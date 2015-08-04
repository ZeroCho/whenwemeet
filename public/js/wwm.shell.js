wwm.shell = (function () {
	var jqMap;
	var KAKAO_KEY = 'a35623411563ec424430d3bd5dc7a93e';
	function setJqMap($con) {
		jqMap = {
			$con: $con,
			$view: $con.find('#view'),
			$modal: $con.find('#modal'),
			$kakaoLogin: $con.find('#kakao-login-btn')
		};
	}
	function onError (errorMsg, url, lineNumber, column, errorObj) {
		if (typeof errorMsg === 'string' && errorMsg.indexOf('Script error.') > -1) { return; }
		console.log('Error: ', errorMsg, ' Script: ' + url + ' Line: ' + lineNumber + ' Column: ' + column + ' StackTrace: ' + errorObj);
	}
	function initModule($con) {
		console.log('login: ' + localStorage.login);
		console.log('first: ' + localStorage.first)
		var logged = localStorage.login && JSON.parse(localStorage.login);
		var first = localStorage.first && JSON.parse(localStorage.first);
		setJqMap($con);
		Kakao.init(KAKAO_KEY);
		//if (first) {
		//	wwm.modal.initModule($('#wwm-intro').html());
		//}
		console.log('logged: ', logged);
		if (logged) {
			wwm.lobby.initModule(jqMap.$view);
		} else {
			$con.find('#view').html($('#wwm-login').html());
			setJqMap($con);
			jqMap.$kakaoLogin.on({
				click: function() {
					Kakao.Auth.login({
					        success: function(authObj) {
					        	localStorage.login = JSON.stringify(authObj);
							wwm.lobby.initModule(jqMap.$view);
					        },
					        fail: function(err) {
					        	alert(JSON.stringify(err))
					        }
					});
				},
				mouseover: function() {
					this.src = '/kakao_account_login_btn_medium_narrow_ov.png';
				},
				mouseout: function() {
					this.src = '/kakao_account_login_btn_medium_narrow.png';
				}
			});
		}
		$(window).on('error', onError);
	}
	return {
		initModule: initModule
	};
}());
