import React from 'react';

const Card = ({ className = '', children, ...props }) => {
  return (
    <div
      className={[
        'rounded-xl border border-[#e5e5e5] bg-white shadow-sm transition-all duration-300',
        'dark:border-white/10 dark:bg-[#111827]/70 dark:backdrop-blur dark:shadow-level-1',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

