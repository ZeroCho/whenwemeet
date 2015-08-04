wwm.lobby = (function (){
	var jqMap;
	var userInfo;
	function setJqMap ($con) {
		jqMap = {
			$con: $con,
			$showCreateroom: $con.find('#show-createroom-modal'),
			$searchroomBtn: $con.find('#searchroom-btn'),
			$list: $con.find('#room-list'),
			$logout: $con.find('#logout-btn')
		};
	}
	function initModule ($con) {
		userInfo = JSON.parse(localStorage.login);
		var src = $('#wwm-lobby').text();
		dust.render(dust.loadSource(dust.compile(src)), {
			name: userInfo.username
		}, function(err, out) {
			$container.html(out);
		}
		setJqMap($con);
		getList();
		jqMap.$showCreateroom.click(showCreateroom);
		jqMap.$searchroomBtn.click(onSearchRoom);
		jqMap.$logout.click(onLogout);
	}
	function showCreateroom () {
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
	function onLogout() {
		localStorage.removeItem('login');
		location.href = '/logout';
	}
	return {
		initModule: initModule
	};
}());
