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
        bg-white rounded-lg shadow-sm hover:shadow-md
        transition-shadow duration-200 p-6
        ${className}
      `}
    >
      {(title || subtitle || headerAction) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">
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
