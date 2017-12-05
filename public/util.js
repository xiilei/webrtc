/* eslint-disable no-console */

function trace(args) {
  const now = (window.performance.now() / 1000).toFixed(3);
  args.push('-->', now);
  console.log.apply(console, args);
}

function random(start, end) {
  return Math.floor(Math.random() * (end - start) + start);
}

function traceNs(ns) {
  return function (...args) {
    args.unshift('[' + ns + ']');
    trace(args);
  };
}

function createVideoBox(id) {
  const video = document.createElement('video');
  const box = document.createElement('div');
  const div2 = document.createElement('div');
  box.className = 'col-sm-3';
  div2.className = 'peer';
  video.autoplay = true;
  video.muted = true;
  box.id = id;
  div2.appendChild(video);
  box.appendChild(div2);
  return { box, video };
}

function getUserMedia(constants) {
  return navigator.mediaDevices.getUserMedia(constants);
}


function traceStreamTracks(stream) {
  stream.getTracks().forEach(track => {
    trace(['track', track]);
  });
}

module.exports = {
  random,
  traceNs,
  createVideoBox,
  getUserMedia,
  traceStreamTracks
};