wwm.modal = (function (){
	'use strict';
	var jqMap;
	var setJqMap, onCloseModal, createRoom, initModule;
	setJqMap = function($con) {
		jqMap = {
			$con: $con,
			$close: $con.find('.modal-close'),
			$title: $con.find('#room-title'),
			$limit: $con.find('#room-limit'),
			$password: $con.find('#room-password'),
			$createRoom: $con.find('#create-room-btn')
		};
	};
	onCloseModal = function(e) {
		e.preventDefault();
		wwm.shell.modal.fadeOut('slow');
	};
	createRoom = function(e) {
		var spinner = new Spinner().spin();
		var title = jqMap.$title.val().trim();
		var limit = jqMap.$limit.val();
		var password = jqMap.$password.val().trim() || null;
		var maker = userInfo.id.toString();
		var picture = userInfo.picture;
		var data = {
			rid: new Date().getTime().toString().slice(0, -4),
			title: title,
			maker: maker,
			limit: limit,
			picture: picture,
			password: password,
			members: JSON.stringify([{id: userInfo.id, name: userInfo.name, picture: userInfo.picture, confirm: false}])
		};
		var createRoomPromise;
		e.preventDefault();
		jqMap.$con.append(spinner.el);
		if (!title) {
			$(spinner.el).remove();
			alert('제목을 입력하세요.');
			return;
		}
		console.log('createroom data', data);
		createRoomPromise = wwm.model.createRoom(data);
		createRoomPromise.done(function (result) {
			console.log(result);
			data.current = 1;
			wwm.room.initModule(data, 'create');
			wwm.shell.modal.fadeOut('slow');
		});
		createRoomPromise.fail(function (err) {
			console.log(err);
			alert(err);
		});
		createRoomPromise.always(function () {
			$(spinner.el).remove();
		});
	};
	initModule = function($target) {
		wwm.shell.modal.html($target);
		setJqMap(wwm.shell.modal);
		wwm.shell.modal.fadeIn('slow');
		jqMap.$title.focus();
		jqMap.$close.click(onCloseModal);
		jqMap.$createRoom.click(createRoom);
	};
	return {
		initModule: initModule
	};
}());	