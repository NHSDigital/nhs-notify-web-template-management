import { writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

const secret = process.env.CSRF_SECRET ?? randomBytes(16).toString('hex');

writeFileSync(
  './frontend/.env',
  [`CSRF_SECRET=${secret}`, 'NEXT_PUBLIC_ENABLE_PROOFING=true'].join('\n')
);
