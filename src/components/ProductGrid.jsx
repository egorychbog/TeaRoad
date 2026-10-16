import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { money } from '../lib/cartHelpers.js';

export function ProductGrid({ products, addToCart, compact = false }) {
  const [addedId, setAddedId] = useState('');

  function handleAdd(productId) {
    addToCart?.(productId);
    setAddedId(productId);
    window.setTimeout(() => setAddedId(''), 1100);
  }

  return (
    <div className={compact ? 'product-grid compact grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3' : 'product-grid grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}>
      {products.map((product) => (
        <article className="product-card group h-full rounded-2xl border border-stone-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg" key={product.id}>
          <Link className="image-button" to={`/product/${product.id}`}>
            <img loading="lazy" decoding="async" src={product.image} alt={product.name} />
          </Link>
          <span className="stock">В наличии</span>
          <h3>{product.name}</h3>
          <p>{product.weight} · {product.category.toLowerCase()}</p>
          <div className="price-row">
            <strong>{money(product.price)}</strong>
            <button onClick={() => handleAdd(product.id)} aria-label="Добавить в корзину">
              {addedId === product.id ? '✓' : <ShoppingCart size={17} />}
            </button>
          </div>
          <Link className="card-link" to={`/product/${product.id}`}>Подробнее</Link>
        </article>
      ))}
    </div>
  );
}
