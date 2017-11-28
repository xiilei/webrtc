const App = require('./app');
const { random } = require('./util');

function genName() {
  return [0, 0, 0, 0, 0].map((v, i) => i < 3 ? String.fromCharCode(random(97, 122)) : random(1, 10)).join('');
}


const url = new URL(location.href);
const rid = url.searchParams.rid || 'room1';
const uid = url.searchParams.uid || 'uid1';
const name = url.searchParams.uname || genName();

new App({
  url: 'ws://' + url.host + '/?rid=' + encodeURIComponent(rid) + '&uid=' + encodeURIComponent(uid),
  user: {
    rid: rid,
    uid: uid,
    name: name
  }
});