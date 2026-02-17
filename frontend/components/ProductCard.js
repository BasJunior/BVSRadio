// Product Card Component for E-commerce
import React from 'react';
import PaynowButton from './PaynowButton';

export default function ProductCard({ product, onAddToCart, showPaynow = true }) {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
            {product.image_url && (
                <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-48 object-cover"
                />
            )}
            <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                {product.category && (
                    <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded mb-2">
                        {product.category}
                    </span>
                )}
                <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-blue-600">
                        ${product.price}
                    </span>
                    <button 
                        onClick={() => onAddToCart(product)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        disabled={product.stock_quantity === 0}
                    >
                        {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
                {product.stock_quantity > 0 && product.stock_quantity < 10 && (
                    <p className="text-orange-500 text-xs mt-2">
                        Only {product.stock_quantity} left!
                    </p>
                )}
                {/* Paynow Payment Button for Wolf Beat Pack and Mixtape products */}
                {showPaynow && product.stock_quantity > 0 && (
                    product.category === 'Wolf Beat Pack' || product.category === 'Mixtape'
                ) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">Or pay directly with Paynow:</p>
                        <PaynowButton product={product} />
                    </div>
                )}
            </div>
        </div>
    );
}
