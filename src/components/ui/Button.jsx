import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  onClick,
  type = 'button',
  className = '',
  ...props 
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontWeight: '600',
    borderRadius: 'var(--border-radius)',
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'var(--transition-fast)',
    fontFamily: 'var(--font-family)',
    textDecoration: 'none',
    position: 'relative',
    overflow: 'hidden',
  };

  const variants = {
    primary: {
      backgroundColor: 'var(--primary-color)',
      color: 'var(--text-white)',
      '&:hover': {
        backgroundColor: 'var(--primary-hover)',
        transform: 'translateY(-1px)',
        boxShadow: 'var(--shadow-md)',
      },
    },
    secondary: {
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-color)',
      '&:hover': {
        backgroundColor: 'var(--bg-tertiary)',
        borderColor: 'var(--primary-color)',
      },
    },
    success: {
      backgroundColor: 'var(--success-color)',
      color: 'var(--text-white)',
      '&:hover': {
        backgroundColor: 'var(--success-hover)',
        transform: 'translateY(-1px)',
        boxShadow: 'var(--shadow-md)',
      },
    },
    danger: {
      backgroundColor: 'var(--error-color)',
      color: 'var(--text-white)',
      '&:hover': {
        backgroundColor: 'var(--error-hover)',
        transform: 'translateY(-1px)',
        boxShadow: 'var(--shadow-md)',
      },
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--primary-color)',
      '&:hover': {
        backgroundColor: 'var(--primary-light)',
      },
    },
  };

  const sizes = {
    sm: {
      padding: '0.5rem 1rem',
      fontSize: 'var(--font-size-sm)',
      minHeight: '2rem',
    },
    md: {
      padding: '0.75rem 1.5rem',
      fontSize: 'var(--font-size-base)',
      minHeight: '2.5rem',
    },
    lg: {
      padding: '1rem 2rem',
      fontSize: 'var(--font-size-lg)',
      minHeight: '3rem',
    },
  };

  const buttonStyles = {
    ...baseStyles,
    ...variants[variant],
    ...sizes[size],
    opacity: disabled || loading ? 0.6 : 1,
    transform: disabled || loading ? 'none' : undefined,
  };

  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      style={buttonStyles}
      onClick={handleClick}
      disabled={disabled || loading}
      className={className}
      {...props}
    >
      {loading && (
        <div
          style={{
            width: '1rem',
            height: '1rem',
            border: '2px solid transparent',
            borderTop: '2px solid currentColor',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      )}
      {children}
    </button>
  );
};

export default Button;
