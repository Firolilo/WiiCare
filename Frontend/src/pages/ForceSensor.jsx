import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyCareDashboard } from '../api/patientManagement';
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
          if (trimmedLine.startsWith('{') && trimmedLine.endsWith('}')) {
            try {
              const data = JSON.parse(trimmedLine);
              
              if (typeof data.adc === 'number' && typeof data.fuerza === 'number') {
                setCurrentData(data);
                
                // Actualizar máximo
                setMaxForce(prev => Math.max(prev, data.fuerza));
                
                // Agregar al historial (mantener últimos 50 puntos)
                setHistory(prev => {
                  const newHistory = [...prev, { ...data, timestamp: Date.now() }];
                  return newHistory.slice(-50);
                });

                // Enviar al cuidador si está compartiendo
                if (isSharing && caregiver?.id) {
                  sendSensorData(data);
                }
              }
            } catch (parseError) {
              // Ignorar líneas que no son JSON válido
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
      // Detener compartir primero
      if (isSharing) {
        stopSensorStream();
        setIsSharing(false);
      }

      if (readerRef.current) {
        await readerRef.current.cancel();
        await readableStreamClosedRef.current;
      }
      
      if (portRef.current) {
        await portRef.current.close();
      }
      
      setIsConnected(false);
      readerRef.current = null;
      portRef.current = null;
    } catch (err) {
      console.error('Error al desconectar:', err);
    }
  }, [isSharing]);

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

  // Calcular porcentaje para la barra de fuerza (máximo razonable ~10N)
  const forcePercentage = Math.min((currentData.fuerza / 10) * 100, 100);
  
  // Color basado en la fuerza
  const getForceColor = (force) => {
    if (force < 1) return 'bg-green-500';
    if (force < 3) return 'bg-yellow-500';
    if (force < 6) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (!isSupported) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <h2 className="font-bold text-lg mb-2">⚠️ Navegador no compatible</h2>
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
        <h1 className="text-3xl font-bold text-[#5a3825] mb-2">
          🏋️ Sensor de Fuerza
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
                className="px-6 py-2 bg-[#7C5C42] hover:bg-[#5a3825] text-white rounded-lg transition-colors font-medium"
              >
                🔌 Conectar Arduino
              </button>
            ) : (
              <button
                onClick={disconnect}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
              >
                ⏹️ Desconectar
              </button>
            )}
            
            <button
              onClick={resetMax}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
            >
              🔄 Reset
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
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-medium text-blue-900">
                  <i className="bi bi-broadcast mr-2"></i>
                  Compartir con tu cuidador: {caregiver.name}
                </p>
                {caregiverRequested && !isSharing && (
                  <p className="text-sm text-blue-700 mt-1">
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
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
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
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Fuerza Actual</h2>
          
          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-[#5a3825]">
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
            <span>10 N</span>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Estadísticas</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Fuerza Máxima</span>
              <span className="text-2xl font-bold text-[#7C5C42]">
                {maxForce.toFixed(2)} N
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Valor ADC</span>
              <span className="text-xl font-mono text-gray-800">
                {currentData.adc.toFixed(0)}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Muestras</span>
              <span className="text-xl font-mono text-gray-800">
                {history.length}
              </span>
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
      <div className="mt-6 bg-[#f5f0e8] rounded-xl p-6">
        <h3 className="font-semibold text-[#5a3825] mb-3">📋 Instrucciones</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Conecta tu Arduino al puerto USB de tu computadora</li>
          <li>Asegúrate de que el código del Arduino esté cargado y funcionando</li>
          <li>Haz clic en "Conectar Arduino" y selecciona el puerto COM correcto</li>
          <li>¡Presiona el sensor para ver los datos en tiempo real!</li>
        </ol>
        
        <div className="mt-4 p-3 bg-yellow-100 rounded-lg text-sm">
          <strong>💡 Nota:</strong> Esta función solo está disponible en Chrome y Edge. 
          El navegador te pedirá permiso para acceder al puerto serial.
        </div>
      </div>
    </div>
  );
}
