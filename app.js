const http = require('http');
const Koa = require('koa');
const serve = require('koa-static');
const Signaler = require('./lib/signaling');
const app = new Koa();

const signaler = new Signaler();

//所有房间数据
app.use((ctx, next) => {
  if (ctx.request.path.indexOf('/api/signaler') === -1) {
    return next();
  }
  ctx.response.type = 'json';
  ctx.body = JSON.stringify(signaler);
});

app.use(serve(__dirname + '/public'));

const server = http.createServer(app.callback());
signaler.start({ server });

server.listen(process.env.WEBRTC_TEST_PORT || 3000);