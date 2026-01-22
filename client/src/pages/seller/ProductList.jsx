import React, { useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { categories } from '../../assets/assets'

const ProductList = () => {
    const {products, currency, axios, fetchProducts} = useAppContext()
    const [editProduct, setEditProduct] = useState(null)
    const [editForm, setEditForm] = useState({
        name: '',
        description: '',
        category: '',
        price: '',
        offerPrice: '',
        weight: ''
    })

    const toggleStock = async (id, inStock)=>{
        try {
            const { data } = await axios.post('/api/product/stock', {id, inStock});
            if (data.success){
                fetchProducts();
                toast.success(data.message)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const openEditModal = (product) => {
        setEditProduct(product)
        setEditForm({
            name: product.name,
            description: Array.isArray(product.description) ? product.description.join('\n') : product.description,
            category: product.category,
            price: product.price,
            offerPrice: product.offerPrice,
            weight: product.weight || ''
        })
    }

    const closeEditModal = () => {
        setEditProduct(null)
        setEditForm({
            name: '',
            description: '',
            category: '',
            price: '',
            offerPrice: '',
            weight: ''
        })
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault()
        try {
            const { data } = await axios.post('/api/product/update', {
                id: editProduct._id,
                ...editForm
            })
            if (data.success) {
                toast.success(data.message)
                fetchProducts()
                closeEditModal()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            try {
                const { data } = await axios.post('/api/product/delete', { id })
                if (data.success) {
                    toast.success(data.message)
                    fetchProducts()
                } else {
                    toast.error(data.message)
                }
            } catch (error) {
                toast.error(error.message)
            }
        }
    }

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
            <div className="w-full md:p-10 p-4">
                <h2 className="pb-4 text-lg font-medium">All Products</h2>
                <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
                    <table className="md:table-auto table-fixed w-full overflow-hidden">
                        <thead className="text-gray-900 text-sm text-left">
                            <tr>
                                <th className="px-4 py-3 font-semibold truncate">Product</th>
                                <th className="px-4 py-3 font-semibold truncate">Category</th>
                                <th className="px-4 py-3 font-semibold truncate hidden md:block">Selling Price</th>
                                <th className="px-4 py-3 font-semibold truncate">In Stock</th>
                                <th className="px-4 py-3 font-semibold truncate">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-500">
                            {products.map((product) => (
                                <tr key={product._id} className="border-t border-gray-500/20">
                                    <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                                        <div className="border border-gray-300 rounded overflow-hidden">
                                            <img src={product.image[0]} alt="Product" className="w-16" />
                                        </div>
                                        <span className="truncate max-sm:hidden w-full">{product.name}</span>
                                    </td>
                                    <td className="px-4 py-3">{product.category}</td>
                                    <td className="px-4 py-3 max-sm:hidden">{currency}{product.offerPrice}</td>
                                    <td className="px-4 py-3">
                                        <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">           
                                            <input onClick={()=> toggleStock(product._id, !product.inStock)} checked={product.inStock} type="checkbox" className="sr-only peer" />
                                            <div className="w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 transition-colors duration-200"></div>
                                            <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                                        </label>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => openEditModal(product)}
                                                className="px-3 py-1.5 bg-primary text-white text-xs rounded hover:bg-primary-dull transition cursor-pointer"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(product._id, product.name)}
                                                className="px-3 py-1.5 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition cursor-pointer"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {editProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Edit Product</h3>
                            <button onClick={closeEditModal} className="text-gray-500 hover:text-gray-700 text-2xl cursor-pointer">&times;</button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Product Name</label>
                                <input 
                                    type="text" 
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <textarea 
                                    rows={3}
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded outline-none resize-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Category</label>
                                <select 
                                    value={editForm.category}
                                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded outline-none"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((item, index) => (
                                        <option key={index} value={item.path}>{item.path}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Weight</label>
                                <select 
                                    value={editForm.weight}
                                    onChange={(e) => setEditForm({...editForm, weight: e.target.value})}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded outline-none"
                                    required
                                >
                                    <option value="">Select Weight</option>
                                    <option value="500g">500g</option>
                                    <option value="1kg">1kg</option>
                                    <option value="2kg">2kg</option>
                                    <option value="5kg">5kg</option>
                                    <option value="250ml">250ml</option>
                                    <option value="500ml">500ml</option>
                                    <option value="1L">1L</option>
                                    <option value="1 piece">1 piece</option>
                                    <option value="1 dozen">1 dozen</option>
                                    <option value="1 pack">1 pack</option>
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-sm font-medium">Price</label>
                                    <input 
                                        type="number" 
                                        value={editForm.price}
                                        onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded outline-none"
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-sm font-medium">Offer Price</label>
                                    <input 
                                        type="number" 
                                        value={editForm.offerPrice}
                                        onChange={(e) => setEditForm({...editForm, offerPrice: e.target.value})}
                                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded outline-none"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button"
                                    onClick={closeEditModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dull transition cursor-pointer"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
  )
}

export default ProductList
