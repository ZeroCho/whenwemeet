wwm.lobby = (function (){
	var jqMap;
	var userInfo;
	function showCreateroom() {
		wwm.modal.initModule($('#wwm-createroom-modal'));
	}
	function getList() {
		var $frag = $(document.createDocumentFragment());
		$.get('/roomlist').done(function(res){
			jqMap.$list.html();
		});
	}
	function changeList(data) {
		var $frag = $(document.createDocumentFragment());
		jqMap.$list.html();
	}
	function onSearchRoom (query) {
		$.get('/search/' + query, function(res) {
			changeList(res);
		});
	}
	function logout() {
		localStorage.removeItem('login');
		location.href = '/logout';
	}
	function enterRoom() {
		wwm.room.initModule(jqMap.$con);
	}
	function setJqMap($con) {
		jqMap = {
			$con: $con,
			$showCreateroom: $con.find('#show-createroom-modal'),
			$searchroomBtn: $con.find('#searchroom-btn'),
			$list: $con.find('#room-list'),
			$logout: $con.find('#logout-btn'),
			$room: $con.find('.room')
		};
	}
	function initModule($con) {
		var src = document.getElementById('wwm-lobby').textContent;
		userInfo = JSON.parse(localStorage.login);
		console.log('lobby', localStorage.login);
		console.log('src', src);
		console.log('nickname', userInfo.properties.nickname);
		dust.render(dust.loadSource(dust.compile(src)), {
			name: userInfo.properties.nickname || userInfo.name
		}, function(err, out) {
			if (err) {
				console.log(err);
				alert('error! 콘솔 확인');
			} else {
				console.log('out', out);
				$con.html(out);
				setJqMap($con);
				getList();
				jqMap.$showCreateroom.click(showCreateroom);
				jqMap.$searchroomBtn.click(onSearchRoom);
				jqMap.$logout.click(logout);
				jqMap.$room.click(enterRoom);
			}
		});
	}
	return {
		initModule: initModule
	};
}());
