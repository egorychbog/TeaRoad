import { createServer } from 'node:http';

const products = [
  { id: 'shu-puer-lesnoy-put', name: 'Шэн Пуэр «Лесной путь»', category: 'Китайский чай', taste: 'мягкий', price: 1490, weight: '100 г', stock: true, image: '/assets/web-gold-puer-cake.jpg', description: 'Выдержанный чай с древесным ароматом, сухофруктами и долгим теплым послевкусием.' },
  { id: 'te-guan-in-orhideya', name: 'Те Гуань Инь «Орхидея»', category: 'Китайский чай', taste: 'цветочный', price: 1290, weight: '100 г', stock: true, image: '/assets/web-dongding-oolong.jpg', description: 'Свежий улун с цветочным профилем, сливочной мягкостью и прозрачным настоем.' },
  { id: 'ceremony-figure-yunnan', name: 'Фигурка для церемонии «Юньнань»', category: 'Аксессуары', taste: 'нейтральный', price: 2500, weight: '1 шт.', stock: true, image: '/assets/web-tea-pets.jpg', description: 'Небольшая чайная фигурка для стола и церемоний гунфу.' },
];

const server = createServer((request, response) => {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('X-Content-Type-Options', 'nosniff');

  if (request.method === 'GET' && request.url === '/api/health') {
    response.writeHead(200);
    response.end(JSON.stringify({ status: 'ok', service: 'tearoad-backend' }));
    return;
  }

  if (request.method === 'GET' && request.url === '/api/products') {
    response.writeHead(200);
    response.end(JSON.stringify({ items: products, total: products.length, source: 'backend-demo-catalog' }));
    return;
  }

  response.writeHead(404);
  response.end(JSON.stringify({ error: 'Not found' }));
});

const port = Number(process.env.PORT || 3000);
server.listen(port, '0.0.0.0', () => console.log(`TeaRoad backend listening on ${port}`));

function shutdown() {
  server.close(() => process.exit(0));
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
