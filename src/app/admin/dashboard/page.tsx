'use client'

import { useEffect, useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts'

type Stats = {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  ordersByStatus: { status: string; _count: { status: number } }[]
  lastOrderDate: string | null
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#f87171', '#60a5fa', '#facc15']

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats')
        const data = await res.json()
        setStats(data)
      } catch (error) {
        console.error('Error al cargar estadísticas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin / Dashboard</h1>

        {loading ? (
          <p className="text-gray-600">Cargando estadísticas...</p>
        ) : stats ? (
          <>
            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard label="Total Productos" value={stats.totalProducts} />
              <StatCard label="Total Pedidos" value={stats.totalOrders} />
              <StatCard label="Ingresos Totales" value={`$${stats.totalRevenue.toFixed(2)}`} />
              <StatCard
                label="Último Pedido"
                value={
                  stats.lastOrderDate
                    ? new Date(stats.lastOrderDate).toLocaleDateString()
                    : 'N/A'
                }
              />
              {stats.ordersByStatus.map((s) => (
                <StatCard key={s.status} label={`Pedidos ${s.status}`} value={s._count.status} />
              ))}
            </div>

            {/* Gráfico de pastel */}
            <div className="mt-10 bg-white p-6 rounded-xl shadow-md border max-w-xl mx-auto">
              <h2 className="text-lg font-semibold text-gray-700 mb-4 text-center">
                Distribución de Pedidos por Estado
              </h2>
              <PieChart width={400} height={300}>
                <Pie
                  data={stats.ordersByStatus}
                  dataKey="_count.status"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {stats.ordersByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </div>
          </>
        ) : (
          <p className="text-red-500">Error al cargar estadísticas.</p>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white shadow-md rounded-xl p-6 border text-center">
      <h2 className="text-sm text-gray-500">{label}</h2>
      <p className="text-2xl font-semibold text-gray-800 mt-2">{value}</p>
    </div>
  )
}
