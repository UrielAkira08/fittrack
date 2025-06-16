
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import ProgressChart from '../../components/ProgressChart';
import { BodyWeightLog, BodyMeasurementsLog, ExerciseProgressLog, MeasurementType, Exercise } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';

const MyProgressPage: React.FC = () => {
  const { user } = useAuth();
  const { isLoading, getClientBodyWeightLogs, getClientBodyMeasurementsLogs, getClientExerciseProgressLogs, getRoutineById } = useData();

  if (isLoading || !user) {
    return <div className="container mx-auto p-6 text-center"><LoadingSpinner /></div>;
  }

  const weightLogs = getClientBodyWeightLogs(user.id);
  const measurementLogs = getClientBodyMeasurementsLogs(user.id);
  const exerciseLogs = getClientExerciseProgressLogs(user.id);

  const formattedWeightData = weightLogs.map((log: BodyWeightLog) => ({
    date: log.date,
    value: log.weightKg,
  }));
  
  const measurementTypesToPlot: MeasurementType[] = [MeasurementType.WAIST, MeasurementType.CHEST, MeasurementType.HIPS];
  const formattedMeasurementData = measurementLogs.reduce<Array<{date: string, [key:string]: any}>>((acc, log) => {
    const dataPoint: {date: string, [key:string]: any} = { date: log.date };
    let hasRelevantMeasurement = false;
    log.measurements.forEach(m => {
        if(measurementTypesToPlot.includes(m.type)){
            // Use the translated enum value directly as dataKey for the chart line
            dataPoint[m.type] = m.valueCm; 
            hasRelevantMeasurement = true;
        }
    });
    if(hasRelevantMeasurement) acc.push(dataPoint);
    return acc;
  }, []);

  const measurementChartLines = measurementTypesToPlot.map(type => {
      const colors = [ '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28', '#FF8042' ];
      // The `type` (e.g., MeasurementType.WAIST) is already translated
      return { dataKey: type, stroke: colors[measurementTypesToPlot.indexOf(type) % colors.length], name: type };
  });

  const getExerciseName = (routineId: string, exerciseId: string): string => {
    const routine = getRoutineById(routineId);
    if (routine) {
        const exercise = routine.exercises.find((ex: Exercise) => ex.id === exerciseId);
        return exercise ? exercise.name : "Ejercicio Desconocido";
    }
    return "Rutina Desconocida";
  };

  const recentExerciseLogs = exerciseLogs.slice(-10).reverse().map(log => ({
    ...log,
    exerciseName: getExerciseName(log.routineId, log.exerciseId)
  }));


  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-secondary mb-8">Resumen de Mi Progreso</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ProgressChart 
          data={formattedWeightData} 
          title="Tendencia de Peso Corporal (kg)" 
          dataKey="value" 
          yAxisLabel="Peso (kg)"
        />
        {formattedMeasurementData.length > 0 && measurementChartLines.length > 0 && (
            <ProgressChart 
            data={formattedMeasurementData} 
            title="Medidas Corporales Clave (cm)" 
            dataKey={measurementChartLines[0].dataKey}
            lines={measurementChartLines}
            yAxisLabel="Medida (cm)"
            />
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Registros Recientes de Ejercicios</h2>
        {recentExerciseLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ejercicio</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peso (lbs)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reps / Duración</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notas</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentExerciseLogs.map((log: ExerciseProgressLog & {exerciseName: string}) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{new Date(log.date).toLocaleDateString('es-ES')}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">{log.exerciseName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{log.weightLbs ?? '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{log.repsAchieved ?? log.duration ?? '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 truncate max-w-xs" title={log.notes}>{log.notes ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-6">Aún no se ha registrado el rendimiento de ningún ejercicio. ¡Ve a "Registrar Progreso" para añadir tus entradas!</p>
        )}
      </div>
    </div>
  );
};

export default MyProgressPage;