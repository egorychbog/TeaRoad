import { lazy, Suspense } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { fallbackAbout, fallbackGifts, fallbackHome, fallbackPromotions, heroImages } from './data/siteContent.js';
import { BackLink, EmptyState, Header, MobileNav } from './components/SiteChrome.jsx';
import { useShopState } from './hooks/useShopState.js';

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
  const {
    menuOpen, setMenuOpen, query, setQuery, cart, products, productsLoading,
    productsError, session, authLoading, profile, profileLoading, profileError,
    favorites, orders, orderError, filteredProducts, favoriteProducts, cartCount,
    addToCart, changeQuantity, applyPromo, saveProfile, signOut, submitOrder, toggleFavorite,
  } = useShopState(navigate);

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
