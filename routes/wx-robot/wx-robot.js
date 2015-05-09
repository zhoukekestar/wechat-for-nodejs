var express = require('express');
var router = express.Router();
var crypto = require('crypto');
//var unirest = require('unirest');
var xmlbuilder = require('xmlbuilder');
var wx_config = require('../../config/wx_config')
var xmlBodyParser = require('../../lib/xml-body-parser');

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
  console.log("res: " + xml);
  res.end(xml);

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

    xmlObj.xml["Content"] = obj.Content;

  } else if (obj.MsgType === 'image') {

    xmlObj.xml["Image"] = {
      MediaId: {
        "#cdata": 'media_id'
      }
    }

  }

  xmlObj = xmlbuilder.create(xmlObj);

  //console.log(xmlObj.end({pretty: true}));
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
      nonce = req.query.nonce,
      shasum = crypto.createHash('sha1'),
      token = wx_config.token,
      arr = [token, timestamp, nonce];
  shasum.update(arr.sort().join(''));
  console.log(arr.sort().join(',') + "," + signature);
  return shasum.digest('hex') == signature;
}

module.exports = router;
