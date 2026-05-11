import React from 'react';
import clsx from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  className,
  hover = false,
  onClick,
  children,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'bg-glass backdrop-blur-glass border border-glass shadow-glass rounded-lg p-4',
        hover && 'transition-all duration-200 hover:bg-glass/80 hover:border-sky-400/60 hover:shadow-glass-hover hover:-translate-y-0.5',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

