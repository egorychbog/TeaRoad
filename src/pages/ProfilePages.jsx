import { money } from '../lib/cartHelpers.js';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, TicketPercent } from 'lucide-react';
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
      <h1>Личный кабинет</h1>
      <EmptyState
        title="Профиль ещё не создан"
        text="Регистрация создала аккаунт, но профиль будет сохранён только после заполнения этой формы."
      />
      <form className="profile-card rounded-2xl border border-stone-200 bg-white shadow-sm" onSubmit={handleSubmit}>
        <h2>Создать профиль</h2>
        <label>E-mail<input type="email" value={email || ''} readOnly /></label>
        <label>Имя<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} required /></label>
        <label>Телефон<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+7 999 123-45-67" /></label>
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
    <div className="profile-page">
      <div className="page-title"><BackLink to="/" label="На главную" /></div>
      <h1>Личный кабинет</h1>
      <aside className="profile-menu">
        <strong>Покупатель</strong>
        <Link className="active" to="/profile">Профиль</Link>
        <Link to="/profile#orders">Мои заказы</Link>
        <Link to="/favorites">Избранное</Link>
        <Link to="/cart">Корзина</Link>
        <button className="nav-link" type="button" onClick={onSignOut}>Выйти из аккаунта</button>
      </aside>
      <section className="profile-dashboard">
        <form className="profile-card" onSubmit={handleSave}>
          <h2>Данные профиля</h2>
          <label>E-mail аккаунта<input type="email" value={email || ''} readOnly /></label>
          <label>Имя<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} required /></label>
          <label>Телефон<input value={phone} onChange={(event) => setPhone(event.target.value)} /></label>
          {error && <p className="field-error">{error}</p>}
          {message && <p className="auth-message">{message}</p>}
          <button className="button dark" type="submit" disabled={saving}>{saving ? 'Сохраняем...' : 'Сохранить'}</button>
        </form>
        <div className="profile-stats">
          <Link to="/favorites"><Heart size={18} /> Избранное: {favoriteCount}</Link>
          <Link to="/cart"><ShoppingCart size={18} /> В корзине: {cartCount}</Link>
          <Link to="/promotions"><TicketPercent size={18} /> Промокоды</Link>
          <Link to="/catalog">Каталог товаров</Link>
        </div>
      </section>
      <section className="orders" id="orders">
        <h2>Мои заказы</h2>
        {orders.length ? orders.map((order) => (
          <article key={order.id}>
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
