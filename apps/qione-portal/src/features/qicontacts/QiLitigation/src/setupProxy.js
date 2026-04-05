const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy for all API routes
  app.use(
    ['/api', '/auth', '/cases', '/clients', '/documents', '/tasks', '/dashboard', '/ai-assistant'],
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying:', req.method, req.url, '->', 'http://localhost:3001' + req.url);
      }
    })
  );
};
