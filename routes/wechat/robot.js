var express   = require('express');
var router    = express.Router();
var crypto    = require('crypto');
var unirest   = require('unirest');
var xmlbuilder= require('xmlbuilder');
var config    = require('../../config/wechat');
var wechat    = require('../../lib/wechat');
var xmlBodyParser = require('../../lib/xmlBodyParser');

var log       = require('bunyan').createLogger({name: "wechat/robot", streams: require('../../lib/logformat')});
var lowdb     = require('lowdb');
var db        = lowdb('./config/wechat.json');
// var obj = db.object;

// obj.zkk = "zkk.obj";
// db.save();

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
 * 处理POST请求，处理消息的主体代码
 * @param req
 * @param res
 */
router.post('/', function (req, res) {
  /*if (!checkSource(req)) {
      res.end('token or other parm is error! ');
      return;
  }*/

  res.contentType('text/xml');
  var xml = req.body.xml;

  // 订阅事件
  if (xml.MsgType === 'event' && xml.Event === 'subscribe') {

    sendSimpleMsg(req, res, db.object.subscribe);


  // 取消订阅事件
  } else if (xml.MsgType === 'event' && xml.Event === 'unsubscribe') {

    sendSimpleMsg(req, res, db.object.unsubscribe);

  // 点击菜单事件
  } else if (xml.MsgType === 'event' && xml.Event === 'CLICK') {

    // 点击签到
    if (xml.EventKey === 'CHECKIN') {

      sendSimpleMsg(req, res, db.object.CHECKIN);

    } else {

      var rxml= buildXml(req, {
        MsgType: 'text',
        Content: db.object.unsubscribe
      });

      rxml += '';
      log.debug('res: ' + rxml);
      res.end(rxml);
    }

  // 接收文本消息
  } else if (xml.MsgType === 'text') {

    // 设置订阅消息
    if (xml.Content.indexOf('#subscribe#') != -1) {
      db.object.subscribe = xml.Content.substr(11);
      db.save();
      sendSimpleMsg(req, res, "已重新设置订阅时的消息:" + db.object.subscribe);

    } else{

      // 过滤关键字
      db.object.keywords.forEach(function(obj){

        obj.words.split(',').forEach(function(w){

          // 关键字匹配上之后，发送相应的消息
          // 处理后，跳出函数，避免小黄鸡处理
          if (w === xml.Content.trim()) {

            // 发送文本消息
            if (typeof obj.reply === 'string') {

              sendSimpleMsg(req, res, obj.reply);

            // 发送图文消息
            } else {
              sendSimpleNews(req, res, obj.reply.title, obj.reply.desc, obj.reply.pic, obj.reply.url);
            }

            return;
          }
        });

      });

      // 小黄鸡机器人自动回复
      unirest.post('http://www.niurenqushi.com/app/simsimi/ajax.aspx')
        .header('Cookie', 'Hm_lvt_a03ca47d40cee1509f846cf6dfb38778=1431927186; Hm_lpvt_a03ca47d40cee1509f846cf6dfb38778=1431927186; bdshare_firstime=1431927183823')
        .send({txt: xml.Content})
        .end(function(result){
          if (result.body === undefined) {

            sendSimpleMsg(req, res, '我凌乱了。。。');

          } else if (result.body.indexOf('<h1>') !== -1) {
            sendSimpleMsg(req, res, '我只收到一串乱码');

          } else {
            sendSimpleMsg(req, res, result.body);
          }
        });


    }
  // 其他事件
  } else {

    sendSimpleMsg(req, res, '不太懂您的意思。。。您能打字吗？');

  }
});


/**
 * 获取keywords

http://localhost:3000/wechat/robot/keywords

 */
router.get('/keywords', function(req, res) {

  res.json(db.object.keywords);
});

router.post('/keywords', function(req, res) {

  // 添加关键字
  if (req.query.action === 'post') {

    var d = req.body;

    if (d.type === 'text') {
      delete d.type;

      db('keywords').push(d);
      res.json({code:0, msg: '添加成功'});
    } else if (d.type === 'news') {

      delete d.type;
      var dd = {
        words: d.words,
        reply: {
          title: d.title,
          desc: d.desc,
          pic: d.pic,
          url: d.url
        }
      };

      db('keywords').push(dd);
      res.json({code:0, msg: '添加成功'});
    } else {
      res.json({code: -1, msg: '未知类型'});
    }

  // 删除关键字
  } else if (req.query.action === 'delete') {

    db('keywords').remove({words: req.query.words});
    res.json({code: 0, msg: 'delete ok'});

  // 修改关键字
  } else if (req.query.action === 'put') {
    var d = req.body;

    if (d.type === 'text') {
      delete d.type;
      db('keywords').remove({words: d.words});
      db('keywords').push(d);
      res.json({code:0, msg: '更新成功'});
    } else if (d.type === 'news') {

      delete d.type;
      var dd = {
        words: d.words,
        reply: {
          title: d.title,
          desc: d.desc,
          pic: d.pic,
          url: d.url
        }
      };

      db('keywords')
        .chain()
        .find({words: d.words})
        .assign(dd)
        .value();
      db.save();

      res.json({code:0, msg: '更新成功'});
    } else {
      res.json({code: -1, msg: '未知类型'});
    }
  }

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

POST_BODY:

 */
router.post('/msg', function(req, res) {
  var body = req.body;
  var msg = {};
  if (body.type === 'text') {
    msg = {
      "touser": req.query.openid,
      "msgtype":"text",
      "text": body
    }
  } else if (body.type === 'news') {
    msg = {
      "touser": req.query.openid,
      "msgtype":"news",
      "news": {
        "articles": [
          body
        ]
      }
    };
  } else {

  }

  wechat.getAccessToken(function(token) {

    unirest
      .post('https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=' + token)
      .header('Content-Type', 'application/json')
      .send(msg)
      .end(function(response) {
        res.json({code: 0, msg: '操作成功', body: response.body});
      });
  });

});


function buildXml(req, obj) {
  var xmlObj = {
    xml: {
      ToUserName: {
        "#cdata": req.body.xml.FromUserName
      },
      FromUserName: {
        "#cdata": req.body.xml.ToUserName
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


  } else if (obj.MsgType === 'news') {

    xmlObj.xml.ArticleCount = obj.ArticleCount;
    xmlObj.xml.Articles = obj.Articles;
  }

  xmlObj = xmlbuilder.create(xmlObj);

  //log.debug(xmlObj.end({pretty: true}));

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

  log.debug(arr.sort().join(',') + "," + signature);

  return shasum.digest('hex') === signature;
}

function sendSimpleMsg(req, res, msg) {
  var rxml= buildXml(req, {
    MsgType: 'text',
    Content: msg
  });

  rxml += '';
  log.debug('res: ' + rxml);
  res.end(rxml);
}

function sendSimpleNews(req, res, title, desc, pic, url) {
  var rxml = buildXml(req, {
    MsgType: 'news',
    ArticleCount: 1,
    Articles: {
      item: {
        Title: {
          "#cdata": title
        },
        Description: {
          "#cdata": desc
        },
        PicUrl: {
          "#cdata": pic
        },
        Url: {
          "#cdata": url
        }
      }
    }
  });
  rxml += '';
  log.debug('res: ' + rxml);
  res.end(rxml);

}

module.exports = router;
