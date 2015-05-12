var leancloud = require('./lib/leancloud.js');
var uuid = require('uuid');
// After got user info
// 1、Save user info
// 2、Redirect request
var user = {openid: "abc"};
user.username = uuid.v1();
user.password = '123456';

var s = new Date();

leancloud.create('_User', user, function(response) {

  var t = (new Date()).getTime() - s.getTime();
  console.log(t);

  /*console.log(response.body);
  res.contentType("application/json; charset=utf-8")
  res.end("info: " + response.body);*/
});

