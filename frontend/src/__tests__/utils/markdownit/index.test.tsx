import {
  renderEmailMarkdown,
  renderNHSAppMarkdown,
  renderSMSMarkdown,
} from '@utils/markdownit';
import { markdown } from '../../components/forms/fixtures';

describe('renderEmailMarkdown', () => {
  it('should render markdown matching GOVUK Notify email rules', () => {
    expect(renderEmailMarkdown(markdown)).toMatchSnapshot();
  });
});

describe('renderNHSAppMarkdown', () => {
  it('should render markdown matching NHSApp email rules', () => {
    expect(renderNHSAppMarkdown(markdown)).toMatchSnapshot();
  });
});

describe('renderSMSMarkdown', () => {
  it('should render markdown matching GOVUK Notify SMS rules', () => {
    expect(renderSMSMarkdown(markdown)).toMatchSnapshot();
  });
});
