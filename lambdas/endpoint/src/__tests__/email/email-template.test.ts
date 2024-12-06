import { emailTemplate } from '../../email/email-template';

const testMarkdown =
  '# Message heading' +
  '\n\n## Heading 2' +
  '\n\n**bold text**' +
  '\n\n*This text will be italic*' +
  '\n\n* bullet' +
  '\n* bullet' +
  '\n* bullet' +
  '\n\n[link text](https://www.nhs.uk/)' +
  '\n\n### Ordered' +
  '\n1. Item 1' +
  '\n2. Item 2' +
  '\n3. Item 3' +
  '\n   1. Item 3a' +
  '\n   2. Item 3b';
test('generate email content', () => {
  const result = emailTemplate('test-id', 'test-name', testMarkdown);
  expect(result).toMatchSnapshot();
});
