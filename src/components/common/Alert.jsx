export const Alert = ({
  type = 'info',
  title,
  message,
  onClose,
  className = '',
}) => {
  const types = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      title: 'text-green-900',
      message: 'text-green-800',
      icon: '✓',
      iconColor: 'text-green-600',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      title: 'text-red-900',
      message: 'text-red-800',
      icon: '✕',
      iconColor: 'text-red-600',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      title: 'text-yellow-900',
      message: 'text-yellow-800',
      icon: '!',
      iconColor: 'text-yellow-600',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      title: 'text-blue-900',
      message: 'text-blue-800',
      icon: 'ℹ',
      iconColor: 'text-blue-600',
    },
  }

  const config = types[type]

  return (
    <div
      className={`
        border-l-4 ${config.bg} ${config.border} p-4
        rounded-r-lg flex items-start gap-3
        ${className}
      `}
    >
      <div
        className={`flex-shrink-0 text-xl font-bold ${config.iconColor}`}
      >
        {config.icon}
      </div>
      <div className="flex-grow">
        {title && (
          <h4 className={`font-semibold ${config.title}`}>
            {title}
          </h4>
        )}
        {message && (
          <p className={`text-sm ${config.message} ${title ? 'mt-1' : ''}`}>
            {message}
          </p>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      )}
    </div>
  )
}
