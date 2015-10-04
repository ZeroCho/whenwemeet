wwm.modal = (function (){
	'use strict';
	var jqMap;
	var setJqMap, closeModal, createRoom, report, initModule;
	setJqMap = function($con) {
		jqMap = {
			$con: $con,
			$close: $con.find('.modal-close'),
			$roomTitle: $con.find('#room-title'),
			$limit: $con.find('#room-limit'),
			$password: $con.find('#room-password'),
			$createRoom: $con.find('#create-room-btn'),
			$reportTitle: $con.find('#report-title'),
			$reportHidden: $con.find('#report-hidden'),
			$reportContent: $con.find('#report-content'),
			$report: $con.find('#report-btn')
		};
	};
	closeModal = function(e) {
		if (e)	{e.preventDefault();}
		wwm.shell.modal.fadeOut('slow');
	};
	createRoom = function(e) {
		var spinner = new Spinner().spin();
		var title = jqMap.$roomTitle.val().trim();
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
			members: JSON.stringify([{id: userInfo.id, name: userInfo.name, picture: userInfo.picture, confirm: false}]),
			color: [maker, null, null, null, null, null, null, null]
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
			console.error(err);
			alert(err);
		});
		createRoomPromise.always(function () {
			$(spinner.el).remove();
		});
	};
	report = function (e) {
		var title = jqMap.$reportTitle.val().trim();
		var content = jqMap.$reportContent.val().trim();
		var data = {
			id: userInfo.id,
			rid: userInfo.rid,
			name: userInfo.name,
			title: title,
			content: content,
			date: new Date().toString()
		};
		var reportPromise;
		e.preventDefault();
		reportPromise = wwm.model.report(data);
		reportPromise.done(function (res) {
			alert('전송되었습니다. 빠른 시일 내에 조치하겠습니다.');
			console.log(res);
			closeModal();
		});
		reportPromise.fail(function (err) {
			console.error(err);
			alert(err);
		});
	};
	initModule = function($target) {
		wwm.shell.modal.html($target);
		setJqMap(wwm.shell.modal);
		wwm.shell.modal.fadeIn('slow');
		jqMap.$roomTitle.focus();
		jqMap.$close.click(closeModal);
		jqMap.$createRoom.click(createRoom);
		jqMap.$report.click(report);
	};
	return {
		initModule: initModule
	};
}());	