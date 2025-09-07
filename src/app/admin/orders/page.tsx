'use client'

import { useEffect, useState } from 'react'

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

type OrderItem = {
  id: string
  product: { name: string }
  quantity: number
  price: number
}

type Order = {
  id: string
  orderNumber: string
  customerEmail: string
  totalAmount: number
  status: OrderStatus
  items: OrderItem[]
  createdAt: string
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    const res = await fetch('/api/orders')
    const data = await res.json()
    setOrders(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
  try {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH', // ✅ usa PATCH, no PUT
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })

    if (!res.ok) {
      throw new Error('Error al actualizar el estado')
    }

    // Opcional: refrescar los pedidos
    const updated = await res.json()
    if (!updated?.order?.id) {
  console.warn("Respuesta mal estructurada:", updated)
  return
}
setOrders((prev) =>
  prev.map((order) =>
    order.id === updated.order.id ? updated.order : order
  )
)
  } catch (error) {
    console.error(error)
    alert('No se pudo actualizar el estado del pedido')
  }
}

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin / Pedidos</h1>

        {loading ? (
          <p className="text-gray-500">Cargando pedidos...</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-500">No hay pedidos registrados.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white shadow-md rounded-xl p-6 border">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      Pedido #{order.orderNumber}
                    </h2>
                    <p className="text-sm text-gray-500">Cliente: {order.customerEmail}</p>
                    <p className="text-sm text-gray-500">
  Total:{' '}
  {typeof order.totalAmount === 'number'
    ? `$${order.totalAmount.toFixed(2)}`
    : 'N/D'}
</p>

                    <p className="text-sm text-gray-500">
                      Fecha: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Estado
                    </label>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value as OrderStatus)
                      }
                      className="border border-gray-300 rounded px-3 py-1"
                    >
                      {[
                        'PENDING',
                        'CONFIRMED',
                        'PROCESSING',
                        'SHIPPED',
                        'DELIVERED',
                        'CANCELLED',
                      ].map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="text-md font-semibold text-gray-700 mb-2">Productos</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {Array.isArray(order.items) ? (
  order.items.map((item) => (
    <li key={item.id}>
      - {item.quantity}x {item.product.name} (${item.price.toFixed(2)})
    </li>
  ))
) : (
  <li className="text-gray-400 italic">Sin productos</li>
)}

                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
