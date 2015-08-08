var express = require('express');
var router = express.Router();
var Pgb = require('pg-bluebird');
process.env['DATABASE_URL'] = 'postgres://thxcqbbpfrgolx:92MMhUKaB1bD_0Ga0gwZ6LC2cs@ec2-54-83-51-0.compute-1.amazonaws.com:5432/d4fgfofmnomujs';
var pgb = new Pgb().connect(process.env.DATABASE_URL);
pgb.catch(function(err) {
	console.log('app.js::pgb ' + err);
});
var cnn;
module.exports = function () {
	router.get('/', function(req, res) {
		res.render('index', {
			title: '우리언제만나',
			user: req.user
		});		
	});
	router.get('/logout', function(req, res){
	  	req.logout();
	  	console.log('logged out!');
	  	res.redirect('/');
	});
	router.post('/room/:name', function (req, res) {
		var id = req.params.name;
		var maker = req.body.maker;
		var title = req.body.title;
		var number = req.body.number || 2;
		var password = req.body.password || null;
		pgb.then(function (connection) {
			cnn = connection;
			return cnn.client.query(
				'INSERT INTO rooms (id, maker, title, number, password) ' +
				'VALUES (' + id + ', ' + maker + ',' + title + ',' + number + ',' + password + ')'
			);
		}).then(function (result) {
			res.send(result);
		}).catch(function (err) {
			console.log('room ' + err);
		});
	});
	router.get('/rooms', function (req, res) {
		pgb.then(function (connection) {
			cnn = connection;
			return cnn.client.query(
				'SELECT * FROM rooms'
			);
		}).then(function (result) {
			res.send(result);
		}).catch(function (err) {
			console.log('rooms ' + err);
		});
	});
	router.get('/rooms/:query', function (req, res) {
		var query = req.params.query;
		pgb.then(function (connection) {
			cnn = connection;
			return cnn.client.query(
				'SELECT * FROM rooms where title = ' + query
			);
		}).then(function (result) {
			res.send(result);
		}).catch(function (err) {
			console.log('roomsq ' + err);
		});
	});
	return router;
};
