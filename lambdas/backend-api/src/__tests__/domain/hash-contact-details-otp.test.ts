import type { ContactDetail } from 'nhs-notify-web-template-management-types';
import { hashContactDetailsOtp } from '../../domain/hash-contact-details-otp';

describe('hashContactDetailsOtp', () => {
  const contactDetail: ContactDetail = {
    id: 'contact-123',
    value: 'user@example.com',
    type: 'EMAIL',
    status: 'PENDING_VERIFICATION',
  };

  const testOtp = '123456';
  const testSecret = 'test-secret-key';

  it('should generate a valid hex string hash', () => {
    const hash = hashContactDetailsOtp(contactDetail, testOtp, testSecret);

    expect(hash).toMatch(/^[\da-f]+$/);
    expect(hash.length).toBe(64);
  });

  it('should produce consistent hashes for identical inputs', () => {
    const hash1 = hashContactDetailsOtp(contactDetail, testOtp, testSecret);
    const hash2 = hashContactDetailsOtp(contactDetail, testOtp, testSecret);

    expect(hash1).toBe(hash2);
  });

  it('should produce different hashes for different contact detail ids', () => {
    const contactDetail1: ContactDetail = {
      ...contactDetail,
      id: 'contact-abc',
    };
    const contactDetail2: ContactDetail = {
      ...contactDetail,
      id: 'contact-xyz',
    };

    const hash1 = hashContactDetailsOtp(contactDetail1, testOtp, testSecret);
    const hash2 = hashContactDetailsOtp(contactDetail2, testOtp, testSecret);

    expect(hash1).not.toBe(hash2);
  });

  it('should produce different hashes for different contact detail values', () => {
    const contactDetail1: ContactDetail = {
      ...contactDetail,
      value: 'user1@example.com',
    };
    const contactDetail2: ContactDetail = {
      ...contactDetail,
      value: 'user2@example.com',
    };

    const hash1 = hashContactDetailsOtp(contactDetail1, testOtp, testSecret);
    const hash2 = hashContactDetailsOtp(contactDetail2, testOtp, testSecret);

    expect(hash1).not.toBe(hash2);
  });

  it('should produce different hashes for different OTPs', () => {
    const hash1 = hashContactDetailsOtp(contactDetail, '123456', testSecret);
    const hash2 = hashContactDetailsOtp(contactDetail, '654321', testSecret);

    expect(hash1).not.toBe(hash2);
  });

  it('should produce different hashes for different secrets', () => {
    const hash1 = hashContactDetailsOtp(contactDetail, testOtp, 'secret-1');
    const hash2 = hashContactDetailsOtp(contactDetail, testOtp, 'secret-2');

    expect(hash1).not.toBe(hash2);
  });

  it('should produce different hashes when contact detail ID differs', () => {
    const contactDetail1: ContactDetail = {
      ...contactDetail,
      id: 'contact-abc',
    };
    const contactDetail2: ContactDetail = {
      ...contactDetail,
      id: 'contact-xyz',
    };

    const hash1 = hashContactDetailsOtp(contactDetail1, testOtp, testSecret);
    const hash2 = hashContactDetailsOtp(contactDetail2, testOtp, testSecret);

    expect(hash1).not.toBe(hash2);
  });

  it('should use length-prefixed format to avoid collisions', () => {
    const contactDetail1: ContactDetail = {
      ...contactDetail,
      id: 'abc',
      value: 'de',
    };
    const contactDetail2: ContactDetail = {
      ...contactDetail,
      id: 'ab',
      value: 'cdef',
    };

    const hash1 = hashContactDetailsOtp(contactDetail1, 'f12', testSecret);
    const hash2 = hashContactDetailsOtp(contactDetail2, '12', testSecret);

    // With length-prefixing: "3:abc2:de3:f12" vs "2:ab4:cdef2:12"
    // Without length-prefixing: "abcdef12" vs "abcdef12"
    expect(hash1).not.toBe(hash2);
  });
});
