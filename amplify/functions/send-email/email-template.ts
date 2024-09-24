export const emailTemplate = (
  templateId: string,
  templateName: string
): string => {
  return `<!DOCTYPE html>
<html lang="en">

<head>
  <style type="text/css">
    @media all {
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
    }

    table {
      display: block;
    }
  </style>
</head>

<body style="width: 100% !important; margin: 0; padding: 0; line-height: 1.5; background-color: #fff;">
          <table style="margin: 0 auto; width: 100%; max-width: 450px; table-layout: fixed; padding: 12px;">
            <tr>
              <th style="height: 50px; width: 80px;">
                <img src="data:image/jpg;base64,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" alt="NHS Logo" width="90" />
              </th>
              <td>
                <p style="margin-left: 12px; font-family: 'Frutiger W01', Arial, Sans-serif; font-size: 16px;">Notify</p>
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <p style="margin: 10px 0 30px 0; font-family: 'Frutiger W01', Arial, Sans-serif; font-size: 16px;">You have
                  successfully submitted your template to NHS Notify.</p>
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <h4 style="margin: 0 0 5px 0; font-family: 'Frutiger W01', Arial, Sans-serif; font-size: 16px;">Template name</h4>
                <p style="margin: 0 0 30px 0; font-family: 'Frutiger W01', Arial, Sans-serif; font-size: 16px;">${templateName}</p>
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <h4 style="margin: 0 0 5px 0; font-family: 'Frutiger W01', Arial, Sans-serif; font-size: 16px;">Template ID</h4>
                <p style="margin: 0 0 30px 0; font-family: 'Frutiger W01', Arial, Sans-serif; font-size: 16px;">${templateId}</p>
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <h4 style="margin: 0 0 5px 0; font-family: 'Frutiger W01', Arial, Sans-serif; font-size: 16px;">Template content
                </h4>
                <p style="margin: 0 0 30px 0; color: #858787; font-family: 'Frutiger W01', Arial, Sans-serif; font-size: 16px;">
                  This content does not have your formatting applied. This is not how your message will look when it's sent to
                  recipients.
                </p>
              </td>
            </tr>
            <tr>
              <td colspan="2" style="background-color: #e8ecee; padding: 24px;">
                <p style="font-family: 'Frutiger W01', Arial, Sans-serif; font-size: 16px; margin-top: 0;"># Message heading</p>
                <p style="font-family: 'Frutiger W01', Arial, Sans-serif; font-size: 16px;">## Heading 2</p>
                <p style="font-family: 'Frutiger W01', Arial, Sans-serif; font-size: 16px;">**bold text**</p>
                <p style="font-family: 'Frutiger W01', Arial, Sans-serif; font-size: 16px;">*This text will be italic*</p>
                <p style="font-family: 'Frutiger W01', Arial, Sans-serif; font-size: 16px;">
                  <span style="display: block;">* bullet</span>
                  <span style="display: block;">* bullet</span>
                  <span style="display: block;">* bullet</span>
                </p>
                <p style="font-family: 'Frutiger W01', Arial, Sans-serif; font-size: 16px;">[link text](www.google.com)</p>

                <p style="font-family: 'Frutiger W01', Arial, Sans-serif; font-size: 16px;">### Ordered</p>

                <ol style="margin-left: 0; padding-left: 20px; font-family: 'Frutiger W01', Arial, Sans-serif; font-size: 16px;">
                  <li>Item 1</li>
                  <li>Item 2</li>
                  <li>Item 3</li>
                  <ol
                    style="margin-left: 0; padding-left: 16px; font-family: 'Frutiger W01', Arial, Sans-serif; font-size: 16px;">
                    <li>Item 3a</li>
                    <li>Item 3b</li>
                  </ol>
                </ol>
              </td>
            </tr>
          </table>
</body>

</html>
`;
};
