import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET(
  _req: NextRequest,
  { params }: { params: { email: string } }
) {
  const { email } = params

  try {
    const orders = await prisma.order.findMany({
      where: { customerEmail: decodeURIComponent(email) },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error al obtener pedidos del cliente:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
