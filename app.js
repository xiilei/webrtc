const serve = require('koa-static');
const Koa = require('koa');
const app = new Koa();

app.use(serve(__dirname + '/public'));


app.listen(process.env.WEBRTC_TEST_PORT || 3000);