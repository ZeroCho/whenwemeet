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
				var msg = '���� �ִ� �� ������ ���� �� �ֽ��ϴ�.';
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
			alert('�α��εǾ� �ֽ��ϴ�.');
		}
	}
	return {
		initModule: initModule,
		createRoom: createRoom
	};
}());