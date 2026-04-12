import React from 'react';
import clsx from 'clsx';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select: React.FC<SelectProps> = ({ className, children, ...props }) => {
  return (
    <select
      className={clsx(
        'w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-md',
        'text-slate-200',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
};

