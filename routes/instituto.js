var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Chat = mongoose.model('Chat');
var Message = mongoose.model('Message');
var passport = require('passport');
var User = mongoose.model('User');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

/* GET Admin home page. */
router.get('/', function(req, res, next) {
  res.render('instituto', { title: 'Express' });

});

/* GET message jsons. */
router.get('/chats', function(req, res, next) {
  Chat.find(function(err, chats){
    if(err){ return next(err); }
	
    res.json(chats);
  });
});

module.exports = router;