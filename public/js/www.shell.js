wwm.shell = (function () {
	var jqMap;
	function setJqMap($con) {
		jqMap = {
			$con: $con,
			$view: $con.find('#view'),
			$modal: $con.find('#modal')
		};
	}
	function initModule($con) {
		var logged = localStorage.login && !!JSON.parse(localStorage.login);
		var first = localStorage.login && JSON.parse(localStorage.first);
		setJqMap($con);
		if (logged) {
			wwm.lobby.initModule($con, jqMap.$view);
		} else {
			$container.html($('#wwm-login').html());
		}
		if (first) {
			wwm.modal.initModule();
		}
		Kakao.init('a35623411563ec424430d3bd5dc7a93e');		
	}
	return {
		initModule: initModule
	};
}());