export const Input = ({
  label,
  error,
  touched,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-2 border rounded-lg text-gray-900 dark:text-white
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-colors duration-200
          ${
            error && touched
              ? 'border-red-500 bg-red-50 dark:bg-red-950 dark:border-red-400'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
          }
          ${className}
        `}
        {...props}
      />
      {error && touched && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  )
}
