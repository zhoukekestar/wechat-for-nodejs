
var key = 'ckKU7P4FwB4PBZQlnB9hfBAcaKZMeUge';

console.log(Math.random() * 100000 * 100000);
function getSign(appid, secretid, expire, timestamp, userid, fileid) {
  var r = '270494647';
  var crypto = require('crypto');

  var signStr = 'a=' + appid +
                '&k=' + secretid +
                '&e=' + expire +
                '&t=' + timestamp +
                '&r=' + r +
                '&u=' + userid +
                '&f=' + fileid;
  var sha = crypto.createHmac('sha1', key);
  sha.update(signStr);

  var buf1 = new Buffer(sha.digest());
  var buf2 = new Buffer(signStr);
  var buf = new Buffer(buf1.length + buf2.length);
  buf1.copy(buf, 0);
  buf2.copy(buf, buf1.length);

  return buf.toString('base64');

}

// For qcloud:
// @see http://wiki.qcloud.com/wiki/%E9%89%B4%E6%9D%83%E6%9C%8D%E5%8A%A1%E6%8A%80%E6%9C%AF%E6%96%B9%E6%A1%88.

// test:
// console.log(getSign('2011541224', 'AKID2ZkOXFyDRHZRlbPo93SMtzVY79kpAdGP','1432970065', '1427786065', '123456', ''));
// console.log(getSign('2011541224', 'AKID2ZkOXFyDRHZRlbPo93SMtzVY79kpAdGP','0', '1427786065', '123456', '442d8ddf-59a5-4dd4-b5f1-e38499fb33b4'));


// Example
// Authorization:QCloud 7tAmReZYPA07HIBk61hRwKVfq6VhPTIwMDg5NSZrPUFLSURaUWgxYmdWT2hVem9kSUo3aVd4VDU5ZHpOcFZKbE1NNSZlPTE0MzI5NzAwNjUmdD0xNDMwMTIxMTg4JnI9MjcwNDk0NjQ3JnU9MTIzNDU2JmY9

// Content-Type:multipart/form-data; boundary=----WebKitFormBoundaryDYwC6zAt18yjRMXm
// Content-Disposition: form-data; name="FileContent"; filename="Tulips.jpg"

// Already:
// http://200895.image.myqcloud.com/200895/123456/ca7da6bc-40d2-4d8b-91df-1b281464d9a5/original

