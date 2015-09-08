wwm.login = (function () {
	'use strict';
	var jqMap;
	var adminLogin, testLogin, kakaoLogin, fbLogin, setJqMap, kakaoCallback, fbCallback, initModule;
	adminLogin = function() {
		var res = {id: "123456789", name: '관리자', picture: '//graph.facebook.com/874512615962577/picture'};
		var joinPromise = wwm.model.join(res);
		joinPromise.fail(function(err){
			alert('가입 오류 발생!');
			console.log(err.responseText);
		});
		history.pushState({mod: 'login', data: res, type: 'local'}, '', '/lobby/123456789');
		window.userInfo = res;
		localStorage.login = JSON.stringify(res);
		localStorage.loginType = 'local';
		wwm.lobby.initModule(wwm.shell.view);
	};
	testLogin = function() {
		var res = {id: "987654321", name: '테스터', picture: 'http://th-p.talk.kakao.co.kr/th/talkp/wkkZf8zHlk/lxr9VefTlrfUr7FAzsAgJk/ljh2mh_640x640_s.jpg'};
		var joinPromise = wwm.model.join(res);
		joinPromise.fail(function(err){
			alert('가입 오류 발생!');
			console.log(err.responseText);
		});
		history.pushState({mod: 'login', data: res, type: 'local2'}, '', '/lobby/987654321');
		window.userInfo = res;
		localStorage.login = JSON.stringify(res);
		localStorage.loginType = 'local2';
		wwm.lobby.initModule(wwm.shell.view);
	};
	kakaoLogin = function() {
		Kakao.Auth.login({
			success: function () {
				Kakao.API.request({
					url: '/v1/user/me',
					success: function(result) {
						console.log(result);
						Kakao.API.request({
							url: '/v1/api/talk/profile',
							success: function(res) {
								res = $.extend(res, result);
								kakaoCallback(res);
								console.log(res);
							},
							fail: function (error) {
								alert(JSON.stringify(error));
							}
						});
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
	};
	kakaoCallback = function(res) {
		var joinPromise;
		console.log(JSON.stringify(res));
		res.name = res.nickName;
		res.picture = res.profileImageURL;
		res.thumb = res.thumbnailURL;
		joinPromise = wwm.model.join(res);
		joinPromise.fail(function(err){
			alert('가입 오류 발생!');
			console.log(err.responseText);
		});
		history.pushState({mod: 'login', data: res, type: 'kakao'}, '', '/lobby/' + res.id);
		window.userInfo = res;
		localStorage.login = JSON.stringify(res);
		localStorage.loginType = 'kakao';
		wwm.lobby.initModule(wwm.shell.view);
	};
	fbLogin = function() {
		FB.login(function (res) {
			if (res.status === 'connected') {
				FB.api('/me', fbCallback);
			} else if (res.status === 'not_authorized') {
				/* The person is logged into Facebook, but not your app. */
				alert('Please log log into this app.');
			} else {
				alert('Please log into Facebook.');
			}
		});
	};
	fbCallback = function(res) {
		var joinPromise;
		console.log(JSON.stringify(res));
		res.picture = '//graph.facebook.com/' + res.id + '/picture';
		joinPromise = wwm.model.join(res);
		joinPromise.fail(function(err){
			alert('가입 오류 발생!');
			console.log(err.responseText);
		});
		history.pushState({mod: 'login', data: res, type: 'facebook'}, '', '/lobby/' + res.id);
		window.userInfo = res;
		localStorage.login = JSON.stringify(res);
		localStorage.loginType = 'facebook';
		wwm.lobby.initModule(wwm.shell.view);
	};
	setJqMap = function($con) {
		jqMap = {
			$con: $con,
			$logo: $con.find('#login-logo'),
			$wrapper: $con.find('#login-wrapper'),
			$kakaoLogin: $con.find('#kakao-login-btn'),
			$fbLogin: $con.find('#fb-login-btn'),
			$localhost: $con.find('#localhost-login'),
			$localhost2: $con.find('#localhost2-login')
		};
	};
	initModule = function() {
		wwm.shell.view.html($('#wwm-login').html());
		setJqMap(wwm.shell.view);
		jqMap.$logo.showSVGLogo(100);
		jqMap.$logo.animate({height: '70%'});
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
		jqMap.$localhost.click(adminLogin);
		jqMap.$localhost2.click(testLogin);
	};
	return {
		initModule: initModule
	};
}());