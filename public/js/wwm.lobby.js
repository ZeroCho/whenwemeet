wwm.lobby = (function (){
	var jqMap;
	function setJqMap ($container) {
		jqMap = {
			$container: $container,
			$showCreateroom: $container.find('#show-createroom-modal'),
			$searchroomBtn: $container.find('#searchroom-btn')
		};
	}
	function initModule ($container) {
		$container.html($('#wwm-lobby').html());
		setJqMap($container);
		jqMap.$showCreateroom.click(showCreateroom);
		jqMap.$searchroomBtn.click(onSearchRoom);
	}
	function showCreateroom () {
		wwm.modal.initModule($('#wwm-createroom'));
	}
	function onSearchRoom () {
	
	}
	return {
		initModule: initModule
	};
}());
