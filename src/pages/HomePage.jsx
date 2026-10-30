import { asset, faqItems } from '../data/siteContent.js';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeroBanner, ImageCarousel } from '../components/SiteChrome.jsx';
import { ProductGrid } from '../components/ProductGrid.jsx';


export function Home({ home }) {
  return (
    <div className="page-stack space-y-8 sm:space-y-12">
      <HeroBanner
        image={home.hero.image}
        label={home.hero.label}
        title={home.hero.title}
        text={home.hero.text}
        imageAlt="Чайный стол с китайским чаем и посудой"
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
      <section className="space-y-5">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">Выберите сценарий</h2>
        <div className="scenario-grid grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {home.scenarios.map((scenario) => (
            <article className="scenario-card group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg" key={scenario.title}>
              <img className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.02]" loading="lazy" decoding="async" width={620} height={360} src={scenario.image} alt={scenario.title} />
              <div className="space-y-2 p-5">
                <h3 className="text-lg font-semibold text-stone-900">{scenario.title}</h3>
                <p className="text-sm leading-6 text-stone-600">{scenario.text}</p>
                <Link className="inline-flex pt-1 text-sm font-semibold text-emerald-800 hover:text-emerald-950" to={scenario.target}>Открыть →</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="space-y-5">
        <div className="section-head">
          <div>
            <p className="kicker">Каждую неделю</p>
            <h2>Акции недели</h2>
          </div>
          <Link className="button light section-action" to="/promotions">Все акции</Link>
        </div>
        <div className="week-promo-grid grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {home.weekPromos.map((promo) => (
            <article className="week-promo-card group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg" key={promo.title}>
              <img className="h-44 w-full object-cover" loading="lazy" decoding="async" width={720} height={520} src={promo.image} alt={promo.title} />
              <div className="space-y-2 p-5">
                <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900">{promo.code}</span>
                <h3 className="text-lg font-semibold text-stone-900">{promo.title}</h3>
                <p className="text-sm leading-6 text-stone-600">{promo.text}</p>
                <Link className="inline-flex pt-1 text-sm font-semibold text-emerald-800 hover:text-emerald-950" to={promo.to}>Открыть →</Link>
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
      <section className="tea-table-builder space-y-5 rounded-3xl border border-stone-200 bg-white p-5 sm:p-8">
        <div className="section-head">
          <div>
            <p className="kicker">Готовый сценарий</p>
            <h2>Собрать свой чайный стол</h2>
          </div>
        </div>
        <div className="builder-grid grid grid-cols-1 gap-3 md:grid-cols-3">
          {home.teaTable.map((step) => (
            <Link className="builder-card rounded-2xl border border-stone-200 bg-stone-50 p-5 transition hover:border-emerald-300 hover:bg-emerald-50/60" key={step.title} to={step.to}>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              <span>Выбрать</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="production-band grid overflow-hidden rounded-3xl bg-emerald-950 text-white shadow-sm md:grid-cols-2">
        <img className="h-full w-full object-cover" loading="lazy" decoding="async" width={760} height={520} src={home.production.image} alt={home.production.title} />
        <div>
          <p className="kicker">Мастерская магазина</p>
          <h2>{home.production.title}</h2>
          <p>{home.production.text}</p>
          <Link className="button clay" to="/gifts">Смотреть наборы</Link>
        </div>
      </section>
      <Faq />
      <section className="space-y-5">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">Популярное сейчас</h2>
        <ProductGrid products={home.popular} compact />
      </section>
    </div>
  );
}

export function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="faq-section rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="section-head">
        <div>
          <p className="kicker">Помощь</p>
          <h2>Частые вопросы</h2>
        </div>
      </div>
      <div className="faq-list divide-y divide-stone-200">
        {faqItems.map((item, index) => (
          <article className={openIndex === index ? 'open' : ''} key={item.question}>
            <button className="flex w-full items-center justify-between gap-4 py-4 text-left text-base font-semibold text-stone-900" type="button" onClick={() => setOpenIndex(openIndex === index ? -1 : index)}>
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
