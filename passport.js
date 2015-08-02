var passport = require('passport');
var KakaoStrategy = require('passport-kakao').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
module.exports = function (app) {
	app.use(passport.initialize());
	app.use(passport.session());
	passport.serializeUser(function(user, done) {
		console.log('serialize');
		done(null, user);
	});

	passport.deserializeUser(function(id, done) {
		console.log('deserialize');
		done(null, id);
	});
	passport.use(new FacebookStrategy({
		clientID: '936431363034863',
		clientSecret: '4c24c1d1d9b4a12351d69c05a9d43213',
		callbackURL: "http://www.zeroit.info/oauth/facebook"
	}, function(accessToken, refreshToken, profile, done) {
		// asynchronous verification, for effect...
		process.nextTick(function () {
			console.log("accessToken: " + accessToken);
			// To keep the example simple, the user's Facebook profile is returned to
			// represent the logged-in user.  In a typical application, you would want
			// to associate the Facebook account with a user record in your database,
			// and return that user instead.
			return done(null, profile);
		});
	}));

	passport.use(new KakaoStrategy({    
		clientID : 'bd5a25909c1a4e32759f75a44b9abc45',
		callbackURL : 'http://whenwemeet.herokuapp.com/oauth/kakao'
	}, function(accessToken, refreshToken, profile, done){
		console.log("accessToken: " + accessToken);

		process.nextTick(function () {
			return done(null, profile);
		});
	}));
	return passport;
}