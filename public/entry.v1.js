const App = require('./origin');
const conf = require('./entry');

const app = new App(conf);

global.app = app;

conf.elm.localStart.addEventListener('click', function () {
  app.start();
  this.disabled = true;
});
