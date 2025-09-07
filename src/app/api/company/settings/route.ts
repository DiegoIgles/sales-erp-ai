import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const prisma = new PrismaClient()

const settingsSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  personality: z.string().min(1),
  messaging: z.string().min(1),
})

// GET - obtener configuración
export async function GET() {
  try {
    const settings = await prisma.companySettings.findFirst()
    if (!settings) {
      return NextResponse.json({ error: 'Configuración no encontrada' }, { status: 404 })
    }
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener configuración' }, { status: 500 })
  }
}

// PUT - actualizar configuración
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = settingsSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos', issues: parsed.error.format() }, { status: 400 })
    }

    const existing = await prisma.companySettings.findFirst()
    if (!existing) {
      return NextResponse.json({ error: 'Configuración no existe. Usa POST para crearla.' }, { status: 404 })
    }

    const updated = await prisma.companySettings.update({
      where: { id: existing.id },
      data: parsed.data,
    })

    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error('Error en PUT /company/settings:', error)
    return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 })
  }
}

// POST - crear nueva configuración
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = settingsSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos', issues: parsed.error.format() }, { status: 400 })
    }

    // Evita duplicados (solo debe existir uno)
    const existing = await prisma.companySettings.findFirst()
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una configuración. Usa PUT para actualizar.' }, { status: 409 })
    }

    const created = await prisma.companySettings.create({
      data: parsed.data,
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error('Error en POST /company/settings:', error)
    return NextResponse.json({ error: 'Error al crear configuración' }, { status: 500 })
  }
}
