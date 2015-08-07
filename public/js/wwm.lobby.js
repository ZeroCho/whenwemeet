wwm.lobby = (function (){
	var jqMap;
	var userInfo;
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
		userInfo = JSON.parse(localStorage.login);
		console.log('lobby', localStorage.login);
		var src = document.getElementById('wwm-lobby').textContent;
		console.log(src);
		console.log(userInfo.properties.nickname);
		dust.renderSource(src, {
			name: userInfo.properties.nickname
		}, function(err, out) {
			console.log(out);
			$con.html(out);
			setJqMap($con);
			getList();
			jqMap.$showCreateroom.click(showCreateroom);
			jqMap.$searchroomBtn.click(onSearchRoom);
			jqMap.$logout.click(logout);
			jqMap.$room.click(enterRoom);
		});
	}
	function showCreateroom() {
		wwm.modal.initModule($('#wwm-createroom'));
	}
	function getList() {
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
	return {
		initModule: initModule
	};
}());
