/**
 * Created by Zero on 2015-07-25.
 */
wwm.model = (function () {
	function createRoom(data) {
		$.post('/create')
	}
	function initModule() {

	}
	return {
		initModule: initModule
	};
}());