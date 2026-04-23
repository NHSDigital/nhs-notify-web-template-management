import React from 'react';
import {
  ContentBlock,
  ContentRenderer,
} from '@molecules/ContentRenderer/ContentRenderer';
import { addClassNameToContentBlock } from '@utils/add-classname-to-content-block';
import { render } from '@testing-library/react';

describe('block type content', () => {
  it('adds the given classname to the content', () => {
    const content: ContentBlock = {
      type: 'text',
      text: 'Hello',
    };

    const result = addClassNameToContentBlock(content, 'new-class-name');

    expect(result).toEqual({
      type: 'text',
      text: 'Hello',
      overrides: {
        p: {
          props: {
            className: 'new-class-name',
          },
        },
      },
    });

    expect(
      render(<ContentRenderer content={[result]} />).asFragment()
    ).toMatchSnapshot();
  });

  it('adds the given classname when existing override has no props', () => {
    const content: ContentBlock = {
      type: 'text',
      text: 'Hello',
      overrides: {
        p: { component: 'em' },
      },
    };

    const result = addClassNameToContentBlock(content, 'new-class-name');

    expect(result).toEqual({
      type: 'text',
      text: 'Hello',
      overrides: {
        p: {
          component: 'em',
          props: {
            className: 'new-class-name',
          },
        },
      },
    });

    expect(
      render(<ContentRenderer content={[result]} />).asFragment()
    ).toMatchSnapshot();
  });

  it('merges with existing override props', () => {
    const content: ContentBlock = {
      type: 'text',
      text: 'Hello',
      overrides: {
        p: {
          component: 'h1',
          props: {
            foo: 'bar',
            className: 'old-class-name',
          },
        },
        div: {
          props: {
            className: 'div-class',
          },
        },
      },
    };

    const result = addClassNameToContentBlock(content, 'new-class-name');

    expect(result).toEqual({
      type: 'text',
      text: 'Hello',
      overrides: {
        p: {
          component: 'h1',
          props: {
            foo: 'bar',
            className: 'old-class-name new-class-name',
          },
        },
        div: {
          props: {
            className: 'div-class',
          },
        },
      },
    });

    expect(
      render(<ContentRenderer content={[result]} />).asFragment()
    ).toMatchSnapshot();
  });

  describe('existing override is not an object', () => {
    const cases: { case: string; override: React.ElementType }[] = [
      { case: 'element name', override: 'h1' },
      { case: 'component', override: (props) => <strong {...props} /> },
    ];
    it.each(cases)(
      'adds the classname when override is $case',
      ({ override }) => {
        const content: ContentBlock = {
          type: 'text',
          text: 'Hello',
          overrides: {
            p: override,
          },
        };

        const result = addClassNameToContentBlock(content, 'new-class-name');

        expect(result).toEqual({
          type: 'text',
          text: 'Hello',
          overrides: {
            p: {
              component: override,
              props: { className: 'new-class-name' },
            },
          },
        });

        expect(
          render(<ContentRenderer content={[result]} />).asFragment()
        ).toMatchSnapshot();
      }
    );
  });
});

describe('inline-block type content', () => {
  it('adds the given classname to the content', () => {
    const content: ContentBlock = {
      type: 'inline-text',
      text: 'Hello',
    };

    const result = addClassNameToContentBlock(content, 'new-class-name');

    expect(result).toEqual({
      type: 'inline-text',
      text: 'Hello',
      overrides: {
        span: {
          props: {
            className: 'new-class-name',
          },
        },
      },
    });

    expect(
      render(<ContentRenderer content={[result]} />).asFragment()
    ).toMatchSnapshot();
  });

  it('adds the given classname when existing override has no props', () => {
    const content: ContentBlock = {
      type: 'inline-text',
      text: 'Hello',
      overrides: {
        span: { component: 'em' },
      },
    };

    const result = addClassNameToContentBlock(content, 'new-class-name');

    expect(result).toEqual({
      type: 'inline-text',
      text: 'Hello',
      overrides: {
        span: {
          component: 'em',
          props: {
            className: 'new-class-name',
          },
        },
      },
    });

    expect(
      render(<ContentRenderer content={[result]} />).asFragment()
    ).toMatchSnapshot();
  });

  it('merges with existing override props', () => {
    const content: ContentBlock = {
      type: 'inline-text',
      text: 'Hello',
      overrides: {
        span: {
          props: {
            foo: 'bar',
            className: 'old-class-name',
          },
        },
        div: {
          props: {
            className: 'div-class',
          },
        },
      },
    };

    const result = addClassNameToContentBlock(content, 'new-class-name');

    expect(result).toEqual({
      type: 'inline-text',
      text: 'Hello',
      overrides: {
        span: {
          props: {
            foo: 'bar',
            className: 'old-class-name new-class-name',
          },
        },
        div: {
          props: {
            className: 'div-class',
          },
        },
      },
    });

    expect(
      render(<ContentRenderer content={[result]} />).asFragment()
    ).toMatchSnapshot();
  });

  describe('existing override is not an object', () => {
    const cases: { case: string; override: React.ElementType }[] = [
      { case: 'element name', override: 'h1' },
      { case: 'component', override: (props) => <strong {...props} /> },
    ];
    it.each(cases)(
      'adds the classname when override is $case',
      ({ override }) => {
        const content: ContentBlock = {
          type: 'inline-text',
          text: 'Hello',
          overrides: {
            span: override,
          },
        };

        const result = addClassNameToContentBlock(content, 'new-class-name');

        expect(result).toEqual({
          type: 'inline-text',
          text: 'Hello',
          overrides: {
            span: {
              component: override,
              props: { className: 'new-class-name' },
            },
          },
        });

        expect(
          render(<ContentRenderer content={[result]} />).asFragment()
        ).toMatchSnapshot();
      }
    );
  });
});

describe('code type content', () => {
  it('returns the unmodified block', () => {
    const content: ContentBlock = {
      type: 'code',
      code: 'Hello',
      aria: {
        text: 'code example',
        id: 'example-id',
      },
    };

    expect(addClassNameToContentBlock(content, 'new-class-name')).toEqual(
      content
    );
  });
});
