export const Alert = ({
  type = 'info',
  title,
  message,
  onClose,
  className = '',
}) => {
  const types = {
    success: {
      bg: 'bg-green-50 dark:bg-green-950',
      border: 'border-green-200 dark:border-green-800',
      title: 'text-green-900 dark:text-green-200',
      message: 'text-green-800 dark:text-green-300',
      icon: '✓',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-950',
      border: 'border-red-200 dark:border-red-800',
      title: 'text-red-900 dark:text-red-200',
      message: 'text-red-800 dark:text-red-300',
      icon: '✕',
      iconColor: 'text-red-600 dark:text-red-400',
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-950',
      border: 'border-yellow-200 dark:border-yellow-800',
      title: 'text-yellow-900 dark:text-yellow-200',
      message: 'text-yellow-800 dark:text-yellow-300',
      icon: '!',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950',
      border: 'border-blue-200 dark:border-blue-800',
      title: 'text-blue-900 dark:text-blue-200',
      message: 'text-blue-800 dark:text-blue-300',
      icon: 'ℹ',
      iconColor: 'text-blue-600 dark:text-blue-400',
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
