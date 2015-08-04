wwm.shell = (function () {
	var jqMap;
	function setJqMap($con) {
		jqMap = {
			$con: $con,
			$view: $con.find('#view'),
			$modal: $con.find('#modal'),
			$kakaoLogin: $con.find('#kakao-login-btn')
		};
	}
	function initModule($con) {
		var logged = localStorage.login && !!JSON.parse(localStorage.login);
		var first = localStorage.login && JSON.parse(localStorage.first);
		//if (first) {
		//	wwm.modal.initModule($('#wwm-intro').html());
		//}
		if (logged) {
			wwm.lobby.initModule(jqMap.$view);
		} else {
			$con.find('#view').html($('#wwm-login').html());
			setJqMap($con);
			jqMap.$kakaoLogin.on({
				click: function () {
					$.get('/login/kakao').done(function (res) {
						if (res === 'success') {
							alert('로그인되었습니다!');
							wwm.lobby.initModule(jqMap.$view);
						}
					}).fail(function (err) {
						console.log(err);
						alert('오류 발생! 콘솔 확인');
					});
				},
				mouseover: function () {
					this.src = '/kakao_account_login_btn_medium_narrow_ov.png';
				},
				mouseout: function () {
					this.src = '/kakao_account_login_btn_medium_narrow.png';
				}
			});
		}		
		Kakao.init('a35623411563ec424430d3bd5dc7a93e');
	}
	return {
		initModule: initModule
	};
}());
