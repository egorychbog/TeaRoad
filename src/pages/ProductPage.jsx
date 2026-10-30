import { asset } from '../data/siteContent.js';
import { money } from '../lib/cartHelpers.js';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { BackLink, EmptyState } from '../components/SiteChrome.jsx';


export function ProductRoute({
  products,
  addToCart,
  favorites,
  toggleFavorite,
  loading = false,
  error = '',
}) {
  const { id } = useParams();
  const product = products.find((item) => item.id === id);

  if (!product) {
    return (
      <div className="simple-page">
        <BackLink to="/catalog" label="Вернуться в каталог" />
        <h1 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">{loading ? 'Загрузка товара...' : 'Товар не найден'}</h1>
        <EmptyState
          title={loading ? 'Загрузка товара...' : 'Товар не найден'}
          text={error || (loading ? 'Получаем информацию из базы данных.' : 'Возможно, товар снят с продажи.')}
          action={<Link className="button dark" to="/catalog">Открыть каталог</Link>}
        />
      </div>
    );
  }

  return (
    <Product
      product={product}
      addToCart={addToCart}
      isFavorite={favorites.includes(product.id)}
      toggleFavorite={toggleFavorite}
    />
  );
}

export function Product({ product, addToCart, isFavorite, toggleFavorite }) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addToCart(product.id);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="product-page mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-2 lg:items-start">
      <BackLink to="/catalog" label="Вернуться в каталог" />
      <p className="breadcrumbs mb-4 text-sm text-stone-500 lg:col-span-2">Каталог / {product.category} / Чайники</p>
      <div className="product-photo aspect-square overflow-hidden rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
        <img className="h-full w-full object-contain" loading="eager" fetchPriority="high" decoding="async" width={900} height={900} src={product.image} alt={product.name} />
      </div>
      <section className="product-info space-y-5 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-semibold leading-tight tracking-tight text-stone-950 sm:text-4xl">{product.name}</h1>
        <p className="text-base leading-7 text-stone-600">{product.description}</p>
        <strong className="product-price block text-3xl font-bold tracking-tight text-emerald-950">{money(product.price)}</strong>
        <span className="stock">Всего 1 шт.</span>
        <p className="product-meta">Мастерская: Тин Юйнян<br />Обжиг: дровяной.</p>
        <div className="product-actions flex flex-wrap gap-3">
          <button className="button dark" onClick={handleAdd}>
            {added ? 'Добавлено' : 'Добавить в корзину'}
          </button>
          <button className={`button light ${isFavorite ? 'selected' : ''}`} onClick={() => toggleFavorite(product.id)}>
            <Heart size={16} /> {isFavorite ? 'В избранном' : 'В избранное'}
          </button>
        </div>
        <div className="payment-badges">
          <span>Долями по 2 718 ₽</span>
          <span>2 718 ₽ в Сплит</span>
        </div>
      </section>
      <p className="product-description text-base leading-7 text-stone-600 lg:col-span-2">{product.details || product.description}</p>
      <div className="workshop-strip">
        <img loading="lazy" decoding="async" width={900} height={820} src={asset('web-ru-kiln-set.jpg')} alt="Керамический чайный сервиз для китайской чайной церемонии" />
      </div>
    </div>
  );
}
