/**
 * Created by Zero on 2015-07-25.
 */
wwm.model = (function () {
	function join(data) {
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
	}
	function getRoomList(id) {
		var deferred = $.Deferred();
		$.get('/rooms/' + id).done(function (res) {
			if (res.length === 0) {
				deferred.reject('no_room');
			}
			deferred.resolve(res);
		}).fail(function (err) {
			deferred.reject(err);
		});
		return deferred.promise();
	}
	function searchList(query) {
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
	}
	function ban(id, rid) {
		var deferred = $.Deferred();
		$.post('/ban/' + id, {rid: rid}).done(function(res) {
			console.log(res);
			deferred.resolve(res);
		}).fail(function(err) {
			console.log(err);
			deferred.reject(err);
		});
		return deferred.promise();
	}
	function changeTitle(rid, title) {
		var deferred = $.Deferred();
		$.post('/changeroom/' + rid, {title: title}).done(function(res) {
			console.log(res);
			deferred.resolve(res);
		}).fail(function(err) {
			console.log(err);
			deferred.reject(err);
		});
		return deferred.promise();
	}
	function changeLimit(rid, number) {
		var deferred = $.Deferred();
		$.post('/changeroom/' + rid, {number: number}).done(function(res) {
			console.log(res);
			deferred.resolve(res);
		}).fail(function(err) {
			console.log(err);
			deferred.reject(err);
		});
		return deferred.promise();
	}
	function confirm(data) {
		var deferred = $.Deferred();
		var rid = data.rid;
		$.post('/confirm/' + rid, {day: data.day, night: data.night}).done(function(res) {
			console.log(res);
			deferred.resolve(res);
		}).fail(function(err) {
			console.log(err);
			deferred.reject(err);
		});
		return deferred.promise();
	}
	function createRoom(data) {
		var deferred = $.Deferred();
		console.log('modeldata', data);
		$.get('/member/' + data.maker).done(function(res) {
			console.log(res);
			if (res[0].roomcount >= 3) {
				var msg = '방은 최대 세 개까지 만들 수 있습니다.';
				deferred.reject(msg);
			} else {
				$.post('/addroom/' + data.rid, data).done(function () {
					deferred.resolve(res);				
				}).fail(function (err) {
					console.log(err);
					deferred.reject(err);
				});
			}
		}).fail(function (err) {
			console.log(err);
			deferred.reject(err);
		});
		return deferred.promise();
	}
	function deleteRoom(id, maker) {
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
	}
	function initModule() {
		if (localStorage.login) {
			window.userInfo = JSON.parse(localStorage.login);
		} else {
			window.userInfo = {};
		}
	}
	return {
		initModule: initModule,
		createRoom: createRoom,
		getRoomList: getRoomList,
		deleteRoom: deleteRoom,
		ban: ban,
		changeTitle: changeTitle,
		changeLimit: changeLimit,
		searchList: searchList,
		confirm: confirm,
		join: join
	};
}());
