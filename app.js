const https = require('https');
const fs = require('fs');
const path = require('path');
const Koa = require('koa');
const serve = require('koa-static');
const Signaler = require('./lib/signaling');
const { startServer } = require('./lib/sfu');
const app = new Koa();

const signaler = new Signaler();

//sfu 
startServer({}, signaler);

//所有房间数据
app.use((ctx, next) => {
  if (ctx.request.path.indexOf('/api/signaler') === -1) {
    return next();
  }
  ctx.response.type = 'json';
  ctx.body = JSON.stringify(signaler);
});

app.use(serve(__dirname + '/public'));

const server = https.createServer({
  cert: fs.readFileSync(path.join(__dirname, '/keys/test.crt')),
  key: fs.readFileSync(path.join(__dirname, '/keys/test.key'))
}, app.callback());
signaler.start({ server });



server.listen(process.env.WEBRTC_TEST_PORT || 3000);