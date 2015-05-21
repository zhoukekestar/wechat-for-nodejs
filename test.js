var lowdb     = require('lowdb');
var db        = lowdb('./config/wechat.json');


db('keywords')
  .chain()
  .find({ words: 'zkk' })
  .assign({ words: 'zkk-1', reply: 'no.1'})
  .value()
db.save();
//db('keywords').remove({word:"aa"});

