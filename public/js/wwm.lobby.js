wwm.lobby = (function (){
	var jqMap;
	var userInfo;
	function setJqMap ($container) {
		jqMap = {
			$container: $container,
			$showCreateroom: $container.find('#show-createroom-modal'),
			$searchroomBtn: $container.find('#searchroom-btn'),
			$logout: $container.find('#logout-btn')
		};
	}
	function initModule ($container) {
		userInfo = JSON.parse(localStorage.login);
		var src = $('#wwm-lobby').text();
		dust.render(dust.loadSource(dust.compile(src)), function(err, out) {
			$container.html(out);
		}
		setJqMap($container);
		jqMap.$showCreateroom.click(showCreateroom);
		jqMap.$searchroomBtn.click(onSearchRoom);
		jqMap.$logout.click(onLogout);
	}
	function showCreateroom () {
		wwm.modal.initModule($('#wwm-createroom'));
	}
	function onSearchRoom () {
	
	}
	function onLogout() {
		localStorage.removeItem('login');
		location.href = '/logout';
	}
	return {
		initModule: initModule
	};
}());
