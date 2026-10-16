import { fallbackProducts, promoRules } from '../data/siteContent.js';

export function readStoredArray(key) {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function money(value) {
  return `${currency.format(value)} ₽`;
}

export function createCart(itemsInput = [], promoCode = '', catalog = fallbackProducts) {
  const items = [
    ...itemsInput,
  ]
    .map((line) => ({
      ...line,
      product: catalog.find((product) => product.id === line.productId)
        || fallbackProducts.find((product) => product.id === line.productId),
    }))
    .filter((item) => item.product && item.quantity > 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const promo = promoRules[promoCode.toUpperCase()];
  const baseDiscount = 0; // Discounts are validated by Supabase during checkout.
  const promoDiscount = promo?.type === 'percent' ? Math.round((subtotal * promo.value) / 100) : 0;
  return {
    items,
    promoCode: promo ? promoCode.toUpperCase() : '',
    promo,
    summary: {
      subtotal,
      delivery: subtotal > 0 ? 450 : 0,
      discount: baseDiscount + promoDiscount,
      total: Math.max(0, subtotal + (subtotal > 0 ? 450 : 0) - baseDiscount - promoDiscount),
    },
  };
}
