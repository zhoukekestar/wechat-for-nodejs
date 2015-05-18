var lowdb     = require('lowdb');
var db        = lowdb('./config/wechat.json');


db.object.keywords.forEach(function(d){
  if (d.word === 'aa') {
    d.word = 'aaa';
    db.save();
  }
});

//db('keywords').remove({word:"aa"});

