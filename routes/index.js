var express = require('express');
var router = express.Router();
var pg = require('pg');

module.exports = function () {
	router.get('/', function(req, res) {
		res.render('index', {
			title: '우리언제만나',
			user: req.user
		});		
	});
	router.get('/member/:id', function (req, res) {
		var id = req.params.id;
		pg.connect(process.env.DATABASE_URL, function (err, client, done) {
			if (err) {
				return console.error('error fetching client from pool', err);
			}
			client.query('SELECT * FROM members WHERE id = ' + id, function (err, result) {
				done();
				if (err) {
					return console.error('error running query', err);
				}
				res.send(result.rows);
			});
		});
	});
	router.post('/room/:name', function (req, res) {
		var id = req.params.name;
		var maker = req.body.maker;
		var title = req.body.title;
		var number = req.body.number || 2;
		var password = req.body.password || null;
		pg.connect(process.env.DATABASE_URL, function (err, client, done) {
			if (err) {
				return console.error('error fetching client from pool', err);
			}
			client.query(
				'INSERT INTO rooms (id, maker, title, number, password) ' +
				'VALUES (' + id + ', ' + maker + ',' + title + ',' + number + ',' + password + ')',
			function(err, result) {
				done();
				if (err) {
					return console.error('error running query', err);
				}
				res.send(result.rows);
			});
		});
	});
	router.get('/rooms', function (req, res) {
		pg.connect(process.env.DATABASE_URL, function (err, client, done) {
			if (err) {
				return console.error('error fetching client from pool', err);
			}
			client.query('SELECT * FROM rooms', function(err, result) {
				done();
				if (err) {
					return console.error('error running query', err);
				}
				res.send(result.rows);
			});
		});
	});
	router.get('/rooms/:query', function (req, res) {
		var query = req.params.query;
		pg.connect(process.env.DATABASE_URL, function (err, client, done) {
			if (err) {
				return console.error('error fetching client from pool', err);
			}
			client.query('SELECT * FROM rooms where title = ' + query, function(err, result) {
				done();
				if (err) {
					return console.error('error running query', err);
				}
				res.send(result.rows);
			});
		});
	});
	return router;
};
