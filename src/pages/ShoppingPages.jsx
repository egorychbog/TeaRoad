import { money } from '../lib/cartHelpers.js';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Minus, Plus } from 'lucide-react';
import { HeroBanner, BackLink, EmptyState } from '../components/SiteChrome.jsx';
import { ProductGrid } from '../components/ProductGrid.jsx';


export function Favorites({ products, addToCart }) {
  return (
    <div className="simple-page mx-auto w-full max-w-7xl space-y-6">
      <BackLink to="/profile" label="Вернуться в профиль" />
      <div className="page-title-row">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">Избранное</h1>
        <span className="heart-badge"><Heart size={18} /> {products.length}</span>
      </div>
      {products.length ? (
        <ProductGrid products={products} addToCart={addToCart} />
      ) : (
        <EmptyState
          title="Пока пусто"
          text="Откройте карточку товара и добавьте его в избранное."
          action={<Link className="button dark" to="/catalog">Перейти в каталог</Link>}
        />
      )}
    </div>
  );
}

export function Gifts({ gifts, addToCart }) {
  const [giftFilter, setGiftFilter] = useState('Все');
  const [addedId, setAddedId] = useState('');
  const giftFilters = ['Все', 'до 2 000 ₽', '2 000-4 000 ₽', 'от 4 000 ₽', 'День рождения', 'Коллеге', 'Для дома'];
  const visibleGifts = giftFilter === 'Все'
    ? gifts.items
    : gifts.items.filter((gift) => gift.budget === giftFilter || gift.occasion === giftFilter);

  function handleGiftAdd(gift) {
    addToCart(gift.productId);
    setAddedId(gift.id);
    window.setTimeout(() => setAddedId(''), 1100);
  }

  return (
    <div className="page-stack mx-auto w-full max-w-7xl space-y-8 sm:space-y-12">
      <section className="back-section">
        <BackLink to="/" label="На главную" />
      </section>
      <HeroBanner
        image={gifts.hero.image}
        title="Подарок, который запоминается"
        text="Готовые наборы по бюджету и поводу."
        action={<a className="button ghost" href="#gift-picker">Выбрать набор</a>}
      />
      <section id="gift-picker">
        <h2>Подберите подарок</h2>
        <div className="chips gift-tabs">
          {giftFilters.map((chip) => (
            <button
              className={giftFilter === chip ? 'active' : ''}
              key={chip}
              type="button"
              onClick={() => setGiftFilter(chip)}
            >
              {chip}
            </button>
          ))}
        </div>
        <div className="gift-grid grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visibleGifts.map((gift) => (
            <article className="gift-card h-full overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm" key={gift.id}>
              <img className="aspect-square w-full object-cover" loading="lazy" decoding="async" src={gift.image} alt={gift.name} />
              <span className="stock">{gift.occasion}</span>
              <h3 className="text-lg font-semibold leading-6 text-stone-900">{gift.name}</h3>
              <p className="text-sm leading-6 text-stone-600">{gift.text}</p>
              <strong>{money(gift.price)}</strong>
              <button className="button dark" onClick={() => handleGiftAdd(gift)}>
                {addedId === gift.id ? 'В корзине' : 'Выбрать'}
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export function Cart({ cart, changeQuantity, applyPromo }) {
  return (
    <div className="cart-page mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
      <div className="page-title lg:col-span-2">
        <BackLink to="/catalog" label="Продолжить покупки" />
      </div>
      <h1 className="mb-0 text-3xl font-semibold tracking-tight text-stone-950 sm:col-span-2 sm:text-4xl lg:col-span-2">Корзина</h1>
      <div className="cart-list min-w-0 space-y-3">
        {cart.items.length ? (
          cart.items.map((item) => (
            <article className="cart-item grid grid-cols-[84px_minmax(0,1fr)] items-center gap-4 rounded-2xl border border-stone-200 bg-white p-3 sm:grid-cols-[100px_minmax(0,1fr)_auto] sm:p-4" key={item.productId}>
              <img className="aspect-square w-full rounded-xl object-cover bg-stone-50" loading="lazy" decoding="async" src={item.product.image} alt="" />
              <div className="min-w-0 py-1">
                <h3 className="font-semibold text-stone-900">{item.product.name}</h3>
                <p className="mt-2 text-xs text-stone-500">Количество</p>
                <div className="mt-1 inline-flex items-center gap-3 rounded-xl border border-stone-200 px-2 py-1">
                  <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-stone-100" type="button" aria-label="Уменьшить количество" onClick={() => changeQuantity(item.productId, item.quantity - 1)}><Minus size={14} /></button>
                  <span className="min-w-4 text-center text-sm font-semibold">{item.quantity}</span>
                  <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-stone-100" type="button" aria-label="Увеличить количество" onClick={() => changeQuantity(item.productId, item.quantity + 1)}><Plus size={14} /></button>
                </div>
              </div>
              <strong className="col-span-2 text-right text-lg font-semibold text-emerald-950 sm:col-span-1">{money(item.product.price * item.quantity)}</strong>
            </article>
          ))
        ) : (
          <EmptyState
            title="Корзина пустая"
            text="Добавьте чай, посуду или подарок из каталога."
            action={<Link className="button dark" to="/catalog">Открыть каталог</Link>}
          />
        )}
      </div>
      <OrderSummary cart={cart} applyPromo={applyPromo} />
    </div>
  );
}

export function OrderSummary({ cart, applyPromo }) {
  const [promoInput, setPromoInput] = useState(cart.promoCode || '');
  const [promoMessage, setPromoMessage] = useState('');
  const { summary } = cart;

  function handlePromo(event) {
    event.preventDefault();
    if (!cart.items.length) {
      setPromoMessage('Сначала добавьте товары в корзину.');
      return;
    }
    const ok = applyPromo(promoInput);
    setPromoMessage(ok ? 'Промокод применен.' : 'Такого промокода нет. Попробуйте TEA15.');
  }

  return (
    <aside className="order-card h-fit rounded-2xl border border-stone-200 bg-white p-5 shadow-sm lg:sticky lg:top-6">
      <h2 className="text-xl font-semibold tracking-tight text-stone-900">Ваш заказ</h2>
      <form className="promo-form" onSubmit={handlePromo}>
        <label>
          Промокод
          <input value={promoInput} onChange={(event) => setPromoInput(event.target.value)} placeholder="TEA15" />
        </label>
        <button type="submit">Применить</button>
        {promoMessage && <p>{promoMessage}</p>}
      </form>
      <dl>
        <div><dt>Товары</dt><dd>{money(summary.subtotal)}</dd></div>
        <div><dt>Доставка</dt><dd>{money(summary.delivery)}</dd></div>
        <div><dt>Скидка</dt><dd>- {money(summary.discount)}</dd></div>
      </dl>
      <div className="total"><span>Итого</span><strong>{money(summary.total)}</strong></div>
      <Link className="button clay" to="/checkout">Перейти к оформлению</Link>
    </aside>
  );
}

export function Checkout({ cart, submitOrder, orderError = '', isAuthenticated = false }) {
  const [delivery, setDelivery] = useState('courier');
  const [payment, setPayment] = useState('card');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    setSubmitting(true);
    try {
      const ok = await submitOrder(event, delivery);
      if (ok) setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="simple-page">
        <EmptyState
          title="Заказ сохранён"
          text="Заказ записан в Supabase и ожидает подтверждения. Реальная оплата пока не подключена."
          action={<Link className="button dark" to="/profile">Открыть профиль</Link>}
        />
      </div>
    );
  }

  return (
    <div className="checkout-page mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
      <div className="page-title lg:col-span-2">
        <BackLink to="/cart" label="Вернуться в корзину" />
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl lg:col-span-2">Оформление заказа</h1>
      {!isAuthenticated && <p className="rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-950 lg:col-span-2">Чтобы сохранить заказ, сначала <Link className="font-semibold underline underline-offset-2" to="/login">войдите в аккаунт</Link>.</p>}
      <div className="steps grid grid-cols-2 gap-2 sm:grid-cols-4 lg:col-span-2"><span>1 Корзина</span><span>2 Доставка</span><span>3 Оплата</span><span>4 Готово</span></div>
      <form className="checkout-form space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7" onSubmit={handleSubmit}>
        <h2>Данные получателя</h2>
        <label className="grid gap-1.5 text-sm font-medium text-stone-700">Имя<input className="w-full" name="name" placeholder="Имя покупателя" required /></label>
        <label className="grid gap-1.5 text-sm font-medium text-stone-700">Телефон<input className="w-full" name="phone" placeholder="+7 (___) ___-__-__" required /></label>
        <label className="grid gap-1.5 text-sm font-medium text-stone-700">Город<input className="w-full" name="city" defaultValue="Новосибирск" required /></label>
        <label className="grid gap-1.5 text-sm font-medium text-stone-700">Адрес<input className="w-full" name="address" placeholder="Адрес доставки" required /></label>
      </form>
      <aside className="checkout-side h-fit space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm lg:sticky lg:top-6">
        <h2 className="text-xl font-semibold tracking-tight text-stone-900">Доставка и оплата</h2>
        <button className={delivery === 'courier' ? 'active' : ''} type="button" onClick={() => setDelivery('courier')}>Курьер +1-2 дня</button>
        <button className={delivery === 'pickup' ? 'active' : ''} type="button" onClick={() => setDelivery('pickup')}>Пункт выдачи +2-4 дня</button>
        <h3>Способ оплаты</h3>
        <div className="payment-options">
          <button className={payment === 'card' ? 'active' : ''} type="button" onClick={() => setPayment('card')}>Банковская карта</button>
          <button className={payment === 'split' ? 'active' : ''} type="button" onClick={() => setPayment('split')}>Сплит</button>
        </div>
        <p>К оформлению</p>
        <strong>{money(cart.summary.total)}</strong>
        {orderError && <p className="field-error">{orderError}</p>}
        <button className="button clay" type="button" disabled={submitting || !cart.items.length} onClick={() => document.querySelector('.checkout-form')?.requestSubmit()}>
          {submitting ? 'Сохраняем заказ...' : 'Оформить заказ'}
        </button>
      </aside>
    </div>
  );
}
