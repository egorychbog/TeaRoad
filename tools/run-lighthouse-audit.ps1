[CmdletBinding()]
param(
    [string]$BaseUrl = "https://tearoad.localhost",
    [string[]]$ProductSlug = @(),
    [string[]]$BlockedUrlPattern = @(),
    [switch]$IncludePrivate
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$reportsDir = Join-Path $repoRoot "docs/audit/reports"
New-Item -ItemType Directory -Force -Path $reportsDir | Out-Null

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Node.js не найден. Установите Node.js 20+ и повторите запуск."
}
if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
    throw "npx не найден. Проверьте установку Node.js/npm."
}

$BaseUrl = $BaseUrl.TrimEnd("/")
Write-Host "Проверка production-сайта: $BaseUrl" -ForegroundColor Cyan

try {
    $null = Invoke-WebRequest -Uri "$BaseUrl/" -Method Get -UseBasicParsing -TimeoutSec 20
}
catch {
    throw "Сайт недоступен по $BaseUrl. Запустите Docker Compose, проверьте HTTPS-сертификат mkcert и повторите. Детали: $($_.Exception.Message)"
}

$publicRoutes = @(
    @{ Name = "home";       Path = "/" },
    @{ Name = "catalog";    Path = "/catalog" },
    @{ Name = "gifts";      Path = "/gifts" },
    @{ Name = "promotions"; Path = "/promotions" },
    @{ Name = "about";      Path = "/about" },
    @{ Name = "delivery";   Path = "/delivery" },
    @{ Name = "picker";     Path = "/picker" }
)

foreach ($slug in $ProductSlug) {
    if ([string]::IsNullOrWhiteSpace($slug)) { continue }
    $safeName = ($slug -replace "[^a-zA-Z0-9_-]", "-")
    $encodedSlug = [uri]::EscapeDataString($slug)
    $publicRoutes += @{ Name = "product-$safeName"; Path = "/product/$encodedSlug" }
}

function Invoke-LighthouseAudit {
    param(
        [string]$Url,
        [string]$Name,
        [string]$Categories,
        [int]$Runs
    )

    for ($run = 1; $run -le $Runs; $run++) {
        $suffix = if ($Runs -eq 1) { "single" } else { "run-$run" }
        $outputBase = Join-Path $reportsDir "$Name-$suffix"

        Write-Host "Lighthouse $Name ($run/$Runs): $Url" -ForegroundColor Yellow
        $lighthouseArgs = @(
            $Url,
            "--preset=desktop",
            "--only-categories=$Categories",
            "--output=json",
            "--output=html",
            "--output-path=$outputBase",
            "--chrome-flags=--headless=new",
            "--locale=ru"
        )

        foreach ($pattern in $BlockedUrlPattern) {
            $lighthouseArgs += "--blocked-url-patterns=$pattern"
        }

        & npx --yes lighthouse @lighthouseArgs
        if ($LASTEXITCODE -ne 0) {
            throw "Lighthouse завершился с кодом $LASTEXITCODE для $Url. Проверьте сертификат, доступность страницы и запуск Chrome."
        }
    }
}

foreach ($route in $publicRoutes) {
    Invoke-LighthouseAudit -Url "$BaseUrl$($route.Path)" -Name $route.Name -Categories "performance,accessibility,best-practices,seo" -Runs 3
}

if ($IncludePrivate) {
    $privateRoutes = @(
        @{ Name = "favorites"; Path = "/favorites" },
        @{ Name = "cart";      Path = "/cart" },
        @{ Name = "checkout";  Path = "/checkout" },
        @{ Name = "login";     Path = "/login" },
        @{ Name = "register";  Path = "/register" },
        @{ Name = "recover";   Path = "/recover" }
    )

    foreach ($route in $privateRoutes) {
        Invoke-LighthouseAudit -Url "$BaseUrl$($route.Path)" -Name $route.Name -Categories "performance,accessibility,best-practices" -Runs 1
    }

    Write-Host "Профиль /profile проверьте отдельно после входа в аккаунт в том же окне инкогнито. Не сохраняйте скриншоты с персональными данными." -ForegroundColor Magenta
}

Write-Host ""
Write-Host "Готово. HTML и JSON отчёты: $reportsDir" -ForegroundColor Green
Write-Host "Сводка: node .\tools\summarize-lighthouse.mjs" -ForegroundColor Green
