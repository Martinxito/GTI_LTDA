import {
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo,
  FiX,
  FiXCircle
} from "react-icons/fi";

const Alert = ({
  type = 'info',
  title,
  children,
  onClose,
  className = '',
  ...props
}) => {
  const normalizedType = ['success', 'error', 'warning', 'info'].includes(type)
    ? type
    : 'info';

  const iconMap = {
    success: FiCheckCircle,
    error: FiXCircle,
    warning: FiAlertTriangle,
    info: FiInfo,
  };

  const IconComponent = iconMap[normalizedType];
  const role = normalizedType === 'error' || normalizedType === 'warning' ? 'alert' : 'status';

  const alertClassName = ['alert', `alert--${normalizedType}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={alertClassName}
      role={role}
      aria-live={role === 'alert' ? 'assertive' : 'polite'}
      {...props}
    >
      <span className="alert__icon">
        <IconComponent size={18} aria-hidden="true" />
      </span>
      <div className="alert__content">
        {title && <div className="alert__title">{title}</div>}
        <div className="alert__message">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          className="alert__close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <FiX size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export default Alert;
