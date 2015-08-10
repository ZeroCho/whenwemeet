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
router.get('/member/:pid', function (req, res) {
	var id = req.params.pid;
	pgb.connect(process.env.HEROKU_POSTGRESQL_AMBER_URL)
		.then(function (connection) {
			cnn = connection;
			return cnn.client.query('SELECT * FROM members WHERE id=($1)', [id]);
		}).then(function (result) {
			res.send(result);
		}).catch(function (err) {
			console.log('member ' + err);
		});
});
router.post('/ban/:id', function(req, res) {
	var id = req.params.id;
	var rid = req.body.rid;
});
router.post('/changeroom/:rid', function(req, res) {
	var rid = req.params.rid;
	if (req.body.title) {
		var key = 'title';
		var value = req.body.title;
	} else if (req.body.number) {
		var key = 'number';
		var value = req.body.number;
	}
	pgb.connect(process.env.HEROKU_POSTGRESQL_AMBER_URL)
		.then(function (connection) {
			cnn = connection;
			return cnn.client.query('UPDATE rooms SET ($1)=($2) WHERE id=($3)', [key, value, rid]);
		}).then(function (result) {
			res.send(result);
		}).catch(function (err) {
			console.log('member ' + err);
		});
});
router.post('/addroom/:rid', function (req, res) {
	var rid = req.params.rid;
	var maker = req.body.maker;
	var title = req.body.title;
	var member = JSON.stringify([maker]);
	var number = req.body.number || 2;
	var password = req.body.password || null;
	pgb.connect(process.env.HEROKU_POSTGRESQL_AMBER_URL)
		.then(function (connection) {
			cnn = connection;
			return cnn.client.query('UPDATE members SET roomcount = roomcount + 1 WHERE id=($1)', [maker]);
		})
		.then(function (result) {
			console.log(result);
			return cnn.client.query(
				'INSERT INTO rooms (rid, maker, title, number, members, password) VALUES (($1),($2),($3),($4),($5),($6))',
				[rid, maker, title, number, member, password]
			);
		})
		.then(function (result) {
			console.log(result);
			res.send(result);
		})
		.catch(function (err) {
			console.log('member ' + err);
		});
});
router.post('/deletemembers', function (req, res) {
	pgb.connect(process.env.HEROKU_POSTGRESQL_AMBER_URL)
		.then(function (connection) {
			cnn = connection;
			return cnn.client.query('DELETE FROM members');
		}).then(function (result) {
			res.send(result);
		}).catch(function (err) {
			console.log('deleteallmembers ' + err);
		});	
});
router.post('/deleterooms', function (req, res) {
	pgb.connect(process.env.HEROKU_POSTGRESQL_AMBER_URL)
		.then(function (connection) {
			cnn = connection;
			return cnn.client.query('DELETE FROM rooms');
		}).then(function (result) {
			res.send(result);
		}).catch(function (err) {
			console.log('deleteallrooms ' + err);
		});
});
router.post('/deleteroom/:rid', function (req, res) {
	var rid = req.params.id;
	var maker = req.body.maker;
	pgb.connect(process.env.HEROKU_POSTGRESQL_AMBER_URL)
		.then(function (connection) {
			cnn = connection;
			return cnn.client.query('UPDATE members SET roomcount = roomcount - 1 WHERE id=($1)', [maker]);
		}).then(function (result) {
			console.log(result);
			return cnn.client.query('DELETE FROM rooms WHERE rid=($1)', [rid]);
		}).then(function (result) {
			res.send(result);
		}).catch(function (err) {
			console.log('deleteroom ' + err);
		});
});
router.post('/join', function (req, res) {
	var id = req.body.id;
	var name = req.body.name;
	console.log('name ' + name + ' id '+ id);
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
			res.send(result);
		}).catch(function (err) {
			console.log('join ' + err);
		});
});
router.post('/enterroom/:rid', function(req, res) {
	var pw = req.body.pw;
	var rid = req.params.rid;
	console.log(pw);
	console.log(id);
	pgb.connect(process.env.HEROKU_POSTGRESQL_AMBER_URL)
		.then(function (connetion) {
			cnn = connection;
			return cnn.client.query('SELECT * FROM rooms WHERE rid=($1) AND password=($2)', [rid, pw]);
		}).then(function(result) {
			res.send(result);
		}).catch(function(err) {
			console.log('enterroom ' + err);
		});
});
router.get('/rooms/:pid', function (req, res) {
	var pid = req.params.pid;
	pgb.connect(process.env.HEROKU_POSTGRESQL_AMBER_URL)
		.then(function (connection) {
			console.log('connected');
			cnn = connection;
			return cnn.client.query('SELECT * FROM rooms WHERE maker=($1) OR members like ($2)', [pid, '%' + pid + '%']);
		}).then(function (result) {
			console.log('result');
			res.send(result);
		}).catch(function (err) {
			console.log('rooms ' + err);
		});
});
router.get('/search/:query', function (req, res) {
	var query = req.params.query;
	pgb.connect(process.env.HEROKU_POSTGRESQL_AMBER_URL)
		.then(function (connection) {
			cnn = connection;
			return cnn.client.query('SELECT * FROM rooms WHERE title LIKE ($1)', ['%' + query + '%']);
		}).then(function (result) {
			res.send(result);
		}).catch(function (err) {
			console.log('roomsq ' + err);
		});
});

module.exports = router;
