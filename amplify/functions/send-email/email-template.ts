export const emailTemplate = (templateId: string, templateName: string): string => {
  return `
    <!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <meta name="description" content="">

  <title>NHS Notify</title>

  <style>
    @font-face {
      font-display: swap;
      font-family: "Frutiger W01";
      font-style: normal;
      font-weight: 400;
      src: url(https://assets.nhs.uk/fonts/FrutigerLTW01-55Roman.eot?#iefix);
      src: url(https://assets.nhs.uk/fonts/FrutigerLTW01-55Roman.eot?#iefix) format("eot"),
      url(https://assets.nhs.uk/fonts/FrutigerLTW01-55Roman.woff2) format("woff2"),
      url(https://assets.nhs.uk/fonts/FrutigerLTW01-55Roman.woff) format("woff"),
      url(https://assets.nhs.uk/fonts/FrutigerLTW01-55Roman.ttf) format("truetype"),
      url(https://assets.nhs.uk/fonts/FrutigerLTW01-55Roman.svg#7def0e34-f28d-434f-b2ec-472bde847115) format("svg")
    }

    @font-face {
      font-display: swap;
      font-family: "Frutiger W01";
      font-style: normal;
      font-weight: 600;
      src: url(https://assets.nhs.uk/fonts/FrutigerLTW01-65Bold.eot?#iefix);
      src: url(https://assets.nhs.uk/fonts/FrutigerLTW01-65Bold.eot?#iefix) format("eot"),
      url(https://assets.nhs.uk/fonts/FrutigerLTW01-65Bold.woff2) format("woff2"),
      url(https://assets.nhs.uk/fonts/FrutigerLTW01-65Bold.woff) format("woff"),
      url(https://assets.nhs.uk/fonts/FrutigerLTW01-65Bold.ttf) format("truetype"),
      url(https://assets.nhs.uk/fonts/FrutigerLTW01-65Bold.svg#eae74276-dd78-47e4-9b27-dac81c3411ca) format("svg")
    }

    html{
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      overflow-y: scroll;
      font-family: "Frutiger W01", Arial, Sans-serif
    }

    body {
      display: flex;
      justify-content: center;
      padding: 3rem;
      font-size: 1rem;

      .container {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-width: 420px;

        .logo-display {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .content-wrapper {
          display: flex;
          flex-direction: column;
          margin-top: 1.5rem;
          line-height: 1.5;

          h4, p {
            margin: 0;
          }

          .light-grey {
            color: #858787;
          }
        }

        .mark-down {
          gap: 1rem;
          background-color: #e8ecee;
          padding: 2rem;
        }
      }

      p {
        line-height: 1.5;
      }

      span {
        display: block;
      }

      ol, li {
        margin-left: 0.5rem;
        padding: 0;
      }

      ol, li li {
        margin-left: 0.5rem;
        padding: 0;
      }
    }


  </style>

</head>

<body>
  <div class="container">
    <header class="logo-display">
      <svg class="nhsuk-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 16" height="40" width="100">
        <path class="nhsuk-logo__background" fill="#005eb8" d="M0 0h40v16H0z"></path>
        <path class="nhsuk-logo__text" fill="#fff"
          d="M3.9 1.5h4.4l2.6 9h.1l1.8-9h3.3l-2.8 13H9l-2.7-9h-.1l-1.8 9H1.1M17.3 1.5h3.6l-1 4.9h4L25 1.5h3.5l-2.7 13h-3.5l1.1-5.6h-4.1l-1.2 5.6h-3.4M37.7 4.4c-.7-.3-1.6-.6-2.9-.6-1.4 0-2.5.2-2.5 1.3 0 1.8 5.1 1.2 5.1 5.1 0 3.6-3.3 4.5-6.4 4.5-1.3 0-2.9-.3-4-.7l.8-2.7c.7.4 2.1.7 3.2.7s2.8-.2 2.8-1.5c0-2.1-5.1-1.3-5.1-5 0-3.4 2.9-4.4 5.8-4.4 1.6 0 3.1.2 4 .6">
        </path>
      </svg>
      <p>Notify</p>
    </header>

    <main role="main">
      <p>You have successfully submitted your template to NHS Notify.</p>
      <div class="content-wrapper">
        <h4>Template name</h4>
        <p>${templateName}</p>
      </div>
      <div class="content-wrapper">
        <h4>Template ID</h4>
        <p>${templateId}</p>
      </div>
      <div class="content-wrapper">
        <h4>Template content</h4>
        <p class="light-grey">This content does not have your formatting applied. This is not how your message will look
          when it's sent to recipients.</p>
      </div>

      <div class="content-wrapper mark-down">
        <p># Message heading</p>
        <p>## Heading 2</p>
        <p>**bold text**</p>
        <p>*This text will be italic*</p>
        <p>
          <span>* bullet</span>
          <span>* bullet</span>
          <span>* bullet</span>
        </p>
        <p>[link text](www.google.com)</p>

        <p>### Ordered</p>

        <ol>
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
            <ol>
              <li>Item 3a</li>
              <li>Item 3b</li>
            </ol>
        </ol>
      </div>
    </main>
  </div>

</body>

</html>

  `;
};
