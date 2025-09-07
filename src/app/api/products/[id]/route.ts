import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'

const prisma = new PrismaClient()

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

// Utilidad: convertir buffer a stream
function bufferToStream(buffer: Buffer) {
  const readable = new Readable()
  readable.push(buffer)
  readable.push(null)
  return readable
}

// ✅ Obtener producto por ID
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  try {
    const product = await prisma.product.findUnique({ where: { id } })

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error al obtener producto por ID:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// ✅ Eliminar producto por ID
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  try {
    const deleted = await prisma.product.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Producto eliminado', product: deleted })
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    console.error('❌ Error al eliminar producto:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// ✅ Actualizar producto por ID con imagen en Cloudinary
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  try {
    const formData = await request.formData()

    const name = formData.get('name')?.toString() || ''
    const description = formData.get('description')?.toString() || ''
    const price = Number(formData.get('price'))
    const stock = Number(formData.get('stock'))
    const category = formData.get('category')?.toString() || ''
    const imageFile = formData.get('image') as File | null

    // Si ya había una imagen previa
    let imageUrl = formData.get('existingImageUrl')?.toString() || ''

    // Si se subió una nueva imagen
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      imageUrl = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'products' },
          (err, result) => {
            if (err || !result) return reject(err)
            resolve(result.secure_url)
          }
        )
        bufferToStream(buffer).pipe(uploadStream)
      })
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        stock,
        category,
        imageUrl,
      },
    })

    return NextResponse.json(updated)
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    console.error('❌ Error al actualizar producto:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
