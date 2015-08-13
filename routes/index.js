var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://zerocho:Wpfhsms0!@ds031873.mongolab.com:31873/heroku_lhdjlrwx';
var db, memberCollection, roomCollection;
MongoClient.connect(url, function(err, database) {
	if (err) {
		console.error(err);
	} else {
		console.log("Connected correctly to server");
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
	roomCollection.find({rid: rid}).toArray(function(err, docs) {
		if (err) {
			console.log('findroomerror:' + err);
		} else {
			var members = docs[0].members.indexOf(id);
			docs[0].members.splice(members, 1);
			roomCollection.update({rid: rid}, {members: docs[0].members}).toArray(function(err, res) {
				if (err) {
					console.log('findroomerror:' + err);
				} else {
					res.send(res);
				}	
			});
		}	
	});
});
router.post('/confirm/:rid', function(req, res) {
	var rid = req.params.rid;
	var day = JSON.stringify(req.body.day);
	var night = JSON.stringify(req.body.night);
	roomCollection.update({rid: rid}, {day: day, night: night}).toArray(function(err, res) {
		if (err) {
			console.log('confirmerror:' + err);
		} else {
			res.send(res);
		}
	});
});
router.post('/changeroom/:rid', function(req, res) {
	var rid = req.params.rid;
	if (req.body.title) {
		var title = req.body.title;
		roomCollection.update({id: rid}, {title: title}).toArray(function(err, res) {
			if (err) {
				console.log('changeroomerror:' + err);
			} else {
				console.log(res);
				res.send(res);
			}
		});
	} else if (req.body.number) {
		var number = req.body.number;
		roomCollection.update({id: rid}, {number: number}).toArray(function(err, res) {
			if (err) {
				console.log('changeroomerror:' + err);
			} else {
				console.log(res);
				res.send(res);
			}
		});
	}
});
router.post('/addroom/:rid', function (req, res) {
	var rid = req.params.rid;
	var maker = req.body.maker;
	var title = req.body.title;
	var members = [maker];
	var number = req.body.number || 2;
	var password = req.body.password || null;
	memberCollection.update({id: maker}, {$inc: {roomcount: 1}).toArray(function(err, docs) {
		if (err) {
			console.log('roomcounterror:' + err);
		} else {
			roomCollection.insert({rid: rid, maker: maker, title: title, members: members, number: number}).toArray(function(err, docs){
				if (err) {
					console.log('addroomerror:' + err);
				} else {
					res.send(docs);
				}
			});
		}
	});
});

router.post('/deleteroom/:rid', function (req, res) {
	var rid = req.params.id;
	var maker = req.body.maker;
	memberCollection.update({id: maker}, {$inc: {roomcount: -1}).toArray(function(err, docs) {
		if (err) {
			console.log('roomcounterror:' + err);
		} else {
			roomCollection.remove({rid: rid}).toArray(function(err, docs){
				if (err) {
					console.log('addroomerror:' + err);
				} else {
					res.send(docs);
				}
			});
		}
	});
});
router.post('/join', function (req, res) {
	var id = req.body.id;
	var name = req.body.name;
	console.log('name ' + name + ' id '+ id);
	memberCollection.find({id: id}).toArray(function(err, docs) {
		if (err) {
			console.log('findiderror:' + err);
		} else {
			console.log("Found the following records");
			console.log(docs);
			if (docs.length > 0) {
				memberCollection.insert({
					id: id,
					name: name,
					roomcount: 0
				}).toArray(function(err, res) {
					if (err) {
						console.log('joinerror:' + err);
					} else {
						console.log(res);
						res.send(res);
					}
				});
			} else {
				res.send('already joined');
			}
		}
	});
});
router.post('/enterroom/:rid', function(req, res) {
	var pw = req.body.pw || '';
	var rid = req.params.rid;
	console.log(rid ,pw);
	roomCollection.find({rid: rid, pw: pw}).toArray(function(err, docs) {
		if (err) {
			console.log('enterroomerror:' + err);
		} else {
			console.log(docs);
			res.send(docs);
		}
	});
});
router.get('/rooms/:pid', function (req, res) {
	var pid = req.params.pid;
	roomCollection.find({ $or: [{maker: pid}],[{members: {$regex: pid}}]}).toArray(function(err, docs) {
		if (err) {
			console.log('roomlisterror:' + err);
		} else {
			console.log(docs);
			res.send(docs);
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
