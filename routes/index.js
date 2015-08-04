var express = require('express');
var router = express.Router();

module.exports = function (passport) {
	router.get('/', function(req, res, next) {
		if (req.user) {
			res.render('index', {
				title: '우리언제만나',
				user: req.user
			});
		} else {
			res.render('login', {
				title: '로그인::우리언제만나'
			});
		}
	});
	router.get('/status', function(req, res) {
		console.log(req.user);
		res.send(req.user);
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
		req.session.destroy()
	  	req.logout();
	  	console.log('logged out!')
	  	res.redirect('/');
	});
	return router;
};
