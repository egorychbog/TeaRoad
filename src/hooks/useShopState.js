import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { asset, fallbackProducts, promoRules } from '../data/siteContent.js';
import { createCart, readStoredArray } from '../lib/cartHelpers.js';

export function useShopState(navigate) {
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

  
  return {
    menuOpen, setMenuOpen, query, setQuery, cart, products, productsLoading,
    productsError, session, authLoading, profile, profileLoading, profileError,
    favorites, orders, orderError, filteredProducts, favoriteProducts,
    cartCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    addToCart, changeQuantity, applyPromo, saveProfile, signOut, submitOrder, toggleFavorite,
  };
}
