const microtime = require('microtime');
const importer = require('../../src/importer');

/**
 * NOTE: This benchmark doesn't compare multiple implementation for now (no time to do those)
 * It only records the time taken to index based on the current COPY Stream implementation
 *
 */
const runBenchmark = async () => {
  await importer.seedData({
    seedSource: 'gs'
  });
  let start = microtime.now();
  await importer.start();
  importer.on('end', () => {
    let elapstedTimeMs = microtime.now() - start;
    console.log(`Time elapased: ${elapstedTimeMs}`);
  });
};

runBenchmark();
