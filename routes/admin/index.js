var express   = require('express');
var router    = express.Router();

var log       = require('bunyan').createLogger({name: "admin-index", streams: require('../../lib/logformat')});

/**
 * Render admin views
 * @param  {string} view    view's name

http://localhost:3000/admin/v/index

 */
router.get('/v/:view', function(req, res){

  log.debug('render: admin/' + req.params.view);

  res.render('admin/' + req.params.view);
});

module.exports = router;
