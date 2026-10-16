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
              <img loading="lazy" decoding="async" src={scenario.image} alt="" />
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
              <img loading="lazy" decoding="async" src={promo.image} alt={promo.title} />
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
      <section className="production-band grid overflow-hidden rounded-3xl bg-emerald-950 text-white shadow-sm md:grid-cols-2">
        <img className="h-full w-full object-cover" loading="lazy" decoding="async" src={home.production.image} alt="" />
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

export function Faq() {
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
