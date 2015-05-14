var bunyan = require('bunyan');
function MyRawStream() {};

function format(d) {
  return d.getHours() + ':' + d.getMinutes() + ":" + d.getSeconds();
}
// var MyRawStream = {};
MyRawStream.prototype.write = function(rec) {
  console.log('[%s] %s %s: %s',
         format(rec.time),
         bunyan.nameFromLevel[rec.level],
         rec.name,
         rec.msg);
}

module.exports = [
  {
    level: 'debug',
    stream: new MyRawStream(),
    type: 'raw'
  }
];

