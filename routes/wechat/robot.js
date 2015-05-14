var express   = require('express');
var router    = express.Router();
var crypto    = require('crypto');
var unirest = require('unirest');
var xmlbuilder= require('xmlbuilder');
var config    = require('../../config/wechat');
var wechat    = require('../../lib/wechat');
var xmlBodyParser = require('../../lib/xmlBodyParser');
var debug     = process.env.NODEJS_DEBUG === undefined ? false : process.env.NODEJS_DEBUG;

router.all('/', xmlBodyParser);
/**
 * 处理GET请求
 * @param req
 * @param res
 */
router.get('/', function(req, res) {
  if (!checkSource(req)) {
      res.end('token or other parm is error! ');
      return;
  }
  res.end(req.query.echostr);
});

/**
 * 处理POST请求
 * @param req
 * @param res
 */
router.post('/', function (req, res) {
  /*if (!checkSource(req)) {
      res.end('token or other parm is error! ');
      return;
  }*/

  res.contentType('text/xml');
  var xml = buildXml(req, {
    MsgType: 'text',
    Content: 'reply by server:' + req.body.xml.Content[0]
  });
  xml += "";

  if (debug) {
    console.log("res: " + xml);
  }

  res.end(xml);
});

/**
 * 自定义菜单按钮
 * @param  {json}   body button json
 *

POST http://localhost:3000/wechat/robot/btn
Content-type: application/json
POST_BODY:
{"button":[{"type":"click","name":"song","key":"V1001_TODAY_MUSIC"}]}

 */
router.post('/btn', function(req, res) {
  wechat.getAccessToken(function(token) {

    unirest
      .post('https://api.weixin.qq.com/cgi-bin/menu/create?access_token=' + token)
      .header('Content-Type', 'application/json')
      .send(req.body)
      .end(function(response) {
        res.end(JSON.stringify(response.body));
      });
  });
});


/**
 * 获取自定义按钮
 * @return {json}      自定义按钮的json格式

GET http://localhost:3000/wechat/robot/btn
 */
router.get('/btn', function(req, res) {

  wechat.getAccessToken(function(token) {
    unirest
      .get('https://api.weixin.qq.com/cgi-bin/menu/get?access_token=' + token)
      .end(function(response) {
        res.end(JSON.stringify(response.body));
      });
  });

});

/**
 * 发送客服消息
 * @param  {string} openid  消息接收方的openid
 * @param  {string} msg     消息
 *
GET http://localhost:3000/wechat/robot/msg?openid=o3ebHjp1_Acae0IxOlK4B1IWG3fQ&msg=hello
 */
router.all('/msg', function(req, res) {
  var msg = {
    "touser": req.query.openid,
    "msgtype":"text",
    "text":
    {
      "content": req.query.msg
    }
  }
  wechat.getAccessToken(function(token) {

    unirest
      .post('https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=' + token)
      .header('Content-Type', 'application/json')
      .send(msg)
      .end(function(response) {
        res.end(JSON.stringify(response.body));
      });
  });

});


function buildXml(req, obj) {
  var xmlObj = {
    xml: {
      ToUserName: {
        "#cdata": req.body.xml.FromUserName[0]
      },
      FromUserName: {
        "#cdata": req.body.xml.ToUserName[0]
      },
      CreateTime: (new Date()).getTime(),
      MsgType: {
        "#cdata": obj.MsgType
      }
    }
  };

  if (obj.MsgType === 'text') {

    xmlObj.xml.Content = obj.Content;

  // TODO: other types
  } else if (obj.MsgType === 'image') {

    xmlObj.xml.Image = {
      MediaId: {
        "#cdata": 'media_id'
      }
    };

  }

  xmlObj = xmlbuilder.create(xmlObj);

  if (debug) {
    console.log(xmlObj.end({pretty: true}));
  }

  return xmlObj.end().substr(21);
}

/**
 * 验证消息真实性
 * @param req
 * @returns {boolean}
 */
function checkSource(req) {
  var signature = req.query.signature,
      timestamp = req.query.timestamp,
      nonce     = req.query.nonce,
      shasum    = crypto.createHash('sha1'),
      token     = config.token,
      arr       = [token, timestamp, nonce];
  shasum.update(arr.sort().join(''));

  if (debug) {
    console.log(arr.sort().join(',') + "," + signature);
  }

  return shasum.digest('hex') == signature;
}

module.exports = router;
