import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle,
  className = '',
  padding = 'lg',
  shadow = 'md',
  ...props 
}) => {
  const cardStyles = {
    backgroundColor: 'var(--bg-primary)',
    borderRadius: 'var(--border-radius-lg)',
    border: '1px solid var(--border-color)',
    overflow: 'hidden',
    transition: 'var(--transition-normal)',
  };

  const paddingStyles = {
    sm: { padding: 'var(--spacing-md)' },
    md: { padding: 'var(--spacing-lg)' },
    lg: { padding: 'var(--spacing-xl)' },
    xl: { padding: 'var(--spacing-2xl)' },
  };

  const shadowStyles = {
    none: {},
    sm: { boxShadow: 'var(--shadow-sm)' },
    md: { boxShadow: 'var(--shadow-md)' },
    lg: { boxShadow: 'var(--shadow-lg)' },
  };

  const headerStyles = {
    padding: 'var(--spacing-lg) var(--spacing-xl)',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
  };

  const titleStyles = {
    fontSize: 'var(--font-size-xl)',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
  };

  const subtitleStyles = {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--text-secondary)',
    margin: '0.25rem 0 0 0',
  };

  const contentStyles = {
    ...paddingStyles[padding],
  };

  return (
    <div 
      style={{
        ...cardStyles,
        ...shadowStyles[shadow],
      }}
      className={className}
      {...props}
    >
      {(title || subtitle) && (
        <div style={headerStyles}>
          {title && <h3 style={titleStyles}>{title}</h3>}
          {subtitle && <p style={subtitleStyles}>{subtitle}</p>}
        </div>
      )}
      <div style={contentStyles}>
        {children}
      </div>
    </div>
  );
};

export default Card;
