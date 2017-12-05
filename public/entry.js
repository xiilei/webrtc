const { random } = require('./util');

function genName() {
  return [0, 0, 0, 0, 0].map((v, i) => i < 3 ? String.fromCharCode(random(97, 122)) : random(1, 10)).join('');
}


const url = global.url;
const rid = url.searchParams.get('rid') || 'room1';
const id = url.searchParams.get('id') || 'id1';
const name = url.searchParams.get('uname') || genName();

const localVideo = document.querySelector('#local-video');
const localStart = document.querySelector('#local-start');

module.exports = {
  url: (location.protocol == 'https:' ? 'wss' : 'ws') + '://' + url.host + '/?rid=' + encodeURIComponent(rid) + '&id=' + encodeURIComponent(id),
  user: { rid, id, name },
  elm: {
    localVideo,
    localStart,
    peersContainer: document.querySelector('#peersContainer')
  }
};
