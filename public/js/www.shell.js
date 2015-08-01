wwm.shell = (function () {
	function initModule($container) {
		$container.html($('#wwm-front').html());
		// īī�� �α��� �κ�
		Kakao.init(' a35623411563ec424430d3bd5dc7a93e');
		Kakao.Auth.createLoginButton({
			container: '#kakao-login-btn',
			success: function(authObj) {
				Kakao.API.request({
					url: '/v1/user/me',
					success: function(res) {
						alert(JSON.stringify(res));
						$container.html($('#wwm-lobby').html());
					},
					fail: function(error) {
						alert(JSON.stringify(error));
					}
				});
			},
			fail: function(err) {
				alert(JSON.stringify(err));
			}
		});
	}
	return {
		initModule: initModule
	};
}());