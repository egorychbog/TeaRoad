import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { BackLink } from '../components/SiteChrome.jsx';


export function Auth({ mode }) {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [recoveryActive, setRecoveryActive] = useState(false);
  const isRegister = mode === 'register';
  const isRecover = mode === 'recover';
  const isPasswordReset = isRecover && recoveryActive;

  useEffect(() => {
    if (!supabase || !isRecover) return undefined;
    if (window.location.hash.includes('type=recovery')) setRecoveryActive(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setRecoveryActive(true);
    });
    return () => subscription.unsubscribe();
  }, [isRecover]);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    setError('');

    try {
      if (!supabase) throw new Error('Supabase не настроен. Проверь .env и пересобери сайт.');

      const form = new FormData(event.currentTarget);
      const email = String(form.get('email') || '').trim().toLowerCase();
      const password = String(form.get('password') || '');

      if (isPasswordReset) {
        if (password.length < 6) throw new Error('Новый пароль должен содержать минимум 6 символов.');
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) throw updateError;
        setMessage('Пароль изменён. Теперь войди с новым паролем.');
        setRecoveryActive(false);
        navigate('/login');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email)) {
        throw new Error('Введите корректный адрес электронной почты.');
      }

      if (isRecover) {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/recover',
        });
        if (resetError) throw resetError;
        setMessage('Если адрес зарегистрирован, инструкция для восстановления отправлена на почту.');
        return;
      }

      if (password.length < 6) throw new Error('Пароль должен содержать минимум 6 символов.');

      if (isRegister) {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;

        if (data.session) {
          navigate('/profile');
        } else {
          setMessage('Аккаунт создан. Проверь почту, подтверди адрес и затем войди. Профиль пока не создан.');
        }
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      navigate('/profile');
    } catch (authError) {
      setError(authError.message || 'Не удалось выполнить запрос авторизации.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <BackLink to="/" label="На главную" />
      <form className="auth-card mx-auto w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-xl sm:p-8" onSubmit={handleSubmit}>
        <strong>ЧАЙНЫЙ ПУТЬ</strong>
        <div className="auth-switch">
          <Link className={mode === 'login' ? 'active' : ''} to="/login">Вход</Link>
          <Link className={mode === 'register' ? 'active' : ''} to="/register">Регистрация</Link>
          <Link className={mode === 'recover' ? 'active' : ''} to="/recover">Пароль</Link>
        </div>
        <h1>{isPasswordReset ? 'Новый пароль' : isRecover ? 'Восстановление пароля' : isRegister ? 'Создать аккаунт' : 'Вход'}</h1>
        <p>
          {isPasswordReset
            ? 'Введи новый пароль для аккаунта.'
            : isRecover
              ? 'Введи e-mail, на который отправить ссылку для восстановления.'
              : 'После входа можно сохранять избранное, корзину и историю заказов.'}
        </p>
        {!isPasswordReset && (
          <label>
            E-mail
            <input name="email" type="email" autoComplete="email" placeholder="example@mail.ru" required />
          </label>
        )}
        {(isPasswordReset || !isRecover) && (
          <label>
            {isPasswordReset ? 'Новый пароль' : 'Пароль'}
            <input name="password" type="password" minLength={6} autoComplete={isPasswordReset ? 'new-password' : isRegister ? 'new-password' : 'current-password'} placeholder="Минимум 6 символов" required />
          </label>
        )}
        {error && <p className="field-error">{error}</p>}
        {message && <p className="auth-message">{message}</p>}
        <button className="button dark" type="submit" disabled={busy}>
          {busy ? 'Подождите...' : isPasswordReset ? 'Сохранить новый пароль' : isRecover ? 'Отправить ссылку' : isRegister ? 'Зарегистрироваться' : 'Войти'}
        </button>
        <small>
          {isRecover && !isPasswordReset && <Link to="/login">Вернуться ко входу</Link>}
          {isRegister && <Link to="/login">Уже есть аккаунт? Войти</Link>}
          {mode === 'login' && <Link to="/recover">Забыли пароль?</Link>}
        </small>
      </form>
    </div>
  );
}
