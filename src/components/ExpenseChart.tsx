
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ExpenseChartProps {
  data?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export const ExpenseChart = ({ data }: ExpenseChartProps) => {
  // Use dados reais se disponíveis
  const chartData = data && data.length > 0 ? data : [];

  if (chartData.length === 0) {
    return (
      <div className="relative">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Despesas por Categoria
          </h3>
          <div className="h-px bg-gradient-to-r from-purple-500/30 to-blue-500/30"></div>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4 opacity-50">📊</div>
            <p className="text-gray-400 font-medium">Nenhuma despesa por categoria encontrada</p>
            <p className="text-sm text-gray-500 mt-2">Adicione despesas para ver o gráfico</p>
          </div>
        </div>
      </div>
    );
  }

  const COLORS = chartData.map(item => item.color);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-purple-500/40 rounded-lg p-4 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div 
              className="w-4 h-4 rounded-full shadow-lg border border-white/20" 
              style={{ backgroundColor: data.payload.color }}
            />
            <span className="text-white font-semibold text-sm">{data.payload.name}</span>
          </div>
          <p className="text-green-400 font-bold text-lg">
            R$ {data.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-purple-300 text-sm font-medium">
            {((data.value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}% do total
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-6 p-4 bg-gradient-to-r from-gray-800/30 to-gray-700/30 rounded-lg border border-purple-500/20">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-3 p-2 rounded-md hover:bg-white/5 transition-colors">
            <div 
              className="w-4 h-4 rounded-full shadow-lg border border-white/20" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-white text-sm font-semibold tracking-wide">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Despesas por Categoria
        </h3>
        <div className="h-px bg-gradient-to-r from-purple-500/30 to-blue-500/30"></div>
      </div>
      
      <div className="h-80 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-blue-900/10 rounded-xl border border-purple-500/20 backdrop-blur-sm">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {chartData.map((entry, index) => (
                  <linearGradient key={index} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={entry.color} stopOpacity={0.9} />
                    <stop offset="50%" stopColor={entry.color} stopOpacity={0.7} />
                    <stop offset="100%" stopColor={entry.color} stopOpacity={0.5} />
                  </linearGradient>
                ))}
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(0,0,0,0.3)"/>
                </filter>
              </defs>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={45}
                outerRadius={90}
                paddingAngle={0.5}
                dataKey="value"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={1}
                filter="url(#shadow)"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`url(#gradient-${index})`}
                    className="hover:opacity-90 transition-all duration-300 hover:scale-105 cursor-pointer"
                    style={{
                      filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
                      transformOrigin: 'center'
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
