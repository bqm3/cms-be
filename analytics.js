const { BetaAnalyticsDataClient } = require('@google-analytics/data');

const client = new BetaAnalyticsDataClient({
  keyFilename: 'D:\\Apollo\\Freelancer\\cms-no-code\\backend-cms\\farm-erp-3ddd7-6388efd5cf1d.json',
});

async function run() {
  // 1. Swapped to runReport
  const [response] = await client.runReport({ 
    property: 'properties/520643539',
    // 2. Standard reporting requires a date range
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }], 
    dimensions: [{ name: 'unifiedPagePathScreen' }], // This works here!
    metrics: [{ name: 'activeUsers' }]
  });

  console.log("🔥 Core Report Data:", response);

  if (!response.rows) {
    console.log("Không có data");
    return;
  }

  response.rows.forEach(row => {
    console.log(
      row.dimensionValues[0].value,
      row.metricValues[0].value
    );
  });
}

run();