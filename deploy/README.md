# Практическое занятие №18: локальная репетиция деплоя TeaRoad

Проект разворачивается только на этом компьютере по адресу `https://tearoad.localhost`. Публичный Vercel-домен и интернет-деплой не используются.

## Архитектура

```text
Браузер
  └─ HTTPS/HTTP → nginx (локальные порты 127.0.0.1:443 и 127.0.0.1:80)
                    └─ HTTP → frontend (Nginx, production-сборка React/Vite, внутренний порт 8080)
                               └─ браузер напрямую обращается к Supabase по HTTPS
```

В проекте нет отдельного серверного API и локальной базы данных. Supabase — внешний управляемый сервис; браузер обращается к нему напрямую. Для репетиции используй отдельный тестовый Supabase-проект и тестовые данные. Не направляй локальный стенд на production-базу с реальными пользователями и заказами.

| Сервис | Технология | Внутренний порт | Production-сервер |
|---|---|---:|---|
| frontend | React 19, React Router 7, Vite/esbuild; production static build | 8080 | Nginx Alpine внутри контейнера |
| nginx | Nginx reverse proxy, TLS termination, HTTP→HTTPS redirect | 8080/8443 | Nginx Alpine; единственный контейнер с опубликованными портами |
| data/auth | Supabase managed PostgreSQL/Auth | внешний HTTPS endpoint | Supabase; не запускается в Docker Compose |

Оба контейнера запускаются без root. Порты опубликованы только на loopback компьютера; сеть Compose изолирована. Входящий доступ из локальной сети и Интернета не открывается.

## Переменные окружения

Файл `deploy/.env` создаётся локально из `deploy/.env.example` и не коммитится.

| Имя | Назначение |
|---|---|
| `VITE_SUPABASE_URL` | URL тестового Supabase-проекта; публичная конфигурация сборки |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Publishable key тестового проекта; попадает в клиентский bundle и не является административным секретом |

Не добавляй `service_role`, database password, access token или другие секретные значения в `VITE_*`, Git, Dockerfile, Docker image или скриншоты. Фронтендовые `VITE_*` доступны посетителям сайта после сборки.

## Подготовка HTTPS

1. Установи `mkcert` из официального источника (на Windows методичка предлагает WinGet) и открой новый PowerShell.
2. Один раз установи локальный центр сертификатов командой `mkcert -install`. Windows попросит подтвердить изменение системного списка доверенных центров сертификации.
3. Из корня репозитория создай сертификат для локального домена:

   ```powershell
   New-Item -ItemType Directory -Force deploy/certs | Out-Null
   mkcert -cert-file deploy/certs/tearoad.localhost.pem -key-file deploy/certs/tearoad.localhost-key.pem tearoad.localhost
   ```

Корневой приватный ключ mkcert нельзя передавать или добавлять в репозиторий. Каталог сертификатов исключён из Git и Docker build context.

## Запуск

Создай `deploy/.env` и вставь в него URL и publishable key **тестового** Supabase-проекта. Затем из корня репозитория выполни:

```powershell
docker compose --env-file deploy/.env up --build -d
docker compose ps
docker compose logs nginx
docker compose logs frontend
```

Открой `https://tearoad.localhost` в Chrome или Edge. `http://tearoad.localhost` должен перенаправить на HTTPS. В DevTools → Network проверь запросы приложения, успешные ответы тестового Supabase и заголовки ответа страниц. Для закрытых маршрутов (`/cart`, `/profile`, `/login`, `/register`, `/recover`, `/checkout`, `/favorites`) frontend Nginx добавляет `X-Robots-Tag: noindex, nofollow`.

Остановить стенд:

```powershell
docker compose --env-file deploy/.env down
```

## Скриншоты отчёта

Сохрани фактические скриншоты в `deploy/screenshots/`:

- `compose-ps.png` — вывод `docker compose ps` со статусом обоих сервисов;
- `https-localhost.png` — TeaRoad в Chrome/Edge на `https://tearoad.localhost` с защищённым соединением;
- `network.png` — вкладка Network с успешным запросом и заголовками ответа;
- `docker-desktop.png` — два контейнера и опубликованные только у nginx loopback-порты.

Скриншоты нельзя заменять макетами или выводом, полученным не с запущенного стенда. Перед коммитом проверь их на отсутствие email, токенов, ключей, заказов и других персональных данных.

## Наблюдавшиеся проблемы и решения

- `docker build` сначала не подключался к Docker Engine (`dockerDesktopLinuxEngine` pipe отсутствовал). Решение: запустить Docker Desktop, дождаться `Engine running`, проверить `docker version` и повторить Compose.
- На момент подготовки этого файла Docker CLI найден, но Docker Engine пока не отвечает. Поэтому Compose, HTTPS, браузерные проверки и обязательные скриншоты ещё не подтверждены фактическим запуском.
- `mkcert` пока не обнаружен в PATH. Установить его и добавить локальный CA в доверенное хранилище Windows до запуска HTTPS-стенда.

## Что потребуется для реального сервера

Нужны отдельный Linux-сервер или выбранный облачный хостинг, зарегистрированный домен и DNS-запись на сервер, публичный TLS-сертификат (например, Let's Encrypt), серверные секреты в защищённом хранилище, резервное копирование и мониторинг. Потребуется заменить loopback-публикацию портов и локальные сертификаты, настроить TLS/proxy и безопасные правила Supabase. Эта практическая работа остаётся локальной репетицией: она сама по себе не публикует сайт.

## CI/CD

GitHub Actions проверяет npm production build и сборку Docker-образа на `push`, `pull_request` и `workflow_dispatch`. При push в `main` отдельный job публикует образ в GHCR. Публикация образа — доставка артефакта (Continuous Delivery); автоматического обновления реального сервера в этом учебном проекте нет.

GitHub Actions repository variables, необходимые workflow: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`. Они не являются backend-секретами; ключи service role в workflow не нужны.
