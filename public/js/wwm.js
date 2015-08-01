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