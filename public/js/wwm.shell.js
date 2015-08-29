wwm.shell = (function () {
	var cfMap = {
		$con: $('#whenwemeet'),
		$view: $('#view'),
		$modal: $('#modal'),
		$logo: $('#logo')
	};
	var onPopstate = function(e) {
		var state = e.originalEvent.state;
		var mod = state.mod;
		console.log('onpopstate', mod);
		switch (mod) {
			case 'login':
				window.userInfo = state.data;
				localStorage.login = JSON.stringify(state.data);
				localStorage.loginType = state.type;
				wwm.lobby.initModule();
				break;
			case 'directlogin':
				wwm.login.initModule();
				break;
			case 'lobby':
				wwm.lobby.initModule();
				break;
			case 'intro':
				wwm.modal.initModule($('#wwm-intro').html());
				break;
			case 'search':
				wwm.lobby.showSearchResult(state.data);
				break;
			case 'logout':
				delete window.userInfo;
				localStorage.removeItem('login');
				localStorage.removeItem('loginType');
				wwm.login.initModule();
				break;
			case 'room':
				wwm.room.initModule(state.data, 'enter');
				break;
			case 'confirm':
				break;
			default:
				wwm.shell.initModule();
		}
	};

	var initModule = function() {
		console.log('login', localStorage.login);
		console.log('first', localStorage.first);
		$(window).on('popstate', onPopstate);
		var logged = localStorage.login && JSON.parse(localStorage.login);
		var first = localStorage.first && JSON.parse(localStorage.first);
		if (first) {
			history.pushState({mod: 'intro'}, '', '/intro');
			wwm.modal.initModule($('#wwm-intro').html());
		}
		if (logged) {
			history.pushState({mode: 'lobby', id: userInfo.id}, '', '/lobby/' + userInfo.id);
			wwm.lobby.initModule();
		} else {
			history.pushState({mode: 'directlogin'}, '', '/login');
			wwm.login.initModule();
		}
	};

	return {
		initModule: initModule,
		view: cfMap.$view,
		modal: cfMap.$modal,
		logo: cfMap.$logo
	};
}());