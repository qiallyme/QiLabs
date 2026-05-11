import { ReactNode } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';

interface ResizablePanelGroupProps {
  children: ReactNode;
  direction?: 'horizontal' | 'vertical';
  className?: string;
}

interface ResizablePanelProps {
  children: ReactNode;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  className?: string;
}

/**
 * Resizable panel group component
 * Wrapper around react-resizable-panels for consistent styling
 */
export function ResizablePanelGroup({
  children,
  direction = 'horizontal',
  className = '',
}: ResizablePanelGroupProps) {
  return (
    <PanelGroup direction={direction} className={className}>
      {children}
    </PanelGroup>
  );
}

/**
 * Resizable panel component
 */
export function ResizablePanel({
  children,
  defaultSize,
  minSize = 10,
  maxSize = 90,
  className = '',
}: ResizablePanelProps) {
  return (
    <Panel
      defaultSize={defaultSize}
      minSize={minSize}
      maxSize={maxSize}
      className={className}
    >
      {children}
    </Panel>
  );
}

/**
 * Resizable handle component
 */
export function ResizableHandle({ className = '' }: { className?: string }) {
  return (
    <PanelResizeHandle
      className={`w-1 bg-white/10 hover:bg-white/20 transition-colors ${className}`}
    />
  );
}

