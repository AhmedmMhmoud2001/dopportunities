export function IconButton({
  label,
  onClick,
  children,
  isActive = false,
  className = '',
  type = 'button',
}) {
  return (
    <button
      type={type}
      className={`icon-button ${isActive ? 'is-active' : ''} ${className}`}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  )
}

