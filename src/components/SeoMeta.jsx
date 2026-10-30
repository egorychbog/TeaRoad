
const DEFAULT_SITE_URL = 'https://chai-path-complete.vercel.app';
const SITE_URL = (import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '');

const publicPages = {
  '/': {
    title: 'Чайный путь — китайский чай, пуэр и чайная посуда',
    description: 'Авторский китайский чай, пуэры, улуны, чайная посуда и подарочные наборы. Подберите чай для себя или в подарок в магазине «Чайный путь».',
  },
  '/catalog': {
    title: 'Каталог китайского чая и посуды — Чайный путь',
    description: 'Выберите китайский чай, пуэр, улун, чайную посуду и аксессуары. Каталог товаров магазина «Чайный путь».',
  },
  '/gifts': {
    title: 'Подарочные наборы чая — Чайный путь',
    description: 'Подарочные наборы китайского чая и чайной посуды для друзей, коллег и близких. Подбор подарка по поводу и бюджету.',
  },
  '/promotions': {
    title: 'Акции на чай и подарочные наборы — Чайный путь',
    description: 'Актуальные акции и промокоды на китайский чай, чайную посуду и подарочные наборы в магазине «Чайный путь».',
  },
  '/about': {
    title: 'О магазине китайского чая — Чайный путь',
    description: 'Узнайте о магазине «Чайный путь», ассортименте китайского чая, посуды и аксессуаров для спокойного чаепития.',
  },
  '/delivery': {
    title: 'Доставка и оплата — Чайный путь',
    description: 'Условия доставки китайского чая и чайной посуды по Новосибирску и России. Способы оплаты и оформление заказа.',
  },
  '/picker': {
    title: 'Подбор китайского чая — Чайный путь',
    description: 'Ответьте на несколько вопросов, чтобы подобрать китайский чай по вкусу, времени чаепития и бюджету.',
  },
};

const privatePages = {
  '/favorites': {
    title: 'Избранное — Чайный путь',
    description: 'Сохранённые товары магазина «Чайный путь».',
  },
  '/cart': {
    title: 'Корзина — Чайный путь',
    description: 'Товары, выбранные для заказа в магазине «Чайный путь».',
  },
  '/checkout': {
    title: 'Оформление заказа — Чайный путь',
    description: 'Оформление заказа на чай и чайную посуду в магазине «Чайный путь».',
  },
  '/profile': {
    title: 'Личный кабинет — Чайный путь',
    description: 'Личный кабинет покупателя магазина «Чайный путь».',
  },
  '/login': {
    title: 'Вход — Чайный путь',
    description: 'Вход в аккаунт покупателя магазина «Чайный путь».',
  },
  '/register': {
    title: 'Регистрация — Чайный путь',
    description: 'Создание аккаунта покупателя магазина «Чайный путь».',
  },
  '/recover': {
    title: 'Восстановление пароля — Чайный путь',
    description: 'Восстановление доступа к аккаунту магазина «Чайный путь».',
  },
};

export function SeoMeta({ pathname = '/', products = [] }) {
  const path = pathname.replace(/\/+$/, '') || '/';
  const productId = path.startsWith('/product/') ? decodeURIComponent(path.split('/')[2] || '') : '';
  const product = productId
    ? products.find((item) => item.id === productId || item.slug === productId)
    : null;

  let page = publicPages[path];
  let noIndex = false;

  if (productId) {
    page = {
      title: product?.name
        ? `${product.name} — купить в магазине «Чайный путь»`
        : `Китайский чай и посуда — Чайный путь`,
      description: product?.description
        || 'Описание, характеристики и стоимость товара в магазине китайского чая «Чайный путь».',
    };
  } else if (privatePages[path]) {
    page = privatePages[path];
    noIndex = true;
  } else if (!page) {
    page = {
      title: 'Страница не найдена — Чайный путь',
      description: 'Запрошенная страница не найдена. Перейдите в каталог магазина «Чайный путь».',
    };
    noIndex = true;
  }

  const title = page.title;
  const description = page.description;
  const canonical = `${SITE_URL}${path === '/' ? '/' : path}`;
  const image = `${SITE_URL}/assets/hero-tea.jpg`;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content="Чайный стол и китайский чай — магазин «Чайный путь»" />
      <meta property="og:site_name" content="Чайный путь" />
      <meta property="og:locale" content="ru_RU" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </>
  );
}
