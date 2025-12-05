export const StatCard = ({
  title,
  value,
  icon,
  trend,
  trendValue,
  color = 'blue',
  onClick,
}) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-lg shadow-sm p-6
        ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
      `}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {value}
          </p>
          {trend && (
            <p
              className={`text-sm mt-2 ${
                trend === 'up'
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={`
              w-12 h-12 rounded-lg flex items-center justify-center text-xl
              ${colors[color]}
            `}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
