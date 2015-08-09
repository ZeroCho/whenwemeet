wwm.login = (function () {
	var jqMap;
	function setJqMap($con) {
		jqMap = {
			$con: $con,
			$kakaoLogin: $con.find('#kakao-login-btn'),
			$fbLogin: $con.find('#fb-login-btn'),
			$canvas: $con.find('#canvas-logo')
		};
	}
	function initModule($con) {
		$con.html($('#wwm-login').html());
		setJqMap($con);
		var ctx = jqMap.$canvas[0].getContext('2d');
		ctx.fillStyle = '#FF0000';
		ctx.fillRect(0,0,150,75);
		jqMap.$kakaoLogin.on({
			click: function () {
				Kakao.Auth.login({
					success: function () {
						Kakao.API.request({
							url: '/v1/user/me',
							success: function (res) {
								var id = res._id;
								var name = res.properties.nickname;
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
									console.log(err.responseText);
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
							var id = res.id;
							var name = res.name;
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
								console.log(err.responseText);
							});
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
	return {
		initModule: initModule
	};
}());