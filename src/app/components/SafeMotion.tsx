import React from 'react';

// Mock motion to avoid fginspector ForwardRef errors
export const motion = {
  div: ({ animate, initial, exit, transition, layoutId, whileHover, whileTap, ...props }: any) => <div {...props} />,
  button: ({ animate, initial, exit, transition, layoutId, whileHover, whileTap, ...props }: any) => <button {...props} />,
  span: ({ animate, initial, exit, transition, layoutId, whileHover, whileTap, ...props }: any) => <span {...props} />,
  li: ({ animate, initial, exit, transition, layoutId, whileHover, whileTap, ...props }: any) => <li {...props} />,
  ul: ({ animate, initial, exit, transition, layoutId, whileHover, whileTap, ...props }: any) => <ul {...props} />,
  a: ({ animate, initial, exit, transition, layoutId, whileHover, whileTap, ...props }: any) => <a {...props} />,
  p: ({ animate, initial, exit, transition, layoutId, whileHover, whileTap, ...props }: any) => <p {...props} />,
  h1: ({ animate, initial, exit, transition, layoutId, whileHover, whileTap, ...props }: any) => <h1 {...props} />,
  h2: ({ animate, initial, exit, transition, layoutId, whileHover, whileTap, ...props }: any) => <h2 {...props} />,
  h3: ({ animate, initial, exit, transition, layoutId, whileHover, whileTap, ...props }: any) => <h3 {...props} />,
  section: ({ animate, initial, exit, transition, layoutId, whileHover, whileTap, ...props }: any) => <section {...props} />,
  tr: ({ animate, initial, exit, transition, layoutId, whileHover, whileTap, ...props }: any) => <tr {...props} />,
  td: ({ animate, initial, exit, transition, layoutId, whileHover, whileTap, ...props }: any) => <td {...props} />,
  th: ({ animate, initial, exit, transition, layoutId, whileHover, whileTap, ...props }: any) => <th {...props} />,
  tbody: ({ animate, initial, exit, transition, layoutId, whileHover, whileTap, ...props }: any) => <tbody {...props} />,
  thead: ({ animate, initial, exit, transition, layoutId, whileHover, whileTap, ...props }: any) => <thead {...props} />,
  table: ({ animate, initial, exit, transition, layoutId, whileHover, whileTap, ...props }: any) => <table {...props} />,
};

export const AnimatePresence = ({ children }: any) => <>{children}</>;