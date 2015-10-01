var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var res;
var errorHandler = function (err) {
	console.error(err);
	res.send(err);
};
module.exports = function (db) {
	var memberCollection = db.collection('members');
	var roomCollection = db.collection('rooms');
	router.get('/', function (req, res) {
		res.render('index', {
			title: '우리언제만나'
		});
	});
	router.get('/lobby/:id', function (req, res) {
		var id = req.params.id;
		res.render('index', {
			title: '우리언제만나',
			id: id
		});
	});
	router.get('/login', function (req, res) {
		res.render('index', {
			title: '우리언제만나'
		});
	});
	router.get('/search', function (req, res) {
		res.render('index', {
			title: '우리언제만나'
		});
	});
	router.get('/search/:query', function (req, res) {
		var query = req.params.query;
		res.render('index', {
			title: '우리언제만나::검색?' + query,
			query: query,
			mod: 'search'
		});
	});
	router.get('/room/:rid', function (req, res) {
		var rid = req.params.rid;
		res.render('index', {
			title: '우리언제만나::Room#' + rid,
			mod: 'room',
			rid: rid
		});
	});
	router.get('/result/:rid', function (req, res) {
		var rid = req.params.rid;
		res.render('index', {
			title: '우리언제만나::Result#' + rid,
			mod: 'room',
			rid: rid
		});
	});
	router.post('/join', function (req, res) {
		var id = req.body.id;
		var name = req.body.name;
		var picture = req.body.picture;
		console.log('name: ' + name + ', id: ' + id + ', picture: ' + picture);
		memberCollection.updateOne({
			id: id
		}, {
			$set: {name: name, picture: picture}, $setOnInsert: {id: id, roomcount: 0}
		}, {
			upsert: true
		}).then(function (r) {
			console.log('join success:');
			res.send(r);
		}).catch(errorHandler);
	});
	router.get('/rooms/:pid', function (req, res) {
		var pid = req.params.pid;
		console.log('getroomlist of ' + pid);
		roomCollection.find({
			$or: [{maker: pid}, {members: {$elemMatch: {id: pid}}}]
		}).toArray().then(function (docs) {
			console.log('room list result: ' + docs[0]);
			res.send(docs);
		}).catch(errorHandler);
	});
	router.get('/member/:pid', function (req, res) {
		var pid = req.params.pid;
		memberCollection.findOne({id: pid}).then(function (doc) {
			console.log(doc);
			res.send(doc);
		}).catch(errorHandler);
	});
	router.post('/ban/:id', function (req, res) {
		var id = req.params.id;
		var rid = req.body.rid;
		roomCollection.updateOne({rid: rid}, {$push: {ban: id}, $pull: {members: {id: id}}}).then(function (r) {
			res.send(r);
		}).catch(errorHandler);
	});
	router.post('/confirm/:rid', function (req, res) {
		var rid = String(req.params.rid);
		var day = JSON.parse(req.body.day);
		var night = JSON.parse(req.body.night);
		var id = String(req.body.id);
		var bool = JSON.parse(req.body.bool);
		console.log('confirm ' + rid + ' ' + id + ' ' + bool);
		console.log(day);
		console.log(night);
		roomCollection.updateOne({
			'rid': rid, 'members.id': id
		}, {
			$set: {'day': day, 'night': night, 'members.$.confirm': bool}
		}).then(function (r) {
			res.send(r);
		}).catch(errorHandler);
	});
	router.post('/report', function (req, res) {
		var id = req.body.id;
		var name = req.body.name;
		var rid = req.body.rid;
		var title = req.body.title;
		var content = req.body.content;
		var date = req.body.date;
		var smtpTransport = nodemailer.createTransport({
			service: 'Gmail',
			auth: {
				user: 'zerohch0@gmail.com',
				pass: 'pswdofzer0'
			}
		});
		var mailOptions = {
			from: 'WhenWeMeet <zerohcho0@gmail.com>',
			to: 'zerohch0@gmail.com',
			subject: title,
			html: '<h2>id: ' + id + ' name: ' + name + '</h2><h3>rid: ' + rid + '</h3><h4>' + date + '</h4>' + '<p>' + content + '</p>'
		};
		smtpTransport.sendMail(mailOptions, function (error, info) {
			if (error) {
				console.log(error);
			} else {
				res.send("Message sent : " + info.response);
			}
		});
	});
	router.post('/addroom/:rid', function (req, res) {
		var rid = req.params.rid;
		var maker = req.body.maker;
		var title = req.body.title;
		var members = JSON.parse(req.body.members);
		var limit = req.body.limit;
		var password = req.body.password;
		var picture = req.body.picture;
		memberCollection.updateOne({'id': maker}, {'$inc': {'roomcount': 1}}).then(function () {
			return roomCollection.insertOne({
				'rid': rid,
				'maker': maker,
				'picture': picture,
				'password': password,
				'title': title,
				'members': members,
				'limit': limit,
				'day': null,
				'night': null
			});
		}).then(function (r) {
			console.log('addroom success');
			res.send(r);
		}).catch(errorHandler);
	});
	router.post('/enterroom/:rid', function (req, res) {
		var rid = req.params.rid;
		var pw = req.body.pw || null;
		var pid = req.body.pid;
		var name = req.body.name;
		var picture = req.body.picture;
		var room;
		roomCollection.findOne({rid: rid}).then(function (doc) {
			room = doc;
			var i, alreadyMember = false;
			var number = doc.members.length;
			if (doc === null) {
				res.send('no_room');
				return;
			}
			if (Array.isArray(doc.ban)) {
				for (i = 0; i < doc.ban.length; i++) {
					if (doc.ban[i] === pid) {
						res.send('ban');
						return;
					}
				}
			}
			for (i = 0; i < number; i++) {
				if (doc.members[i].id.toString() === pid.toString()) {
					alreadyMember = true;
					break;
				}
			}
			if (alreadyMember) {
				console.log('enterroom result' + doc);
				res.send(doc);
			} else {
				console.log(number + ' ' + doc.limit);
				if (doc.limit === number) {
					res.send('full');
					return;
				}
				if (doc.password !== '' && doc.password !== pw) {
					res.send('wrong_password');
					return;
				}
				return roomCollection.updateOne({rid: rid}, {
					$push: {
						members: {
							id: pid,
							name: name,
							picture: picture,
							confirm: false
						}
					}
				});
			}
		}).then(function () {
			console.log('adding a member to room');
			room.members.push({
				id: pid,
				name: name,
				picture: picture,
				confirm: false
			});
			res.send(room);
		}).catch(errorHandler);
	});
	router.post('/roominfo/:rid', function (req, res) {
		var rid = req.params.rid;
		roomCollection.findOne({rid: rid}).then(function (doc) {
			if (doc === null) {
				res.send('no_room');
				return;
			}
			console.log('roominfo result');
			console.log(doc);
			res.send(doc);
		}).catch(errorHandler);
	});
	router.post('/changeroom/:rid', function (req, res) {
		var rid = req.params.rid;
		var title, limit;
		if (req.body.title) {
			title = req.body.title;
			roomCollection.updateOne({rid: rid}, {$set: {title: title}}).then(function (result) {
				console.log(result);
				res.send(result);
			}).catch(errorHandler);
		} else if (req.body.limit) {
			limit = req.body.limit;
			roomCollection.updateOne({rid: rid}, {$set: {limit: limit}}).then(function (result) {
				console.log(result);
				res.send(result);
			}).catch(errorHandler);
		}
	});
	router.post('/introdone/:id', function (req, res) {
		var id = req.params.id;
		memberCollection.updateOne({id: id}, {$set: {first: false}}).then(function (result) {
			console.log(result);
			res.send(result);
		}).catch(errorHandler);
	});
	router.post('/deleteroom/:rid', function (req, res) {
		var rid = req.params.rid;
		var maker = req.body.maker;
		roomCollection.findOne({rid: rid, maker: maker}).then(function (doc) {
			if (doc === null) {
				res.send('no_room');
			} else {
				return memberCollection.updateOne({id: maker}, {$inc: {roomcount: -1}});
			}
		}).then(function () {
			return roomCollection.deleteOne({rid: rid});
		}).then(function (r) {
			res.send(r);
		}).catch(errorHandler);
	});
	router.post('/search/:query', function (req, res) {
		var query = req.params.query;
		roomCollection.find({title: {$regex: query}}).toArray().then(function (docs) {
			console.log('search result:' + docs[0]);
			res.send(docs);
		}).catch(errorHandler);
	});
	// for debugging
	router.get('/getallmembers', function (req, res) {
		memberCollection.find({}).toArray().then(function (docs) {
			console.log(docs);
			res.send(docs);
		}).catch(errorHandler);
	});
	router.get('/getallrooms', function (req, res) {
		roomCollection.find({}).toArray().then(function (docs) {
			console.log(docs);
			res.send(docs);
		}).catch(errorHandler);
	});
	router.post('/deletemembers', function (req, res) {
		memberCollection.deleteMany({}).then(function (docs) {
			console.log(docs);
			res.send(docs);
		}).catch(errorHandler);
	});
	router.post('/deleterooms', function (req, res) {
		roomCollection.deleteMany({}).then(function (docs) {
			console.log(docs);
			res.send(docs);
		}).catch(errorHandler);
	});
	return router;
};