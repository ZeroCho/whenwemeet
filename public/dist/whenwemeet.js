/**
 * Created by Zero on 2015-07-25.
 */
var wwm = (function () {
	function initModule($container) {
		wwm.model.initModule();
		wwm.shell.initModule($container);
	}
	return {
		initModule: initModule
	};
}());
$(function () {
	wwm.initModule($('#whenwemeet'));
});
/**
 * Created by Zero on 2015-07-25.
 */
wwm.model = (function () {
	function initModule() {

	}
	return {
		initModule: initModule
	};
}());
wwm.shell = (function () {
	function initModule($container) {
		$container.html($('#wwm-front').html());
		// 카카오 로그인 부분
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