import classNames from 'classnames';
import type {
  ContentBlock,
  MarkdownToJSX,
} from '@molecules/ContentRenderer/ContentRenderer';

function hasClassName(props: object): props is { className: string } {
  return Object.hasOwn(props, 'className');
}

function addClassNameToProps(props: object, className: string): object {
  const existing = hasClassName(props) ? props.className : '';
  return {
    ...props,
    className: classNames(existing, className),
  };
}

function addClassNameToOverride(
  override: MarkdownToJSX.Override,
  className: string
): MarkdownToJSX.Override {
  if (typeof override !== 'object') {
    return {
      component: override,
      props: {
        className,
      },
    };
  }

  const props = override.props ?? {};

  return {
    ...override,
    props: addClassNameToProps(props, className),
  };
}

function addClassNameToOverrides(
  overrides: MarkdownToJSX.Overrides | undefined,
  elementName: 'p' | 'span',
  className: string
): MarkdownToJSX.Overrides {
  const existing = overrides?.[elementName] ?? { props: {} };

  return {
    ...overrides,
    [elementName]: addClassNameToOverride(existing, className),
  };
}

export function addClassNameToContentBlock(
  item: ContentBlock,
  className: string
): ContentBlock {
  if (item.type === 'code') {
    return item;
  }

  const elementName = item.type === 'text' ? 'p' : 'span';

  return {
    ...item,
    overrides: addClassNameToOverrides(item.overrides, elementName, className),
  };
}
