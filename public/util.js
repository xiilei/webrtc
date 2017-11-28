// Logging utility function.
function trace(args) {
  const now = (window.performance.now() / 1000).toFixed(3);
  args.push(',-->', now);
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

module.exports = {
  random,
  traceNs
};