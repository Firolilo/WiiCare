import { useState, useEffect } from 'react';
import { useArduinoSerial } from '../hooks/useArduinoSerial';

/**
 * Componente para medir y visualizar fuerza del sensor FSR
 */
export default function ForceSensor({ userId, token }) {
  const {
    isServerOnline,
    isConnected,
    ports,
    currentPort,
    lastReading,
    readings,
    session,
    error,
    stats,
    listPorts,
    connect,
    disconnect,
    startSession,
    stopSession,
    clearError
  } = useArduinoSerial();

  const [selectedPort, setSelectedPort] = useState('');

  // Cargar puertos al montar
  useEffect(() => {
    if (isServerOnline) {
      listPorts();
    }
  }, [isServerOnline, listPorts]);

  // Formatear fuerza para mostrar
  const formatForce = (force) => {
    if (force < 1) return `${(force * 1000).toFixed(0)} mN`;
    return `${force.toFixed(2)} N`;
  };

  // Calcular porcentaje para barra de progreso (0-10N como máximo)
  const forcePercentage = lastReading 
    ? Math.min((lastReading.forceNewtons / 10) * 100, 100) 
    : 0;

  // Color basado en fuerza
  const getForceColor = (force) => {
    if (force < 2) return 'bg-green-500';
    if (force < 5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!isServerOnline) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-red-800 font-semibold mb-2">⚠️ Servidor Local No Disponible</h3>
        <p className="text-red-600 mb-4">
          El servidor local para Arduino no está corriendo.
        </p>
        <div className="bg-gray-800 text-green-400 p-4 rounded text-left font-mono text-sm">
          <p>cd Frontend/local-server</p>
          <p>npm install</p>
          <p>npm start</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-[#e6e0d2]">
      <h2 className="text-2xl font-bold text-[#2B4C7E] mb-4 flex items-center gap-2">
        <i className="bi bi-activity"></i> Sensor de Fuerza FSR
      </h2>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 flex justify-between items-center">
          <span className="text-red-700">{error}</span>
          <button 
            onClick={clearError}
            className="text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Conexión */}
      <div className="mb-6 p-4 bg-[#f5f0e8] rounded-lg border border-[#e6e0d2]">
        <h3 className="font-semibold text-[#2B4C7E] mb-3 flex items-center gap-2">
          <i className="bi bi-plug-fill"></i> Conexión Arduino
        </h3>
        
        {!isConnected ? (
          <div className="flex gap-2">
            <select
              value={selectedPort}
              onChange={(e) => setSelectedPort(e.target.value)}
              className="flex-1 border border-[#e6e0d2] rounded px-3 py-2 focus:border-[#3A6EA5] outline-none"
            >
              <option value="">Seleccionar puerto...</option>
              {ports.map((port) => (
                <option key={port.path} value={port.path}>
                  {port.path} - {port.manufacturer}
                </option>
              ))}
            </select>
            <button
              onClick={() => listPorts()}
              className="px-4 py-2 bg-[#f5f0e8] hover:bg-[#e6e0d2] rounded border border-[#e6e0d2]"
              title="Refrescar puertos"
            >
              <i className="bi bi-arrow-clockwise"></i>
            </button>
            <button
              onClick={() => connect(selectedPort)}
              disabled={!selectedPort}
              className="px-4 py-2 bg-[#3A6EA5] text-white rounded hover:bg-[#2B4C7E] disabled:opacity-50"
            >
              Conectar
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-green-600">
              ✅ Conectado a <strong>{currentPort}</strong>
            </span>
            <button
              onClick={disconnect}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Desconectar
            </button>
          </div>
        )}
      </div>

      {/* Lectura en tiempo real */}
      {isConnected && (
        <div className="mb-6">
          <h3 className="font-semibold text-[#2B4C7E] mb-3 flex items-center gap-2">
            <i className="bi bi-graph-up"></i> Lectura en Tiempo Real
          </h3>
          
          <div className="bg-[#2B4C7E] rounded-lg p-6 text-center">
            <div className="text-5xl font-bold text-white mb-2">
              {lastReading ? formatForce(lastReading.forceNewtons) : '--'}
            </div>
            <div className="text-gray-400 text-sm">
              ADC: {lastReading?.adcValue?.toFixed(0) || '--'}
            </div>
            
            {/* Barra de fuerza */}
            <div className="mt-4 h-4 bg-[#5B8BBE] rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-200 ${lastReading ? getForceColor(lastReading.forceNewtons) : ''}`}
                style={{ width: `${forcePercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-gray-500 text-xs mt-1">
              <span>0 N</span>
              <span>5 N</span>
              <span>10 N</span>
            </div>
          </div>
        </div>
      )}

      {/* Sesión de medición */}
      {isConnected && (
        <div className="mb-6 p-4 bg-[#f5f0e8] rounded-lg border border-[#e6e0d2]">
          <h3 className="font-semibold text-[#2B4C7E] mb-3 flex items-center gap-2">
            <i className="bi bi-clipboard-data"></i> Sesión de Medición
          </h3>
          
          {!session ? (
            <button
              onClick={() => startSession(userId, token)}
              className="w-full py-3 bg-[#3A6EA5] text-white rounded-lg hover:bg-[#2B4C7E] font-semibold flex items-center justify-center gap-2"
            >
              <i className="bi bi-play-fill"></i> Iniciar Sesión
            </button>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-green-600">
                  🔴 Sesión activa - {readings.length} lecturas
                </span>
                <button
                  onClick={stopSession}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  ⏹️ Finalizar
                </button>
              </div>
              
              {/* Estadísticas */}
              {stats && (
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white p-3 rounded shadow border border-[#e6e0d2]">
                    <div className="text-2xl font-bold text-[#3A6EA5]">
                      {formatForce(stats.avg)}
                    </div>
                    <div className="text-[#5B8BBE] text-sm">Promedio</div>
                  </div>
                  <div className="bg-white p-3 rounded shadow border border-[#e6e0d2]">
                    <div className="text-2xl font-bold text-[#2B4C7E]">
                      {formatForce(stats.max)}
                    </div>
                    <div className="text-[#5B8BBE] text-sm">Máximo</div>
                  </div>
                  <div className="bg-white p-3 rounded shadow border border-[#e6e0d2]">
                    <div className="text-2xl font-bold text-[#7DA5C8]">
                      {formatForce(stats.min)}
                    </div>
                    <div className="text-[#5B8BBE] text-sm">Mínimo</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Historial reciente */}
      {readings.length > 0 && (
        <div>
          <h3 className="font-semibold text-[#2B4C7E] mb-3 flex items-center gap-2">
            <i className="bi bi-clock-history"></i> Últimas Lecturas ({readings.length})
          </h3>
          <div className="max-h-40 overflow-y-auto border border-[#e6e0d2] rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-[#f5f0e8] sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left">Hora</th>
                  <th className="px-3 py-2 text-right">ADC</th>
                  <th className="px-3 py-2 text-right">Fuerza</th>
                </tr>
              </thead>
              <tbody>
                {[...readings].reverse().slice(0, 20).map((reading, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="px-3 py-1 text-gray-600">
                      {new Date(reading.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-3 py-1 text-right">{reading.adcValue.toFixed(0)}</td>
                    <td className="px-3 py-1 text-right font-mono">
                      {formatForce(reading.forceNewtons)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
