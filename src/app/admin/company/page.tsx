// src/app/admin/company/page.tsx
'use client'

import { useEffect, useState } from 'react'

export default function AdminCompanyPage() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    personality: '',
    messaging: '',
  })

  const [loading, setLoading] = useState(true)
  const [isNew, setIsNew] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/company/settings')
        if (res.status === 404) {
          setIsNew(true) // No existe aún
        } else {
          const data = await res.json()
          setForm({
            name: data.name || '',
            description: data.description || '',
            personality: data.personality || '',
            messaging: data.messaging || '',
          })
        }
      } catch (error) {
        console.error('❌ Error al cargar configuración:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    try {
      const method = isNew ? 'POST' : 'PUT'
      const res = await fetch('/api/company/settings', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const error = await res.json()
        alert('❌ Error:\n' + JSON.stringify(error.issues || error.error, null, 2))
      } else {
        alert('✅ Configuración guardada con éxito')
        setIsNew(false)
      }
    } catch (error) {
      alert('❌ Error inesperado al guardar')
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin / Empresa</h1>

        {loading ? (
          <p className="text-gray-500">Cargando configuración...</p>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nombre de empresa</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Descripción</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Personalidad</label>
              <textarea
                name="personality"
                value={form.personality}
                onChange={handleChange}
                rows={2}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Mensaje de bienvenida / marketing</label>
              <textarea
                name="messaging"
                value={form.messaging}
                onChange={handleChange}
                rows={2}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg"
              ></textarea>
            </div>

            <div className="pt-4">
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Guardar configuración
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
