import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// ✅ Validación con Zod
const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  category: z.string().min(1),
  imageUrl: z.string().optional(),
})

// 📦 GET: Listar productos
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(products)
  } catch (error) {
    console.error('❌ Error al obtener productos:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// ➕ POST: Crear nuevo producto
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const name = formData.get('name')?.toString() || ''
    const description = formData.get('description')?.toString() || ''
    const price = Number(formData.get('price'))
    const stock = Number(formData.get('stock'))
    const category = formData.get('category')?.toString() || ''
    const imageFile = formData.get('image') as File | null

    let imageUrl = ''

    // 🖼 Guardar imagen si existe
    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const fileName = `${Date.now()}_${imageFile.name}`
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      const filePath = path.join(uploadDir, fileName)

      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

      fs.writeFileSync(filePath, buffer)

      imageUrl = `/uploads/${fileName}`
    }

    // ✅ Validar con Zod
    const parsed = productSchema.safeParse({
      name,
      description,
      price,
      stock,
      category,
      imageUrl,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', issues: parsed.error.format() },
        { status: 400 }
      )
    }

    // 💾 Guardar producto en BD
    const newProduct = await prisma.product.create({
      data: parsed.data,
    })

    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error('❌ Error al crear producto:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
