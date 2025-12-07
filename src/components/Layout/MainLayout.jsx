import { Sidebar } from './Sidebar'
import { Header } from './Header'

export const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <Header />
      <main className="ml-64 mt-16 p-6 bg-gray-50 dark:bg-gray-950 min-h-screen">
        <div className="max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}
