import { asset } from './data/siteContent.js';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ArrowLeft, Heart, Menu, Search, TicketPercent, X } from 'lucide-react';


const assetGuide = [
  { place: 'Главный hero-баннер', size: '1280x380 px', file: 'hero-tea.jpg', note: 'широкий горизонтальный кадр, главный объект справа или по центру' },
  { place: 'Hero раздела «Подарки»', size: '1280x360 px', file: 'gift.jpg', note: 'горизонтальный баннер с подарочным набором' },
  { place: 'Hero «Акции»', size: '1280x360 px', file: 'promotions.jpg', note: 'баннер с акционным товаром или подборкой' },
  { place: 'Hero «О магазине»', size: '1280x360 px', file: 'tea-set.jpg', note: 'широкий кадр с чайным столом' },
  { place: 'Hero «Подбор чая»', size: '1280x360 px', file: 'pick-tea.jpg', note: 'широкий кадр, без важного текста на самой картинке' },
  { place: 'Карусель на главной', size: '760x360 px', file: 'shen-puer-lesnoy.jpg / gift.jpg / tea-set.jpg', note: 'горизонтальные кадры, объект в центре' },
  { place: 'Карточки товара в каталоге', size: '800x800 px', file: 'любая карточка товара', note: 'квадрат, товар должен полностью помещаться с небольшими полями' },
  { place: 'Карточки подарков', size: '800x800 px', file: 'tea-set.jpg / gift.jpg', note: 'квадратный кадр набора целиком' },
  { place: 'Акции недели', size: '720x520 px', file: 'oolong.jpg / gift.jpg / tea-set.jpg', note: 'горизонтальная карточка, объект по центру' },
  { place: 'Собственное производство', size: '760x520 px', file: 'tea-set.jpg', note: 'горизонтальный кадр мастерской или набора' },
  { place: 'Сценарии на главной', size: '620x360 px', file: 'tea-set.jpg / hero-tea.jpg / gift.jpg', note: 'широкий фон без мелких деталей' },
  { place: 'Фото на странице товара', size: '900x820 px', file: 'yunnan.jpg и другие товары', note: 'почти квадрат, товар полностью внутри кадра' },
];

export function AssetGuide() {
  return (
    <section className="asset-guide">
      <div className="section-head">
        <div>
          <p className="kicker">Для замены картинок</p>
          <h2>Какие изображения подготовить</h2>
        </div>
      </div>
      <div className="asset-table">
        {assetGuide.map((item) => (
          <article key={item.place}>
            <strong>{item.place}</strong>
            <span>{item.size}</span>
            <p>{item.file}</p>
            <small>{item.note}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

export function Header({ menuOpen, setMenuOpen, query, setQuery, cartCount, favoriteCount, session, onSignOut }) {
  return (
    <header className="topbar sticky top-3 z-40 mx-auto w-full max-w-7xl shadow-md">
      <Link className="brand" to="/">
        <img className="logo-image" src={asset('logo.png')} alt="Чайный путь" />
        <span>ЧАЙНЫЙ ПУТЬ</span>
      </Link>
      <nav className="desktop-nav">
        <NavLink to="/">Главная</NavLink>
        <NavLink to="/catalog">Каталог</NavLink>
        <NavLink to="/gifts">Подарки</NavLink>
        <NavLink to="/about">О магазине</NavLink>
        <NavLink to="/delivery">Доставка</NavLink>
      </nav>
      <label className="search-box">
        <Search size={15} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Найти чай, посуду, подарок..."
        />
      </label>
      <Link className="nav-link promo-link" to="/promotions">
        <TicketPercent size={16} /> Акции
      </Link>
      <Link className={`nav-icon heart-link ${favoriteCount ? 'has-items' : ''}`} to="/favorites" aria-label="Избранное">
        <Heart size={19} />
        {favoriteCount > 0 && <span>{favoriteCount}</span>}
      </Link>
      <Link className="nav-link" to="/cart">
        Корзина {cartCount > 0 && <span>{cartCount}</span>}
      </Link>
      {session?.user ? (
        <>
          <Link className="nav-link" to="/profile">Профиль</Link>
          <button className="nav-link" type="button" onClick={onSignOut}>Выйти</button>
        </>
      ) : (
        <Link className="nav-link" to="/login">Войти</Link>
      )}
      <button
        className="mobile-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Меню"
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
    </header>
  );
}

export function MobileNav({ close }) {
  return (
    <nav className="mobile-nav">
      {[
        ['/', 'Главная'],
        ['/catalog', 'Каталог'],
        ['/gifts', 'Подарки'],
        ['/about', 'О магазине'],
        ['/delivery', 'Доставка'],
        ['/promotions', 'Акции'],
        ['/favorites', 'Избранное'],
        ['/cart', 'Корзина'],
        ['/profile', 'Профиль'],
        ['/login', 'Вход'],
      ].map(([to, label]) => (
        <Link key={to} to={to} onClick={close}>
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function HeroBanner({ image, label, title, text, action }) {
  return (
    <section className="hero-banner home-hero relative isolate overflow-hidden rounded-3xl">
      <img src={image} alt="" />
      <div className="banner-overlay" />
      <div className="banner-copy max-w-2xl px-6 py-8 sm:px-10 sm:py-12">
        {label && <p className="kicker">{label}</p>}
        <h1>{title}</h1>
        {text && <p>{text}</p>}
        {action}
      </div>
    </section>
  );
}

export function BackLink({ to = '/profile', label = 'Назад' }) {
  return (
    <Link className="back-link" to={to}>
      <ArrowLeft size={17} />
      {label}
    </Link>
  );
}

export function ImageCarousel({ slides }) {
  const [index, setIndex] = useState(0);
  const current = slides[index];

  function nextSlide() {
    setIndex((value) => (value + 1) % slides.length);
  }

  function prevSlide() {
    setIndex((value) => (value - 1 + slides.length) % slides.length);
  }

  return (
    <section className="carousel-section">
      <div className="carousel-copy">
        <p className="kicker">Подборка</p>
        <h2>{current.title}</h2>
        <p>{current.text}</p>
        <Link className="button dark" to={current.to}>Открыть</Link>
      </div>
      <div className="carousel-visual">
        <img src={current.image} alt={current.title} />
        <button type="button" onClick={prevSlide} aria-label="Предыдущий слайд">‹</button>
        <button type="button" onClick={nextSlide} aria-label="Следующий слайд">›</button>
        <div className="carousel-dots">
          {slides.map((slide, slideIndex) => (
            <button
              className={slideIndex === index ? 'active' : ''}
              key={slide.title}
              type="button"
              onClick={() => setIndex(slideIndex)}
              aria-label={`Слайд ${slideIndex + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function EmptyState({ title, text, action }) {
  return (
    <div className="empty-state">
      <h2>{title}</h2>
      <p>{text}</p>
      {action}
    </div>
  );
}

export default App;
