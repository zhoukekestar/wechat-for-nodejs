module.exports = {
  token: "wx123",                                               // 微信自动回复消息的token
  url: 'http://223.95.81.53/wechat/robot',                      // 微信自动回复url
  basecallback: 'http://223.95.81.53/wechat/auth/base/callback',// 用户授权回调地址，基础授权
  infocallback: 'http://223.95.81.53/wechat/auth/info/callback',// 用户授权回调地址，信息授权
  appID: 'wx7d7b73a6b545f4d4',
  appsecret: 'e3ececf744f04f0eea10a15939388e21'
};
