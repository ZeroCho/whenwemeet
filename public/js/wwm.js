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
	var KAKAO_KEY = 'a35623411563ec424430d3bd5dc7a93e';
	$.ajaxSetup({cache: true});
	$.getScript('//connect.facebook.net/ko_KR/sdk.js', function () {
		FB.init({
			appId: '1617440885181938',
			xfbml: true,
			version: 'v2.4'
		});
	});
	Kakao.init(KAKAO_KEY);
	wwm.initModule($('#whenwemeet'));
});