# Практическое занятие №18: локальная репетиция деплоя TeaRoad

Локальный Docker-стенд открывается по адресу `https://tearoad.localhost`. Frontend также развёрнут на Vercel; backend Compose берёт из отдельного репозитория `egorychbog/deploy`.

## Архитектура

```text
Браузер
  └─ HTTPS/HTTP → nginx gateway (локальные порты 127.0.0.1:443 и 127.0.0.1:80)
                    ├─ / и страницы → frontend (React production build, порт 8080)
                    └─ /api/* → backend (Node.js API, порт 3000)
Браузер также обращается к Supabase по HTTPS для авторизации и основного каталога.
```

Backend находится в отдельном GitHub-репозитории `egorychbog/deploy`; Docker Compose загружает его как Git build context. Он предоставляет `/api/health` и демонстрационный каталог `/api/products`. Frontend использует этот каталог, если Supabase не настроен или недоступен. Supabase остаётся внешним управляемым сервисом.

| Сервис | Технология | Внутренний порт | Production-сервер |
|---|---|---:|---|
| frontend | React 19, React Router 7, Vite/esbuild; production static build | 8080 | Nginx Alpine внутри контейнера |
| backend | Node.js HTTP API (`/api/health`, `/api/products`) | 3000 | Node 22 Alpine |
| nginx | Nginx reverse proxy, TLS termination, HTTP→HTTPS redirect | 8080/8443 | Nginx Alpine; единственный контейнер с опубликованными портами |
| data/auth | Supabase managed PostgreSQL/Auth | внешний HTTPS endpoint | Supabase; не запускается в Docker Compose |

Все три контейнера запускаются без root. Порты опубликованы только на loopback компьютера; сеть Compose изолирована. Входящий доступ из локальной сети и Интернета не открывается.

## Переменные окружения

Файл `.env` создаётся в корне из `.env.example` и не коммитится.

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
   New-Item -ItemType Directory -Force certs | Out-Null
   mkcert -cert-file certs/tearoad.localhost.pem -key-file certs/tearoad.localhost-key.pem tearoad.localhost
   ```

Корневой приватный ключ mkcert нельзя передавать или добавлять в репозиторий. Каталог сертификатов исключён из Git и Docker build context.

## Запуск

Создай `.env` из `.env.example` и укажи URL и publishable key Supabase. Затем из корня репозитория выполни:

```powershell
docker compose up --build -d
docker compose ps
docker compose logs nginx
docker compose logs frontend
```

Открой `https://tearoad.localhost` в Chrome или Edge. `http://tearoad.localhost` должен перенаправить на HTTPS. В DevTools → Network проверь запросы приложения, успешные ответы тестового Supabase и заголовки ответа страниц. Для закрытых маршрутов (`/cart`, `/profile`, `/login`, `/register`, `/recover`, `/checkout`, `/favorites`) frontend Nginx добавляет `X-Robots-Tag: noindex, nofollow`.

Остановить стенд:

```powershell
docker compose down
```

## Скриншоты отчёта

Сохрани фактические скриншоты в `docs/screenshots/`:

- `compose-ps.png` — вывод `docker compose ps` со статусом обоих сервисов;
- `https-localhost.png` — TeaRoad в Chrome/Edge на `https://tearoad.localhost` с защищённым соединением;
- `network.png` — вкладка Network с успешным запросом и заголовками ответа;
- `docker-desktop.png` — два контейнера и опубликованные только у nginx loopback-порты.

Скриншоты нельзя заменять макетами или выводом, полученным не с запущенного стенда. Перед коммитом проверь их на отсутствие email, токенов, ключей, заказов и других персональных данных.

## Наблюдавшиеся проблемы и решения

- `docker build` сначала не подключался к Docker Engine (`dockerDesktopLinuxEngine` pipe отсутствовал). Решение: запустить Docker Desktop, дождаться `Engine running`, проверить `docker version` и повторить Compose.
- При первом запуске frontend Nginx не смог создать PID-файл с правами непривилегированного пользователя. В Dockerfile путь PID переведён в `/tmp`.
- Nginx gateway сначала не запускался на read-only корневой файловой системе из-за отсутствующей директории временных файлов. Добавлены выделенные tmpfs для `/tmp`, `/run` и `/var/cache/nginx`.
- Compose-сеть первоначально была помечена `internal`, и gateway не публиковал host-порты. Порты теперь доступны только на loopback, а сами сервисы связаны явным DNS alias `frontend`.
- Внутренний redirect SPA терял `X-Robots-Tag` на `/cart`. Заголовок теперь вычисляется по исходному URI и сохраняется на `index.html`; проверено через HTTPS.
- `mkcert` установлен, локальный сертификат создан, но CA ещё не добавлен в доверенное хранилище Windows. До этого браузер не будет считать HTTPS-соединение доверенным.
- Compose стартует с обоими сервисами в состоянии healthy. HTTP→HTTPS редирект, HTTPS-ответ и `X-Robots-Tag` для `/cart` проверены `curl` с локальным CA; проверка отзыва сертификатов Windows для этого CLI-запроса была отключена из-за недоступного статуса отзыва.
- `mkcert` пока не обнаружен в PATH. Установить его и добавить локальный CA в доверенное хранилище Windows до запуска HTTPS-стенда.

## Что потребуется для реального сервера

Нужны отдельный Linux-сервер или выбранный облачный хостинг, зарегистрированный домен и DNS-запись на сервер, публичный TLS-сертификат (например, Let's Encrypt), серверные секреты в защищённом хранилище, резервное копирование и мониторинг. Потребуется заменить loopback-публикацию портов и локальные сертификаты, настроить TLS/proxy и безопасные правила Supabase. Эта практическая работа остаётся локальной репетицией: она сама по себе не публикует сайт.

## CI/CD

GitHub Actions проверяет npm production build и сборку Docker-образа на `push`, `pull_request` и `workflow_dispatch`. При push в `main` отдельный job публикует образ в GHCR. Публикация образа — доставка артефакта (Continuous Delivery); автоматического обновления реального сервера в этом учебном проекте нет.

GitHub Actions repository variables, необходимые workflow: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`. Они не являются backend-секретами; ключи service role в workflow не нужны.
