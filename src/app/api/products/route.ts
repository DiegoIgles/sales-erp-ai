import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { v2 as cloudinary } from 'cloudinary'

const prisma = new PrismaClient()

// 🛠️ Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

// ✅ Esquema Zod
const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  category: z.string().min(1),
  imageUrl: z.string().optional(),
})

type ProductInput = z.infer<typeof productSchema>

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

// ➕ POST: Crear producto
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''

    let data: Partial<ProductInput> = {}
    let imageFile: File | null = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()

      data = {
        name: formData.get('name')?.toString() || '',
        description: formData.get('description')?.toString() || '',
        price: Number(formData.get('price')),
        stock: Number(formData.get('stock')),
        category: formData.get('category')?.toString() || '',
      }

      imageFile = formData.get('image') as File | null

      // 🌥 Subir imagen a Cloudinary si existe
      if (imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const base64Image = `data:${imageFile.type};base64,${buffer.toString('base64')}`

        const result = await cloudinary.uploader.upload(base64Image, {
          folder: 'products',
        })

        data.imageUrl = result.secure_url // ✅ URL pública de Cloudinary
      }
    } else if (contentType.includes('application/json')) {
      data = await request.json()
    } else {
      return NextResponse.json({ error: 'Tipo de contenido no soportado' }, { status: 415 })
    }

    // ✅ Validación
    const parsed = productSchema.safeParse(data)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', issues: parsed.error.format() },
        { status: 400 }
      )
    }

    // 💾 Guardar en BD
    const newProduct = await prisma.product.create({
      data: parsed.data,
    })

    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error('❌ Error al crear producto:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
