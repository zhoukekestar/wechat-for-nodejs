var express = require('express');
var router = express.Router();
var wx_config = require('../../config/wx_config');
var urlencode = require('urlencode');
var unirest = require('unirest');

router.get('/wx/auth/base', function(req, res) {
  var url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' +
            wx_config.appID +
            '&redirect_uri=' +
            urlencode(wx_config.callback) +
            '&response_type=code&scope=snsapi_base&state=base#wechat_redirect';

  res.redirect(url);

});

router.get('/wx/auth/info', function(req, res) {
  var url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' +
            wx_config.appID +
            '&redirect_uri=' +
            urlencode(wx_config.callback) +
            '&response_type=code&scope=snsapi_userinfo&state=info#wechat_redirect';

  res.redirect(url);

});

router.get('/wx/callback', function(req, res) {
  var a = 'a';
  var code = req.query["code"];
  var state = req.query["state"];

  var url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' +
            wx_config.appID +
            '&secret=' + wx_config.appsecret +
            '&code=' + code +
            '&grant_type=authorization_code';
  if (state === 'base' ) {

    unirest.get(url).end(function(response) {

       res.end("hi " + code + " " + state + " " + response.body);
    });

  } else {
    unirest.get(url).end(function(response) {
      var json = JSON.parse(response.body);

      url = 'https://api.weixin.qq.com/sns/userinfo?access_token=' +
            json.access_token +
            '&openid=' + json.openid + '&lang=zh_CN';

      unirest.get(url).end(function(response){

        res.contentType("application/json; charset=utf-8")
        res.end("info: " + response.body);
      });
    });
  }


});
module.exports = router;
