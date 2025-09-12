import React from 'react';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  const inputStyles = {
    width: '100%',
    padding: '0.75rem 1rem',
    fontSize: 'var(--font-size-base)',
    fontFamily: 'var(--font-family)',
    border: `1px solid ${error ? 'var(--error-color)' : 'var(--border-color)'}`,
    borderRadius: 'var(--border-radius)',
    backgroundColor: disabled ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
    color: 'var(--text-primary)',
    transition: 'var(--transition-fast)',
    outline: 'none',
    '&:focus': {
      borderColor: 'var(--primary-color)',
      boxShadow: '0 0 0 3px var(--primary-light)',
    },
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.6,
    },
  };

  const labelStyles = {
    display: 'block',
    fontSize: 'var(--font-size-sm)',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '0.5rem',
  };

  const errorStyles = {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--error-color)',
    marginTop: '0.25rem',
  };

  const containerStyles = {
    marginBottom: '1rem',
  };

  return (
    <div style={containerStyles} className={className}>
      {label && (
        <label style={labelStyles}>
          {label}
          {required && <span style={{ color: 'var(--error-color)', marginLeft: '0.25rem' }}>*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        style={inputStyles}
        {...props}
      />
      {error && <div style={errorStyles}>{error}</div>}
    </div>
  );
};

export default Input;
