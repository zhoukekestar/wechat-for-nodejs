var express   = require('express');
var router    = express.Router();
var urlencode = require('urlencode');
var unirest   = require('unirest');
var uuid      = require('uuid');
var config    = require('../../config/wechat');
var leancloud = require('../../lib/leancloud');

// Base auth request.
// http://localhost:3000/wechat/auth/base
router.get('/base', function(req, res) {

  var url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' +
            config.appID +
            '&redirect_uri=' +
            urlencode(config.basecallback) +
            '&response_type=code&scope=snsapi_base&state=base#wechat_redirect';

  res.redirect(url);

});

// Base auth callback.
router.get('/base/callback', function(req, res) {
  var code = req.query.code;
  var state = req.query.state;

  if (code === '') {
    // TODO
  }
  var url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' +
            config.appID +
            '&secret=' + config.appsecret +
            '&code=' + code +
            '&grant_type=authorization_code';
  unirest.get(url).end(function(response) {
    // After got openid.
    //
    var body = response.body;
    if (typeof response.body === 'string') {
      body = JSON.parse(response.body);
    }

    // Check openid
    leancloud.select('select count(*) from _User where openid="' + body.openid + '"', function(result) {
      result = result.body;
      if (result.count === 0) {
        res.contentType("text/html");
        res.end('<a href="/user/wx/auth/info">info</a>');
      } else {

        res.end(body.openid);
      }

    });

  });
});

// Info auth request.
// http://localhost:3000/wechat/auth/info
router.get('/info', function(req, res) {
  var url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' +
            config.appID +
            '&redirect_uri=' +
            urlencode(config.infocallback) +
            '&response_type=code&scope=snsapi_userinfo&state=info#wechat_redirect';

  res.redirect(url);

});

// Info auth callback.
router.get('/info/callback', function(req, res) {
  var code = req.query.code;
  var state = req.query.state;

  if (code === '') {
    // TODO
  }
  var url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' +
            config.appID +
            '&secret=' + config.appsecret +
            '&code=' + code +
            '&grant_type=authorization_code';
  unirest.get(url).end(function(response) {
    var json = JSON.parse(response.body);

    url = 'https://api.weixin.qq.com/sns/userinfo?access_token=' +
          json.access_token +
          '&openid=' + json.openid + '&lang=zh_CN';

    unirest.get(url).end(function(response){

      // After got user info
      // 1、Save user info
      // 2、Redirect request
      var user = JSON.parse(response.body);
      user.username = uuid.v1();
      user.password = '123456';

      leancloud.create('_User', user, function(response) {
        console.log(response.body);
        res.contentType("application/json; charset=utf-8");
        res.end(response.body);
      });
    });
  });
});

module.exports = router;
