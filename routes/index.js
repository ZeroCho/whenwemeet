var express = require('express');
var router = express.Router();

module.exports = function (passport) {
	router.get('/', function(req, res, next) {
	  res.render('index', {
	  	title: '우리언제만나'
	  });
	});
	router.get('/login/kakao', passport.authenticate('kakao'));
	router.get('/oauth/kakao', passport.authenticate('kakao', {
	    failureRedirect: '/'
	}), function (req, res) {
		res.send('success');
	});
	router.get('/login/facebook', passport.authenticate('facebook'));
	router.get('/oauth/facebook', passport.authenticate('facebook', {
	    failureRedirect: '/'
	}), function (req, res) {
		res.send('success');
	});
	router.get('/logout', function(req, res){
	  req.logout();
	  res.send('success');
	});
	return router;
};
