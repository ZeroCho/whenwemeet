/**
 * Created by Zero on 2015-07-25.
 */
window.onerror = onError;
function onError(errorMsg, url, lineNumber, column, errorObj) {
	if (typeof errorMsg === 'string' && errorMsg.indexOf('Script error.') > -1) {
		return;
	}
	console.log('Error: ', errorMsg, ' Script: ' + url + ' Line: ' + lineNumber + ' Column: ' + column + ' StackTrace: ' + errorObj);
}

var wwm = (function () {
	function initModule() {
		wwm.model.initModule();
		wwm.shell.initModule();
	}
	return {
		initModule: initModule,
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
	wwm.initModule();
});