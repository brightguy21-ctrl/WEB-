import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Analytics() {
  const salesData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Daily Sales (GHS)',
      data: [0, 0, 0, 0, 0, 0, 0],
      backgroundColor: 'rgba(41,128,185,0.6)',
      borderColor: '#2980B9',
      borderWidth: 2,
    }],
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Analytics</h2>
      <p style={{ color: '#666', marginBottom: 24 }}>
        Sales data will appear here once customers start purchasing bundles.
      </p>
      <div style={{ maxWidth: 700 }}>
        <Bar
          data={salesData}
          options={{
            responsive: true,
            plugins: {
              legend: { position: 'top' },
              title: { display: true, text: 'Weekly Sales Overview' },
            },
          }}
        />
      </div>
    </div>
  );
}
