import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.product.deleteMany()

  await prisma.product.createMany({
    data: [
      {
        name: 'MacBook Pro M2',
        description: 'Apple MacBook Pro con chip M2, 256GB SSD, 8GB RAM',
        price: 1299,
        stock: 5,
        category: 'Laptops',
        imageUrl: 'https://via.placeholder.com/300x200?text=MacBook+Pro',
      },
      {
        name: 'Logitech MX Master 3',
        description: 'Mouse ergonómico inalámbrico Logitech',
        price: 99,
        stock: 12,
        category: 'Accessories',
        imageUrl: 'https://via.placeholder.com/300x200?text=Logitech+MX+3',
      },
      {
        name: 'iPhone 14',
        description: 'iPhone 14 128GB - cámara mejorada, A15 Bionic',
        price: 899,
        stock: 8,
        category: 'Smartphones',
        imageUrl: 'https://via.placeholder.com/300x200?text=iPhone+14',
      },
      {
        name: 'Samsung Galaxy S23',
        description: 'Samsung S23 Ultra 256GB, excelente cámara y batería',
        price: 1099,
        stock: 6,
        category: 'Smartphones',
        imageUrl: 'https://via.placeholder.com/300x200?text=Galaxy+S23',
      },
      {
        name: 'Dell XPS 13',
        description: 'Laptop ligera Dell XPS 13" con Intel i7 y 16GB RAM',
        price: 1399,
        stock: 4,
        category: 'Laptops',
        imageUrl: 'https://via.placeholder.com/300x200?text=Dell+XPS+13',
      },
      {
        name: 'Monitor LG 27"',
        description: 'Monitor LG 27” 4K UHD con HDR10 y USB-C',
        price: 349,
        stock: 9,
        category: 'Monitors',
        imageUrl: 'https://via.placeholder.com/300x200?text=LG+Monitor+27',
      },
      {
        name: 'Teclado Mecánico Keychron K2',
        description: 'Teclado mecánico inalámbrico RGB Bluetooth',
        price: 85,
        stock: 15,
        category: 'Accessories',
        imageUrl: 'https://via.placeholder.com/300x200?text=Keychron+K2',
      },
      {
        name: 'iPad Air 5',
        description: 'iPad Air 10.9" con chip M1 y soporte para Apple Pencil',
        price: 649,
        stock: 7,
        category: 'Tablets',
        imageUrl: 'https://via.placeholder.com/300x200?text=iPad+Air+5',
      },
      {
        name: 'Bose QuietComfort 45',
        description: 'Audífonos con cancelación de ruido premium',
        price: 329,
        stock: 10,
        category: 'Audio',
        imageUrl: 'https://via.placeholder.com/300x200?text=Bose+QC+45',
      },
      {
        name: 'Sony WH-1000XM5',
        description: 'Audífonos over-ear con calidad Hi-Res y ANC',
        price: 379,
        stock: 5,
        category: 'Audio',
        imageUrl: 'https://via.placeholder.com/300x200?text=Sony+XM5',
      },
    ],
  })

  console.log('✅ Productos de ejemplo insertados con éxito.')
}

main()
  .catch((e) => {
    console.error('❌ Error insertando productos:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
