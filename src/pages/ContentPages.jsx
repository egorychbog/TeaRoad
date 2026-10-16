import { heroImages } from '../data/siteContent.js';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AssetGuide, HeroBanner, BackLink, EmptyState } from '../components/SiteChrome.jsx';
import { ProductGrid } from '../components/ProductGrid.jsx';


export function Promotions({ promotions }) {
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

export function About({ about }) {
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

export function NotFound() {
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

export function Delivery() {
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

export function Picker({ products, addToCart }) {
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
