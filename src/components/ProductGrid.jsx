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
          <Link className="image-button block aspect-square overflow-hidden bg-stone-50" to={`/product/${product.id}`}>
            <img className="h-full w-full object-contain p-4 transition duration-300 group-hover:scale-105" loading="lazy" decoding="async" src={product.image} alt={product.name} />
          </Link>
          <div className="flex h-full flex-col gap-2 p-4">
            <span className="stock inline-flex w-fit rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">В наличии</span>
            <h3 className="text-base font-semibold leading-6 text-stone-900">{product.name}</h3>
            <p className="text-sm text-stone-500">{product.weight} · {product.category.toLowerCase()}</p>
            <div className="price-row mt-2 flex items-center justify-between gap-3">
            <strong className="text-lg font-bold tracking-tight text-emerald-950">{money(product.price)}</strong>
            <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950 text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2" type="button" onClick={() => handleAdd(product.id)} aria-label="Добавить в корзину">
              {addedId === product.id ? '✓' : <ShoppingCart size={17} />}
            </button>
          </div>
          <Link className="card-link mt-1 inline-flex items-center text-sm font-semibold text-emerald-800 transition hover:text-emerald-950" to={`/product/${product.id}`}>Подробнее →</Link>
          </div>
        </article>
      ))}
    </div>
  );
}
