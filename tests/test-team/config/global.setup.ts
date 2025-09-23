import { randomUUID } from 'node:crypto';

async function globalSetup() {
  process.env.PLAYWRIGHT_RUN_ID = randomUUID();
  console.log(`=== RunId: ${process.env.PLAYWRIGHT_RUN_ID} ===`);
}

export default globalSetup;
