import { useId } from 'react';

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
  id,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = error ? `${inputId}-error` : undefined;

  const containerClassName = ['form-field', className].filter(Boolean).join(' ');
  const inputClassName = [
    'form-input',
    error ? 'form-input--error' : '',
    disabled ? 'form-input--disabled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClassName}>
      {label && (
        <label className="form-label" htmlFor={inputId}>
          {label}
          {required && <span className="form-label__required">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={inputClassName}
        aria-invalid={!!error}
        aria-describedby={errorId}
        {...props}
      />
      {error && (
        <div id={errorId} className="form-error">
          {error}
        </div>
      )}
    </div>
  );
};

export default Input;
