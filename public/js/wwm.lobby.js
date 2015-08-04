wwm.lobby = (function (){
	var jqMap;
	var userInfo;
	function setJqMap ($container) {
		jqMap = {
			$container: $container,
			$showCreateroom: $container.find('#show-createroom-modal'),
			$searchroomBtn: $container.find('#searchroom-btn'),
			$logout: $container.find('#logout-btn')
		};
	}
	function initModule ($container) {
		userInfo = JSON.parse(localStorage.login);
		var src = $('#wwm-lobby').text();
		dust.render(dust.loadSource(dust.compile(src)), {
			name: userInfo.username
		}, function(err, out) {
			$container.html(out);
		}
		setJqMap($container);
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
			
		});
	}
	function changeList(data) {
		
	}
	function onSearchRoom (query) {
		$.get('/search', {
			query: query
		}, function(res) {
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
