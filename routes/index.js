var express = require('express');
var router = express.Router();

module.exports = function (passport) {
	router.get('/', function(req, res, next) {
		res.render('index', {
			title: '우리언제만나',
			user: req.user
		});		
	});
	router.get('/login/kakao', passport.authenticate('kakao'));
	router.get('/oauth/kakao', passport.authenticate('kakao', {
	    failureRedirect: '/'
	}), function (req, res) {
		console.log('kakao login success!');
		res.redirect('/');
	});
	router.get('/login/facebook', passport.authenticate('facebook'));
	router.get('/oauth/facebook', passport.authenticate('facebook', {
	    failureRedirect: '/'
	}), function (req, res) {
		console.log('facebook login success!');
		res.redirect('/');
	});
	router.get('/logout', function(req, res){
	  	req.logout();
	  	console.log('logged out!');
	  	res.redirect('/');
	});
	router.get('/room/:name', function (req, res) {

	});
	return router;
};
