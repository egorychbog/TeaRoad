import { filterOptions } from '../data/siteContent.js';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BackLink, EmptyState } from '../components/SiteChrome.jsx';
import { ProductGrid } from '../components/ProductGrid.jsx';


export function Catalog({ products, addToCart, loading = false, error = '' }) {
  const [filters, setFilters] = useState({ categories: [], tastes: [], prices: [] });

  function toggleFilter(type, value) {
    setFilters((current) => {
      const values = current[type];
      return {
        ...current,
        [type]: values.includes(value)
          ? values.filter((item) => item !== value)
          : [...values, value],
      };
    });
  }

  function matchesPrice(product) {
    if (!filters.prices.length) return true;
    return filters.prices.some((range) => {
      if (range === 'до 1 000 ₽') return product.price < 1000;
      if (range === '1 000-2 500 ₽') return product.price >= 1000 && product.price <= 2500;
      return product.price > 2500;
    });
  }

  const visibleProducts = products.filter((product) => {
    const categoryOk = !filters.categories.length || filters.categories.includes(product.category);
    const productTastes = product.tastes ?? [product.taste];
    const tasteOk = !filters.tastes.length || productTastes.some(
      (taste) => filters.tastes.includes(capitalize(taste))
    );
    return categoryOk && tasteOk && matchesPrice(product);
  });

  function resetFilters() {
    setFilters({ categories: [], tastes: [], prices: [] });
  }

  return (
    <div className="catalog-page mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start">
      <div className="page-title mb-6">
        <BackLink to="/" label="На главную" />
        <h1 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">Каталог</h1>
        <p className="mt-2 text-sm text-stone-500">{loading ? 'Загрузка товаров...' : error ? 'Ошибка загрузки' : visibleProducts.length + ' из ' + products.length + ' товаров'}</p>
      </div>
      <aside className="filters self-start rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-stone-900">Фильтры</h2>
        <FilterGroup title="Категория" type="categories" items={filterOptions.categories} selected={filters.categories} onToggle={toggleFilter} />
        <FilterGroup title="Вкус" type="tastes" items={filterOptions.tastes} selected={filters.tastes} onToggle={toggleFilter} />
        <FilterGroup title="Цена" type="prices" items={filterOptions.prices} selected={filters.prices} onToggle={toggleFilter} />
        <div className="filter-actions">
          <button className="button dark" type="button">Показано {visibleProducts.length}</button>
          <button className="button light" type="button" onClick={resetFilters}>Сбросить</button>
        </div>
      </aside>
      <section className="catalog-content min-w-0">
        <p className="sort-label mb-4 text-sm text-stone-500">Сортировка: По названию</p>
        {loading ? (
          <p>Загружаем каталог из Supabase...</p>
        ) : error ? (
          <EmptyState
            title="Не удалось загрузить каталог"
            text={error}
            action={<button className="button dark" type="button" onClick={() => window.location.reload()}>Повторить загрузку</button>}
          />
        ) : visibleProducts.length ? (
          <ProductGrid products={visibleProducts} addToCart={addToCart} />
        ) : (
          <EmptyState
            title="Ничего не нашлось"
            text="Сбросьте фильтры или попробуйте другой запрос."
            action={<button className="button dark" type="button" onClick={resetFilters}>Сбросить фильтры</button>}
          />
        )}
      </section>
    </div>
  );
}

export function FilterGroup({ title, type, items, selected, onToggle }) {
  return (
    <div className="filter-group space-y-2 border-b border-stone-100 py-4 first:pt-0 last:border-0">
      <strong className="mb-2 block text-sm font-semibold text-stone-800">{title}</strong>
      {items.map((item) => (
        <label className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition hover:bg-stone-50 ${selected.includes(item) ? 'bg-emerald-50 font-medium text-emerald-950' : 'text-stone-600'}`} key={item}>
          <input
            type="checkbox"
            checked={selected.includes(item)}
            onChange={() => onToggle(type, item)}
          />
          {item}
        </label>
      ))}
    </div>
  );
}

export function capitalize(value) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}