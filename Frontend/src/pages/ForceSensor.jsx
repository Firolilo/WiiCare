import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyCareDashboard } from '../api/patientManagement';
import { saveForceReadingsBatch } from '../api/force';
import { 
  startSensorStream, 
  sendSensorData, 
  stopSensorStream,
  onSensorStreamRequested,
  offSensorStreamRequested
} from '../socket';

export default function ForceSensor() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [currentData, setCurrentData] = useState({ adc: 0, fuerza: 0 });
  const [history, setHistory] = useState([]);
  const [maxForce, setMaxForce] = useState(0);
  const [error, setError] = useState(null);
  const [caregiver, setCaregiver] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [caregiverRequested, setCaregiverRequested] = useState(false);
  
  // Estados para guardado automático
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [savedCount, setSavedCount] = useState(0);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const pendingReadingsRef = useRef([]);
  const saveIntervalRef = useRef(null);
  
  const portRef = useRef(null);
  const readerRef = useRef(null);
  const readableStreamClosedRef = useRef(null);

  // Verificar si Web Serial API está disponible
  useEffect(() => {
    if (!('serial' in navigator)) {
      setIsSupported(false);
      setError('Tu navegador no soporta Web Serial API. Usa Chrome o Edge.');
    }
  }, []);

  // Cargar información del cuidador
  useEffect(() => {
    const loadCaregiverInfo = async () => {
      try {
        const dashboard = await getMyCareDashboard();
        if (dashboard?.profile?.caregiver) {
          setCaregiver({
            id: dashboard.profile.caregiver._id || dashboard.profile.caregiver.id,
            name: dashboard.profile.caregiver.name
          });
        }
      } catch (err) {
        console.log('No hay cuidador asignado');
      }
    };
    loadCaregiverInfo();
  }, []);

  // Función para guardar lecturas pendientes en la base de datos
  const savePendingReadings = useCallback(async () => {
    if (pendingReadingsRef.current.length === 0 || !autoSaveEnabled) return;
    
    const readingsToSave = [...pendingReadingsRef.current];
    pendingReadingsRef.current = [];
    
    try {
      setIsSaving(true);
      await saveForceReadingsBatch(readingsToSave);
      setSavedCount(prev => prev + readingsToSave.length);
      setLastSaved(new Date());
      console.log(`[SAVE] ${readingsToSave.length} lecturas guardadas`);
    } catch (err) {
      console.error('Error guardando lecturas:', err);
      // Reintentar agregando las lecturas de vuelta
      pendingReadingsRef.current = [...readingsToSave, ...pendingReadingsRef.current];
    } finally {
      setIsSaving(false);
    }
  }, [autoSaveEnabled]);

  // Configurar intervalo de guardado automático (cada 10 segundos)
  useEffect(() => {
    if (isConnected && autoSaveEnabled) {
      saveIntervalRef.current = setInterval(savePendingReadings, 10000);
    }
    
    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [isConnected, autoSaveEnabled, savePendingReadings]);

  // Guardar lecturas pendientes al desconectar
  useEffect(() => {
    return () => {
      if (pendingReadingsRef.current.length > 0) {
        savePendingReadings();
      }
    };
  }, [savePendingReadings]);

  // Escuchar si el cuidador solicita ver el sensor
  useEffect(() => {
    const handleCaregiverRequest = ({ caregiverId }) => {
      console.log('Cuidador solicitó ver sensor:', caregiverId);
      setCaregiverRequested(true);
      // Auto-iniciar compartir si ya está conectado
      if (isConnected && caregiver?.id === caregiverId) {
        setIsSharing(true);
        startSensorStream(caregiverId);
      }
    };

    onSensorStreamRequested(handleCaregiverRequest);
    return () => offSensorStreamRequested();
  }, [isConnected, caregiver]);

  // Función para conectar al Arduino
  const connect = useCallback(async () => {
    try {
      setError(null);
      
      // Solicitar puerto serial
      const port = await navigator.serial.requestPort();
      
      // Abrir conexión a 9600 baudios (igual que el Arduino)
      await port.open({ baudRate: 9600 });
      
      portRef.current = port;
      setIsConnected(true);

      // Leer datos del puerto
      const textDecoder = new TextDecoderStream();
      readableStreamClosedRef.current = port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      readerRef.current = reader;

      let buffer = '';

      // Loop de lectura
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        
        buffer += value;
        
        // Buscar líneas completas (terminadas en \n)
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Guardar línea incompleta
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          
          // Intentar parsear formato del Arduino: "ADC: XXX  |  Fuerza (N): YYY"
          const adcMatch = trimmedLine.match(/ADC:\s*([\d.]+)/);
          const forceMatch = trimmedLine.match(/Fuerza \(N\):\s*([\d.]+)/);
          
          if (adcMatch && forceMatch) {
            const data = {
              adc: parseFloat(adcMatch[1]),
              fuerza: parseFloat(forceMatch[1]),
              timestamp: Date.now()
            };
            
            console.log('[ARDUINO] Lectura:', data);
            setCurrentData(data);
            
            // Actualizar máximo
            setMaxForce(prev => Math.max(prev, data.fuerza));
            
            // Agregar al historial (mantener últimos 50 puntos)
            setHistory(prev => {
              const newHistory = [...prev, data];
              return newHistory.slice(-50);
            });

            // Agregar a lecturas pendientes para guardar en BD (solo si fuerza > 0)
            if (autoSaveEnabled && data.fuerza > 0) {
              pendingReadingsRef.current.push({
                adcValue: data.adc,
                forceNewtons: data.fuerza,
                timestamp: data.timestamp
              });
            }

            // Enviar al cuidador si está compartiendo
            if (isSharing && caregiver?.id) {
              sendSensorData(data);
            }
          } else if (trimmedLine.startsWith('{') && trimmedLine.endsWith('}')) {
            // Fallback: intentar parsear como JSON
            try {
              const data = JSON.parse(trimmedLine);
              
              if (typeof data.adc === 'number' && typeof data.fuerza === 'number') {
                const dataWithTime = { ...data, timestamp: Date.now() };
                setCurrentData(dataWithTime);
                setMaxForce(prev => Math.max(prev, data.fuerza));
                setHistory(prev => {
                  const newHistory = [...prev, dataWithTime];
                  return newHistory.slice(-50);
                });
                
                // Agregar a lecturas pendientes para guardar en BD (solo si fuerza > 0)
                if (autoSaveEnabled && data.fuerza > 0) {
                  pendingReadingsRef.current.push({
                    adcValue: data.adc,
                    forceNewtons: data.fuerza,
                    timestamp: dataWithTime.timestamp
                  });
                }
                
                if (isSharing && caregiver?.id) {
                  sendSensorData(data);
                }
              }
            } catch (parseError) {
              console.debug('Línea no JSON:', trimmedLine);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error de conexión:', err);
      if (err.name === 'NotFoundError') {
        setError('No se seleccionó ningún puerto.');
      } else {
        setError(`Error: ${err.message}`);
      }
      setIsConnected(false);
    }
  }, [isSharing, caregiver]);

  // Función para desconectar
  const disconnect = useCallback(async () => {
    try {
      console.log('[DISCONNECT] Iniciando desconexión...');
      
      // Detener compartir primero
      if (isSharing) {
        stopSensorStream();
        setIsSharing(false);
      }

      // Cancelar el reader primero (esto detendrá el loop de lectura)
      if (readerRef.current) {
        try {
          await readerRef.current.cancel();
          console.log('[OK] Reader cancelado');
        } catch (e) {
          console.log('Reader ya cancelado:', e.message);
        }
        readerRef.current = null;
      }

      // Esperar a que el stream se cierre (con timeout)
      if (readableStreamClosedRef.current) {
        try {
          await Promise.race([
            readableStreamClosedRef.current,
            new Promise(resolve => setTimeout(resolve, 1000)) // Timeout de 1 segundo
          ]);
          console.log('[OK] Stream cerrado');
        } catch (e) {
          console.log('Stream error (ignorado):', e.message);
        }
        readableStreamClosedRef.current = null;
      }
      
      // Cerrar el puerto
      if (portRef.current) {
        try {
          await portRef.current.close();
          console.log('[OK] Puerto cerrado');
        } catch (e) {
          console.log('Puerto ya cerrado:', e.message);
        }
        portRef.current = null;
      }
      
      setIsConnected(false);
      console.log('[OK] Desconexión completada');

      // Guardar lecturas pendientes después de desconectar (no bloquea)
      if (pendingReadingsRef.current.length > 0) {
        savePendingReadings().catch(err => {
          console.error('Error guardando lecturas pendientes:', err);
        });
      }
    } catch (err) {
      console.error('Error al desconectar:', err);
      // Forzar estado desconectado incluso si hay error
      setIsConnected(false);
      readerRef.current = null;
      portRef.current = null;
    }
  }, [isSharing, savePendingReadings]);

  // Iniciar/detener compartir con cuidador
  const toggleSharing = () => {
    if (!caregiver?.id) {
      setError('No tienes un cuidador asignado');
      return;
    }

    if (isSharing) {
      stopSensorStream();
      setIsSharing(false);
    } else {
      startSensorStream(caregiver.id);
      setIsSharing(true);
    }
  };

  // Resetear máximo
  const resetMax = () => {
    setMaxForce(0);
    setHistory([]);
  };

  // Calcular porcentaje para la barra de fuerza (máximo razonable ~50N)
  const forcePercentage = Math.min((currentData.fuerza / 50) * 100, 100);
  
  // Color basado en la fuerza (ajustado para máximo de 50N)
  const getForceColor = (force) => {
    if (force < 10) return 'bg-green-500';
    if (force < 25) return 'bg-yellow-500';
    if (force < 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (!isSupported) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <h2 className="font-bold text-lg mb-2"><i className="bi bi-exclamation-triangle-fill mr-2"></i>Navegador no compatible</h2>
          <p>Web Serial API no está disponible en tu navegador.</p>
          <p className="mt-2">Por favor usa <strong>Google Chrome</strong> o <strong>Microsoft Edge</strong>.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#2B4C7E] mb-2">
          <i className="bi bi-speedometer2 mr-2"></i>Sensor de Fuerza
        </h1>
        <p className="text-gray-600">
          Conecta tu sensor Arduino para medir y compartir tu progreso
        </p>
        {user && (
          <p className="text-sm text-gray-500 mt-1">
            Usuario: {user.nombre || user.email}
          </p>
        )}
      </div>

      {/* Estado de conexión y botones */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="font-medium">
              {isConnected ? 'Arduino Conectado' : 'Arduino Desconectado'}
            </span>
          </div>
          
          <div className="flex gap-3">
            {!isConnected ? (
              <button
                onClick={connect}
                className="px-6 py-2 bg-[#3A6EA5] hover:bg-[#2B4C7E] text-white rounded-lg transition-colors font-medium"
              >
                <i className="bi bi-plug-fill mr-2"></i>Conectar Arduino
              </button>
            ) : (
              <button
                onClick={disconnect}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
              >
                <i className="bi bi-stop-fill mr-2"></i>Desconectar
              </button>
            )}
            
            <button
              onClick={resetMax}
              className="px-4 py-2 bg-[#f5f0e8] hover:bg-[#e6e0d2] text-[#2B4C7E] rounded-lg transition-colors border border-[#e6e0d2]"
            >
              <i className="bi bi-arrow-clockwise mr-1"></i>Reset
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}

        {/* Compartir con cuidador */}
        {caregiver && isConnected && (
          <div className="mt-4 p-4 bg-[#f5f0e8] rounded-lg border border-[#e6e0d2]">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-medium text-[#2B4C7E]">
                  <i className="bi bi-broadcast mr-2"></i>
                  Compartir con tu cuidador: {caregiver.name}
                </p>
                {caregiverRequested && !isSharing && (
                  <p className="text-sm text-[#3A6EA5] mt-1">
                    <i className="bi bi-bell-fill mr-1"></i>
                    ¡Tu cuidador quiere ver tus datos!
                  </p>
                )}
              </div>
              <button
                onClick={toggleSharing}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isSharing 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-[#3A6EA5] hover:bg-[#2B4C7E] text-white'
                }`}
              >
                {isSharing ? (
                  <>
                    <i className="bi bi-broadcast mr-2"></i>
                    Compartiendo en vivo...
                  </>
                ) : (
                  <>
                    <i className="bi bi-share mr-2"></i>
                    Compartir
                  </>
                )}
              </button>
            </div>
            {isSharing && (
              <p className="text-sm text-green-700 mt-2">
                <i className="bi bi-check-circle-fill mr-1"></i>
                Tu cuidador puede ver tus datos en tiempo real
              </p>
            )}
          </div>
        )}

        {!caregiver && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800">
            <i className="bi bi-info-circle mr-1"></i>
            No tienes un cuidador asignado. Solicita un servicio para poder compartir tus datos.
          </div>
        )}
      </div>

      {/* Visualización de fuerza actual */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Medidor principal */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-[#e6e0d2]">
          <h2 className="text-lg font-semibold text-[#2B4C7E] mb-4">Fuerza Actual</h2>
          
          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-[#3A6EA5]">
              {currentData.fuerza.toFixed(2)}
            </div>
            <div className="text-xl text-gray-500">Newtons (N)</div>
          </div>
          
          {/* Barra de progreso */}
          <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-200 ${getForceColor(currentData.fuerza)}`}
              style={{ width: `${forcePercentage}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>0 N</span>
            <span>50 N</span>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-[#e6e0d2]">
          <h2 className="text-lg font-semibold text-[#2B4C7E] mb-4">Estadísticas</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-[#f5f0e8] rounded-lg">
              <span className="text-[#5B8BBE]">Fuerza Máxima</span>
              <span className="text-2xl font-bold text-[#3A6EA5]">
                {maxForce.toFixed(2)} N
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-[#f5f0e8] rounded-lg">
              <span className="text-[#5B8BBE]">Valor ADC</span>
              <span className="text-xl font-mono text-[#2B4C7E]">
                {currentData.adc.toFixed(0)}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-[#f5f0e8] rounded-lg">
              <span className="text-[#5B8BBE]">Muestras</span>
              <span className="text-xl font-mono text-[#2B4C7E]">
                {history.length}
              </span>
            </div>

            {/* Estado de guardado automático */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Guardado Automático</span>
                <button
                  onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoSaveEnabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoSaveEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {autoSaveEnabled && (
                <div className="text-sm space-y-1">
                  <div className="flex justify-between text-gray-500">
                    <span>Lecturas guardadas:</span>
                    <span className="font-mono">{savedCount}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Pendientes:</span>
                    <span className="font-mono">{pendingReadingsRef.current.length}</span>
                  </div>
                  {isSaving && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      <span>Guardando...</span>
                    </div>
                  )}
                  {lastSaved && !isSaving && (
                    <div className="text-green-600 text-xs">
                      <i className="bi bi-check-circle-fill mr-1"></i>Último guardado: {lastSaved.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico simple de historial */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Historial de Fuerza</h2>
        
        {history.length > 0 ? (
          <div className="h-48 flex items-end gap-1">
            {history.map((point, index) => {
              const height = Math.max((point.fuerza / Math.max(maxForce, 1)) * 100, 2);
              return (
                <div
                  key={index}
                  className={`flex-1 ${getForceColor(point.fuerza)} rounded-t transition-all duration-150`}
                  style={{ height: `${height}%` }}
                  title={`${point.fuerza.toFixed(2)} N`}
                />
              );
            })}
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-400">
            {isConnected ? 'Esperando datos...' : 'Conecta el Arduino para ver el historial'}
          </div>
        )}
        
        <div className="flex justify-between text-sm text-gray-500 mt-2">
          <span>Tiempo →</span>
          <span>Últimas {history.length} lecturas</span>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="mt-6 bg-[#f5f0e8] rounded-xl p-6 border border-[#e6e0d2]">
        <h3 className="font-semibold text-[#2B4C7E] mb-3"><i className="bi bi-list-check mr-2"></i>Instrucciones</h3>
        <ol className="list-decimal list-inside space-y-2 text-[#5B8BBE]">
          <li>Conecta tu Arduino al puerto USB de tu computadora</li>
          <li>Asegúrate de que el código del Arduino esté cargado y funcionando</li>
          <li>Haz clic en "Conectar Arduino" y selecciona el puerto COM correcto</li>
          <li>¡Presiona el sensor para ver los datos en tiempo real!</li>
        </ol>
        
        <div className="mt-4 p-3 bg-yellow-100 rounded-lg text-sm">
          <strong><i className="bi bi-lightbulb-fill mr-1"></i>Nota:</strong> Esta función solo está disponible en Chrome y Edge. 
          El navegador te pedirá permiso para acceder al puerto serial.
        </div>
      </div>
    </div>
  );
}
