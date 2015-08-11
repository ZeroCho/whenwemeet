/**
 * Created by Zero on 2015-07-25.
 */
wwm.model = (function () {
	function getRoomList(id) {
		var deferred = $.Deferred();
		$.get('/rooms/' + id).done(function (res) {
			if (res.rows.length === 0) {
				deferred.reject('no_room');
			}
			deferred.resolve(res.rows);
		}).fail(function (err) {
			deferred.reject(err);
		});
		return deferred.promise();
	}
	function searchList(query) {
		var deferred = $.Deferred();
		$.get('/search/' + query).done(function (res) {
			if (res.rows.length === 0) {
				deferred.reject('no_room');
			}
			deferred.resolve(res.rows);
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
		$.get('/member/' + data.maker).done(function(res) {
			console.log(res);
			if (res.rows[0].roomcount >= 3) {
				var msg = '방은 최대 세 개까지 만들 수 있습니다.';
				deferred.reject(msg);
			} else {
				$.post('/addroom/' + data.maker, data).done(function () {
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
			deferred.resolve(res);
		}).fail(function(err){
			deferred.reject(err);
		});
		return deferred.promise();
	}
	function initModule() {
		if (localStorage.login) {
			window.userInfo = JSON.parse(localStorage.login);
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
		confirm: confirm
	};
}());
