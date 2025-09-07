import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
const prisma = new PrismaClient()

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  try {
    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error al obtener producto por ID:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// ✅ Eliminar un producto por ID
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
  } catch (error: any) {
    if (error.code === 'P2025') {
      // Prisma: record not found
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    console.error('❌ Error al eliminar producto:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// ✏️ Actualizar producto por ID
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

    // Si ya había una imagen previa (por ejemplo en un campo oculto del formulario)
    let imageUrl = formData.get('existingImageUrl')?.toString() || ''

    // Si se subió una nueva imagen, la reemplazamos
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const fileName = `${Date.now()}_${imageFile.name}`
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      const filePath = path.join(uploadDir, fileName)

      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
      fs.writeFileSync(filePath, buffer)

      imageUrl = `/uploads/${fileName}`
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
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    console.error('❌ Error al actualizar producto:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
