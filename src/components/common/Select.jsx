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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={`
          w-full px-4 py-2 border rounded-lg text-gray-900 bg-white
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-colors duration-200
          ${
            error && touched
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300'
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
