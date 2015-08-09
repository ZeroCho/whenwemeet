wwm.shell = (function () {
	var jqMap;
	var KAKAO_KEY = 'a35623411563ec424430d3bd5dc7a93e';

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
		console.log('Error: ', errorMsg, ' Script: ' + url + ' Line: ' + lineNumber + ' Column: ' + column + ' StackTrace: ' + errorObj);
	}

	function initModule($con) {
		$.ajaxSetup({cache: true});
		$.getScript('//connect.facebook.net/ko_KR/sdk.js', function () {
			FB.init({
				appId: '1617440885181938',
				xfbml: true,
				version: 'v2.4'
			});
		});
		Kakao.init(KAKAO_KEY);
		console.log('login', localStorage.login);
		console.log('first', localStorage.first);
		var logged = localStorage.login && JSON.parse(localStorage.login);
		var first = localStorage.first && JSON.parse(localStorage.first);
		setJqMap($con);
		//if (first) {
		//	wwm.modal.initModule($('#wwm-intro').html());
		//}
		console.log('logged', logged);
		if (logged) {
			wwm.lobby.initModule(jqMap.$view);
		} else {
			$con.find('#view').html($('#wwm-login').html());
			setJqMap($con);
			jqMap.$kakaoLogin.on({
				click: function () {
					Kakao.Auth.login({
						success: function (authObj) {
							Kakao.API.request({
								url: '/v1/user/me',
								success: function (res) {
									var id = res.id || res._id;
									var name = res.name || res.properties.nickname;
									var data = {
										name: name,
										id: id
									};
									$.ajax('/join', {
										data: data,
										type: 'post',
										contentType: 'application/x-www-form-urlencoded;charset=utf-8'
									}).done(function (res) {
										console.log(res);
										alert('가입되었습니다');
									}).fail(function (err) {
										alert('가입 오류 발생!');
										console.log(err);
									});
									localStorage.login = JSON.stringify(res);
									localStorage.loginType = 'kakao';
									wwm.lobby.initModule(jqMap.$view);
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
				},
				mouseover: function () {
					this.src = '/kakao_account_login_btn_medium_narrow_ov.png';
				},
				mouseout: function () {
					this.src = '/kakao_account_login_btn_medium_narrow.png';
				}
			});
			jqMap.$fbLogin.on({
				click: function () {
					FB.login(function (res) {
						if (res.status === 'connected') {
							FB.api('/me', function (res) {
								localStorage.login = JSON.stringify(res);
								localStorage.loginType = 'facebook';
								wwm.lobby.initModule(jqMap.$view);
							});
						} else if (res.status === 'not_authorized') {
							// The person is logged into Facebook, but not your app.
							alert('Please log log into this app.');
						} else {
							alert('Please log into Facebook.');
						}
					});
				},
				mouseover: function () {
					this.src = '/facebook_ov.png';
				},
				mouseout: function () {
					this.src = '/facebook.png';
				}
			});
		}
		$(window).on('error', onError);
	}

	return {
		initModule: initModule
	};
}());
