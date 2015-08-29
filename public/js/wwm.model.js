/**
 * Created by Zero on 2015-07-25.
 */
wwm.model = (function () {
	var join = function(data) {
		var deferred = $.Deferred();
		$.ajax('/join', {
			data: data,
			type: 'post',
			contentType: 'application/x-www-form-urlencoded;charset=utf-8'
		}).done(function(res) {
			deferred.resolve(res);
		}).fail(function(err) {
			deferred.reject(err);
		});
		return deferred.promise();
	};
	var getRoomList = function(id) {
		var deferred = $.Deferred();
		$.get('/rooms/' + id).done(function (res) {
			if (res.length === 0) {
				deferred.reject('no_room');
			} else {
				deferred.resolve(res);	
			}
		}).fail(function (err) {
			deferred.reject(err);
		});
		return deferred.promise();
	};
	var getUser = function(id) {
		var deferred = $.Deferred();
		$.get('/member/' + id).done(function (res) {
			deferred.resolve(res);
		}).fail(function(err) {
			deferred.reject(err);
		});
		return deferred.promise();
	};
	var searchList = function(query) {
		var deferred = $.Deferred();
		$.get('/search/' + query).done(function (res) {
			if (res.length === 0) {
				deferred.reject('no_room');
			}
			deferred.resolve(res);
		}).fail(function (err) {
			deferred.reject(err);
		});
		return deferred.promise();
	};
	var banPerson = function(id, rid) {
		var deferred = $.Deferred();
		$.post('/ban/' + id, {rid: rid}).done(function(res) {
			console.log(res);
			deferred.resolve(res);
		}).fail(function(err) {
			console.log(err);
			deferred.reject(err);
		});
		return deferred.promise();
	};
	var enterRoom = function() {

	};
	var changeTitle = function(rid, title) {
		var deferred = $.Deferred();
		$.post('/changeroom/' + rid, {title: title}).done(function(res) {
			console.log(res);
			deferred.resolve(res);
		}).fail(function(err) {
			console.log(err);
			deferred.reject(err);
		});
		return deferred.promise();
	};
	var changeLimit = function(rid, limit) {
		var deferred = $.Deferred();
		$.post('/changeroom/' + rid, {limit: limit}).done(function(res) {
			console.log(res);
			deferred.resolve(res);
		}).fail(function(err) {
			console.log(err);
			deferred.reject(err);
		});
		return deferred.promise();
	};
	var confirm = function(data) {
		var deferred = $.Deferred();
		var rid = data.rid;
		data.day = JSON.stringify(data.day);
		data.night = JSON.stringify(data.night);
		$.post('/confirm/' + rid, data).done(function(res) {
			console.log(res);
			deferred.resolve(res);
		}).fail(function(err) {
			console.log('confirmerror', err);
			deferred.reject(err);
		});
		return deferred.promise();
	};
	var createRoom = function(data) {
		var deferred = $.Deferred();
		var userPromise = getUser(data.maker);
		userPromise.done(function(res) {
			if (res.roomcount >= 3) {
				var msg = '방은 최대 세 개까지 만들 수 있습니다.';
				deferred.reject(msg);
			} else {
				$.post('/addroom/' + data.rid, data).done(function (r) {
					deferred.resolve(r);				
				}).fail(function (err) {
					console.log(err);
					deferred.reject(err);
				});
			}
		});
		userPromise.fail(function (err) {
			console.log(err);
			deferred.reject(err);
		});
		return deferred.promise();
	};
	var deleteRoom = function(id, maker) {
		var deferred = $.Deferred();
		$.post('/deleteroom/' + id, {maker: maker}).done(function (res) {
			console.log(res);
			if (res === 'no_room') {
				var msg = '심각한 오류! 방장이 아닙니다.';
				deferred.reject(msg);
			}
			deferred.resolve(res);
		}).fail(function(err){
			deferred.reject(err);
		});
		return deferred.promise();
	};
	var initModule = function() {
		if (localStorage.login) {
			window.userInfo = JSON.parse(localStorage.login);
		} else {
			window.userInfo = {};
		}
	};
	return {
		initModule: initModule,
		createRoom: createRoom,
		getRoomList: getRoomList,
		getUser: getUser,
		enterRoom: enterRoom,
		deleteRoom: deleteRoom,
		ban: banPerson,
		changeTitle: changeTitle,
		changeLimit: changeLimit,
		searchList: searchList,
		confirm: confirm,
		join: join
	};
}());