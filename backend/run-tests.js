import { startVitest } from 'vitest/node';

async function run() {
  const vitest = await startVitest('test', process.argv.slice(2), {
    config: false,
    watch: false,
    environment: 'node',
    testTimeout: 60000,
    hookTimeout: 60000,
    fileParallelism: false,
  });
  await vitest?.close();
  if (vitest?.state?.getCountOfFailedTests() > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
