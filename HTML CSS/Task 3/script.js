const ctx = document.getElementById('visitsChart').getContext('2d');

new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Visits',
      data: [12, 19, 3, 25, 22, 18, 30],
      backgroundColor: '#4e73df' ,
      borderRadius: 8,
      
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 5
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  }
});
