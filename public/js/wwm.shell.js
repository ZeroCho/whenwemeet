wwm.shell = (function () {
	var jqMap;
	function setJqMap($con) {
		jqMap = {
			$con: $con,
			$view: $con.find('#view'),
			$modal: $con.find('#modal'),
			$kakaoLogin: $con.find('#kakao-login-btn'),
			$fbLogin: $con.find('#fb-login-btn')
		};
	}

	function onError(errorMsg, url, lineNumber, column, errorObj) {
		if (typeof errorMsg === 'string' && errorMsg.indexOf('Script error.') > -1) {
			return;
		}
		console.log('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber + ' Column: ' + column + ' StackTrace: ' + errorObj);
	}

	function initModule($con) {
		console.log('login', localStorage.login);
		console.log('first', localStorage.first);
		var logged = localStorage.login && JSON.parse(localStorage.login);
		var first = localStorage.first && JSON.parse(localStorage.first);
		setJqMap($con);
		if (first) {
			wwm.modal.initModule($('#wwm-intro').html());
		}
		if (logged) {
			wwm.lobby.initModule(jqMap.$view);
		} else {
			wwm.login.initModule(jqMap.$view);
		}
		$(window).on('error', onError);
	}

	return {
		initModule: initModule
	};
}());
