var bunyan = require('bunyan');

var log = require('bunyan').createLogger({name: "admin-index", streams: require('./lib/logformat')});


// var bunyan = require('bunyan');

// function MyRawStream() {}
// MyRawStream.prototype.write = function (rec) {
//     console.log('[%s] %s: %s',
//         rec.time.toISOString(),
//         bunyan.nameFromLevel[rec.level],
//         rec.msg);
// }

// var log = bunyan.createLogger({
//     name: 'play',
//     streams: [
//         {
//             level: 'info',
//             stream: new MyRawStream(),
//             type: 'raw'
//         }
//     ]
// });

log.info('hi on info');

log.info("hi");
log.debug("nihao");
