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
router.post('/join', function (req, res) {
	var id = req.body.id;
	var name = req.body.name;
	console.log('name: ' + name + ', id: '+ id);
	memberCollection.find({id: id}).toArray(function(err, docs) {
		if (err) {
			console.log('findiderror:' + err);
		} else {
			console.log('Found the following records');
			console.log(docs);
			console.log(docs.length);
			if (docs.length == 0) {
				memberCollection.insert({
					id: id,
					name: name,
					roomcount: 0
				}, function(err, res) {
					if (err) {
						console.log('joinerror:' + err);
					} else {
						process.env.MY_ID = id;
						process.env.NAME = name;
						console.log('join:' + res);
						res.send(res);
					}
				});
			} else {
				process.env.MY_ID = id;
				process.env.NAME = name;
				console.log(process.env.MY_ID);
				res.send('already joined');
			}
		}
	});
});
router.get('/rooms/:pid', function (req, res) {
	var pid = req.params.pid;
	process.env.MY_ID = pid;
	console.log('getroomlist of ' + pid);
	roomCollection.find({$or: [{maker: pid},{members: {$elemMatch: {id: pid}}}]}).toArray(function(err, docs) {
		if (err) {
			console.log('roomlisterror:' + err);
		} else {
			console.log('roomlist:');
			console.log(docs);
			res.send(docs);
		}
	});
});
router.get('/member/:pid', function (req, res) {
	var pid = req.params.pid;
	memberCollection.find({id: pid}).toArray(function(err, docs) {
		if (err) {
			console.log('membererror:' + err);
		} else {
			console.log(docs);
			res.send(docs);
		}	
	});
});
router.post('/ban/:id', function(req, res) {
	var id = req.params.id;
	var rid = req.body.rid;
	roomCollection.update({rid: rid}, {$pull: {members: {id: id}}}, function(err, res) {
		if (err) {
			console.log('ban error:' + err);
		} else {
			res.send(res);
		}	
	});
});
router.post('/confirm/:rid', function(req, res) {
	var rid = req.params.rid;
	var day = JSON.stringify(req.body.day);
	var night = JSON.stringify(req.body.night);
	var id = req.body.id;
	var bool = req.body.bool;
	roomCollection.update({rid: rid}, {'$set': {day: day, night: night}}, function(err, res) {
		if (err) {
			console.log('confirmupdatedayerror:' + err);
		} else {
			roomCollection.update({rid: rid, 'members.id': id}, {$set: {'members.$.confirm': bool}}, function(err, res) {
				if (err) {
					console.log('confirmerror:' + err);
				} else {
					res.send(res);
				}
			});
		}
	});
});

router.post('/addroom/:rid', function (req, res) {
	var rid = req.params.rid;
	var maker = req.body.maker;
	var title = req.body.title;
	var members = JSON.parse(req.body.members);
	console.log('addroom');
	console.log(maker);
	console.log(members);
	process.env.MY_ID = maker;
	process.env.NAME = members[0].name;
	var number = req.body.number || 2;
	var password = req.body.password || null;
	memberCollection.update({id: maker}, {$inc: {roomcount: 1}}, function(err, result) {
		if (err) {
			console.log('roomcounterror:' + err);
		} else {
			console.log(result);
			roomCollection.insert({rid: rid, maker: maker, password: password, title: title, members: members, number: number}, function(err, docs){
				if (err) {
					console.log('addroomerror:' + err);
				} else {
					console.log(docs);
					res.send(docs);
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
	var alreadyMember = false;
	process.env.MY_ID = pid;
	process.env.CURRENT_ROOM = rid;
	console.log('rid: ' + rid + ', pw: ' + pw);
	roomCollection.findOne({rid: rid, password: pw}, function (err, doc) {
		if (err) {
			console.log('enter room error: ' + err);
		} else {
			for (var i = 0; i < doc.members.length; i++) {
				if (doc.members[i].id == pid) {
					alreadyMember = true;
					break;
				}
			}
			if (alreadyMember) {
				process.env.CURRENT_ROOM = rid;
				console.log('enterroom result');
				console.log(doc);
				res.send(doc);
			} else {
				roomCollection.update({rid: rid}, {$push: {members: {id: pid, name: name, confirm: false}}}, function(err, result) {
					if (err) {
						console.log('enterroomaddmembererror:' + err);
					} else {
						res.send(doc);
					}
				});
			}
		}
	});
});
router.post('/enterroommaster/:rid', function(req, res) {
	var rid = req.params.rid;
	var pid = req.body.pid;
	var name = req.body.name;
	var alreadyMember = false;
	process.env.MY_ID = pid;
	process.env.CURRENT_ROOM = rid;
	roomCollection.findOne({rid: rid}, function (err, doc) {
		if (err) {
			console.log('enter room master error: ' + err);
		} else {
			for (var i = 0; i < doc.members.length; i++) {
				if (doc.members[i].id == pid) {
					alreadyMember = true;
					break;
				}
			}
			if (alreadyMember) {
				process.env.CURRENT_ROOM = rid;
				console.log('enterroom result');
				console.log(doc);
				res.send(doc);
			} else {
				roomCollection.update({rid: rid}, {$push: {members: {id: pid, name: name, confirm: false}}}, function(err, result) {
					if (err) {
						console.log('enterroomaddmembererror:' + err);
					} else {
						res.send(doc);
					}
				});
			}
		}
	});
});

router.post('/roominfo/:rid', function(req, res) {
	var rid = req.params.rid;
	roomCollection.findOne({rid: rid}).toArray(function(err, doc) {
		if (err) {
			console.log('roominfoerror:' + err);
		} else {
			process.env.CURRENT_ROOM = rid;
			console.log('roominfo result');
			console.log(doc);
			res.send(doc);
		}
	});
});
router.post('/changeroom/:rid', function(req, res) {
	var rid = req.params.rid;
	if (req.body.title) {
		var title = req.body.title;
		roomCollection.update({id: rid}, {title: title}, function(err, res) {
			if (err) {
				console.log('changeroomerror:' + err);
			} else {
				console.log(res);
				res.send(res);
			}
		});
	} else if (req.body.number) {
		var number = req.body.number;
		roomCollection.update({id: rid}, {number: number}, function(err, res) {
			if (err) {
				console.log('changeroomerror:' + err);
			} else {
				console.log(res);
				res.send(res);
			}
		});
	}
});
router.post('/deleteroom/:rid', function (req, res) {
	var rid = req.params.id;
	var maker = req.body.maker;
	roomCollection.find({rid: rid, maker: maker}).toArray(function(err, docs) {
		if (err) {
			console.log('findroomerror:' + err);
		} else if (docs.length == 0) {
			res.send('no_room');
		} else {
			memberCollection.update({id: maker}, {$inc: {roomcount: -1}}, function(err, docs) {
				if (err) {
					console.log('roomcounterror:' + err);
				} else {
					roomCollection.remove({rid: rid}, function(err, docs){
						if (err) {
							console.log('addroomerror:' + err);
						} else {
							res.send(docs);
						}
					});
				}
			});
		}
	});
	
});


router.get('/search/:query', function (req, res) {
	var query = req.params.query;
	roomCollection.find({title: {$regex: query}}).toArray(function(err, docs) {
		if (err) {
			console.log('searcherror:' + err);
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