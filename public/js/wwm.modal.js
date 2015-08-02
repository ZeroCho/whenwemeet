wwm.modal = (function (){
	function initModule($container, $target, options) {
		var $div = $('<div/>').addClass('modal').append($target);
		$container.append($div)
	}
	return {
		initModule: initModule
	};
}());