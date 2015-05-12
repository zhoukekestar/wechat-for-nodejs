module.exports = function(app) {

  app.engine('jade', function(filePath, options, callback){
    var jade = require('jade');
    var wechat = require('./wechat');

    var fn = jade.compileFile(filePath, {pretty: '\t'});
    var html = fn(options);

    if (options.wx !== undefined) {
      var req = options.wx;
      var url = 'http://' + req.headers.host + req.url;

      wechat.getSign(url, function(time, random, sign) {

        var d = {
          debug: true,
          appId: wechat.appID,  // 必填，公众号的唯一标识
          timestamp: time,      // 必填，生成签名的时间戳
          nonceStr: random,     // 必填，生成签名的随机串
          signature: sign,      // 必填，签名，见附录1
          jsApiList: [          // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            'onMenuShareTimeline',
            'onMenuShareAppMessage'
          ]
        };

        html = html.replace('wx.config();', 'wx.config(' + JSON.stringify(d) + ');');
        return callback(null, html);

      });

    } else {
      return callback(null, html);
    }

  });
};
