var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://zero:Wpfhsms0!@ds031873.mongolab.com:31873/heroku_lhdjlrwx';
var db, memberCollection, roomCollection;
MongoClient.connect(url, function(err, database) {
	if (err) {
		console.error('connectionerror:' + err);
	} else {
		console.log("index.js:Connected correctly to server");
		db = database;
		memberCollection = db.collection('members');
		roomCollection = db.collection('rooms');
	}
});

router.get('/', function(req, res) {
	res.render('index', {
		title: '우리언제만나'
	});
});
router.get('/lobby/:id', function(req, res) {
	var id = req.params.id;
	res.render('index', {
		title: '우리언제만나',
		id: id
	});
});
router.get('/debug', function(req, res) {
	res.render('debug', {
		title: 'Debug Mod'
	});	
});
router.get('/login', function(req, res) {
	res.render('debug', {
		title: '우리언제만나'
	});
});
router.get('/search/:query', function(req, res) {
	var query = req.params.query;
	res.render('index', {
		title: '우리언제만나::검색?' + query,
		query: query,
		mod: 'search'
	});
});
router.get('/room/:rid', function(req, res) {
	var rid = req.params.rid;
	res.render('index', {
		title: '우리언제만나::Room#' + rid,
		mod: 'room',
		rid: rid
	});
});
router.get('/result/:rid', function(req, res) {
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
	console.log('name: ' + name + ', id: '+ id + ', picture: ' + picture);
	memberCollection.update({
		id: id
	}, {
		$set: {name: name, picture: picture}, $setOnInsert: {id: id, roomcount: 0}
	}, {
		upsert: true
	}, function(err, r) {
		if (err) {
			console.log('joinerror:' + err);
		} else {
			process.env.MY_ID = id;
			process.env.NAME = name;
			console.log('join success:');
			res.send(r);
		}
	});
});
router.get('/rooms/:pid', function (req, res) {
	var pid = req.params.pid;
	process.env.MY_ID = pid;
	console.log('getroomlist of ' + pid);
	roomCollection.find({
		$or: [{maker: pid}, {members: {$elemMatch: {id: pid}}}]
	}).toArray(function(err, docs) {
		if (err) {
			console.log('room list error:' + err);
		} else {
			console.log('room list result: ' + docs[0]);
			res.send(docs);
		}
	});
});
router.get('/member/:pid', function (req, res) {
	var pid = req.params.pid;
	memberCollection.findOne({id: pid}, function(err, doc) {
		if (err) {
			console.log('membererror:' + err);
		} else {
			console.log(doc);
			res.send(doc);
		}	
	});
});
router.post('/ban/:id', function(req, res) {
	var id = req.params.id;
	var rid = req.body.rid;
	roomCollection.update({rid: rid}, {$push: {ban: id}, $pull: {members: {id: id}}}, function(err, r) {
		if (err) {
			console.log('ban error:' + err);
		} else {
			res.send(r);
		}	
	});
});
router.post('/confirm/:rid', function(req, res) {
	var rid = String(req.params.rid);
	var day = JSON.parse(req.body.day);
	var night = JSON.parse(req.body.night);
	var id = String(req.body.id);
	var bool = JSON.parse(req.body.bool);
	console.log('confirm ' + rid + ' ' + id + ' ' + bool);
	console.log(day);
	console.log(night);
	roomCollection.update({
		'rid': rid, 'members.id': id
	}, {
		$set: {'day': day, 'night': night, 'members.$.confirm': bool}
	}, function(err, r) {
		if (err) {
			console.log('confirm error:' + err);
		} else {
			res.send(r);
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
	process.env.MY_ID = maker;
	process.env.NAME = members[0].name;
	memberCollection.update({'id': maker}, {'$inc': {'roomcount': 1}}, function(err) {
		if (err) {
			console.log('roomcounterror:' + err);
		} else {
			roomCollection.insertOne({
				'rid': rid, 'maker': maker, 'picture': picture, 'password': password, 'title': title, 'members': members, 'limit': limit, 'day': null, 'night': null
			}, function(err, r){
				if (err) {
					console.log('addroomerror:' + err);
				} else {
					console.log('addroom success');
					res.send(r);
				}
			});
		}
	});
});
router.post('/enterroom/:rid', function(req, res) {
	var rid = req.params.rid;
	var pw = req.body.pw || null;
	var pid = req.body.pid;
	var name = req.body.name;
	var picture = req.body.picture;
	var enterRoomCallback = function(err, doc) {
		var i, alreadyMember = false;
		if (err) {
			console.error('enterroom: find room error!');
			console.log(err);
		} else {
			if (doc === null) {
				res.send('no_room');
				return;
			}
			if (Array.isArray(doc.ban)) {
				for (i = 0; i < doc.ban.length; i++) {
					if (doc.ban[i] == pid) {
						res.send('ban');
						return;
					}
				}
			}
			for (i = 0; i < doc.members.length; i++) {
				if (doc.members[i].id == pid) {
					alreadyMember = true;
					break;
				}
			}
			if (alreadyMember) {
				process.env.CURRENT_ROOM = rid;
				console.log('enterroom result' + doc);
				res.send(doc);
			} else {
				console.log(doc);
				console.log('password ' +  doc.password + ' ' + (doc.password == null));
				if (doc.password !== '' && doc.password !== pw) {
					res.send('wrong_password');
					return;
				}
				roomCollection.update({rid: rid}, {
					$push: {
						members: {
							id: pid,
							name: name,
							picture: picture,
							confirm: false
						}
					}
				}, function (err) {
					if (err) {
						console.log('enterroomaddmembererror:' + err);
					} else {
						console.log('adding a member to room');
						res.send(doc);
					}
				});
			}
		}
	};
	process.env.MY_ID = pid;
	process.env.CURRENT_ROOM = rid;
	console.log('enterroom rid: ' + rid + ', pw: ' + pw);
	roomCollection.findOne({rid: rid}, enterRoomCallback);
});

router.post('/roominfo/:rid', function(req, res) {
	var rid = req.params.rid;
	roomCollection.findOne({rid: rid}, function(err, doc) {
		if (err) {
			console.log('roominfoerror:' + err);
		} else {
			if (doc === null) {
				res.send('no_room');
				return;
			}
			process.env.CURRENT_ROOM = rid;
			console.log('roominfo result');
			console.log(doc);
			res.send(doc);
		}
	});
});
router.post('/changeroom/:rid', function(req, res) {
	var rid = req.params.rid;
	var title, limit;
	if (req.body.title) {
		title = req.body.title;
		roomCollection.update({rid: rid}, {$set: {title: title}}, function(err, result) {
			if (err) {
				console.log('changeroomerror:' + err);
			} else {
				console.log(result);
				res.send(result);
			}
		});
	} else if (req.body.limit) {
		limit = req.body.limit;
		roomCollection.update({rid: rid}, {$set: {limit: limit}}, function(err, result) {
			if (err) {
				console.log('changeroomerror:' + err);
			} else {
				console.log(result);
				res.send(result);
			}
		});
	}
});
router.post('/introdone/:id', function(req, res) {
	var id = req.params.id;
	memberCollection.update({id: id}, {$set: {first: false}}, function(err, result) {
		if (err) {
			console.log('introdone:' + err);
		} else {
			console.log(result);
			res.send(result);
		}
	});
});
router.post('/deleteroom/:rid', function (req, res) {
	var rid = req.params.rid;
	var maker = req.body.maker;
	roomCollection.findOne({rid: rid, maker: maker}, function(err, doc) {
		if (err) {
			console.log('findroomerror:' + err);
		} else if (doc === null) {
			res.send('no_room');
		} else {
			memberCollection.update({id: maker}, {$inc: {roomcount: -1}}, function(err) {
				if (err) {
					console.log('roomcounterror:' + err);
				} else {
					roomCollection.remove({rid: rid}, function(err, r){
						if (err) {
							console.log('addroomerror:' + err);
						} else {
							res.send(r);
						}
					});
				}
			});
		}
	});
	
});


router.post('/search/:query', function (req, res) {
	var query = req.params.query;
	roomCollection.find({title: {$regex: query}}).toArray(function(err, docs) {
		if (err) {
			console.log('searcherror:' + err);
		} else {
			console.log('search result:' + docs[0]);
			res.send(docs);
		}
	});
});
// for debugging
router.get('/getallmembers', function(req ,res) {
	memberCollection.find({}).toArray(function(err, docs) {
		if (err) {
			console.log('getallmembererror:' + err);
		} else {
			console.log(docs);
			res.send(docs);
		}
	});
});
router.get('/getallrooms', function(req ,res) {
	roomCollection.find({}).toArray(function(err, docs) {
		if (err) {
			console.log('getallroomerror:' + err);
		} else {
			console.log(docs);
			res.send(docs);
		}
	});
});
router.post('/deletemembers', function (req, res) {
	memberCollection.remove({}).toArray(function(err, docs) {
		if (err) {
			console.log('deleteallmembererror:' + err);
		} else {
			console.log(docs);
			res.send(docs);
		}
	});
});
router.post('/deleterooms', function (req, res) {
	roomCollection.remove({}).toArray(function(err, docs) {
		if (err) {
			console.log('deleteallroomerror:' + err);
		} else {
			console.log(docs);
			res.send(docs);
		}
	});
});
module.exports = router;
