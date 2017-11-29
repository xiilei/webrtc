const App = require('./app');
const { random } = require('./util');

function genName() {
  return [0, 0, 0, 0, 0].map((v, i) => i < 3 ? String.fromCharCode(random(97, 122)) : random(1, 10)).join('');
}


const url = new URL(location.href);
const rid = url.searchParams.get('rid') || 'room1';
const id = url.searchParams.get('id') || 'id1';
const name = url.searchParams.get('uname') || genName();

const localVideo = document.querySelector('#local-video');
const localStart = document.querySelector('#local-start');

const app = new App({
  url: 'ws://' + url.host + '/?rid=' + encodeURIComponent(rid) + '&id=' + encodeURIComponent(id),
  user: { rid, id, name },
  elm: {
    localVideo,
    peersContainer: document.querySelector('#peersContainer')
  }
});

localStart.addEventListener('click', function () {
  app.start();
  this.disabled = true;
});
