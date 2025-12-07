export const Card = ({
  children,
  title,
  subtitle,
  className = '',
  headerAction,
}) => {
  return (
    <div
      className={`
        bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700
        hover:shadow-md transition-all duration-200 p-6
        ${className}
      `}
    >
      {(title || subtitle || headerAction) && (
        <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            {title && (
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
