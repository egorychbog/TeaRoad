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
    <div className="product-page">
      <BackLink to="/catalog" label="Вернуться в каталог" />
      <p className="breadcrumbs">Каталог / {product.category} / Чайники</p>
      <div className="product-photo">
        <img className="h-full w-full object-contain" loading="eager" fetchPriority="high" decoding="async" src={product.image} alt={product.name} />
      </div>
      <section className="product-info">
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <strong className="product-price">{money(product.price)}</strong>
        <span className="stock">Всего 1 шт.</span>
        <p className="product-meta">Мастерская: Тин Юйнян<br />Обжиг: дровяной.</p>
        <div className="product-actions">
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
      <p className="product-description">{product.details || product.description}</p>
      <div className="workshop-strip">
        <img loading="lazy" decoding="async" src={asset('web-ru-kiln-set.jpg')} alt="" />
      </div>
    </div>
  );
}
