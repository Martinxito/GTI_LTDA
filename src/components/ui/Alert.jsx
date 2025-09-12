import React from 'react';

const Alert = ({ 
  type = 'info', 
  title, 
  children, 
  onClose,
  className = '',
  ...props 
}) => {
  const alertStyles = {
    padding: 'var(--spacing-md) var(--spacing-lg)',
    borderRadius: 'var(--border-radius)',
    border: '1px solid',
    marginBottom: 'var(--spacing-md)',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-sm)',
  };

  const typeStyles = {
    success: {
      backgroundColor: '#f0fdf4',
      borderColor: '#bbf7d0',
      color: '#166534',
    },
    error: {
      backgroundColor: '#fef2f2',
      borderColor: '#fecaca',
      color: '#dc2626',
    },
    warning: {
      backgroundColor: '#fffbeb',
      borderColor: '#fed7aa',
      color: '#d97706',
    },
    info: {
      backgroundColor: '#eff6ff',
      borderColor: '#bfdbfe',
      color: '#1d4ed8',
    },
  };

  const iconStyles = {
    fontSize: 'var(--font-size-lg)',
    marginTop: '0.125rem',
    flexShrink: 0,
  };

  const contentStyles = {
    flex: 1,
  };

  const titleStyles = {
    fontSize: 'var(--font-size-sm)',
    fontWeight: '600',
    margin: '0 0 0.25rem 0',
  };

  const messageStyles = {
    fontSize: 'var(--font-size-sm)',
    margin: 0,
    lineHeight: 1.5,
  };

  const closeButtonStyles = {
    background: 'none',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
    fontSize: 'var(--font-size-lg)',
    padding: 0,
    marginLeft: 'var(--spacing-sm)',
    opacity: 0.7,
    transition: 'var(--transition-fast)',
    '&:hover': {
      opacity: 1,
    },
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div 
      style={{
        ...alertStyles,
        ...typeStyles[type],
      }}
      className={className}
      {...props}
    >
      <span style={iconStyles}>{getIcon()}</span>
      <div style={contentStyles}>
        {title && <div style={titleStyles}>{title}</div>}
        <div style={messageStyles}>{children}</div>
      </div>
      {onClose && (
        <button 
          style={closeButtonStyles}
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
