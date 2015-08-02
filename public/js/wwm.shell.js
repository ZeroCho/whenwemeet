wwm.shell = (function () {
	function initModule($container) {
		$container.html($('#wwm-front').html());
		$('#kakao-login-btn').on({
			click: function () {
				$.get('/login/kakao').done(function (res) {
					if (res === 'success') {
						alert('로그인되었습니다!');
						wwm.lobby.initModule($container);
					}
				}).fail(function (err) {
					alert(err);
				});
			},
			mouseover: function () {
				this.src = '/kakao_account_login_btn_medium_narrow_ov.png';
			},
			mouseout: function () {
				this.src = '/kakao_account_login_btn_medium_narrow.png';
			}
		});
		Kakao.init('a35623411563ec424430d3bd5dc7a93e');		
	}
	return {
		initModule: initModule
	};
}());