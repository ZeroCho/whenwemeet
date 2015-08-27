wwm.login = (function () {
	var jqMap;
	function localhostLogin() {
		var res = {id: "123456789", name: '관리자'};
		var joinPromise = wwm.model.join(res);
		joinPromise.fail(function(err){
			alert('가입 오류 발생!');
			console.log(err.responseText);
			return;
		});
		history.pushState({mod: 'login', data: res, type: 'local'}, '', '/lobby/123456789');
		window.userInfo = res;
		localStorage.login = JSON.stringify(res);
		localStorage.loginType = 'local';
		wwm.lobby.initModule(wwm.shell.view);
	}
	function localhost2Login() {
		var res = {id: "987654321", name: '테스터'};
		var joinPromise = wwm.model.join(res);
		joinPromise.fail(function(err){
			alert('가입 오류 발생!');
			console.log(err.responseText);
			return;
		});
		history.pushState({mod: 'login', data: res, type: 'local2'}, '', '/lobby/987654321');
		window.userInfo = res;
		localStorage.login = JSON.stringify(res);
		localStorage.loginType = 'local2';
		wwm.lobby.initModule(wwm.shell.view);
	}
	function kakaoLogin() {
		Kakao.Auth.login({
			success: function () {
				Kakao.API.request({
					url: '/v1/user/me',
					success: function (res) {
						res.name = res.properties.nickname;
						res.picture = res.properties.profile_image;
						var joinPromise = wwm.model.join(res);
						joinPromise.fail(function(err){
							alert('가입 오류 발생!');
							console.log(err.responseText);
							return;
						});
						history.pushState({mod: 'login', data: res, type: 'kakao'}, '', '/lobby/' + res.id);
						window.userInfo = res;
						localStorage.login = JSON.stringify(res);
						localStorage.loginType = 'kakao';
						wwm.lobby.initModule(wwm.shell.view);
					},
					fail: function (error) {
						alert(JSON.stringify(error));
					}
				});
			},
			fail: function (err) {
				alert(JSON.stringify(err));
			}
		});
	}
	function fbLogin() {
		FB.login(function (res) {
			if (res.status === 'connected') {
				FB.api('/me', function (res) {
					res.picture = '//graph.facebook.com/' + res.id + '/picture'
					var joinPromise = wwm.model.join(res);
					joinPromise.fail(function(err){
						alert('가입 오류 발생!');
						console.log(err.responseText);
						return;
					});
					history.pushState({mod: 'login', data: res, type: 'facebook'}, '', '/lobby/' + res.id);
					window.userInfo = res;
					localStorage.login = JSON.stringify(res);
					localStorage.loginType = 'facebook';
					wwm.lobby.initModule(wwm.shell.view);
				});
			} else if (res.status === 'not_authorized') {
				// The person is logged into Facebook, but not your app.
				alert('Please log log into this app.');
			} else {
				alert('Please log into Facebook.');
			}
		});
	}
	function setJqMap($con) {
		jqMap = {
			$con: $con,
			$wrapper: $con.find('#login-wrapper'),
			$kakaoLogin: $con.find('#kakao-login-btn'),
			$fbLogin: $con.find('#fb-login-btn'),
			$localhost: $con.find('#localhost-login'),
			$localhost2: $con.find('#localhost2-login')
		};
	}
	function initModule() {
		wwm.shell.logo.animate({height: '70%'});
		wwm.shell.logo.after($('#wwm-login').html());
		setJqMap(wwm.shell.view);
		jqMap.$wrapper.fadeIn('slow');
		jqMap.$kakaoLogin.on({
			click: kakaoLogin,
			mouseover: function () {
				this.src = '/kakao_account_login_btn_medium_narrow_ov.png';
			},
			mouseout: function () {
				this.src = '/kakao_account_login_btn_medium_narrow.png';
			}
		});
		jqMap.$fbLogin.on({
			click: fbLogin,
			mouseover: function () {
				this.src = '/facebook_ov.png';
			},
			mouseout: function () {
				this.src = '/facebook.png';
			}
		});
		jqMap.$localhost.click(localhostLogin);
		jqMap.$localhost2.click(localhost2Login);
	}
	return {
		initModule: initModule
	};
}());