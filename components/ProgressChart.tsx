
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ProgressDataPoint } from '../../types'; // Import ProgressDataPoint from global types

// Removed local ProgressDataPoint interface definition

interface ProgressChartProps {
  data: ProgressDataPoint[];
  title: string;
  dataKey: string; // Key for the Y-axis value
  xAxisDataKey?: string; // Key for X-axis label (usually 'date')
  yAxisLabel?: string;
  lines?: { dataKey: string; stroke: string; name: string }[]; // For multiple lines
}

const ProgressChart: React.FC<ProgressChartProps> = ({
  data,
  title,
  dataKey,
  xAxisDataKey = 'date',
  yAxisLabel,
  lines
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
        <p className="text-gray-500">No hay datos disponibles para mostrar.</p>
      </div>
    );
  }

  // Sort data by date to ensure the line chart is drawn correctly
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={sortedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey={xAxisDataKey} 
            tickFormatter={(tick) => new Date(tick).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            angle={-30}
            textAnchor="end"
            height={50}
            style={{ fontSize: '0.75rem' }}
          />
          <YAxis 
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', offset:10, style: {textAnchor: 'middle', fontSize: '0.85rem'} } : undefined}
            domain={['auto', 'auto']}
            allowDataOverflow={true}
            style={{ fontSize: '0.75rem' }}
          />
          <Tooltip 
            labelFormatter={(label) => new Date(label).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}
            formatter={(value: number, name: string) => {
                const unit = name.includes('(kg)') ? 'kg' : name.includes('(cm)') ? 'cm' : '';
                const cleanName = name.split('(')[0].trim();
                return [`${value}${unit}`, cleanName];
            }}
          />
          <Legend wrapperStyle={{fontSize: '0.85rem'}} />
          {lines ? (
             lines.map(line => (
                <Line key={line.dataKey} type="monotone" dataKey={line.dataKey} stroke={line.stroke} name={line.name} activeDot={{ r: 6 }} />
             ))
          ) : (
            <Line type="monotone" dataKey={dataKey} stroke="#1E40AF" activeDot={{ r: 8 }} name={title.split('(')[0].trim()} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressChart;
