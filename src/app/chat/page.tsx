'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

export default function ChatPage() {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >([])

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!input.trim()) return

  const newMessages = [
    ...messages,
    { role: 'user' as const, content: input },
  ]
  setMessages(newMessages)
  setInput('')
  setIsLoading(true)

  try {
    console.log('📤 Enviando mensajes al backend:', newMessages)

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMessages),
    })

    if (!res.ok) throw new Error(`❌ Error HTTP ${res.status}`)

    const data = await res.json()
    const result = data.result || '⚠️ No se obtuvo respuesta del asistente.'

    console.log('✅ Respuesta completa del backend:', result)

    setMessages((prev) => [...prev, { role: 'assistant', content: result }])
  } catch (err) {
    console.error('❌ Error al procesar el chat:', err)
  }

  setIsLoading(false)
}

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col h-screen">
      <h1 className="text-2xl font-bold mb-4">💬 Chat con el Asistente</h1>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4 border rounded-md p-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-md max-w-[80%] whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-blue-100 ml-auto text-right'
                : 'bg-gray-200 text-left'
            }`}
          >
            <div className="text-sm">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="p-3 bg-yellow-100 rounded-md text-sm w-fit text-gray-700 italic">
            Asistente está escribiendo...
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu mensaje..."
          disabled={isLoading}
          className="flex-1 px-4 py-2 border rounded-md"
        />
        <button
          type="submit"
          disabled={isLoading || input.trim() === ''}
          className={`px-4 py-2 rounded-md text-white ${
            isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  )
}
