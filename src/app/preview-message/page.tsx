'use client';

import { PreviewTextMessage } from '../../components/forms/PreviewTextMessage/PreviewTextMessage';
import { PreviewEmail } from '../../components/forms/PreviewEmail/PreviewEmail';
import { PreviewLetter } from '../../components/forms/PreviewLetter/PreviewLetter';
import { PreviewNHSApp } from '../../components/forms/PreviewNHSApp/PreviewNHSApp';

export default function Page(context: unknown) {
  const smsMD = String(`
This is the SMS. it doesn't support any MD options. All links must be full links
so trying to a MD link will not work.

Or a new paragraph. Let's try MD link [hello link](#)
`);
  const sms = (
    <PreviewTextMessage templateName='template-1-sms' message={smsMD} />
  );

  const emailMD = String(`
# This is the intro to the email

## A sub heading!

This is what I expect the body to look like

* I have a list of items 1
* I have a list of items 2

1. This is an ordered list item
2. This is an ordered list item

---

Above me should be a horizontal rule

and here is a [link](https://www.nhs.uk/example)

and a full URL https://www.nhs.uk/example`);

  const email = (
    <PreviewEmail
      templateName='template-1-email'
      message={emailMD}
      subject='This is the subject'
    />
  );

  const letterMD = String(`
# This is the intro to the Letter

## A sub heading!

This is what I expect the body to look like

* I have a list of items 1
* I have a list of items 2

1. This is an ordered list item
2. This is an ordered list item

---

**BOLD**

Above me should be a horizontal rule

and a full URL https://www.nhs.uk/example

***

Above is a page break?

this is a line break  Hello I'm a new line!
`);
  const letter = (
    <PreviewLetter
      templateName='template-1-letter'
      heading='The main heading of the letter'
      bodyText={letterMD}
    />
  );

  // TODO: LINE BREAKS
  const nhsAppMD = String(`
# This is the intro to the NHS APP

## A sub heading!

This is what I expect the body to look like

* I have a list of items 1
* I have a list of items 2

1. This is an ordered list item
2. This is an ordered list item

**BOLD**

and here is a [link](https://www.nhs.uk/example)

and a full URL https://www.nhs.uk/example

this is a line break  Hello I'm a new line!
`);
  const nhsApp = (
    <PreviewNHSApp templateName='template-1-nhsApp' message={nhsAppMD} />
  );

  return letter;
}
