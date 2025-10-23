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
  const normalizedVariant = ['primary', 'secondary', 'success', 'danger', 'ghost'].includes(variant)
    ? variant
    : 'primary';

  const normalizedSize = ['sm', 'md', 'lg'].includes(size) ? size : 'md';

  const buttonClassName = [
    'btn',
    `btn--${normalizedVariant}`,
    `btn--${normalizedSize}`,
    loading ? 'btn--loading' : '',
    disabled ? 'btn--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      className={buttonClassName}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      {children}
    </button>
  );
};

export default Button;
