// ================================================================
// Universal Empty Module Stub
// ================================================================
// Used by Vite aliases to neutralize uninstalled packages
// (@radix-ui/*, next-themes, react-force-graph-3d, etc.)
// Provides both default and common named exports to prevent
// runtime errors when dead-code files reference these packages.
// ================================================================

const noop = () => {};
const NoopComponent = () => null;

// Common @radix-ui named exports
export const Slot = NoopComponent;
export const Root = NoopComponent;
export const Trigger = NoopComponent;
export const Content = NoopComponent;
export const Portal = NoopComponent;
export const Overlay = NoopComponent;
export const Close = NoopComponent;
export const Title = NoopComponent;
export const Description = NoopComponent;
export const Item = NoopComponent;
export const Indicator = NoopComponent;
export const Thumb = NoopComponent;
export const Track = NoopComponent;
export const Range = NoopComponent;
export const Group = NoopComponent;
export const Label = NoopComponent;
export const Separator = NoopComponent;
export const Arrow = NoopComponent;
export const Viewport = NoopComponent;
export const ScrollUpButton = NoopComponent;
export const ScrollDownButton = NoopComponent;
export const Value = NoopComponent;
export const Icon = NoopComponent;
export const ItemText = NoopComponent;
export const ItemIndicator = NoopComponent;
export const Sub = NoopComponent;
export const SubTrigger = NoopComponent;
export const SubContent = NoopComponent;
export const RadioItem = NoopComponent;
export const RadioGroup = NoopComponent;
export const CheckboxItem = NoopComponent;
export const Header = NoopComponent;
export const Footer = NoopComponent;
export const Action = NoopComponent;
export const Cancel = NoopComponent;
export const List = NoopComponent;
export const Link = NoopComponent;

// next-themes exports
export const useTheme = () => ({ theme: 'dark', setTheme: noop, resolvedTheme: 'dark' });
export const ThemeProvider = NoopComponent;

// Default export (for `import X from '...'`)
export default {};
