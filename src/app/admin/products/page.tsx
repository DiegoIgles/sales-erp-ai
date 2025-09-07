'use client'

import { useEffect, useState } from 'react'

type Product = {
    id: string
    name: string
    description: string
    price: number
    stock: number
    category: string
    imageUrl?: string
    createdAt: string
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [editingProductId, setEditingProductId] = useState<string | null>(null)

    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
    })

    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    useEffect(() => {
        const fetchProducts = async () => {
            const res = await fetch('/api/products')
            const data: Product[] = await res.json()
            setProducts(data)
            setLoading(false)
        }
        fetchProducts()
    }, [])

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmitProduct = async () => {
        const formData = new FormData()
        formData.append('name', form.name)
        formData.append('description', form.description)
        formData.append('price', form.price)
        formData.append('stock', form.stock)
        formData.append('category', form.category)
        if (imageFile) formData.append('image', imageFile)
        if (imagePreview && !imageFile) formData.append('existingImageUrl', imagePreview)

        const endpoint = editingProductId
            ? `/api/products/${editingProductId}`
            : '/api/products'

        const method = editingProductId ? 'PATCH' : 'POST'

        const res = await fetch(endpoint, {
            method,
            body: formData,
        })

        if (res.ok) {
            const updatedProduct = await res.json()

            setProducts((prev) => {
                if (editingProductId) {
                    return prev.map((p) => (p.id === editingProductId ? updatedProduct : p))
                }
                return [...prev, updatedProduct]
            })

            // Resetear formulario
            setForm({ name: '', description: '', price: '', stock: '', category: '' })
            setImageFile(null)
            setImagePreview(null)
            setEditingProductId(null)
        } else {
            const error = await res.json()
            alert('Error al guardar producto:\n' + JSON.stringify(error.issues || error.error, null, 2))
        }
    }


    const handleDeleteProduct = async (id: string) => {
        const confirmar = confirm('¿Estás seguro de eliminar este producto?')
        if (!confirmar) return

        const res = await fetch(`/api/products/${id}`, {
            method: 'DELETE',
        })

        if (res.ok) {
            setProducts((prev) => prev.filter((p) => p.id !== id))
        } else {
            alert('Error al eliminar producto')
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Admin / Productos</h1>
                    <button
                        onClick={handleSubmitProduct}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        {editingProductId ? 'Actualizar producto' : 'Guardar producto'}
                    </button>

                </div>

                {/* Formulario de producto */}
                {editingProductId && (
  <div className="mb-4 text-yellow-600 font-medium">
    ✏️ Editando producto (ID: {editingProductId})
  </div>
)}
                <div className="bg-white shadow-md rounded-xl p-8 mb-12">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-700">Nuevo producto</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-600">Nombre</label>
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full border border-gray-300 px-4 py-2 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-600">Categoría</label>
                            <input
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                className="w-full border border-gray-300 px-4 py-2 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-600">Precio</label>
                            <input
                                type="number"
                                name="price"
                                value={form.price}
                                onChange={handleChange}
                                className="w-full border border-gray-300 px-4 py-2 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-600">Stock</label>
                            <input
                                type="number"
                                name="stock"
                                value={form.stock}
                                onChange={handleChange}
                                className="w-full border border-gray-300 px-4 py-2 rounded-lg"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1 text-gray-600">Descripción</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full border border-gray-300 px-4 py-2 rounded-lg"
                            ></textarea>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1 text-gray-600">Imagen</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="w-full border border-gray-300 px-4 py-2 rounded-lg"
                            />
                            {imagePreview && (
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="mt-4 h-40 object-contain border rounded"
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Listado de productos */}
                {loading ? (
                    <p className="text-gray-500">Cargando productos...</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((p) => (
                            <div
                                key={p.id}
                                className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
                            >
                                <h2 className="text-xl font-bold text-gray-800 mb-1">{p.name}</h2>
                                <p className="text-sm text-blue-500">{p.category}</p>
                                <p className="text-gray-600 text-sm mt-2">{p.description}</p>
                                <p className="mt-3 font-medium text-blue-700">
                                    ${p.price} <span className="text-sm text-gray-500">| Stock: {p.stock}</span>
                                </p>
                                {p.imageUrl && (
                                    <img
                                        src={p.imageUrl}
                                        alt={p.name}
                                        className="mt-4 h-40 w-full object-cover rounded-md border border-gray-200"
                                    />
                                )}
                                <button
                                    onClick={() => handleDeleteProduct(p.id)}
                                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                >
                                    Eliminar
                                </button>
                                <button
                                    onClick={() => {
                                        setForm({
                                            name: p.name,
                                            description: p.description,
                                            price: p.price.toString(),
                                            stock: p.stock.toString(),
                                            category: p.category,
                                        })
                                        setImagePreview(p.imageUrl || null)
                                        setImageFile(null)
                                        setEditingProductId(p.id)
                                    }}
                                    className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                                >
                                    Editar
                                </button>

                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
