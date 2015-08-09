/**
 * Created by Zero on 2015-07-25.
 */
wwm.model = (function () {
	function getRoomList(query) {
		var deferred = $.Deferred();
		if (query) {
			$.get('/rooms/' + query).done(function (res) {
				if (res.rows.length === 0) {
					deferred.reject('no_room');
				}
				deferred.resolve(res.rows);
			}).fail(function (err) {
				deferred.reject(err);
			});
		} else {
			$.get('/rooms').done(function (res) {
				if (res.rows.length === 0) {
					deferred.reject('no_room');
				}
				deferred.resolve(res.rows);
			}).fail(function (err) {
				deferred.reject(err);
			});
		}
		return deferred.promise();
	}
	function createRoom(data) {
		var deferred = $.Deferred();
		$.get('/member/' + data.maker).done(function(res) {
			if (res.rows[0].roomcount >= 3) {
				var msg = '방은 최대 세 개까지 만들 수 있습니다.';
				deferred.reject(msg);
			}
		}).fail(function (err) {
			console.log(err);
		});
		$.post('/addroom/' + data.maker).done(function () {
			$.post('/room/' + data.id, data).done(function(res) {
				deferred.resolve(res);
			}).fail(function (err) {
				console.log(err);
			});
		}).fail(function (err) {
			console.log(err);
		});
		return deferred.promise();
	}
	function deleteRoom() {
		var deferred = $.Deferred();
		$.post('/deleteroom/' + id).done(function (res) {
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
		deleteRoom: deleteRoom
	};
}());