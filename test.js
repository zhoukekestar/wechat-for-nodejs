var lean = require('./lib/leancloud');

// lean.sendSMS("15267607491", function(res) {
//   console.log(res.body);
// })

/*
lean.verifySMS("15267607491", "264798", function(res) {
  console.log(res.body);
})
*/

lean.feedback("1002183272", "添加功能abc", function(res) {
  console.log(res.body);
})
//264798
