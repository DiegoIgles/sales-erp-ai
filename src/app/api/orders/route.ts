import { PrismaClient, OrderStatus } from '@prisma/client'
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

// 🧾 Validación para POST
const orderSchema = z.object({
  customerEmail: z.string().email(),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive(),
    })
  ),
})

// 🧾 Validación para GET con query params
const querySchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  email: z.string().email().optional(),
})

// ✅ POST /api/orders → Crear orden
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = orderSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos', issues: parsed.error.format() }, { status: 400 })
    }

    const { customerEmail, items } = parsed.data

    // Verifica productos y stock
    const productIds = items.map((item) => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    })

    const productMap = Object.fromEntries(products.map((p) => [p.id, p]))

    for (const item of items) {
      const product = productMap[item.productId]
      if (!product) {
        return NextResponse.json({ error: `Producto no encontrado: ${item.productId}` }, { status: 404 })
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Stock insuficiente para ${product.name}` }, { status: 400 })
      }
    }

    const totalAmount = items.reduce((total, item) => {
      const product = productMap[item.productId]
      return total + product.price * item.quantity
    }, 0)

    const orderNumber = `ORD-${Date.now()}`

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerEmail,
        totalAmount,
        status: 'PENDING',
        items: {
          create: items.map((item) => ({
            product: { connect: { id: item.productId } },
            quantity: item.quantity,
            price: productMap[item.productId].price,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    await Promise.all(
      items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      )
    )

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('Error al crear orden:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// ✅ GET /api/orders → Listar órdenes con filtros
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const rawStatus = searchParams.get('status')
    const rawEmail = searchParams.get('email')

    const queryInput = {
      status: rawStatus && rawStatus.trim() !== '' ? rawStatus : undefined,
      email: rawEmail && rawEmail.trim() !== '' ? rawEmail : undefined,
    }

    const validated = querySchema.safeParse(queryInput)

    if (!validated.success) {
      return NextResponse.json({ error: 'Parámetros inválidos', issues: validated.error.format() }, { status: 400 })
    }

    const { status, email } = validated.data

    const orders = await prisma.order.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(email ? { customerEmail: email } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: true },
        },
      },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error al obtener órdenes:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
