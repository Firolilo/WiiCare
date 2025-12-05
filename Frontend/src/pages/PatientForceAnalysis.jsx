import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPatientForceAnalysis, getPatientForceReadings } from '../api/force';

/**
 * Página de análisis de fuerza del paciente para cuidadores
 * Muestra tendencias, estado actual y recomendaciones
 */
export default function PatientForceAnalysis() {
  const { patientId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [analysis, setAnalysis] = useState(null);
  const [recentReadings, setRecentReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAnalysis = async () => {
      if (!patientId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Cargar análisis y lecturas recientes en paralelo
        const [analysisRes, readingsRes] = await Promise.all([
          getPatientForceAnalysis(patientId),
          getPatientForceReadings(patientId, { limit: 20 })
        ]);
        
        setAnalysis(analysisRes.analysis);
        setRecentReadings(readingsRes.readings || []);
      } catch (err) {
        console.error('Error cargando análisis:', err);
        setError('No se pudo cargar el análisis del paciente');
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [patientId]);

  // Colores según estado
  const getStatusColor = (color) => {
    const colors = {
      green: 'bg-green-100 text-green-800 border-green-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[color] || colors.gray;
  };

  // Icono según tendencia
  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'improving':
        return <span className="text-green-600 text-2xl">📈</span>;
      case 'declining':
        return <span className="text-red-600 text-2xl">📉</span>;
      default:
        return <span className="text-gray-600 text-2xl">➡️</span>;
    }
  };

  // Color de la tendencia
  const getTrendColor = (direction) => {
    switch (direction) {
      case 'improving':
        return 'text-green-600 bg-green-50';
      case 'declining':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-12 w-12 border-4 border-[#7C5C42] border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <p>{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-2 text-red-800 underline"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (!analysis?.hasData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="text-5xl mb-4">📊</div>
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">
            Sin datos suficientes
          </h2>
          <p className="text-yellow-700">
            {analysis?.message || 'El paciente aún no ha registrado mediciones con el sensor de fuerza.'}
          </p>
          <p className="text-yellow-600 mt-2 text-sm">
            {analysis?.recommendation}
          </p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button 
            onClick={() => navigate(-1)}
            className="text-[#7C5C42] hover:underline mb-2 flex items-center gap-1"
          >
            ← Volver
          </button>
          <h1 className="text-2xl font-bold text-[#5a3825]">
            📊 Análisis de Fuerza del Paciente
          </h1>
          <p className="text-gray-600">
            Últimos {analysis.periodDays} días • {analysis.totalReadings} mediciones
          </p>
        </div>
      </div>

      {/* Estado Actual y Tendencia */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Estado Actual */}
        <div className={`rounded-xl border-2 p-6 ${getStatusColor(analysis.currentStatus.color)}`}>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span>🎯</span> Estado Actual
          </h2>
          
          <div className="text-3xl font-bold mb-2">
            {analysis.currentStatus.description}
          </div>
          
          <div className="space-y-2 mt-4">
            <div className="flex justify-between">
              <span>Fuerza promedio (7 días):</span>
              <strong>{analysis.currentStatus.averageForce ?? '--'} N</strong>
            </div>
            <div className="flex justify-between">
              <span>Fuerza máxima:</span>
              <strong>{analysis.currentStatus.maxForce ?? '--'} N</strong>
            </div>
            <div className="flex justify-between">
              <span>Mediciones recientes:</span>
              <strong>{analysis.currentStatus.readingsLast7Days}</strong>
            </div>
          </div>
        </div>

        {/* Tendencia */}
        <div className={`rounded-xl border p-6 ${getTrendColor(analysis.trend.direction)}`}>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            {getTrendIcon(analysis.trend.direction)} Tendencia
          </h2>
          
          <div className="text-3xl font-bold mb-2">
            {analysis.trend.description}
          </div>
          
          <div className="space-y-2 mt-4">
            <div className="flex justify-between">
              <span>Cambio:</span>
              <strong className={analysis.trend.changePercentage >= 0 ? 'text-green-700' : 'text-red-700'}>
                {analysis.trend.changePercentage >= 0 ? '+' : ''}{analysis.trend.changePercentage}%
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Período reciente:</span>
              <strong>{analysis.trend.comparison.recent ?? '--'} N</strong>
            </div>
            <div className="flex justify-between">
              <span>Período anterior:</span>
              <strong>{analysis.trend.comparison.previous ?? '--'} N</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Recomendación */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-blue-800 mb-2 flex items-center gap-2">
          <span>💡</span> Recomendación
        </h2>
        <p className="text-blue-900">
          {analysis.recommendation}
        </p>
      </div>

      {/* Estadísticas Generales */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">📈 Estadísticas Generales</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-[#7C5C42]">
              {analysis.overall.averageForce} N
            </div>
            <div className="text-sm text-gray-600">Promedio General</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-[#7C5C42]">
              {analysis.overall.maxForce} N
            </div>
            <div className="text-sm text-gray-600">Máximo Registrado</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-[#7C5C42]">
              {analysis.overall.consistencyPercentage}%
            </div>
            <div className="text-sm text-gray-600">Consistencia</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-[#7C5C42]">
              {analysis.overall.daysWithReadings}
            </div>
            <div className="text-sm text-gray-600">Días con Uso</div>
          </div>
        </div>
      </div>

      {/* Comparación por Períodos */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">📅 Comparación por Períodos</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3 rounded-tl-lg">Período</th>
                <th className="text-center p-3">Promedio</th>
                <th className="text-center p-3">Máximo</th>
                <th className="text-center p-3 rounded-tr-lg">Mediciones</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-3 font-medium">Últimos 7 días</td>
                <td className="p-3 text-center">{analysis.periods.last7Days.average ?? '--'} N</td>
                <td className="p-3 text-center">{analysis.periods.last7Days.max ?? '--'} N</td>
                <td className="p-3 text-center">{analysis.periods.last7Days.readings}</td>
              </tr>
              <tr className="border-t bg-gray-50">
                <td className="p-3 font-medium">Días 8-15</td>
                <td className="p-3 text-center">{analysis.periods.days8to15.average ?? '--'} N</td>
                <td className="p-3 text-center">{analysis.periods.days8to15.max ?? '--'} N</td>
                <td className="p-3 text-center">{analysis.periods.days8to15.readings}</td>
              </tr>
              <tr className="border-t">
                <td className="p-3 font-medium">Días 16-30</td>
                <td className="p-3 text-center">{analysis.periods.days16to30.average ?? '--'} N</td>
                <td className="p-3 text-center">{analysis.periods.days16to30.max ?? '--'} N</td>
                <td className="p-3 text-center">{analysis.periods.days16to30.readings}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Patrones */}
      {analysis.patterns && (
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Mejores días */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="font-semibold text-green-800 mb-3">🌟 Mejores días</h3>
            <div className="space-y-2">
              {analysis.patterns.bestDays.map((day, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-green-700">{day.day}</span>
                  <span className="font-bold text-green-800">
                    {day.average.toFixed(2)} N
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Días que necesitan atención */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
            <h3 className="font-semibold text-orange-800 mb-3">⚠️ Días con menor fuerza</h3>
            <div className="space-y-2">
              {analysis.patterns.worstDays.map((day, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-orange-700">{day.day}</span>
                  <span className="font-bold text-orange-800">
                    {day.average.toFixed(2)} N
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Últimas lecturas */}
      {recentReadings.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">🕐 Últimas Mediciones</h2>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentReadings.slice(0, 10).map((reading, idx) => (
              <div 
                key={idx}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <div className="text-sm text-gray-600">
                  {new Date(reading.readingTimestamp).toLocaleString()}
                </div>
                <div className="font-bold text-[#7C5C42]">
                  {reading.forceNewtons.toFixed(2)} N
                </div>
              </div>
            ))}
          </div>

          {analysis.lastReading && (
            <div className="mt-4 text-sm text-gray-500 text-center">
              Última lectura: {new Date(analysis.lastReading).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
