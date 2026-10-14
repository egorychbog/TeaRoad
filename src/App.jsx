import { useState } from 'react';
import {
  ArrowLeft,
  Heart,
  Menu,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  TicketPercent,
  X,
} from 'lucide-react';
import {
  Link,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom';

const currency = new Intl.NumberFormat('ru-RU');

const asset = (name) => `/assets/${name}`;

const heroImages = {
  tea: asset('hero-tea.jpg'),
  gifts: asset('gift.jpg'),
  about: asset('web-celadon-set.jpg'),
  picker: asset('pick-tea.jpg'),
  promo: asset('promotions.jpg'),
};

const fallbackProducts = [
  {
    id: 'shu-puer-lesnoy-put',
    name: 'Шэн Пуэр «Лесной путь»',
    category: 'Китайский чай',
    taste: 'мягкий',
    price: 1490,
    weight: '100 г',
    stock: true,
    image: asset('web-gold-puer-cake.jpg'),
    description: 'Выдержанный чай с древесным ароматом, сухофруктами и долгим теплым послевкусием.',
  },
  {
    id: 'te-guan-in-orhideya',
    name: 'Те Гуань Инь «Орхидея»',
    category: 'Китайский чай',
    taste: 'цветочный',
    price: 1290,
    weight: '100 г',
    stock: true,
    image: asset('web-dongding-oolong.jpg'),
    description: 'Свежий улун с цветочным профилем, сливочной мягкостью и прозрачным настоем.',
  },
  {
    id: 'ceremony-figure-yunnan',
    name: 'Фигурка для церемонии «Юньнань»',
    category: 'Аксессуары',
    taste: 'нейтральный',
    price: 2500,
    weight: '1 шт.',
    stock: true,
    image: asset('web-tea-pets.jpg'),
    description: 'Небольшая чайная фигурка для стола и церемоний гунфу.',
  },
  {
    id: 'si-lo-yu-bao',
    name: 'Сяо Шу Я Бао',
    category: 'Китайский чай',
    taste: 'свежий',
    price: 520,
    weight: '24 г',
    stock: true,
    image: asset('web-yabao-buds.jpg'),
    description: 'Легкий белый чай с травяной свежестью, медом и нежным ароматом почек.',
  },
  {
    id: 'piala-teplaya-glina',
    name: 'Пиала «Теплая глина»',
    category: 'Чайная посуда',
    taste: 'нейтральный',
    price: 890,
    weight: '80 мл',
    stock: true,
    image: asset('web-ceramic-cup.jpg'),
    description: 'Керамическая пиала с матовой фактурой для повседневного чаепития.',
  },
  {
    id: 'teapot-1173',
    name: 'Чайник № 1173, керамика Дэхуа, 105 мл',
    category: 'Чайная посуда',
    taste: 'нейтральный',
    price: 10870,
    weight: '105 мл',
    stock: true,
    image: asset('yunnan.jpg'),
    description: 'Чайник для китайского чая, изготовленный из керамики Дэхуа. Обжиг: дровяной.',
    details:
      'Тин Юйнян - мастерская по изготовлению керамической посуды, расположенная в уезде Дэхуа. Здесь продолжаются традиции ручного изготовления керамики на гончарном круге и обжига в дровяной печи.',
  },
  {
    id: 'dragon-plate',
    name: 'Блюдо «Дракон»',
    category: 'Аксессуары',
    taste: 'нейтральный',
    price: 1990,
    weight: '1 шт.',
    stock: true,
    image: asset('web-bamboo-scoop.jpg'),
    description: 'Декоративное блюдо для сухого листа и чайных инструментов.',
  },
  {
    id: 'tea-mask',
    name: 'Подставка «Театр»',
    category: 'Аксессуары',
    taste: 'нейтральный',
    price: 1740,
    weight: '1 шт.',
    stock: true,
    image: asset('web-flower-gaiwan.jpg'),
    description: 'Контрастная подставка для небольшой посуды и чайного ножа.',
  },
  {
    id: 'green-rain-garden',
    name: 'Зеленый чай «Сад после дождя»',
    category: 'Китайский чай',
    taste: 'свежий',
    price: 980,
    weight: '80 г',
    stock: true,
    image: asset('web-green-tea-cup.jpg'),
    description: 'Свежий зеленый чай с травяным ароматом, легкой сладостью и чистым послевкусием.',
  },
  {
    id: 'ulun-honey-orchid',
    name: 'Улун «Медовая орхидея»',
    category: 'Китайский чай',
    taste: 'цветочный',
    price: 1590,
    weight: '100 г',
    stock: true,
    image: asset('oolong.jpg'),
    description: 'Ароматный улун с цветами, медом и мягкой сливочной текстурой.',
  },
  {
    id: 'mini-tuo-cha',
    name: 'Шэн Пуэр прессованный',
    category: 'Китайский чай',
    taste: 'насыщенный',
    price: 760,
    weight: '50 г',
    stock: true,
    image: asset('web-puer-cake.jpg'),
    description: 'Компактный пуэр для плотной заварки: древесность, сухофрукты и бодрый настой.',
  },
  {
    id: 'bamboo-chahe',
    name: 'Чахэ бамбуковое',
    category: 'Аксессуары',
    taste: 'нейтральный',
    price: 1190,
    weight: '1 шт.',
    stock: true,
    image: asset('web-bamboo-tray-square.jpg'),
    description: 'Легкое чахэ для знакомства с сухим листом перед завариванием.',
  },
  {
    id: 'gift-tea-road',
    name: 'Подарочный набор «Чайный путь»',
    category: 'Подарочные наборы',
    taste: 'мягкий',
    price: 3490,
    weight: 'набор',
    stock: true,
    image: asset('web-blue-tea-set.jpg'),
    description: 'Готовый подарок с чаем, посудой и аккуратной упаковкой.',
  },
  {
    id: 'white-buds-yabao',
    name: 'Белый чай «Я Бао»',
    category: 'Китайский чай',
    taste: 'свежий',
    price: 680,
    weight: '30 г',
    stock: true,
    image: asset('xiao-shu.jpg'),
    description: 'Нежные чайные почки с медовым ароматом, свежей травой и мягким телом.',
  },
  {
    id: 'cha-pan-walnut',
    name: 'Чайная доска «Орех»',
    category: 'Аксессуары',
    taste: 'нейтральный',
    price: 2890,
    weight: '1 шт.',
    stock: true,
    image: asset('wiki-chinese-tea-ceremony.jpg'),
    description: 'Компактная доска для чайного стола, пролива и красивой подачи посуды.',
  },
  {
    id: 'gift-puer-cup',
    name: 'Набор «Пуэр и пиала»',
    category: 'Подарочные наборы',
    taste: 'насыщенный',
    price: 2190,
    weight: 'набор',
    stock: true,
    image: asset('web-puer-square-brick.jpg'),
    description: 'Подарочный набор для тех, кто любит плотный вкус и спокойный чайный ритуал.',
  },
  {
    id: 'daily-oolong-box',
    name: 'Улун на каждый день',
    category: 'Китайский чай',
    taste: 'сливочный',
    price: 1120,
    weight: '80 г',
    stock: true,
    image: asset('wiki-tea-ceremony.jpg'),
    description: 'Мягкий улун для ежедневного заваривания без сложной подготовки.',
  },
];

const fallbackGifts = [
  {
    id: 'first-tea',
    name: 'Набор «Первое чаепитие»',
    price: 4132,
    image: asset('web-gift-box-blue.jpg'),
    productId: 'gift-tea-road',
    budget: '2 000-4 000 ₽',
    occasion: 'День рождения',
    text: 'Чай, пиала и спокойная упаковка для первого знакомства с чайной церемонией.',
  },
  {
    id: 'cozy-evening',
    name: 'Набор «Уютный вечер»',
    price: 2790,
    image: asset('web-rare-tea-gift.jpg'),
    productId: 'te-guan-in-orhideya',
    budget: '2 000-4 000 ₽',
    occasion: 'Для дома',
    text: 'Мягкий улун и приятная подача для вечера без спешки.',
  },
  {
    id: 'dry-brewing',
    name: 'Чабань для сухого заваривания',
    price: 3490,
    image: asset('web-ru-kiln-set.jpg'),
    productId: 'bamboo-chahe',
    budget: '2 000-4 000 ₽',
    occasion: 'Коллеге',
    text: 'Практичный подарок для рабочего стола и аккуратного чаепития.',
  },
  {
    id: 'classic-set',
    name: 'Набор «Китайская классика»',
    price: 4290,
    image: asset('green-tea.jpg'),
    productId: 'teapot-1173',
    budget: 'от 4 000 ₽',
    occasion: 'Подарок важному человеку',
    text: 'Посуда и чай в одной подборке, когда нужен солидный подарок.',
  },
  {
    id: 'small-attention',
    name: 'Комплимент «Белый чай»',
    price: 980,
    image: asset('puer.jpg'),
    productId: 'white-buds-yabao',
    budget: 'до 2 000 ₽',
    occasion: 'Коллеге',
    text: 'Небольшой знак внимания с легким белым чаем.',
  },
  {
    id: 'green-start',
    name: 'Набор «Свежий старт»',
    price: 1690,
    image: asset('yunnan-figure.jpg'),
    productId: 'green-rain-garden',
    budget: 'до 2 000 ₽',
    occasion: 'Для дома',
    text: 'Зеленый чай для утреннего настроения и чистого вкуса.',
  },
];

const fallbackProfile = {
  name: 'Егор',
  email: 'egor@example.ru',
  phone: '+7 999 123-45-67',
  city: 'Новосибирск',
  address: 'ул. Чайная, 7',
  orders: [
    { id: '#CP-02481', date: '18.09.2026', status: 'Оплачен', total: 3370 },
    { id: '#CP-02394', date: '03.09.2026', status: 'Доставлен', total: 2490 },
    { id: '#CP-02331', date: '25.08.2026', status: 'Доставлен', total: 1990 },
  ],
};

const promoRules = {
  TEA15: { label: 'Скидка 15%', type: 'percent', value: 15 },
  GIFT20: { label: 'Скидка 20%', type: 'percent', value: 20 },
  TEAWARE: { label: 'Скидка 10%', type: 'percent', value: 10 },
};

const fallbackHome = {
  hero: {
    image: asset('hero-tea.jpg'),
    label: 'Китайский чай - посуда - подарки',
    title: 'Чайный путь - ритуал, который остается.',
    text: 'Подбирайте чай по вкусу и настроению, собирайте чайную пару или отправляйте подарок.',
  },
  scenarios: [
    {
      title: 'Подобрать чай',
      text: 'Вкус + крепость + бюджет',
      image: asset('gift.jpg'),
      target: '/picker',
    },
    {
      title: 'Собрать чайный стол',
      text: 'Чай + посуда + аксессуары',
      image: asset('wiki-puer-tee.jpg'),
      target: '/catalog',
    },
    {
      title: 'Купить подарок',
      text: 'Готовые наборы по бюджету',
      image: asset('pick-tea.jpg'),
      target: '/gifts',
    },
  ],
  popular: [
    fallbackProducts[8],
    fallbackProducts[9],
    fallbackProducts[10],
  ],
  weekProducts: [
    fallbackProducts[2],
    fallbackProducts[4],
    fallbackProducts[7],
    fallbackProducts[5],
  ],
  weekPromos: [
    { title: 'Неделя улунов', text: 'Скидка 10% на цветочные и сливочные улуны.', code: 'TEAWARE', image: asset('oolong.jpg'), to: '/catalog' },
    { title: 'Подарок к заказу', text: 'При заказе от 3 000 ₽ добавим чайный комплимент.', code: 'GIFT20', image: asset('web-puer-ceremony.jpg'), to: '/gifts' },
    { title: 'Старт для новичка', text: 'Готовый набор для первого чайного стола.', code: 'TEA15', image: asset('promotions.jpg'), to: '/picker' },
  ],
  teaTable: [
    { title: '1. Выберите чай', text: 'Пуэр, улун, зеленый или белый чай под настроение.', to: '/catalog' },
    { title: '2. Добавьте посуду', text: 'Чайник, пиала и чахэ делают стол удобнее.', to: '/catalog' },
    { title: '3. Завершите подарком', text: 'Упаковка и аксессуар превращают заказ в готовый набор.', to: '/gifts' },
  ],
  production: {
    image: asset('tea-set.jpg'),
    title: 'Собственное производство и сбор наборов',
    text: 'Мы сами собираем подарочные наборы, подбираем чай к посуде и упаковываем заказы так, чтобы они приезжали аккуратно и выглядели цельно.',
  },
};

const faqItems = [
  {
    question: 'Как понять, какой чай выбрать?',
    answer: 'Откройте подбор для новичка или используйте фильтры по вкусу, цене и категории в каталоге.',
  },
  {
    question: 'Можно ли собрать подарок самому?',
    answer: 'Да. Добавьте чай, посуду и аксессуар в корзину или выберите готовую подборку в разделе подарков.',
  },
  {
    question: 'Что дает промокод?',
    answer: 'Промокоды TEA15, GIFT20 и TEAWARE дают дополнительную скидку в корзине.',
  },
  {
    question: 'Как упаковывается посуда?',
    answer: 'Хрупкие товары упаковываются отдельно, с плотной защитой внутри коробки.',
  },
];

const fallbackPromotions = {
  hero: { image: heroImages.promo },
  promos: [
    { type: '-15%', title: 'На первый заказ', text: 'Промокод TEA15', tone: 'clay' },
    { type: '-20%', title: 'Подарочные наборы', text: 'При покупке от 3 000 ₽', tone: 'moss' },
    { type: 'Бонус', title: 'Чайный стол', text: 'Скидка на посуду при заказе чая', tone: 'light' },
  ],
  codes: ['TEA15 - -15%', 'GIFT20 - -20%', 'TEAWARE - -10%'],
};

const filterOptions = {
  categories: ['Китайский чай', 'Чайная посуда', 'Аксессуары', 'Подарочные наборы'],
  tastes: ['Мягкий', 'Насыщенный', 'Цветочный', 'Сливочный', 'Свежий', 'Нейтральный'],
  prices: ['до 1 000 ₽', '1 000-2 500 ₽', 'от 2 500 ₽'],
};

const fallbackAbout = {
  hero: { image: heroImages.about },
  cards: [
    {
      title: 'Что мы собираем',
      text: 'Чай, посуду, аксессуары и подарочные наборы для дома, офиса и спокойного вечера.',
    },
    {
      title: 'Как выбираем',
      text: 'Пишем простыми словами: какой вкус у чая, кому он подойдет и как его заваривать.',
    },
    {
      title: 'Как помогаем',
      text: 'Даем фильтры, подсказки и готовые подборки, чтобы быстрее найти подходящий чай.',
    },
  ],
};

function money(value) {
  return `${currency.format(value)} ₽`;
}

function createCart(itemsInput = [], promoCode = '') {
  const items = [
    ...itemsInput,
  ]
    .map((line) => ({
      ...line,
      product: fallbackProducts.find((product) => product.id === line.productId),
    }))
    .filter((item) => item.product && item.quantity > 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const promo = promoRules[promoCode.toUpperCase()];
  const baseDiscount = subtotal >= 3000 ? 750 : 0;
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

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState(createCart);
  const [profile, setProfile] = useState(fallbackProfile);
  const [favorites, setFavorites] = useState(['teapot-1173', 'te-guan-in-orhideya']);

  function addToCart(productId) {
    const lines = cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));
    const line = lines.find((item) => item.productId === productId);
    if (line) {
      line.quantity += 1;
    } else {
      lines.push({ productId, quantity: 1 });
    }
    setCart(createCart(lines, cart.promoCode));
  }

  function changeQuantity(productId, quantity) {
    const lines = cart.items
      .map((item) => ({
        productId: item.productId,
        quantity: item.productId === productId ? Math.max(0, quantity) : item.quantity,
      }))
      .filter((item) => item.quantity > 0);
    setCart(createCart(lines, cart.promoCode));
  }

  function applyPromo(code) {
    const normalized = code.trim().toUpperCase();
    if (!promoRules[normalized]) {
      return false;
    }
    const lines = cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));
    setCart(createCart(lines, normalized));
    return true;
  }

  function submitOrder(event) {
    event.preventDefault();
    const order = {
      id: `#CP-${Math.floor(10000 + Math.random() * 89999)}`,
      date: new Date().toLocaleDateString('ru-RU'),
      status: 'Оплачен',
      total: cart.summary.total,
    };
    setProfile((current) => ({ ...current, orders: [order, ...(current?.orders || [])] }));
    setCart(createCart([]));
  }

  function updateProfile(nextProfile) {
    setProfile((current) => ({ ...current, ...nextProfile }));
  }

  function toggleFavorite(productId) {
    setFavorites((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }

  const filteredProducts = fallbackProducts.filter((product) =>
    [product.name, product.category, product.taste, product.description].some((value) =>
      value.toLowerCase().includes(query.toLowerCase()),
    ),
  );
  const favoriteProducts = fallbackProducts.filter((product) => favorites.includes(product.id));

  return (
    <div className="site-shell">
      <div className="app-frame">
        <Header
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          query={query}
          setQuery={setQuery}
          cartCount={cart?.items.length || 0}
          favoriteCount={favorites.length}
        />
        {menuOpen && <MobileNav close={() => setMenuOpen(false)} />}
        <main>
          <Routes>
            <Route path="/" element={<Home home={fallbackHome} />} />
            <Route
              path="/catalog"
              element={<Catalog products={filteredProducts} addToCart={addToCart} />}
            />
            <Route
              path="/product/:id"
              element={(
                <ProductRoute
                  products={fallbackProducts}
                  addToCart={addToCart}
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                />
              )}
            />
            <Route
              path="/favorites"
              element={<Favorites products={favoriteProducts} addToCart={addToCart} />}
            />
            <Route path="/gifts" element={<Gifts gifts={{ hero: { image: heroImages.gifts }, items: fallbackGifts }} addToCart={addToCart} />} />
            <Route
              path="/cart"
              element={<Cart cart={cart} changeQuantity={changeQuantity} applyPromo={applyPromo} />}
            />
            <Route
              path="/checkout"
              element={<Checkout cart={cart} submitOrder={submitOrder} />}
            />
            <Route path="/profile" element={<Profile profile={profile} updateProfile={updateProfile} favoriteCount={favorites.length} cartCount={cart.items.length} />} />
            <Route path="/promotions" element={<Promotions promotions={fallbackPromotions} />} />
            <Route path="/about" element={<About about={fallbackAbout} />} />
            <Route path="/delivery" element={<Delivery />} />
            <Route path="/picker" element={<Picker products={fallbackProducts} addToCart={addToCart} />} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/register" element={<Auth mode="register" />} />
            <Route path="/recover" element={<Auth mode="recover" />} />
          <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

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

function AssetGuide() {
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

function Header({ menuOpen, setMenuOpen, query, setQuery, cartCount, favoriteCount }) {
  return (
    <header className="topbar">
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
      <Link className="nav-link" to="/profile">Профиль</Link>
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

function MobileNav({ close }) {
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

function HeroBanner({ image, label, title, text, action }) {
  return (
    <section className="hero-banner home-hero">
      <img src={image} alt="" />
      <div className="banner-overlay" />
      <div className="banner-copy">
        {label && <p className="kicker">{label}</p>}
        <h1>{title}</h1>
        {text && <p>{text}</p>}
        {action}
      </div>
    </section>
  );
}

function BackLink({ to = '/profile', label = 'Назад' }) {
  return (
    <Link className="back-link" to={to}>
      <ArrowLeft size={17} />
      {label}
    </Link>
  );
}

function ImageCarousel({ slides }) {
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

function Home({ home }) {
  return (
    <div className="page-stack">
      <HeroBanner
        image={home.hero.image}
        label={home.hero.label}
        title={home.hero.title}
        text={home.hero.text}
        action={
          <div className="button-row">
            <Link className="button clay" to="/catalog">Смотреть каталог</Link>
            <Link className="button ghost" to="/picker">Подбор для новичка</Link>
          </div>
        }
      />
      <ImageCarousel
        slides={[
          {
            title: 'Пуэр для спокойного вечера',
            text: 'Плотный вкус, древесный аромат и теплое послевкусие.',
            image: asset('shen-puer-lesnoy.jpg'),
            to: '/product/shu-puer-lesnoy-put',
          },
          {
            title: 'Подарок без суеты',
            text: 'Готовые наборы по бюджету и поводу прямо в разделе подарков.',
            image: asset('web-gift-box-blue.jpg'),
            to: '/gifts',
          },
          {
            title: 'Посуда для чайного стола',
            text: 'Чайник, пиалы и аксессуары для красивого чаепития.',
            image: asset('web-ru-kiln-set.jpg'),
            to: '/catalog',
          },
        ]}
      />
      <section>
        <h2>Выберите сценарий</h2>
        <div className="scenario-grid">
          {home.scenarios.map((scenario) => (
            <article className="scenario-card" key={scenario.title}>
              <img src={scenario.image} alt="" />
              <div>
                <h3>{scenario.title}</h3>
                <p>{scenario.text}</p>
                <Link to={scenario.target}>Открыть</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section>
        <div className="section-head">
          <div>
            <p className="kicker">Каждую неделю</p>
            <h2>Акции недели</h2>
          </div>
          <Link className="button light section-action" to="/promotions">Все акции</Link>
        </div>
        <div className="week-promo-grid">
          {home.weekPromos.map((promo) => (
            <article className="week-promo-card" key={promo.title}>
              <img src={promo.image} alt={promo.title} />
              <div>
                <span>{promo.code}</span>
                <h3>{promo.title}</h3>
                <p>{promo.text}</p>
                <Link to={promo.to}>Открыть</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section>
        <div className="section-head">
          <div>
            <p className="kicker">Выбор магазина</p>
            <h2>Товары недели</h2>
          </div>
          <Link className="button light section-action" to="/catalog">В каталог</Link>
        </div>
        <ProductGrid products={home.weekProducts} />
      </section>
      <section className="tea-table-builder">
        <div className="section-head">
          <div>
            <p className="kicker">Готовый сценарий</p>
            <h2>Собрать свой чайный стол</h2>
          </div>
        </div>
        <div className="builder-grid">
          {home.teaTable.map((step) => (
            <Link className="builder-card" key={step.title} to={step.to}>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              <span>Выбрать</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="production-band">
        <img src={home.production.image} alt="" />
        <div>
          <p className="kicker">Мастерская магазина</p>
          <h2>{home.production.title}</h2>
          <p>{home.production.text}</p>
          <Link className="button clay" to="/gifts">Смотреть наборы</Link>
        </div>
      </section>
      <Faq />
      <section>
        <h2>Популярное сейчас</h2>
        <ProductGrid products={home.popular} compact />
      </section>
    </div>
  );
}

function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="faq-section">
      <div className="section-head">
        <div>
          <p className="kicker">Помощь</p>
          <h2>Частые вопросы</h2>
        </div>
      </div>
      <div className="faq-list">
        {faqItems.map((item, index) => (
          <article className={openIndex === index ? 'open' : ''} key={item.question}>
            <button type="button" onClick={() => setOpenIndex(openIndex === index ? -1 : index)}>
              {item.question}
              <span>{openIndex === index ? '−' : '+'}</span>
            </button>
            <div className="faq-answer">
              <p>{item.answer}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Catalog({ products, addToCart }) {
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
    const tasteOk = !filters.tastes.length || filters.tastes.includes(capitalize(product.taste));
    return categoryOk && tasteOk && matchesPrice(product);
  });

  return (
    <div className="catalog-page">
      <div className="page-title">
        <BackLink to="/" label="На главную" />
        <h1>Каталог</h1>
        <p>{visibleProducts.length} из {products.length} товаров</p>
      </div>
      <aside className="filters">
        <h2>Фильтры</h2>
        <FilterGroup
          title="Категория"
          type="categories"
          items={filterOptions.categories}
          selected={filters.categories}
          onToggle={toggleFilter}
        />
        <FilterGroup
          title="Вкус"
          type="tastes"
          items={filterOptions.tastes}
          selected={filters.tastes}
          onToggle={toggleFilter}
        />
        <FilterGroup
          title="Цена"
          type="prices"
          items={filterOptions.prices}
          selected={filters.prices}
          onToggle={toggleFilter}
        />
        <div className="filter-actions">
          <button className="button dark" type="button">Показано {visibleProducts.length}</button>
          <button className="button light" type="button" onClick={() => setFilters({ categories: [], tastes: [], prices: [] })}>
            Сбросить
          </button>
        </div>
      </aside>
      <section className="catalog-content">
        <p className="sort-label">Сортировка: По популярности +</p>
        {visibleProducts.length ? (
          <ProductGrid products={visibleProducts} addToCart={addToCart} />
        ) : (
          <EmptyState
            title="Ничего не нашлось"
            text="Сбросьте фильтры или попробуйте другой запрос."
            action={<button className="button dark" type="button" onClick={() => setFilters({ categories: [], tastes: [], prices: [] })}>Сбросить фильтры</button>}
          />
        )}
      </section>
    </div>
  );
}

function FilterGroup({ title, type, items, selected, onToggle }) {
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

function capitalize(value) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function ProductGrid({ products, addToCart, compact = false }) {
  const [addedId, setAddedId] = useState('');

  function handleAdd(productId) {
    addToCart?.(productId);
    setAddedId(productId);
    window.setTimeout(() => setAddedId(''), 1100);
  }

  return (
    <div className={compact ? 'product-grid compact' : 'product-grid'}>
      {products.map((product) => (
        <article className="product-card" key={product.id}>
          <Link className="image-button" to={`/product/${product.id}`}>
            <img src={product.image} alt={product.name} />
          </Link>
          <span className="stock">В наличии</span>
          <h3>{product.name}</h3>
          <p>{product.weight} · {product.category.toLowerCase()}</p>
          <div className="price-row">
            <strong>{money(product.price)}</strong>
            <button onClick={() => handleAdd(product.id)} aria-label="Добавить в корзину">
              {addedId === product.id ? '✓' : <ShoppingCart size={17} />}
            </button>
          </div>
          <Link className="card-link" to={`/product/${product.id}`}>Подробнее</Link>
        </article>
      ))}
    </div>
  );
}

function ProductRoute({ products, addToCart, favorites, toggleFavorite }) {
  const { id } = useParams();
  const product = products.find((item) => item.id === id) || products[0];
  return (
    <Product
      product={product}
      addToCart={addToCart}
      isFavorite={favorites.includes(product.id)}
      toggleFavorite={toggleFavorite}
    />
  );
}

function Product({ product, addToCart, isFavorite, toggleFavorite }) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addToCart(product.id);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="product-page">
      <BackLink to="/catalog" label="Вернуться в каталог" />
      <p className="breadcrumbs">Каталог / {product.category} / Чайники</p>
      <div className="product-photo">
        <img src={product.image} alt={product.name} />
      </div>
      <section className="product-info">
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <strong className="product-price">{money(product.price)}</strong>
        <span className="stock">Всего 1 шт.</span>
        <p className="product-meta">Мастерская: Тин Юйнян<br />Обжиг: дровяной.</p>
        <div className="product-actions">
          <button className="button dark" onClick={handleAdd}>
            {added ? 'Добавлено' : 'Добавить в корзину'}
          </button>
          <button className={`button light ${isFavorite ? 'selected' : ''}`} onClick={() => toggleFavorite(product.id)}>
            <Heart size={16} /> {isFavorite ? 'В избранном' : 'В избранное'}
          </button>
        </div>
        <div className="payment-badges">
          <span>Долями по 2 718 ₽</span>
          <span>2 718 ₽ в Сплит</span>
        </div>
      </section>
      <p className="product-description">{product.details || product.description}</p>
      <div className="workshop-strip">
        <img src={asset('web-ru-kiln-set.jpg')} alt="" />
      </div>
    </div>
  );
}

function Favorites({ products, addToCart }) {
  return (
    <div className="simple-page">
      <BackLink to="/profile" label="Вернуться в профиль" />
      <div className="page-title-row">
        <h1>Избранное</h1>
        <span className="heart-badge"><Heart size={18} /> {products.length}</span>
      </div>
      {products.length ? (
        <ProductGrid products={products} addToCart={addToCart} />
      ) : (
        <EmptyState
          title="Пока пусто"
          text="Откройте карточку товара и добавьте его в избранное."
          action={<Link className="button dark" to="/catalog">Перейти в каталог</Link>}
        />
      )}
    </div>
  );
}

function Gifts({ gifts, addToCart }) {
  const [giftFilter, setGiftFilter] = useState('Все');
  const [addedId, setAddedId] = useState('');
  const giftFilters = ['Все', 'до 2 000 ₽', '2 000-4 000 ₽', 'от 4 000 ₽', 'День рождения', 'Коллеге', 'Для дома'];
  const visibleGifts = giftFilter === 'Все'
    ? gifts.items
    : gifts.items.filter((gift) => gift.budget === giftFilter || gift.occasion === giftFilter);

  function handleGiftAdd(gift) {
    addToCart(gift.productId);
    setAddedId(gift.id);
    window.setTimeout(() => setAddedId(''), 1100);
  }

  return (
    <div className="page-stack">
      <section className="back-section">
        <BackLink to="/" label="На главную" />
      </section>
      <HeroBanner
        image={gifts.hero.image}
        title="Подарок, который запоминается"
        text="Готовые наборы по бюджету и поводу."
        action={<a className="button ghost" href="#gift-picker">Выбрать набор</a>}
      />
      <section id="gift-picker">
        <h2>Подберите подарок</h2>
        <div className="chips gift-tabs">
          {giftFilters.map((chip) => (
            <button
              className={giftFilter === chip ? 'active' : ''}
              key={chip}
              type="button"
              onClick={() => setGiftFilter(chip)}
            >
              {chip}
            </button>
          ))}
        </div>
        <div className="gift-grid">
          {visibleGifts.map((gift) => (
            <article className="gift-card" key={gift.id}>
              <img src={gift.image} alt={gift.name} />
              <span className="stock">{gift.occasion}</span>
              <h3>{gift.name}</h3>
              <p>{gift.text}</p>
              <strong>{money(gift.price)}</strong>
              <button className="button dark" onClick={() => handleGiftAdd(gift)}>
                {addedId === gift.id ? 'В корзине' : 'Выбрать'}
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function Cart({ cart, changeQuantity, applyPromo }) {
  return (
    <div className="cart-page">
      <div className="page-title">
        <BackLink to="/catalog" label="Продолжить покупки" />
      </div>
      <h1>Корзина</h1>
      <div className="cart-list">
        {cart.items.length ? (
          cart.items.map((item) => (
            <article className="cart-item" key={item.productId}>
              <img src={item.product.image} alt="" />
              <div>
                <h3>{item.product.name}</h3>
                <p>Количество</p>
                <button onClick={() => changeQuantity(item.productId, item.quantity - 1)}><Minus size={14} /></button>
                <span>{item.quantity}</span>
                <button onClick={() => changeQuantity(item.productId, item.quantity + 1)}><Plus size={14} /></button>
              </div>
              <strong>{money(item.product.price * item.quantity)}</strong>
            </article>
          ))
        ) : (
          <EmptyState
            title="Корзина пустая"
            text="Добавьте чай, посуду или подарок из каталога."
            action={<Link className="button dark" to="/catalog">Открыть каталог</Link>}
          />
        )}
      </div>
      <OrderSummary cart={cart} applyPromo={applyPromo} />
    </div>
  );
}

function OrderSummary({ cart, applyPromo }) {
  const [promoInput, setPromoInput] = useState(cart.promoCode || '');
  const [promoMessage, setPromoMessage] = useState('');
  const { summary } = cart;

  function handlePromo(event) {
    event.preventDefault();
    if (!cart.items.length) {
      setPromoMessage('Сначала добавьте товары в корзину.');
      return;
    }
    const ok = applyPromo(promoInput);
    setPromoMessage(ok ? 'Промокод применен.' : 'Такого промокода нет. Попробуйте TEA15.');
  }

  return (
    <aside className="order-card">
      <h2>Ваш заказ</h2>
      <form className="promo-form" onSubmit={handlePromo}>
        <label>
          Промокод
          <input value={promoInput} onChange={(event) => setPromoInput(event.target.value)} placeholder="TEA15" />
        </label>
        <button type="submit">Применить</button>
        {promoMessage && <p>{promoMessage}</p>}
      </form>
      <dl>
        <div><dt>Товары</dt><dd>{money(summary.subtotal)}</dd></div>
        <div><dt>Доставка</dt><dd>{money(summary.delivery)}</dd></div>
        <div><dt>Скидка</dt><dd>- {money(summary.discount)}</dd></div>
      </dl>
      <div className="total"><span>Итого</span><strong>{money(summary.total)}</strong></div>
      <Link className="button clay" to="/checkout">Перейти к оформлению</Link>
    </aside>
  );
}

function Checkout({ cart, submitOrder }) {
  const [delivery, setDelivery] = useState('courier');
  const [payment, setPayment] = useState('card');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    submitOrder(event);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="simple-page">
        <EmptyState
          title="Заказ оформлен"
          text="Мы добавили заказ в личный кабинет. Можно продолжить выбирать чай."
          action={<Link className="button dark" to="/profile">Открыть профиль</Link>}
        />
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="page-title">
        <BackLink to="/cart" label="Вернуться в корзину" />
      </div>
      <h1>Оформление заказа</h1>
      <div className="steps"><span>1 Корзина</span><span>2 Доставка</span><span>3 Оплата</span><span>4 Готово</span></div>
      <form className="checkout-form" onSubmit={handleSubmit}>
        <h2>Данные получателя</h2>
        <label>Имя<input name="name" placeholder="Имя покупателя" required /></label>
        <label>Телефон<input name="phone" placeholder="+7 (___) ___-__-__" required /></label>
        <label>Город<input name="city" defaultValue="Новосибирск" required /></label>
        <label>Адрес<input name="address" placeholder="Адрес доставки" required /></label>
      </form>
      <aside className="checkout-side">
        <h2>Доставка и оплата</h2>
        <button className={delivery === 'courier' ? 'active' : ''} type="button" onClick={() => setDelivery('courier')}>Курьер +1-2 дня</button>
        <button className={delivery === 'pickup' ? 'active' : ''} type="button" onClick={() => setDelivery('pickup')}>Пункт выдачи +2-4 дня</button>
        <h3>Способ оплаты</h3>
        <div className="payment-options">
          <button className={payment === 'card' ? 'active' : ''} type="button" onClick={() => setPayment('card')}>Банковская карта</button>
          <button className={payment === 'split' ? 'active' : ''} type="button" onClick={() => setPayment('split')}>Сплит</button>
        </div>
        <p>К оплате</p>
        <strong>{money(cart.summary.total)}</strong>
        <button className="button clay" onClick={() => document.querySelector('.checkout-form')?.requestSubmit()}>
          Подтвердить и оплатить
        </button>
      </aside>
    </div>
  );
}

function Profile({ profile, updateProfile, favoriteCount, cartCount }) {
  const [form, setForm] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    city: profile.city,
    address: profile.address,
  });
  const [saved, setSaved] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSave(event) {
    event.preventDefault();
    updateProfile(form);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="profile-page">
      <div className="page-title">
        <BackLink to="/" label="На главную" />
      </div>
      <h1>Личный кабинет</h1>
      <aside className="profile-menu">
        <strong>Покупатель</strong>
        {[
          ['Профиль', '/profile'],
          ['Мои заказы', '/profile'],
          ['Избранное', '/favorites'],
          ['Адреса доставки', '/checkout'],
          ['Настройки', '/profile'],
        ].map(([item, to], index) => (
          <Link className={index === 0 ? 'active' : ''} key={item} to={to}>{item}</Link>
        ))}
      </aside>
      <section className="profile-dashboard">
        <form className="profile-card" onSubmit={handleSave}>
          <h2>Данные профиля</h2>
          <label>Имя<input name="name" value={form.name} onChange={handleChange} /></label>
          <label>E-mail<input name="email" value={form.email} onChange={handleChange} /></label>
          <label>Телефон<input name="phone" value={form.phone} onChange={handleChange} /></label>
          <label>Город<input name="city" value={form.city} onChange={handleChange} /></label>
          <label>Адрес<input name="address" value={form.address} onChange={handleChange} /></label>
          <button className="button dark" type="submit">{saved ? 'Сохранено' : 'Сохранить'}</button>
        </form>
        <div className="profile-stats">
          <Link to="/favorites"><Heart size={18} /> Избранное: {favoriteCount}</Link>
          <Link to="/cart"><ShoppingCart size={18} /> В корзине: {cartCount}</Link>
          <Link to="/promotions"><TicketPercent size={18} /> Промокоды</Link>
          <Link to="/catalog">Каталог товаров</Link>
        </div>
      </section>
      <section className="orders">
        <h2>Мои заказы</h2>
        {profile.orders.map((order) => (
          <article key={order.id}>
            <strong>{order.id}</strong>
            <span>{order.date}</span>
            <mark>{order.status}</mark>
            <b>{money(order.total)}</b>
            <Link to="/cart">Подробнее +</Link>
          </article>
        ))}
      </section>
    </div>
  );
}

function Promotions({ promotions }) {
  return (
    <div className="page-stack">
      <section className="back-section">
        <BackLink to="/" label="На главную" />
      </section>
      <HeroBanner
        image={promotions.hero.image}
        label="Акции и специальные предложения"
        title="Чайный повод заварить сегодня."
        text="Скидки на чай, наборы и аксессуары. Условия видны до оформления заказа."
        action={<Link className="button clay" to="/catalog">Все предложения</Link>}
      />
      <section>
        <h2>Текущие акции</h2>
        <div className="promo-grid">
          {promotions.promos.map((promo) => (
            <article className={`promo-card ${promo.tone}`} key={promo.title}>
              <strong>{promo.type}</strong>
              <h3>{promo.title}</h3>
              <p>{promo.text}</p>
              <Link className="button dark" to="/catalog">Получить скидку</Link>
            </article>
          ))}
        </div>
        <h2>Промокоды</h2>
        <div className="chips">{promotions.codes.map((code) => <Link to="/catalog" key={code}>{code}</Link>)}</div>
      </section>
    </div>
  );
}

function About({ about }) {
  return (
    <div className="page-stack">
      <section className="back-section">
        <BackLink to="/" label="На главную" />
      </section>
      <HeroBanner
        image={about.hero.image}
        label="О магазине"
        title="Чайный путь - магазин для спокойного чаепития."
        text="Китайский чай, посуда, аксессуары и подарочные наборы - с понятным описанием и подбором."
        action={<span className="city-pill">Новосибирск</span>}
      />
      <section>
        <h2>О компании</h2>
        <div className="about-grid">
          {about.cards.map((card, index) => (
            <article className={index === 2 ? 'clay-card' : index === 1 ? 'green-card' : ''} key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
        <h2>Китайская чайная культура</h2>
        <div className="chips">
          {['Пуэр', 'Улун', 'Зеленый чай', 'Белый чай'].map((chip) => <Link to="/catalog" key={chip}>{chip}</Link>)}
        </div>
      </section>
      <AssetGuide />
    </div>
  );
}

function NotFound() {
  return (
    <div className="simple-page">
      <BackLink to="/" label="На главную" />
      <EmptyState
        title="Страница не найдена"
        text="Такой страницы нет, но каталог и подбор чая работают."
        action={<Link className="button dark" to="/catalog">Открыть каталог</Link>}
      />
    </div>
  );
}

function Delivery() {
  return (
    <div className="simple-page">
      <BackLink to="/" label="На главную" />
      <h1>Доставка</h1>
      <div className="about-grid">
        <article><h3>Курьер</h3><p>1-2 дня по Новосибирску, бережная упаковка посуды.</p></article>
        <article><h3>Пункт выдачи</h3><p>2-4 дня по России, трек после подтверждения заказа.</p></article>
        <article className="green-card"><h3>Оплата</h3><p>Карта, долями или сплит - итог видно до оплаты.</p></article>
      </div>
    </div>
  );
}

const pickerQuestions = [
  { title: 'Какой вкус вам ближе?', options: ['Мягкий и сладкий', 'Цветочный', 'Древесный', 'Свежий и травяной'] },
  { title: 'Когда будете пить?', options: ['Утром', 'Во время работы', 'Вечером', 'Для гостей'] },
  { title: 'Нужна ли посуда?', options: ['Только чай', 'Чай и пиала', 'Полный набор', 'Подарок'] },
  { title: 'Какой бюджет?', options: ['до 1 000 ₽', '1 000-2 500 ₽', 'от 2 500 ₽', 'Не важно'] },
];

function Picker({ products, addToCart }) {
  const [step, setStep] = useState(0);
  const [recommendations, setRecommendations] = useState([]);
  const question = pickerQuestions[step];

  function nextAnswer() {
    if (step < pickerQuestions.length - 1) {
      setStep((value) => value + 1);
      return;
    }
    setRecommendations(products.filter((product) => product.category === 'Китайский чай').slice(0, 3));
  }

  return (
    <div className="picker-page">
      <BackLink to="/" label="На главную" />
      <HeroBanner
        image={heroImages.picker}
        label="Помощь в выборе"
        title="Подберем чай за 60 секунд."
        text="Несколько вопросов - и получим подходящие варианты."
      />
      <p>Шаг {step + 1} из 4</p>
      <h1>{recommendations.length ? 'Рекомендации' : question.title}</h1>
      {recommendations.length ? (
        <>
          <ProductGrid products={recommendations} addToCart={addToCart} compact />
          <button className="button dark" onClick={() => { setStep(0); setRecommendations([]); }}>
            Пройти заново
          </button>
        </>
      ) : (
        <>
          <div className="answer-grid">
            {question.options.map((option) => (
              <button key={option} onClick={nextAnswer}>{option}</button>
            ))}
          </div>
          <div className="step-pills">
            {pickerQuestions.map((_, index) => <span className={index === step ? 'active' : ''} key={index}>Шаг {index + 1}</span>)}
          </div>
        </>
      )}
    </div>
  );
}

function Auth({ mode }) {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const isRegister = mode === 'register';
  const isRecover = mode === 'recover';

  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') || '').trim();
    const phone = String(form.get('phone') || '').trim();
    const password = String(form.get('password') || '');
    const nextErrors = {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email)) {
      nextErrors.email = 'Введите почту в формате name@example.ru.';
    }
    if (isRegister && !/^\+?\d[\d\s()-]{9,}$/.test(phone)) {
      nextErrors.phone = 'Введите нормальный телефон, например +7 999 123-45-67.';
    }
    if (!isRecover && password.length < 4) {
      nextErrors.password = 'Пароль должен быть минимум 4 символа.';
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setMessage('');
      return;
    }

    setErrors({});
    if (isRecover) {
      setMessage('Ссылка для восстановления отправлена на почту.');
      return;
    }
    setMessage(isRegister ? 'Аккаунт создан. Открываем профиль.' : 'Вход выполнен. Открываем профиль.');
    window.setTimeout(() => navigate('/profile'), 450);
  }

  return (
    <div className="auth-page">
      <BackLink to="/" label="На главную" />
      <form className="auth-card" onSubmit={handleSubmit}>
        <strong>ЧАЙНЫЙ ПУТЬ</strong>
        <div className="auth-switch">
          <Link className={mode === 'login' ? 'active' : ''} to="/login">Вход</Link>
          <Link className={mode === 'register' ? 'active' : ''} to="/register">Регистрация</Link>
          <Link className={mode === 'recover' ? 'active' : ''} to="/recover">Пароль</Link>
        </div>
        <h1>{isRecover ? 'Восстановление пароля' : isRegister ? 'Создать аккаунт' : 'Вход'}</h1>
        <p>{isRecover ? 'Введите e-mail, на который мы отправим ссылку.' : 'Сохраняйте избранное и историю заказов.'}</p>
        {isRegister && <label>Имя<input name="name" placeholder="Ваше имя" required /></label>}
        <label>
          E-mail
          <input className={errors.email ? 'invalid' : ''} name="email" type="text" placeholder="example@mail.ru" required />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </label>
        {isRegister && (
          <label>
            Телефон
            <input className={errors.phone ? 'invalid' : ''} name="phone" placeholder="+7 (___) ___-__-__" required />
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </label>
        )}
        {!isRecover && (
          <label>
            Пароль
            <input className={errors.password ? 'invalid' : ''} name="password" type="password" placeholder="Введите пароль" required />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </label>
        )}
        <button className="button dark" type="submit">
          {isRecover ? 'Отправить ссылку' : isRegister ? 'Зарегистрироваться' : 'Войти'}
        </button>
        {message && <p className="auth-message">{message}</p>}
        <small>
          {isRecover && <Link to="/login">Вернуться ко входу</Link>}
          {isRegister && <Link to="/login">Уже есть аккаунт? Войти</Link>}
          {mode === 'login' && <Link to="/recover">Забыли пароль?</Link>}
        </small>
      </form>
    </div>
  );
}

function EmptyState({ title, text, action }) {
  return (
    <div className="empty-state">
      <h2>{title}</h2>
      <p>{text}</p>
      {action}
    </div>
  );
}

export default App;
