import React from 'react';

/** Props stripped from motion wrappers (animation-related, not forwarded to DOM) */
interface MotionStripProps {
  animate?: unknown;
  initial?: unknown;
  exit?: unknown;
  transition?: unknown;
  layoutId?: string;
  whileHover?: unknown;
  whileTap?: unknown;
}

/** Generic factory: strips motion-specific props and passes rest to the HTML element */
type MotionComponent<T extends keyof React.JSX.IntrinsicElements> =
  (props: MotionStripProps & React.JSX.IntrinsicElements[T]) => React.JSX.Element;

function makeMotion<T extends keyof React.JSX.IntrinsicElements>(Tag: T): MotionComponent<T> {
  return ({ animate, initial, exit, transition, layoutId, whileHover, whileTap, ...props }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return React.createElement(Tag, props as any);
  };
}

// Mock motion to avoid fginspector ForwardRef errors
export const motion = {
  div: makeMotion('div'),
  button: makeMotion('button'),
  span: makeMotion('span'),
  li: makeMotion('li'),
  ul: makeMotion('ul'),
  a: makeMotion('a'),
  p: makeMotion('p'),
  h1: makeMotion('h1'),
  h2: makeMotion('h2'),
  h3: makeMotion('h3'),
  section: makeMotion('section'),
  tr: makeMotion('tr'),
  td: makeMotion('td'),
  th: makeMotion('th'),
  tbody: makeMotion('tbody'),
  thead: makeMotion('thead'),
  table: makeMotion('table'),
};

export const AnimatePresence = ({ children }: { children?: React.ReactNode }) => <div className="contents">{children}</div>;
