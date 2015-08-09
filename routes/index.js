var express = require('express');
var router = express.Router();
var Pgb = require('pg-bluebird');
var pgb = new Pgb();
var cnn;
router.get('/', function(req, res) {
	res.render('index', {
		title: '우리언제만나',
		user: req.user
	});
});
router.get('/member/:id', function (req, res) {
	var id = req.params.id;
	pgb.connect(process.env.HEROKU_POSTGRESQL_AMBER_URL)
		.then(function (connection) {
			cnn = connection;
			return cnn.client.query('SELECT * FROM members WHERE id=($1)', [id]);
		}).then(function (result) {
			res.send(result);
		}).catch(function (err) {
			console.log('member' + err);
		});
});
router.post('/join', function (req, res) {
	var id = req.body.id;
	var name = req.body.name;
	pgb.connect(process.env.HEROKU_POSTGRESQL_AMBER_URL)
		.then(function (connection) {
			cnn = connection;
			return cnn.client.query('SELECT * FROM members WHERE id=($1)', [id]);
		})
		.then(function (result) {
			console.log('is user? ' + result.rows.length);
			if (result.rows.length === 0) {
				return cnn.client.query(
					'INSERT INTO members (id, name) VALUES (($1),($2))',
					[id , name]
				);
			}
		}).then(function (result) {
			console.log('joinresult ' + result);
			res.send(result);
		}).catch(function (err) {
			console.log('join ' + err);
		});
});
router.post('/room/:name', function (req, res) {
	var id = req.params.name;
	var maker = req.body.maker;
	var title = req.body.title;
	var number = req.body.number || 2;
	var password = req.body.password || null;
	pgb.connect(process.env.HEROKU_POSTGRESQL_AMBER_URL)
		.then(function (connection) {
		cnn = connection;
			return cnn.client.query(
				'INSERT INTO rooms (id, maker, title, number, password) VALUES (($1),($2),($3),($4),($5))',
				[id, maker, title, number, password]
			);
		}).then(function (result) {
			res.send(result);
		}).catch(function (err) {
			console.log('room ' + err);
		});
});
router.get('/rooms', function (req, res) {
	pgb.connect(process.env.HEROKU_POSTGRESQL_AMBER_URL)
		.then(function (connection) {
			console.log('connected');
			cnn = connection;
			return cnn.client.query('SELECT * FROM rooms');
		}).then(function (result) {
			console.log('result');
			res.send(result);
		}).catch(function (err) {
			console.log('rooms ' + err);
		});
});
router.get('/rooms/:query', function (req, res) {
	var query = req.params.query;
	pgb.connect(process.env.HEROKU_POSTGRESQL_AMBER_URL)
		.then(function (connection) {
			cnn = connection;
			return cnn.client.query('SELECT * FROM rooms where title=($1)', [query]);
		}).then(function (result) {
			res.send(result);
		}).catch(function (err) {
			console.log('roomsq ' + err);
		});
});

module.exports = router;