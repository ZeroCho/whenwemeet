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
			return;
		}
		$.get('/status').done(function(res) {
			if (res) {
				localStorage.login = JSON.stringify(res);
				wwm.lobby.initModule(jqMap.$view);
			} else {
				$con.find('#view').html($('#wwm-login').html());
				setJqMap($con);
				jqMap.$kakaoLogin.on({
					click: function () {
						$.get('/oauth/kakao').done(function (res) {
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
		}).fail(function(err) {
			console.log(err);
			alert('인터넷 연결이 필요합니다.');
		});
		Kakao.init('a35623411563ec424430d3bd5dc7a93e');
	}
	return {
		initModule: initModule
	};
}());
