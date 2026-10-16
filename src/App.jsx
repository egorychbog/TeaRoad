import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase.js';
import { asset, fallbackAbout, fallbackGifts, fallbackHome, fallbackProducts, fallbackPromotions, heroImages, promoRules } from './data/siteContent.js';
import { createCart, readStoredArray } from './lib/cartHelpers.js';
import { BackLink, EmptyState, Header, MobileNav } from './components/SiteChrome.jsx';

const lazyNamed = (loader, name) => lazy(() => loader().then((module) => ({ default: module[name] })));
const Home = lazyNamed(() => import('./pages/HomePage.jsx'), 'Home');
const Catalog = lazyNamed(() => import('./pages/CatalogPage.jsx'), 'Catalog');
const ProductRoute = lazyNamed(() => import('./pages/ProductPage.jsx'), 'ProductRoute');
const Favorites = lazyNamed(() => import('./pages/ShoppingPages.jsx'), 'Favorites');
const Gifts = lazyNamed(() => import('./pages/ShoppingPages.jsx'), 'Gifts');
const Cart = lazyNamed(() => import('./pages/ShoppingPages.jsx'), 'Cart');
const Checkout = lazyNamed(() => import('./pages/ShoppingPages.jsx'), 'Checkout');
const ProfileSetup = lazyNamed(() => import('./pages/ProfilePages.jsx'), 'ProfileSetup');
const Profile = lazyNamed(() => import('./pages/ProfilePages.jsx'), 'Profile');
const Promotions = lazyNamed(() => import('./pages/ContentPages.jsx'), 'Promotions');
const About = lazyNamed(() => import('./pages/ContentPages.jsx'), 'About');
const Delivery = lazyNamed(() => import('./pages/ContentPages.jsx'), 'Delivery');
const Picker = lazyNamed(() => import('./pages/ContentPages.jsx'), 'Picker');
const NotFound = lazyNamed(() => import('./pages/ContentPages.jsx'), 'NotFound');
const Auth = lazyNamed(() => import('./pages/AuthPage.jsx'), 'Auth');

function App() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState(createCart);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [favoritesLoadedFor, setFavoritesLoadedFor] = useState(null);
  const [cartLoadedFor, setCartLoadedFor] = useState(null);
  const [orders, setOrders] = useState([]);
  const [orderError, setOrderError] = useState('');
  const cartSyncRef = useRef(Promise.resolve());
  const favoritesSyncRef = useRef(Promise.resolve());
  const ownerKey = session?.user?.id ?? 'guest';

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return undefined;
    }

    let alive = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!alive) return;
        setSession(nextSession);
        setAuthLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data, error }) => {
      if (!alive) return;
      if (error) console.error('[Auth] Не удалось получить сессию:', error);
      setSession(data?.session ?? null);
      setAuthLoading(false);
    });

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      if (!supabase) {
        setProductsError('Supabase не настроен. Проверь .env и сборку.');
        setProductsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .select('id, slug, name, description, price, unit_label, categories(name), product_images(storage_path, alt_text, sort_order, is_primary), product_taste_tags(taste_tags(name))')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (cancelled) return;

      if (error) {
        console.error('[Supabase] Ошибка загрузки каталога:', error);
        setProductsError(error.message);
        setProducts([]);
        setProductsLoading(false);
        return;
      }

      const mappedProducts = (data ?? []).map((row) => {
        const images = [...(row.product_images ?? [])].sort(
          (a, b) =>
            Number(Boolean(b.is_primary)) - Number(Boolean(a.is_primary))
            || (a.sort_order ?? 0) - (b.sort_order ?? 0)
        );
        const tastes = (row.product_taste_tags ?? [])
          .map((item) => item.taste_tags?.name)
          .filter(Boolean);

        return {
          id: row.slug,
          dbId: row.id,
          slug: row.slug,
          name: row.name,
          category: row.categories?.name ?? 'Без категории',
          taste: tastes[0] ?? 'нейтральный',
          tastes,
          price: Number(row.price),
          weight: row.unit_label ?? '',
          stock: true,
          image: images[0]?.storage_path ?? asset('hero-tea.jpg'),
          description: row.description ?? '',
          details: row.description ?? '',
        };
      });

      setProducts(mappedProducts);
      setProductsError('');
      setProductsLoading(false);
      console.log('[Supabase] Каталог загружен:', mappedProducts.length, 'товаров', mappedProducts);
    }

    loadProducts();
    return () => { cancelled = true; };
  }, []);

  // Profile rows are optional. Signing up never inserts a row into public.profiles.
  useEffect(() => {
    if (authLoading) return undefined;

    if (!session?.user?.id) {
      setProfile(null);
      setProfileError('');
      setProfileLoading(false);
      return undefined;
    }

    let cancelled = false;
    setProfileLoading(true);

    supabase
      .from('profiles')
      .select('user_id, display_name, phone, avatar_path, created_at, updated_at')
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error('[Supabase] Ошибка загрузки профиля:', error);
          setProfileError(error.message);
          setProfile(null);
        } else {
          setProfile(data ?? null);
          setProfileError('');
        }
        setProfileLoading(false);
      });

    return () => { cancelled = true; };
  }, [session?.user?.id, authLoading]);

  useEffect(() => {
    if (authLoading) return undefined;

    let cancelled = false;
    setCartLoadedFor(null);

    async function loadCart() {
      const guestLines = readStoredArray('tearoad-guest-cart')
        .filter((line) => line && typeof line.productId === 'string' && Number(line.quantity) > 0);

      if (!session?.user?.id) {
        if (!cancelled) {
          setCart(createCart(guestLines, '', products.length ? products : fallbackProducts));
          setCartLoadedFor('guest');
        }
        return;
      }

      const { data, error } = await supabase
        .from('carts')
        .select('id, cart_items(quantity, products(slug))')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) throw error;

      const savedLines = (data?.cart_items ?? [])
        .map((line) => ({
          productId: line.products?.slug,
          quantity: Number(line.quantity),
        }))
        .filter((line) => line.productId && line.quantity > 0);

      const lines = savedLines.length ? savedLines : guestLines;
      if (!cancelled) {
        setCart(createCart(lines, '', products.length ? products : fallbackProducts));
        setCartLoadedFor(session.user.id);
      }
    }

    loadCart().catch((error) => {
      console.error('[Supabase] Не удалось загрузить корзину; синхронизация остановлена:', error);
    });

    return () => { cancelled = true; };
  }, [authLoading, session?.user?.id]);

  useEffect(() => {
    if (cartLoadedFor !== ownerKey) return;

    const lines = cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    if (!session?.user?.id) {
      window.localStorage.setItem('tearoad-guest-cart', JSON.stringify(lines));
      return;
    }

    const userId = session.user.id;
    cartSyncRef.current = cartSyncRef.current
      .catch(() => undefined)
      .then(async () => {
        const { data: cartRow, error: cartError } = await supabase
          .from('carts')
          .upsert({ user_id: userId }, { onConflict: 'user_id' })
          .select('id')
          .single();
        if (cartError) throw cartError;

        const slugs = lines.map((line) => line.productId);
        let dbProducts = [];
        if (slugs.length) {
          const { data, error } = await supabase
            .from('products')
            .select('id, slug')
            .in('slug', slugs);
          if (error) throw error;
          dbProducts = data ?? [];
        }

        const { error: deleteError } = await supabase
          .from('cart_items')
          .delete()
          .eq('cart_id', cartRow.id);
        if (deleteError) throw deleteError;

        const bySlug = new Map(dbProducts.map((product) => [product.slug, product.id]));
        const rows = lines
          .filter((line) => bySlug.has(line.productId))
          .map((line) => ({
            cart_id: cartRow.id,
            product_id: bySlug.get(line.productId),
            quantity: line.quantity,
          }));

        if (rows.length) {
          const { error } = await supabase.from('cart_items').insert(rows);
          if (error) throw error;
        }
        window.localStorage.removeItem('tearoad-guest-cart');
        console.log('[Supabase] Корзина сохранена:', rows.length, 'позиций');
      })
      .catch((error) => console.error('[Supabase] Ошибка сохранения корзины:', error));
  }, [cart, cartLoadedFor, ownerKey, session?.user?.id]);

  useEffect(() => {
    if (authLoading) return undefined;

    let cancelled = false;
    setFavoritesLoadedFor(null);

    async function loadFavorites() {
      const guestFavorites = readStoredArray('tearoad-guest-favorites')
        .filter((slug) => typeof slug === 'string');

      if (!session?.user?.id) {
        if (!cancelled) {
          setFavorites(guestFavorites);
          setFavoritesLoadedFor('guest');
        }
        return;
      }

      const { data, error } = await supabase
        .from('favorites')
        .select('products(slug)')
        .eq('user_id', session.user.id);

      if (error) throw error;

      const saved = (data ?? []).map((row) => row.products?.slug).filter(Boolean);
      const merged = [...new Set([...saved, ...guestFavorites])];
      if (!cancelled) {
        setFavorites(merged);
        setFavoritesLoadedFor(session.user.id);
      }
    }

    loadFavorites().catch((error) => {
      console.error('[Supabase] Не удалось загрузить избранное; синхронизация остановлена:', error);
    });

    return () => { cancelled = true; };
  }, [authLoading, session?.user?.id]);

  useEffect(() => {
    if (favoritesLoadedFor !== ownerKey) return;

    if (!session?.user?.id) {
      window.localStorage.setItem('tearoad-guest-favorites', JSON.stringify(favorites));
      return;
    }

    const userId = session.user.id;
    favoritesSyncRef.current = favoritesSyncRef.current
      .catch(() => undefined)
      .then(async () => {
        const { error: deleteError } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId);
        if (deleteError) throw deleteError;

        let dbProducts = [];
        if (favorites.length) {
          const { data, error } = await supabase
            .from('products')
            .select('id, slug')
            .in('slug', favorites);
          if (error) throw error;
          dbProducts = data ?? [];
        }

        const rows = dbProducts.map((product) => ({
          user_id: userId,
          product_id: product.id,
        }));

        if (rows.length) {
          const { error } = await supabase.from('favorites').insert(rows);
          if (error) throw error;
        }
        window.localStorage.removeItem('tearoad-guest-favorites');
        console.log('[Supabase] Избранное сохранено:', rows.length, 'товаров');
      })
      .catch((error) => console.error('[Supabase] Ошибка сохранения избранного:', error));
  }, [favorites, favoritesLoadedFor, ownerKey, session?.user?.id]);

  useEffect(() => {
    if (!products.length) return;
    setCart((current) => createCart(
      current.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      current.promoCode,
      products
    ));
  }, [products]);

  const fetchOrders = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('orders')
      .select('id, order_number, status_code, created_at, delivery_cost_snapshot, discount_amount_snapshot, order_statuses(name), order_items(product_name_snapshot, unit_price_snapshot, quantity)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Supabase] Ошибка загрузки заказов:', error);
      return;
    }

    setOrders((data ?? []).map((order) => {
      const subtotal = (order.order_items ?? []).reduce(
        (sum, item) => sum + Number(item.unit_price_snapshot) * Number(item.quantity),
        0
      );
      return {
        id: order.id,
        number: order.order_number,
        date: new Date(order.created_at).toLocaleDateString('ru-RU'),
        status: order.order_statuses?.name ?? order.status_code,
        total: subtotal + Number(order.delivery_cost_snapshot) - Number(order.discount_amount_snapshot),
      };
    }));
  }, []);

  useEffect(() => {
    if (!session?.user?.id) {
      setOrders([]);
      return;
    }
    fetchOrders(session.user.id);
  }, [session?.user?.id, fetchOrders]);

  function addToCart(productId) {
    const lines = cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));
    const line = lines.find((item) => item.productId === productId);
    if (line) line.quantity = Math.min(99, line.quantity + 1);
    else lines.push({ productId, quantity: 1 });
    setCart(createCart(lines, cart.promoCode, products.length ? products : fallbackProducts));
  }

  function changeQuantity(productId, quantity) {
    const lines = cart.items
      .map((item) => ({
        productId: item.productId,
        quantity: item.productId === productId ? Math.max(0, Math.min(99, quantity)) : item.quantity,
      }))
      .filter((item) => item.quantity > 0);
    setCart(createCart(lines, cart.promoCode, products.length ? products : fallbackProducts));
  }

  function applyPromo(code) {
    const normalized = code.trim().toUpperCase();
    if (!promoRules[normalized]) return false;
    const lines = cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));
    setCart(createCart(lines, normalized, products.length ? products : fallbackProducts));
    return true;
  }

  async function saveProfile(nextProfile) {
    if (!session?.user?.id) throw new Error('Войдите в аккаунт, чтобы сохранить профиль.');

    const payload = {
      user_id: session.user.id,
      display_name: String(nextProfile.display_name ?? '').trim(),
      phone: String(nextProfile.phone ?? '').trim() || null,
      updated_at: new Date().toISOString(),
    };

    if (!payload.display_name) throw new Error('Введите имя.');

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select('user_id, display_name, phone, avatar_path, created_at, updated_at')
      .single();

    if (error) throw error;
    setProfile(data);
    setProfileError('');
    return data;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[Auth] Ошибка выхода:', error);
      return;
    }
    navigate('/');
  }

  async function submitOrder(event, deliveryMethodCode) {
    event.preventDefault();
    setOrderError('');

    if (!session?.user?.id) {
      setOrderError('Для оформления заказа сначала войдите в аккаунт.');
      navigate('/login');
      return false;
    }

    if (!cart.items.length) {
      setOrderError('Корзина пуста.');
      return false;
    }

    const formData = new FormData(event.currentTarget);
    const items = cart.items.map((item) => ({
      slug: item.product.slug ?? item.productId,
      quantity: item.quantity,
    }));

    const { error } = await supabase.rpc('place_order', {
      p_customer_name: String(formData.get('name') ?? '').trim(),
      p_customer_email: session.user.email,
      p_customer_phone: String(formData.get('phone') ?? '').trim(),
      p_city: String(formData.get('city') ?? '').trim(),
      p_address_line: String(formData.get('address') ?? '').trim(),
      p_delivery_method_code: deliveryMethodCode,
      p_items: items,
      p_promotion_code: cart.promoCode || null,
    });

    if (error) {
      console.error('[Supabase] Ошибка оформления заказа:', error);
      setOrderError(error.message);
      return false;
    }

    setCart(createCart([], '', products.length ? products : fallbackProducts));
    await fetchOrders(session.user.id);
    return true;
  }

  function toggleFavorite(productId) {
    setFavorites((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
  }

  const filteredProducts = products.filter((product) =>
    [product.name, product.category, product.taste, ...product.tastes, product.description]
      .some((value) => value.toLowerCase().includes(query.toLowerCase()))
  );
  const favoriteProducts = products.filter((product) => favorites.includes(product.id));

  return (
    <div className="site-shell min-h-screen bg-amber-50 text-stone-900">
      <div className="app-frame mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <Header
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          query={query}
          setQuery={setQuery}
          cartCount={cart.items.reduce((sum, item) => sum + item.quantity, 0)}
          favoriteCount={favorites.length}
          session={session}
          onSignOut={signOut}
        />
        {menuOpen && <MobileNav close={() => setMenuOpen(false)} />}
        <main className="mx-auto w-full max-w-7xl">
          <Suspense fallback={<div className="mx-auto max-w-xl px-4 py-16 text-center text-sm text-stone-500" role="status">Загружаем страницу…</div>}>
          <Routes>
            <Route path="/" element={<Home home={fallbackHome} />} />
            <Route
              path="/catalog"
              element={<Catalog products={filteredProducts} addToCart={addToCart} loading={productsLoading} error={productsError} />}
            />
            <Route
              path="/product/:id"
              element={
                <ProductRoute
                  products={products}
                  addToCart={addToCart}
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                  loading={productsLoading}
                  error={productsError}
                />
              }
            />
            <Route path="/favorites" element={<Favorites products={favoriteProducts} addToCart={addToCart} />} />
            <Route path="/gifts" element={<Gifts gifts={{ hero: { image: heroImages.gifts }, items: fallbackGifts }} addToCart={addToCart} />} />
            <Route path="/cart" element={<Cart cart={cart} changeQuantity={changeQuantity} applyPromo={applyPromo} />} />
            <Route path="/checkout" element={<Checkout cart={cart} submitOrder={submitOrder} orderError={orderError} isAuthenticated={Boolean(session?.user?.id)} />} />
            <Route
              path="/profile"
              element={
                authLoading ? (
                  <div className="simple-page"><p>Проверяем авторизацию...</p></div>
                ) : !session?.user ? (
                  <div className="simple-page">
                    <BackLink to="/" label="На главную" />
                    <EmptyState
                      title="Войдите в аккаунт"
                      text="Профиль доступен после входа. Регистрация сама по себе профиль не создаёт."
                      action={<Link className="button dark" to="/login">Войти</Link>}
                    />
                  </div>
                ) : profileLoading ? (
                  <div className="simple-page"><p>Загружаем профиль...</p></div>
                ) : profileError ? (
                  <div className="simple-page">
                    <EmptyState title="Не удалось загрузить профиль" text={profileError} action={<button className="button dark" onClick={() => window.location.reload()}>Повторить</button>} />
                  </div>
                ) : profile ? (
                  <Profile profile={profile} email={session.user.email} updateProfile={saveProfile} favoriteCount={favorites.length} cartCount={cart.items.length} orders={orders} onSignOut={signOut} />
                ) : (
                  <ProfileSetup email={session.user.email} onSave={saveProfile} />
                )
              }
            />
            <Route path="/promotions" element={<Promotions promotions={fallbackPromotions} />} />
            <Route path="/about" element={<About about={fallbackAbout} />} />
            <Route path="/delivery" element={<Delivery />} />
            <Route path="/picker" element={<Picker products={products} addToCart={addToCart} />} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/register" element={<Auth mode="register" />} />
            <Route path="/recover" element={<Auth mode="recover" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default App;
