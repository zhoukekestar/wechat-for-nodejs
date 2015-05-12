var express     = require('express');
var path        = require('path');
var favicon     = require('serve-favicon');
var logger      = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser  = require('body-parser');

var app = express();

// set view path
app.set('views', path.join(__dirname, 'views'));

// set view engine
require('./lib/viewEngine')(app);
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use('/',          require('./routes/index'));
app.use('/users',     require('./routes/users'));
app.use('/user',      require('./routes/user/index'));

app.use('/wechat/robot',  require('./routes/wechat/robot'));
app.use('/wechat/auth',   require('./routes/wechat/auth'));
app.get('/wechat', function(req, res) {
  console.log("" + req.headers.host + req.url);
  res.render('wechat/wechat', {wx: req});
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.listen(3000);
//module.exports = app;
