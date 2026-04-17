import { createHmac, type Hmac } from 'node:crypto';
import type { ContactDetail } from 'nhs-notify-web-template-management-types';

function updateWithLengthPrefix(hmac: Hmac, value: string): void {
  hmac.update(`${value.length}:`);
  hmac.update(value);
}

export function hashContactDetailsOtp(
  details: ContactDetail,
  otp: string,
  secret: string
): string {
  const hmac = createHmac('sha256', secret);

  updateWithLengthPrefix(hmac, details.id);
  updateWithLengthPrefix(hmac, details.value);
  updateWithLengthPrefix(hmac, otp);

  return hmac.digest().toString('hex');
}
