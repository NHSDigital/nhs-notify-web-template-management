/**
 * Calculates how many SMS messages are needed to send the given message.
 * This function replicates SMS logic states here
 * https://www.notifications.service.gov.uk/pricing/text-messages#long-text-messages
 * @param {number} characterCount The number of characters in the message.
 * @returns {number} The number of SMS messages needed.
 */
export const calculateHowManySmsMessages = (characterCount: number): number => {
  if (Number.isNaN(characterCount)) return 0;

  if (characterCount > 0 && characterCount <= 160) return 1;

  return Math.ceil(characterCount / 153);
};
