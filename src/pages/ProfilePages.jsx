import { money } from '../lib/cartHelpers.js';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, TicketPercent, UserRound, Package, LogOut } from 'lucide-react';
import { BackLink, EmptyState } from '../components/SiteChrome.jsx';


export function ProfileSetup({ email, onSave }) {
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await onSave({ display_name: displayName, phone });
      setMessage('Профиль сохранён.');
    } catch (saveError) {
      setError(saveError.message || 'Не удалось сохранить профиль.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="profile-page mx-auto w-full max-w-6xl">
      <div className="page-title"><BackLink to="/" label="На главную" /></div>
      <h1 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">Личный кабинет</h1>
      <EmptyState
        title="Профиль ещё не создан"
        text="Регистрация создала аккаунт, но профиль будет сохранён только после заполнения этой формы."
      />
      <form className="profile-card rounded-2xl border border-stone-200 bg-white shadow-sm" onSubmit={handleSubmit}>
        <h2>Создать профиль</h2>
        <label className="grid gap-1.5 text-sm font-medium text-stone-700">E-mail<input className="w-full" type="email" value={email || ''} readOnly /></label>
        <label className="grid gap-1.5 text-sm font-medium text-stone-700">Имя<input className="w-full" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required /></label>
        <label className="grid gap-1.5 text-sm font-medium text-stone-700">Телефон<input className="w-full" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+7 999 123-45-67" /></label>
        {error && <p className="field-error">{error}</p>}
        {message && <p className="auth-message">{message}</p>}
        <button className="button dark" type="submit" disabled={saving}>{saving ? 'Сохраняем...' : 'Сохранить профиль'}</button>
      </form>
    </div>
  );
}

export function Profile({ profile, email, updateProfile, favoriteCount, cartCount, orders, onSignOut }) {
  const [displayName, setDisplayName] = useState(profile.display_name || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const saved = await updateProfile({ display_name: displayName, phone });
      setDisplayName(saved.display_name || '');
      setPhone(saved.phone || '');
      setMessage('Изменения сохранены в Supabase.');
    } catch (saveError) {
      setError(saveError.message || 'Не удалось сохранить профиль.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="profile-page mx-auto w-full max-w-6xl">
      <div className="page-title"><BackLink to="/" label="На главную" /></div>
      <header className="profile-heading">
        <div>
          <p className="profile-eyebrow">АККАУНТ ПОКУПАТЕЛЯ</p>
          <h1>Личный кабинет</h1>
          <p>Управляйте личными данными и следите за своими заказами.</p>
        </div>
        <button className="profile-signout" type="button" onClick={onSignOut}><LogOut size={17} /> Выйти</button>
      </header>
      <nav className="profile-menu" aria-label="Разделы личного кабинета">
        <Link className="active" to="/profile"><UserRound size={17} /> Профиль</Link>
        <Link to="/profile#orders"><Package size={17} /> Мои заказы</Link>
        <Link to="/favorites"><Heart size={17} /> Избранное</Link>
        <Link to="/cart"><ShoppingCart size={17} /> Корзина</Link>
      </nav>
      <section className="profile-dashboard">
        <form className="profile-card" onSubmit={handleSave}>
          <div className="profile-card-heading">
            <h2>Данные профиля</h2>
            <p>Контактная информация для ваших заказов</p>
          </div>
          <label className="grid gap-1.5 text-sm font-medium text-stone-700">E-mail аккаунта<input className="w-full" type="email" value={email || ''} readOnly /></label>
          <label className="grid gap-1.5 text-sm font-medium text-stone-700">Имя<input className="w-full" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required /></label>
          <label className="grid gap-1.5 text-sm font-medium text-stone-700">Телефон<input className="w-full" value={phone} onChange={(event) => setPhone(event.target.value)} /></label>
          <div className="profile-save-row">
            <button className="button dark" type="submit" disabled={saving}>{saving ? 'Сохраняем...' : 'Сохранить изменения'}</button>
            {message && <p className="auth-message" role="status">{message}</p>}
            {error && <p className="field-error" role="alert">{error}</p>}
          </div>
        </form>
        <div className="profile-side">
          <div className="profile-stats">
            <Link to="/favorites"><Heart size={19} /><span><strong>{favoriteCount}</strong><small>В избранном</small></span></Link>
            <Link to="/cart"><ShoppingCart size={19} /><span><strong>{cartCount}</strong><small>Товаров в корзине</small></span></Link>
          </div>
          <Link className="profile-promo" to="/promotions"><TicketPercent size={19} /><span><strong>Специальные предложения</strong><small>Промокоды и акции магазина</small></span></Link>
        </div>
      </section>
      <section className="orders" id="orders">
        <div className="orders-heading"><div><p className="profile-eyebrow">ИСТОРИЯ ПОКУПОК</p><h2>Мои заказы</h2></div><Link to="/catalog">Перейти в каталог</Link></div>
        {orders.length ? orders.map((order) => (
          <article className="grid gap-2 rounded-xl border border-stone-100 bg-stone-50 p-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center" key={order.id}>
            <strong>Заказ №{order.number}</strong>
            <span>{order.date}</span>
            <mark>{order.status}</mark>
            <b>{money(order.total)}</b>
          </article>
        )) : <p>Заказов пока нет.</p>}
      </section>
    </div>
  );
}
