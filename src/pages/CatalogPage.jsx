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
    <div className="catalog-page mx-auto w-full max-w-7xl">
      <div className="page-title">
        <BackLink to="/" label="На главную" />
        <h1>Каталог</h1>
        <p>{loading ? 'Загрузка товаров...' : error ? 'Ошибка загрузки' : visibleProducts.length + ' из ' + products.length + ' товаров'}</p>
      </div>
      <aside className="filters self-start rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
        <h2>Фильтры</h2>
        <FilterGroup title="Категория" type="categories" items={filterOptions.categories} selected={filters.categories} onToggle={toggleFilter} />
        <FilterGroup title="Вкус" type="tastes" items={filterOptions.tastes} selected={filters.tastes} onToggle={toggleFilter} />
        <FilterGroup title="Цена" type="prices" items={filterOptions.prices} selected={filters.prices} onToggle={toggleFilter} />
        <div className="filter-actions">
          <button className="button dark" type="button">Показано {visibleProducts.length}</button>
          <button className="button light" type="button" onClick={resetFilters}>Сбросить</button>
        </div>
      </aside>
      <section className="catalog-content min-w-0">
        <p className="sort-label">Сортировка: По названию</p>
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
    <div className="filter-group">
      <strong>{title}</strong>
      {items.map((item) => (
        <label className={selected.includes(item) ? 'active' : ''} key={item}>
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