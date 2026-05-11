import { ReactNode, useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  side?: 'left' | 'right' | 'top' | 'bottom';
}

interface SheetContentProps {
  children: ReactNode;
  className?: string;
}

interface SheetHeaderProps {
  children: ReactNode;
  className?: string;
}

interface SheetTitleProps {
  children: ReactNode;
  className?: string;
}

interface SheetDescriptionProps {
  children: ReactNode;
  className?: string;
}

interface SheetTriggerProps {
  children: ReactNode;
  asChild?: boolean;
  onClick?: () => void;
}

/**
 * Sheet component (drawer/sidebar)
 * Simplified version for QiNote
 */
export function Sheet({ open, onOpenChange, children, side = 'right' }: SheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{
              x: side === 'right' ? '100%' : side === 'left' ? '-100%' : 0,
              y: side === 'top' ? '-100%' : side === 'bottom' ? '100%' : 0,
            }}
            animate={{ x: 0, y: 0 }}
            exit={{
              x: side === 'right' ? '100%' : side === 'left' ? '-100%' : 0,
              y: side === 'top' ? '-100%' : side === 'bottom' ? '100%' : 0,
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`
              fixed z-50 glass-strong border-white/20
              ${side === 'right' || side === 'left' ? 'top-0 bottom-0 w-96 max-w-[90vw]' : ''}
              ${side === 'right' ? 'right-0' : ''}
              ${side === 'left' ? 'left-0' : ''}
              ${side === 'top' || side === 'bottom' ? 'left-0 right-0 h-96 max-h-[90vh]' : ''}
              ${side === 'top' ? 'top-0' : ''}
              ${side === 'bottom' ? 'bottom-0' : ''}
            `}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function SheetContent({ children, className = '' }: SheetContentProps) {
  return (
    <div className={`h-full flex flex-col p-6 ${className}`}>
      {children}
    </div>
  );
}

export function SheetHeader({ children, className = '' }: SheetHeaderProps) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function SheetTitle({ children, className = '' }: SheetTitleProps) {
  return (
    <h2 className={`text-xl font-semibold text-white mb-2 ${className}`}>
      {children}
    </h2>
  );
}

export function SheetDescription({ children, className = '' }: SheetDescriptionProps) {
  return (
    <p className={`text-sm text-gray-300 ${className}`}>{children}</p>
  );
}

export function SheetTrigger({ children, onClick }: SheetTriggerProps) {
  return <div onClick={onClick}>{children}</div>;
}

export function SheetClose({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      className="absolute top-4 right-4 p-2 rounded-lg glass hover:glass-strong transition"
    >
      <X size={20} className="text-gray-300" />
    </button>
  );
}

