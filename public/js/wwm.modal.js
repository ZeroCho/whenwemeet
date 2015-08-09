wwm.modal = (function (){
	var stMap = {
		$modal: $('#modal')
	};
	var jqMap;
	function setJqMap($con) {
		jqMap = {
			$con: $con,
			$close: $con.find('.modal-close'),
			$title: $con.find('#room-title'),
			$number: $con.find('#room-people-number'),
			$password: $con.find('#room-password'),
			$createRoom: $con.find('#create-room-btn')
		};
	}
	function onCloseModal() {
		stMap.$modal.hide();
	}
	function createRoom() {
		var spinner = new Spinner().spin();
		jqMap.$con.append(spinner.el);
		var data;
		var title = jqMap.$title.val();
		var number = jqMap.$number.val();
		var password = jqMap.$password.val();
		var userInfo = JSON.parse(localStorage.login);
		var maker = userInfo.id || userInfo._id;
		if (!title) {
			$(spinner.el).remove();
			alert('제목을 입력하세요.');
			return;
		}
		data = {
			id: new Date().getTime(),
			title: title,
			maker: maker,
			number: number,
			password: password
		};
		var createRoomPromise = wwm.model.createRoom(data);
		createRoomPromise.done(function (result) {
			console.log(result);
			data.current = 1;
			data.member = [data.id]
			wwm.room.initModule(data);
		});
		createRoomPromise.fail(function (err) {
			alert(err);
		});
		createRoomPromise.always(function () {
			$(spinner.el).remove();
		});
	}
	function initModule($target) {
		stMap.$modal.html($target);
		setJqMap(stMap.$modal);
		jqMap.$close.click(onCloseModal);
		stMap.$modal.show();
		jqMap.$createRoom.click(createRoom);
	}
	return {
		initModule: initModule
	};
}());