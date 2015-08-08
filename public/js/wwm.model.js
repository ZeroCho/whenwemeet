/**
 * Created by Zero on 2015-07-25.
 */
wwm.model = (function () {
	function getRoomList(query) {
		var deferred = $.Deferred();
		if (query) {
			$.get('/rooms/' + query).done(function (res) {
				deferred.resolve(res);
			}).fail(function (err) {
				deferred.reject(err);
			});
		} else {
			$.get('/rooms').done(function (res) {
				deferred.resolve(res);
			}).fail(function (err) {
				deferred.reject(err);
			});
		}
		return deferred.promise();
	}
	function createRoom(data) {
		var deferred = $.Deferred();
		$.get('/member/' + data.maker).done(function(res) {
			if (res > 3) {
				var msg = '방은 최대 세 개까지 만들 수 있습니다.';
				deferred.reject(msg);
			}
		});
		$.post('/room/' + data.id, data).done(function(res) {
			deferred.resolve(res);
		});
		return deferred.promise();
	}
	function initModule() {
		if (localStorage.login) {
			alert('로그인되어 있습니다.');
		}
	}
	return {
		initModule: initModule,
		createRoom: createRoom,
		getRoomList: getRoomList
	};
}());