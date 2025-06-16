
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import ProgressChart from '../../components/ProgressChart';
import { BodyWeightLog, BodyMeasurementsLog, MeasurementType, ExerciseProgressLog, Routine, Exercise } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';

const ClientProgressViewPage: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { isLoading, getClientById, getClientBodyWeightLogs, getClientBodyMeasurementsLogs, getClientExerciseProgressLogs, getClientAssignedRoutines, getRoutineById } = useData();

  if (isLoading || !clientId) {
    return <div className="container mx-auto p-6 text-center"><LoadingSpinner /></div>;
  }

  const client = getClientById(clientId);
  if (!client) {
    return (
        <div className="container mx-auto p-6 text-center">
            <p className="text-xl text-red-600">Cliente no encontrado.</p>
            <Link to="/coach/clients" className="text-primary hover:underline mt-4 inline-block">Volver a la Lista de Clientes</Link>
        </div>
    );
  }

  const weightLogs = getClientBodyWeightLogs(clientId);
  const measurementLogs = getClientBodyMeasurementsLogs(clientId);
  const exerciseLogs = getClientExerciseProgressLogs(clientId);
  const assignedRoutines = getClientAssignedRoutines(clientId);

  const formattedWeightData = weightLogs.map((log: BodyWeightLog) => ({
    date: log.date,
    value: log.weightKg,
  }));
  
  const measurementTypesToPlot: MeasurementType[] = [MeasurementType.WAIST, MeasurementType.CHEST];
  const formattedMeasurementData = measurementLogs.reduce<Array<{date: string, [key:string]: any}>>((acc, log) => {
    const dataPoint: {date: string, [key:string]: any} = { date: log.date };
    let hasRelevantMeasurement = false;
    log.measurements.forEach(m => {
        if(measurementTypesToPlot.includes(m.type)){
            dataPoint[m.type] = m.valueCm;
            hasRelevantMeasurement = true;
        }
    });
    if(hasRelevantMeasurement) acc.push(dataPoint);
    return acc;
  }, []);

  const measurementChartLines = measurementTypesToPlot.map(type => {
      const colors = [ '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F'];
      // The `type` itself is already translated from enum MeasurementType
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
  
  const latestExerciseProgress = exerciseLogs.slice(-5).reverse().map(log => ({
    ...log,
    exerciseName: getExerciseName(log.routineId, log.exerciseId)
  }));


  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-primary mb-1">Progreso de {client.name}</h1>
        <p className="text-sm text-gray-500">{client.id}</p>
        <Link to="/coach/clients" className="text-sm text-blue-600 hover:underline mt-2 inline-block">&larr; Volver a Lista de Clientes</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgressChart 
          data={formattedWeightData} 
          title="Peso Corporal (kg)" 
          dataKey="value"
          yAxisLabel="Peso (kg)"
        />
        
        {formattedMeasurementData.length > 0 && measurementChartLines.length > 0 && (
            <ProgressChart 
            data={formattedMeasurementData} 
            title="Medidas Corporales (cm)" 
            dataKey={measurementChartLines[0].dataKey} 
            lines={measurementChartLines}
            yAxisLabel="Medida (cm)"
            />
        )}
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Rutinas Asignadas</h2>
        {assignedRoutines.length > 0 ? (
            <ul className="space-y-2">
                {assignedRoutines.map((routine: Routine) => (
                    <li key={routine.id} className="p-3 border rounded-md bg-gray-50">
                        <span className="font-medium text-gray-800">{routine.name}</span>
                        <span className="text-xs text-gray-500 ml-2">({routine.type})</span>
                    </li>
                ))}
            </ul>
        ): (
            <p className="text-gray-500">No hay rutinas asignadas actualmente.</p>
        )}
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Registros de Ejercicio Recientes</h2>
        {latestExerciseProgress.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ejercicio</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peso (lbs)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reps/Duración</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notas</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {latestExerciseProgress.map((log: ExerciseProgressLog & {exerciseName: string}) => (
                  <tr key={log.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{new Date(log.date).toLocaleDateString('es-ES')}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">{log.exerciseName}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{log.weightLbs ?? '-'}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{log.repsAchieved ?? log.duration ?? '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-500 truncate max-w-xs">{log.notes ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">Aún no se ha registrado el rendimiento de ningún ejercicio.</p>
        )}
      </div>
    </div>
  );
};

export default ClientProgressViewPage;