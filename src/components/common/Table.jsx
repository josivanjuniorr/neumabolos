export const Table = ({
  columns,
  data,
  loading = false,
  onEdit,
  onDelete,
  actions = true,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">Nenhum registro encontrado</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200"
              >
                {column.label}
              </th>
            ))}
            {actions && (
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                Ações
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row.id || idx}
              className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {columns.map((column) => (
                <td
                  key={`${row.id}-${column.key}`}
                  className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300"
                >
                  {column.render
                    ? column.render(row[column.key], row)
                    : row[column.key]}
                </td>
              ))}
              {actions && (
                <td className="px-6 py-4 text-sm space-x-2 flex">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(row)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Editar
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            'Tem certeza que deseja deletar?'
                          )
                        ) {
                          onDelete(row.id)
                        }
                      }}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Deletar
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
