'use client';

import { Button, Card, Details, Radios, Table } from 'nhsuk-react-components';
import MarkdownIt from 'markdown-it';

export default function Page() {

  const md = new MarkdownIt();

  const result = md.render('# markdown-it rulezz!');

  return (
    <>
      <p>Text message template</p>
      <h1>SMS template name</h1>
      <Details>
        <Details.Summary>
          Who your text message will be sent from
        </Details.Summary>
        <Details.Text>
          <p>Set your text message sender name during onboarding.</p>
          <p>
            If you need to set up a different text message sender name for other
            messages, contact our onboarding team.
          </p>
        </Details.Text>
      </Details>
      <Card>
        <Card.Content>
          <div className='nhsuk-grid-row'>
            <div className='nhsuk-grid-column-one-quarter'>
              <h5>Message</h5>
            </div>
            <div className='nhsuk-grid-column-two-thirds'>
              <span dangerouslySetInnerHTML={{ __html: result }} />
            </div>
          </div>
        </Card.Content>
      </Card>
      <h2>What would you like to do next with this template?</h2>
      <form>
        <Radios id='what-would-you-like-to-do-next' name='choices'>
          <Radios.Radio value='edit'>Edit</Radios.Radio>
          <Radios.Radio value='send'>Send a text message</Radios.Radio>
          <Radios.Radio value='submit'>Submit</Radios.Radio>
        </Radios>
        <Button>Continue</Button>
      </form>
    </>
  );
}
