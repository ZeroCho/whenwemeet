wwm.modal = (function (){
	var stMap = {
		$modal: $('#modal')
	};
	var jqMap;
	function initModule($target) {
		stMap.$modal.html($target);
		setJqMap($target);
		jqMap.$close.click(onCloseModal);
		stMap.$modal.show();
		jqMap.$createRoom.click(createRoom);
	}
	function setJqMap($con) {
		jqMap = {
			$con: $con,
			$close: $con.find('.modal-close'),
			$title: $con.find('#room-title'),
			$number: $con.find('#room-number'),
			$password: $con.find('#room-password'),
			$createRoom: $con.find('#create-room-btn')
		};
	}
	function onCloseModal() {
		stMap.$modal.hide();
	}
	function createRoom() {
		var data;
		var title = jqMap.$title.val();
		var number = jqMap.$number.val();
		var password = jqMap.$password.val();
		if (!title) {
			alert('제목을 입력하세요.');
			return;
		}
		if (!number) {
			alert('인원수를 선택하세요!');
			return;
		}
		data = {
			title: jqMap.$title.val(),
			number: jqMap.$number.val(),
			password: jqMap.$password.val()
		}
		wwm.model.createRoom(data);
	}
	return {
		initModule: initModule
	};
}());
