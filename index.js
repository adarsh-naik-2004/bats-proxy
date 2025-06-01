require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DOMAIN = process.env.COOKIE_DOMAIN;

app.use(cors({ origin: ['https://admin.cricstore.icu', 'https://app.cricstore.icu'], credentials: true }));
app.set('trust proxy', 1);

app.use(['/auth', '/users', '/stores'], createProxyMiddleware({
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


app.listen(PORT, () => {
  console.log(`Gateway running at http://localhost:${PORT}`);
});