import { render } from '@testing-library/react';
import { Modal } from '@molecules/Modal/Modal';

const dialogCloseMock = jest.fn(function mock(this: HTMLDialogElement) {
  this.open = false;
});

const dialogOpenMock = jest.fn(function mock(this: HTMLDialogElement) {
  this.open = true;
});

describe('Modal', () => {
  beforeAll(() => {
    jest.resetAllMocks();

    // Polyfill dialog actions since JSDOM does not support it
    // https://github.com/jsdom/jsdom/issues/3294
    HTMLDialogElement.prototype.showModal = dialogOpenMock;

    HTMLDialogElement.prototype.close = dialogCloseMock;
  });

  test('should match snapshot', async () => {
    const { container } = render(
      <Modal showModal={false}>
        <Modal.Header>Header</Modal.Header>
        <Modal.Header>Body</Modal.Header>
        <Modal.Header>Footer</Modal.Header>
      </Modal>
    );

    expect(container).toMatchSnapshot();
  });

  test('should open modal', async () => {
    render(
      <Modal showModal>
        <Modal.Header>Header</Modal.Header>
        <Modal.Header>Body</Modal.Header>
        <Modal.Header>Footer</Modal.Header>
      </Modal>
    );

    expect(dialogCloseMock).not.toHaveBeenCalled();

    expect(dialogOpenMock).toHaveBeenCalledTimes(1);
  });

  test('should close modal', async () => {
    render(
      <Modal showModal={false}>
        <Modal.Header>Header</Modal.Header>
        <Modal.Header>Body</Modal.Header>
        <Modal.Header>Footer</Modal.Header>
      </Modal>
    );

    expect(dialogOpenMock).not.toHaveBeenCalled();

    expect(dialogCloseMock).toHaveBeenCalledTimes(1);
  });
});
