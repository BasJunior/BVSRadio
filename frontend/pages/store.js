// Store Page - Displays products with Paynow payment integration
import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';

export default function Store() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        fetchProducts();
    }, [selectedCategory]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const categoryParam = selectedCategory !== 'all' ? `?category=${selectedCategory}` : '';
            const response = await fetch(`http://localhost:3000/api/products${categoryParam}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            
            const data = await response.json();
            setProducts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (product) => {
        // This could be implemented to add to cart
        console.log('Add to cart:', product);
    };

    const categories = ['all', 'Wolf Beat Pack', 'Mixtape'];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-8">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-2">BVSRadio Store</h1>
                    <p className="text-lg">Wolf Beat Packs & Mixtapes - Secure Payment with Paynow</p>
                </div>
            </header>

            {/* Category Filter */}
            <div className="container mx-auto px-4 py-6">
                <div className="flex gap-4 mb-8">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-6 py-2 rounded-full font-semibold transition-all ${
                                selectedCategory === category
                                    ? 'bg-purple-600 text-white shadow-lg'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            {category === 'all' ? 'All Products' : category}
                        </button>
                    ))}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                        <p className="mt-4 text-gray-600">Loading products...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
                        Error: {error}
                    </div>
                )}

                {/* Products Grid */}
                {!loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.length === 0 ? (
                            <div className="col-span-full text-center py-12">
                                <p className="text-gray-600 text-lg">No products found in this category.</p>
                            </div>
                        ) : (
                            products.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAddToCart={handleAddToCart}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Footer Info */}
            <div className="container mx-auto px-4 py-12">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold mb-4 text-purple-600">About Paynow Payments</h2>
                    <p className="text-gray-700 mb-4">
                        All payments are processed securely through Paynow, Zimbabwe's leading payment platform.
                        You can pay using:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                        <li>Ecocash</li>
                        <li>OneMoney</li>
                        <li>Telecash</li>
                        <li>Visa & Mastercard</li>
                    </ul>
                    <p className="mt-4 text-sm text-gray-600">
                        Click the "Pay Now" button on any product to proceed with secure checkout.
                    </p>
                </div>
            </div>
        </div>
    );
}
