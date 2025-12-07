export const Select = ({
  label,
  error,
  touched,
  options = [],
  required = false,
  className = '',
  placeholder = 'Selecione uma opção',
  children,
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
      <select
        className={`
          w-full px-4 py-2 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-colors duration-200
          ${
            error && touched
              ? 'border-red-500 bg-red-50 dark:bg-red-950 dark:border-red-400'
              : 'border-gray-300 dark:border-gray-600'
          }
          ${className}
        `}
        {...props}
      >
        {children || (
          <>
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </>
        )}
      </select>
      {error && touched && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  )
}
