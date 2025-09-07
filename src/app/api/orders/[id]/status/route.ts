import { PrismaClient, OrderStatus } from '@prisma/client'
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

// Validación del body
const statusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const orderId = params.id

  try {
    const body = await req.json()
    const parsed = statusSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Estado inválido', issues: parsed.error.format() }, { status: 400 })
    }

    const { status } = parsed.data

    // Verifica si la orden existe
    const existingOrder = await prisma.order.findUnique({ where: { id: orderId } })

    if (!existingOrder) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    // Actualiza el estado
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    })

    return NextResponse.json({ message: 'Estado actualizado', order: updatedOrder })
  } catch (error) {
    console.error('Error al actualizar estado de orden:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
