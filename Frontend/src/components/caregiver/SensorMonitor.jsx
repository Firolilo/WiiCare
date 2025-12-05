import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPatientProfile } from '../../api/patientManagement';
import {
  requestSensorStream,
  onSensorStreamStarted,
  onSensorData,
  onSensorStreamStopped,
  onSensorStreamError,
  offSensorStreamStarted,
  offSensorData,
  offSensorStreamStopped,
  offSensorStreamError
} from '../../socket';

export default function SensorMonitor() {
  const { patientProfileId } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReceiving, setIsReceiving] = useState(false);
  const [currentData, setCurrentData] = useState({ adc: 0, fuerza: 0 });
  const [history, setHistory] = useState([]);
  const [maxForce, setMaxForce] = useState(0);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Cargar información del paciente
  useEffect(() => {
    const loadPatient = async () => {
      try {
        setLoading(true);
        const data = await getPatientProfile(patientProfileId);
        console.log('Datos del paciente cargados:', data);
        setPatient(data.profile); // Guardar solo el profile
      } catch (err) {
        console.error('Error cargando paciente:', err);
        setError('Error al cargar información del paciente');
      } finally {
        setLoading(false);
      }
    };
    
    if (patientProfileId) {
      loadPatient();
    }
  }, [patientProfileId]);

  // Configurar listeners de socket
  useEffect(() => {
    const handleStreamStarted = ({ patientId }) => {
      console.log('Stream iniciado por paciente:', patientId);
      setIsReceiving(true);
      setError(null);
    };

    const handleSensorData = (data) => {
      console.log('Datos del sensor recibidos:', data);
      setCurrentData({ adc: data.adc, fuerza: data.fuerza });
      setLastUpdate(new Date());
      setMaxForce(prev => Math.max(prev, data.fuerza));
      
      setHistory(prev => {
        const newHistory = [...prev, { ...data, timestamp: Date.now() }];
        return newHistory.slice(-50);
      });
    };

    const handleStreamStopped = ({ patientId }) => {
      console.log('Stream detenido por paciente:', patientId);
      setIsReceiving(false);
    };

    const handleStreamError = ({ message }) => {
      setError(message);
      setIsReceiving(false);
    };

    onSensorStreamStarted(handleStreamStarted);
    onSensorData(handleSensorData);
    onSensorStreamStopped(handleStreamStopped);
    onSensorStreamError(handleStreamError);

    return () => {
      offSensorStreamStarted();
      offSensorData();
      offSensorStreamStopped();
      offSensorStreamError();
    };
  }, []);

  // Solicitar stream del paciente
  const requestStream = () => {
    const patientUserId = patient?.patient?._id;
    console.log('Solicitando stream para paciente:', patientUserId);
    if (patientUserId) {
      requestSensorStream(patientUserId);
      setError(null);
    } else {
      setError('No se pudo obtener el ID del paciente');
      console.error('patient.patient._id no disponible:', patient);
    }
  };

  // Resetear datos
  const resetData = () => {
    setMaxForce(0);
    setHistory([]);
  };

  // Calcular porcentaje para la barra de fuerza (máximo 50N)
  const forcePercentage = Math.min((currentData.fuerza / 50) * 100, 100);
  
  // Color basado en la fuerza (ajustado para 50N)
  const getForceColor = (force) => {
    if (force < 10) return 'bg-green-500';
    if (force < 25) return 'bg-yellow-500';
    if (force < 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <h2 className="font-bold text-lg mb-2">Paciente no encontrado</h2>
          <Link to="/mis-pacientes" className="text-blue-600 hover:underline">
            ← Volver a mis pacientes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link 
          to={`/paciente/${patientProfileId}`}
          className="text-gray-600 hover:text-gray-900"
        >
          <i className="bi bi-arrow-left text-2xl"></i>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[#5a3825]">
            <i className="bi bi-broadcast mr-2"></i>Monitor del Sensor
          </h1>
          <p className="text-gray-600">
            Paciente: <span className="font-semibold">{patient.patient?.name || 'Sin nombre'}</span>
          </p>
        </div>
      </div>

      {/* Estado de conexión */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${isReceiving ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="font-medium">
              {isReceiving ? 'Recibiendo datos en vivo' : 'Esperando datos del paciente'}
            </span>
            {lastUpdate && isReceiving && (
              <span className="text-sm text-gray-500">
                (última actualización: {lastUpdate.toLocaleTimeString()})
              </span>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={requestStream}
              disabled={isReceiving}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isReceiving 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <i className="bi bi-bell mr-2"></i>
              Solicitar ver sensor
            </button>
            
            <button
              onClick={resetData}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
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

        {!isReceiving && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800">
              <i className="bi bi-info-circle mr-2"></i>
              Haz clic en "Solicitar ver sensor" para pedir al paciente que comparta sus datos.
              El paciente debe tener el Arduino conectado y aprobar la transmisión.
            </p>
          </div>
        )}
      </div>

      {/* Visualización de fuerza actual */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Medidor principal */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Fuerza Actual</h2>
          
          <div className="text-center mb-6">
            <div className={`text-6xl font-bold ${isReceiving ? 'text-[#5a3825]' : 'text-gray-300'}`}>
              {currentData.fuerza.toFixed(2)}
            </div>
            <div className="text-xl text-gray-500">Newtons (N)</div>
          </div>
          
          {/* Barra de progreso */}
          <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-200 ${isReceiving ? getForceColor(currentData.fuerza) : 'bg-gray-300'}`}
              style={{ width: `${forcePercentage}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>0 N</span>
            <span>50 N</span>
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
              <span className="text-gray-600">Muestras recibidas</span>
              <span className="text-xl font-mono text-gray-800">
                {history.length}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Estado</span>
              <span className={`text-lg font-medium ${isReceiving ? 'text-green-600' : 'text-gray-400'}`}>
                {isReceiving ? '🟢 En vivo' : '⚪ Sin datos'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de historial */}
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
            {isReceiving ? 'Esperando datos...' : 'Solicita ver el sensor para recibir datos'}
          </div>
        )}
        
        <div className="flex justify-between text-sm text-gray-500 mt-2">
          <span>Tiempo →</span>
          <span>Últimas {history.length} lecturas</span>
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-6 bg-[#f5f0e8] rounded-xl p-6">
        <h3 className="font-semibold text-[#5a3825] mb-3">ℹ️ Información</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Los datos se transmiten en tiempo real desde el sensor del paciente</li>
          <li>El paciente debe autorizar la transmisión desde su dispositivo</li>
          <li>La conexión se mantiene mientras ambos estén conectados</li>
          <li>Usa estos datos para monitorear el progreso de rehabilitación</li>
        </ul>
      </div>
    </div>
  );
}
