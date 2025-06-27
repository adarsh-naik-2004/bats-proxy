require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 3000;
const DOMAIN = process.env.COOKIE_DOMAIN;

const io = new Server(httpServer, {
  cors: {
    origin: ['https://admin.cricstore.icu', 'https://app.cricstore.icu'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  path: '/socket.io' // Match client-side path
});


io.on('connection', (socket) => {
  console.log('Client connected via gateway:', socket.id);
  
  socket.on('join-order', (data) => {
    if (data.orderId) {
      socket.join(`order-${data.orderId}`);
      console.log(`Socket ${socket.id} joined order room: order-${data.orderId}`);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});


app.use(cors({ origin: ['https://admin.cricstore.icu', 'https://app.cricstore.icu'], credentials: true }));
app.set('trust proxy', 1);

app.use(['/auth', '/users', '/stores', '/.well-known'], createProxyMiddleware({
  target: process.env.AUTH_URL,
  changeOrigin: true,
  cookieDomainRewrite: DOMAIN,
}));


app.use(['/categories', '/products', '/accessorys'], createProxyMiddleware({
  target: process.env.COLLECTION_URL,
  changeOrigin: true,
  cookieDomainRewrite: DOMAIN,
}));


app.use(['/orders', '/customer', '/coupons'], createProxyMiddleware({
  target: process.env.ORDER_URL,
  changeOrigin: true,
  cookieDomainRewrite: DOMAIN,
}));

app.use(['/notify'], createProxyMiddleware({
    target: process.env.NOTIFICATION_URL,
    changeOrigin: true,
    cookieDomainRewrite: DOMAIN,
}));


app.use(['/order-update'], createProxyMiddleware({
    target: process.env.WEBSOCKET_URL,
    changeOrigin: true,
    cookieDomainRewrite: DOMAIN,
}));

app.use('/socket.io', createProxyMiddleware({
  target: process.env.WEBSOCKET_URL,
  changeOrigin: true,
  ws: true,
  cookieDomainRewrite: DOMAIN,
  logLevel: 'debug'
}));


app.listen(PORT, () => {
  console.log(`Gateway running at http://localhost:${PORT}`);
});