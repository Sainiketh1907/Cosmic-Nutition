import React from 'react';

const PieChart = ({ data, size = 150 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) {
    return (
       <div className="flex items-center justify-center" style={{ width: size, height: size }}>
         <p className="text-xs text-muted-foreground">No data</p>
       </div>
    );
  }

  let cumulativePercent = 0;

  const paths = data.map((item, index) => {
    const percent = (item.value / total) * 100;
    const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
    cumulativePercent += percent;
    const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
    const largeArcFlag = percent > 50 ? 1 : 0;

    const pathData = [
      `M ${startX * (size / 2) + size / 2} ${startY * (size / 2) + size / 2}`, // Move
      `A ${size / 2} ${size / 2} 0 ${largeArcFlag} 1 ${endX * (size / 2) + size / 2} ${endY * (size / 2) + size / 2}`, // Arc
      `L ${size / 2} ${size / 2}`, // Line
    ].join(' ');

    return <path key={index} d={pathData} fill={item.color} className="transition-opacity duration-300 hover:opacity-80" />;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {paths}
    </svg>
  );
};

const getCoordinatesForPercent = (percent) => {
  const x = Math.cos(2 * Math.PI * (percent / 100));
  const y = Math.sin(2 * Math.PI * (percent / 100));
  return [x, y];
};


export function MacroPieChart({ protein, carbs, fat }) {
    const pieData = [
        { name: 'Protein', value: protein, color: '#3b82f6' }, // blue-500
        { name: 'Carbs', value: carbs, color: '#22c55e' }, // green-500
        { name: 'Fat', value: fat, color: '#f97316' }, // orange-500
    ];

    return (
        <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-shrink-0">
                <PieChart data={pieData} />
            </div>
            <div className="w-full text-sm">
                <h4 className="font-semibold mb-2 text-center sm:text-left">Macronutrients</h4>
                 <div className="space-y-1">
                    {pieData.map(item => (
                        <div key={item.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                                <span>{item.name}</span>
                            </div>
                            <span className="font-medium">{Math.round(item.value)}g</span>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    )
}
