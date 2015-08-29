wwm.modal = (function (){
	var jqMap;
	function setJqMap($con) {
		jqMap = {
			$con: $con,
			$close: $con.find('.modal-close'),
			$title: $con.find('#room-title'),
			$limit: $con.find('#room-people-limit'),
			$password: $con.find('#room-password'),
			$createRoom: $con.find('#create-room-btn')
		};
	}
	function onCloseModal(e) {
		e.preventDefault();
		wwm.shell.modal.hide();
	}
	function createRoom(e) {
		e.preventDefault();
		var spinner = new Spinner().spin();
		jqMap.$con.append(spinner.el);
		var title = jqMap.$title.val().trim();
		var limit = jqMap.$limit.val();
		var password = jqMap.$password.val().trim() || null;
		var maker = userInfo.id.toString();
		var picture = userInfo.picture;
		if (!title) {
			$(spinner.el).remove();
			alert('제목을 입력하세요.');
			return;
		}
		var data = {
			rid: new Date().getTime().toString(),
			title: title,
			maker: maker,
			limit: limit,
			picture: picture,
			password: password,
			members: JSON.stringify([{id: userInfo.id, name: userInfo.name, picture: userInfo.picture, confirm: false}])
		};
		console.log('createroom data', data);
		var createRoomPromise = wwm.model.createRoom(data);
		createRoomPromise.done(function (result) {
			console.log(result);
			data.current = 1;
			wwm.room.initModule(data, 'create');
			wwm.shell.modal.hide();
		});
		createRoomPromise.fail(function (err) {
			console.log(err);
			alert('방 생성에러! 콘솔확인');
		});
		createRoomPromise.always(function () {
			$(spinner.el).remove();
		});
	}
	function initModule($target) {
		wwm.shell.modal.html($target);
		setJqMap(wwm.shell.modal);
		wwm.shell.modal.fadeIn('slow');
		jqMap.$close.click(onCloseModal);
		jqMap.$createRoom.click(createRoom);
	}
	return {
		initModule: initModule
	};
}());