import { Icon } from './Icon'

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
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  }

  const iconMap = {
    '💰': 'revenue',
    '💳': 'expenses',
    '⚙️': 'production',
    '⚠️': 'waste',
    '🛒': 'ingredients',
  }

  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700
        hover:shadow-md transition-all duration-200
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {value}
          </p>
          {trend && (
            <p
              className={`text-sm mt-2 flex items-center gap-1 ${
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
              w-12 h-12 rounded-xl flex items-center justify-center
              ${colors[color]}
            `}
          >
            <Icon name={iconMap[icon] || 'chart'} className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  )
}
