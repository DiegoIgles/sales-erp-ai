// src/app/api/admin/stats/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient, OrderStatus } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const totalProducts = await prisma.product.count()
    const totalOrders = await prisma.order.count()
    const totalRevenueResult = await prisma.order.aggregate({
      _sum: { totalAmount: true },
    })
    const totalRevenue = totalRevenueResult._sum.totalAmount || 0

    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: { status: true },
    })

    const latestOrder = await prisma.order.findFirst({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalRevenue,
      ordersByStatus,
      lastOrderDate: latestOrder?.createdAt ?? null,
    })
  } catch (error) {
    console.error('❌ Error en GET /api/admin/stats:', error)
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 })
  }
}
