import React from 'react';
import clsx from 'clsx';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea: React.FC<TextareaProps> = ({ className, ...props }) => {
  return (
    <textarea
      className={clsx(
        'w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-md',
        'text-slate-200 placeholder-slate-500',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
        'resize-y',
        className
      )}
      {...props}
    />
  );
};

