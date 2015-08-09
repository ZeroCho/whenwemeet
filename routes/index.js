var express = require('express');
var router = express.Router();
var Pgb = require('pg-bluebird');
var pgb = new Pgb();

var cnn;
module.exports = function () {
	router.get('/', function(req, res) {
		res.render('index', {
			title: '우리언제만나',
			user: req.user
		});
	});
	router.get('/member/:id', function (req, res) {
		var id = req.params.id;
		pgb.connect(process.env.DATABASE_URL).then(function (connection) {
			cnn = connection;
			return cnn.client.query(
				'SELECT * FROM members WHERE id = ' + id
			);
		}).then(function (result) {
			res.send(result);
		}).catch(function (err) {
			console.log('member' + err);
		});
	});
	router.post('/room/:name', function (req, res) {
		var id = req.params.name;
		var maker = req.body.maker;
		var title = req.body.title;
		var number = req.body.number || 2;
		var password = req.body.password || null;
		pgb.connect(process.env.DATABASE_URL).then(function (connection) {
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
		console.log('rooms' + JSON.stringify(req));
		pgb.connect(process.env.DATABASE_URL).then(function (connection) {
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
		pgb.connect(process.env.DATABASE_URL).then(function (connection) {
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