// import { render, screen } from '@testing-library/react';
// import { PreviewEmail } from '@forms/PreviewEmail/PreviewEmail';

// describe('Preview email form renders', () => {
//   it('matches snapshot', () => {
//     const container = render(
//       <PreviewEmail
//         templateName='test-template-email'
//         subject='email subject'
//         message='email message body'
//       />
//     );

//     expect(container.asFragment()).toMatchSnapshot();
//   });

//   it('renders component correctly', () => {
//     render(
//       <PreviewEmail
//         templateName='test-template-email'
//         subject='email subject'
//         message='email message body'
//       />
//     );
//     expect(screen.getByTestId('page-break')).toBeInTheDocument();

//     expect(screen.getByTestId('page-break__content')).toHaveTextContent(
//       'Page Break'
//     );
//   });
// });
