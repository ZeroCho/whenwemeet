wwm.login = (function () {
	var jqMap;
	function localhostLogin() {
		var res = {id: "123456789", name: '관리자'};
		var joinPromise = wwm.model.join(res);
		joinPromise.fail(function(err){
			alert('가입 오류 발생!');
			console.log(err.responseText);
		});
		window.userInfo = res;
		console.log(userInfo);
		localStorage.login = JSON.stringify(res);
		localStorage.loginType = 'localhost';
		wwm.lobby.initModule(jqMap.$con);
	}
	function localhost2Login() {
		var res = {id: "987654321", name: '테스터'};
		var joinPromise = wwm.model.join(res);
		joinPromise.fail(function(err){
			alert('가입 오류 발생!');
			console.log(err.responseText);
		});
		window.userInfo = res;
		localStorage.login = JSON.stringify(res);
		localStorage.loginType = 'localhost';
		wwm.lobby.initModule(jqMap.$con);
	}
	function kakaoLogin() {
		Kakao.Auth.login({
			success: function () {
				Kakao.API.request({
					url: '/v1/user/me',
					success: function (res) {
						var id = res.id;
						var name = res.properties.nickname;
						var data = {
							name: name,
							id: id
						};
						var joinPromise = wwm.model.join(data);
						joinPromise.fail(function(err){
							alert('가입 오류 발생!');
							console.log(err.responseText);
						});
						window.userInfo = res;
						localStorage.login = JSON.stringify(res);
						localStorage.loginType = 'kakao';
						wwm.lobby.initModule(jqMap.$con);
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
					var id = res.id;
					var name = res.name;
					var data = {
						name: name,
						id: id
					};
					var joinPromise = wwm.model.join(data);
					joinPromise.fail(function(err){
						alert('가입 오류 발생!');
						console.log(err.responseText);
					});
					window.userInfo = res;
					localStorage.login = JSON.stringify(res);
					localStorage.loginType = 'facebook';
					wwm.lobby.initModule(jqMap.$con);
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
			$kakaoLogin: $con.find('#kakao-login-btn'),
			$fbLogin: $con.find('#fb-login-btn'),
			$localhost: $con.find('#localhost-login'),
			$localhost2: $con.find('#localhost2-login'),
			$canvas: $con.find('#canvas-logo')
		};
	}
	function showLogo() {
		var canvas = document.getElementById('canvas-logo');
		var ctx = canvas.getContext('2d');
		drawEqTriangle(ctx, 50, canvas.width/2 + 13, canvas.height/2, 'magenta');
		drawRevEqTriangle(ctx, 50, canvas.width/2 + 7, canvas.height/2, 'cyan');
		drawEqTriangle(ctx, 50, canvas.width/2 - 16, canvas.height/2 - 49, 'yellow');
		drawRevEqTriangle(ctx, 50, canvas.width/2 + 36, canvas.height/2 + 49, 'greenyellow');
		function drawEqTriangle(ctx, side, cx, cy, color){  
			var h = side * (Math.sqrt(3)/2);    
			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.moveTo(cx, cy - h / 2);
			ctx.lineTo(cx - side / 2, cy + h / 2);
			ctx.lineTo(cx + side / 2, cy + h / 2);
			ctx.lineTo(cx, cy - h / 2);
			ctx.shadowOffsetX = 1;
			ctx.shadowOffsetY = 3;
			ctx.shadowBlur    = 1;
			ctx.shadowColor   = 'rgb(204, 204, 204)';      
			ctx.fill(); 
		}
		function drawRevEqTriangle(ctx, side, cx, cy, color){  
			var h = side * (Math.sqrt(3)/2); 
			ctx.fillStyle = color;
			ctx.beginPath(); 
			ctx.moveTo(cx, cy - h / 2);
			ctx.lineTo(cx - side, cy - h / 2);
			ctx.lineTo(cx - side / 2, cy + h / 2);
			ctx.lineTo(cx, cy - h / 2);
			ctx.shadowOffsetX = 1;
			ctx.shadowOffsetY = 3;
			ctx.shadowBlur    = 1;
			ctx.shadowColor   = 'rgb(204, 204, 204)'; 
			ctx.fill(); 
		}
	}
	function initModule($con) {
		$con.html($('#wwm-login').html());
		setJqMap($con);
		showLogo();
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
