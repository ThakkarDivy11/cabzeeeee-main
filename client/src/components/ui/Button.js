import React from 'react';

const styles = {
  primary:
    'bg-purple-600 hover:bg-purple-700 border-purple-600/40 shadow-[0_10px_24px_rgba(14,165,233,0.18)]',
  secondary: 'bg-white hover:bg-black/5 border-[#e5e5e5] shadow-sm dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10',
  ghost: 'bg-transparent hover:bg-black/5 border-transparent dark:hover:bg-white/10',
};

const Button = ({ variant = 'primary', className = '', children, ...props }) => {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all duration-300 active:scale-95';

  return (
    <button
      className={[
        base,
        styles[variant] || styles.primary,
        'text-black dark:text-white',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

