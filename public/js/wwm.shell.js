wwm.shell = (function () {
	var cfMap = {
		$con: $('#whenwemeet'),
		$view: $('#view'),
		$modal: $('#modal')
	};
	function onPopstate(e) {
		var state = e.originalEvent.state;
		var mod = state.mod;
		console.log('onpopstate', mod);
		switch (mod) {
			case 'login':
				window.userInfo = state.data;
				localStorage.login = JSON.stringify(state.data);
				localStorage.loginType = state.type;
				wwm.lobby.initModule(wwm.shell.view);
				break;
			case 'directlogin':
				wwm.login.initModule(wwm.shell.view);
				break;
			case 'lobby':
				wwm.lobby.initModule(wwm.shell.view);
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
				wwm.login.initModule(wwm.shell.view);
				break;
			case 'room':
				wwm.room.initModule(state.data, 'enter');
				break;
			case 'confirm':
				break;
			default:
				wwm.shell.initModule();
		}
	}
	function onError(errorMsg, url, lineNumber, column, errorObj) {
		if (typeof errorMsg === 'string' && errorMsg.indexOf('Script error.') > -1) {
			return;
		}
		console.log('Error: ', errorMsg, ' Script: ' + url + ' Line: ' + lineNumber + ' Column: ' + column + ' StackTrace: ' + errorObj);
	}
	function drawEqTriangle(ctx, side, cx, cy, color){  
		var h = side * (Math.sqrt(3)/2);    
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.moveTo(cx, cy - h / 2);
		ctx.lineTo(cx - side / 2, cy + h / 2);
		ctx.lineTo(cx + side / 2, cy + h / 2);
		ctx.lineTo(cx, cy - h / 2);
		ctx.shadowOffsetX = 1;
		ctx.shadowOffsetY = 3;
		ctx.shadowBlur    = 1;
		ctx.shadowColor   = 'rgb(204, 204, 204)';      
		ctx.fill(); 
	}
	function drawRevEqTriangle(ctx, side, cx, cy, color){  
		var h = side * (Math.sqrt(3)/2); 
		ctx.fillStyle = color;
		ctx.beginPath(); 
		ctx.moveTo(cx, cy - h / 2);
		ctx.lineTo(cx - side, cy - h / 2);
		ctx.lineTo(cx - side / 2, cy + h / 2);
		ctx.lineTo(cx, cy - h / 2);
		ctx.shadowOffsetX = 1;
		ctx.shadowOffsetY = 3;
		ctx.shadowBlur    = 1;
		ctx.shadowColor   = 'rgb(204, 204, 204)'; 
		ctx.fill(); 
	}
	function showCanvasLogo($target, width) {
		var $logo = $($('#wwm-canvas-logo').html());
		var canvas = $logo[0];
		var ctx = canvas.getContext('2d');
		drawEqTriangle(ctx, 50, canvas.width/2 + 13, canvas.height/2, 'magenta');
		drawRevEqTriangle(ctx, 50, canvas.width/2 + 7, canvas.height/2, 'cyan');
		drawEqTriangle(ctx, 50, canvas.width/2 - 16, canvas.height/2 - 49, 'yellow');
		drawRevEqTriangle(ctx, 50, canvas.width/2 + 36, canvas.height/2 + 49, 'greenyellow');
		$logo.width(width);
		$target.prepend($logo);
	}
	function showSVGLogo($target, width) {
		var $logo = $($('#wwm-svg-logo').html());
		$logo.width(width);
		$target.prepend($logo);
	}

	function initModule() {
		console.log('login', localStorage.login);
		console.log('first', localStorage.first);
		var logged = localStorage.login && JSON.parse(localStorage.login);
		var first = localStorage.first && JSON.parse(localStorage.first);
		if (first) {
			history.pushState({mod: 'intro'}, '', 'intro');
		}
		if (logged) {
			history.pushState({mode: 'lobby', id: userInfo.id}, '', 'lobby/' + userInfo.id);
		} else {
			history.pushState({mode: 'directlogin'}, '', 'login');
		}
		window.onerror = onError;
		$(window).on('popstate', onPopstate);
	}

	return {
		initModule: initModule,
		view: cfMap.$view,
		modal: cfMap.$modal,
		showSVGLogo: showSVGLogo,
		showCanvasLogo: showCanvasLogo
	};
}());
