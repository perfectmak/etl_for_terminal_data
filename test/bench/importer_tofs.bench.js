const microtime = require('microtime');
const appRoot = require('app-root-path');
const importer = require('../../src/importer');

const benchPath = appRoot + '/test/bench';
/**
 * Test how fast ingesting from the local filesytem would be.
 * 
 */
const runBenchmark = async () => {
  await importer.seedData({
    seedSource: 'gs',
    toFs: true,
    seedSourcePath: benchPath,
    seedSize: 10
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
