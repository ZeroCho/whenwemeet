/**
 * Created by Zero on 2015-07-25.
 */
wwm.model = (function () {
	function getRoomList(query) {
		if (query) {

		}
	}
	function createRoom(data) {
		var deferred = $.Deferred();
		$.get('/member/' + data.maker, function (res) {
			if (res > 3) {
				var msg = '방은 최대 세 개까지 만들 수 있습니다.';
				deferred.reject(msg);
			}
		});
		$.post('/room/' + data.id, data, function (res) {
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
		createRoom: createRoom
	};
}());