wwm.lobby = (function (){
	var jqMap;
	function setJqMap ($container) {
		jqMap = {
			$container: $container,
			$showCreateroom: $container.find('#show-createroom-modal'),
			$searchroomBtn: $container.find('#searchroom-btn'),
			$logout: $container.find('#logout-btn')
		};
	}
	function initModule ($container) {
		$container.html($('#wwm-lobby').html());
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
