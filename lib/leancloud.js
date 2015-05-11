var config = require('../config/leancloud');
var unirest = require('unirest');
var urlencode = require('urlencode');

var obj = {
  /**
   * [create description]
   * @param  {[string]} cla class name
   * @param  {[object]} o   object
   * @param  {Function} callback
   */
  create: function(cla, o, callback){

    unirest.post('https://api.leancloud.cn/1.1/classes/' + cla)
          .header('X-AVOSCloud-Application-Id', config.id)
          .header('X-AVOSCloud-Application-Key', config.key)
          .header('Content-Type', 'application/json')
          .send(o)
          .end(function (response) {
            callback(response);
          });
  },
  select: function(cql, callback){

    cql = urlencode(cql);
    console.log(cql);
    unirest.get('https://api.leancloud.cn/1.1/cloudQuery?cql=' + cql)
          .header('X-AVOSCloud-Application-Id', config.id)
          .header('X-AVOSCloud-Application-Key', config.key)
          .end(function (response) {
            callback(response);
          });
  },
  selectByID: function(cla, id, callback){
    unirest.get('https://api.leancloud.cn/1.1/classes/' + cla + '/' + id)
          .header('X-AVOSCloud-Application-Id', config.id)
          .header('X-AVOSCloud-Application-Key', config.key)
          .end(function (response) {
            callback(response);
          });
  },
  update: function(cla, id, o, callback){
    unirest.put('https://api.leancloud.cn/1.1/classes/' + cla + '/' + id)
          .header('X-AVOSCloud-Application-Id', config.id)
          .header('X-AVOSCloud-Application-Key', config.key)
          .header('Content-Type', 'application/json')
          .send(o)
          .end(function (response) {
            callback(response);
          });
  },
  remove: function(cla, id, callback){
    unirest.delete('https://api.leancloud.cn/1.1/classes/' + cla + '/' + id)
          .header('X-AVOSCloud-Application-Id', config.id)
          .header('X-AVOSCloud-Application-Key', config.key)
          .end(function (response) {
            callback(response);
          });
  },
  sendSMS: function(phone, callback) {
    unirest.post('https://api.leancloud.cn/1.1/requestSmsCode')
          .header('X-AVOSCloud-Application-Id', config.id)
          .header('X-AVOSCloud-Application-Key', config.key)
          .header('Content-Type', 'application/json')
          .send({"mobilePhoneNumber": phone})
          .end(function (response) {
            callback(response);
          });
  },
  verifySMS: function(phone, code, callback) {
    unirest.post('https://api.leancloud.cn/1.1/verifySmsCode/' + code + '?mobilePhoneNumber=' + phone)
          .header('X-AVOSCloud-Application-Id', config.id)
          .header('X-AVOSCloud-Application-Key', config.key)
          .header('Content-Type', 'application/json')
          .end(function (response) {
            callback(response);
          });
  },
  feedback: function(contact, content, callback) {
    unirest.post('https://api.leancloud.cn/1.1/feedback')
          .header('X-AVOSCloud-Application-Id', config.id)
          .header('X-AVOSCloud-Application-Key', config.key)
          .header('Content-Type', 'application/json')
          .send({"status": "open", "content": content, "contact": contact})
          .end(function (response) {
            callback(response);
          });
  }
};

module.exports = obj;

/**
 * Example:
 *
 * var lean = require('./lib/leancloud');
 *
 * select:
 * lean.select('select * from GameScore where playerName="zkk"', function(res){ console.log(res.body); });
 *
 * insert:
 * lean.create('GameScore', {cheatMode: true, playerName: "zkk", "score": 1500}, function(res){ console.log(res.body); });
 *
 */
