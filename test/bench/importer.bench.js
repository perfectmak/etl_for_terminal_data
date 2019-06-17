const microtime = require('microtime');
const importer = require('../../src/importer');

/**
 * NOTE: This benchmark doesn't compare multiple implementation for now (no time to do those)
 * It only records the time taken to index based on fetching file directly from gs the current COPY Stream implementation
 *
 */
const runBenchmark = async () => {
  await importer.seedData({
    seedSource: 'gs',
    seedSize: process.env.SEED_SIZE || 100
  });
  console.log('Starting Ingesting now');
  let start = microtime.now();
  await importer.start();
  importer.on('end', () => {
    let elapstedTimeMs = microtime.now() - start;
    console.log(`TOTAL TIME ELAPSED (micros): ${elapstedTimeMs}`);
  });
};

runBenchmark().catch(console.error);
