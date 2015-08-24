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
				wwm.login.initModule(wwm.shell.view);
				break;
			case 'lobby':
				wwm.lobby.initModule(wwm.shell.view);
				break;
			case 'room':
				$.post('/enterroom/' + state.rid, {pw: state.pw, pid: userInfo.id, name: userInfo.name})
					.done(function(res) {
						res[0].title = state.title;
						res[0].current = state.current;
						res[0].number = state.number;
						res[0].maker = state.maker;
						res[0].members = state.members;
						console.log('enterroompostresult', res[0]);
						wwm.room.initModule(res[0], 'enter');	
					})
					.fail(function(err) {
						alert('비밀번호가 틀렸습니다.');
					});
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
			wwm.modal.initModule($('#wwm-intro').html());
		}
		if (logged) {
			history.pushState({mode: 'lobby', id: userInfo.id}, '', 'lobby/' + userInfo.id);
			wwm.lobby.initModule(wwm.shell.view);
		} else {
			history.pushState({mode: 'login'}, '', 'login');
			wwm.login.initModule(wwm.shell.view);
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
