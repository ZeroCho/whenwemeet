wwm.modal = (function (){
	var stMap = {
		$modal: $('#modal')
	};
	var jqMap;
	function initModule($target) {
		stMap.$modal.html($target);
		setJqMap($target);
		jqMap.$close.click(oncloseModal);
		stMap.$modal.show();
	}
	function setJqMap($con) {
		jqMap = {
			$con: $con,
			$close: $con.find('.modal-close')
		};
	}
	function onCloseModal() {
		stMap.$modal.hide();
	}
	return {
		initModule: initModule
	};
}());
