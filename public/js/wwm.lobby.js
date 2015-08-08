wwm.lobby = (function (){
	var jqMap;
	var userInfo;
	function showCreateroom() {
		wwm.modal.initModule($('#wwm-createroom-modal').html());
	}
	function getList() {
		var spinner = new Spinner().spin();
		jqMap.$list.append(spinner.el);
		var $frag = $(document.createDocumentFragment());
		var getListPromise = wwm.model.getRoomList();
		getListPromise.done(function (res) {
			console.log(res);
			jqMap.$list.text(res);
		});
		getListPromise.fail(function (err) {
			console.log(err);
			jqMap.$list.html(err.responseText);
		});
	}
	function onSearchRoom (query) {
		var $frag = $(document.createDocumentFragment());
		var searchPromise = wwm.model.getRoomList(query);
		searchPromise.done(function (res) {
			console.log(res);
			jqMap.$list.text(res);
		});
		searchPromise.fail(function (err) {
			console.log(err);
			jqMap.$list.html(err.responseText);
		});
	}
	function logout() {
		localStorage.removeItem('login');
		localStorage.removeItem('loginType');
		wwm.lobby.initModule(jqMap.$con);
	}
	function enterRoom() {
		wwm.room.initModule(jqMap.$con, $(this));
	}
	function refreshList() {
		getList();
	}
	function setJqMap($con) {
		jqMap = {
			$con: $con,
			$showCreateroom: $con.find('#show-createroom-modal'),
			$searchroomBtn: $con.find('#searchroom-btn'),
			$list: $con.find('#rooms'),
			$logout: $con.find('#logout-btn'),
			$room: $con.find('.room'),
			$refresh: $con.find('#refresh-list')
		};
	}
	function initModule($con) {
		var src = document.getElementById('wwm-lobby').textContent;
		userInfo = JSON.parse(localStorage.login);
		console.log('lobby', localStorage.login);
		var username = userInfo.properties.nickname || userInfo.name;
		console.log('username', username);
		dust.render(dust.loadSource(dust.compile(src)), {
			name: username
		}, function(err, out) {
			if (err) {
				console.log(err);
				alert('error! 콘솔 확인');
			} else {
				$con.html(out);
				setJqMap($con);
				getList();
				jqMap.$showCreateroom.click(showCreateroom);
				jqMap.$searchroomBtn.click(onSearchRoom);
				jqMap.$logout.click(logout);
				jqMap.$room.click(enterRoom);
				jqMap.$refresh.click(refreshList);
			}
		});
	}
	return {
		initModule: initModule
	};
}());
