/**
 * Created by Zero on 2015-07-25.
 */
window.onerror = function(errorMsg, url, lineNumber, column, errorObj) {
	if (typeof errorMsg === 'string' && errorMsg.indexOf('Script error.') > -1) {
		return;
	}
	console.log('Error: ', errorMsg, ' Script: ' + url + ' Line: ' + lineNumber + ' Column: ' + column + ' StackTrace: ' + errorObj);
};
window.oncontextmenu = function(event) {
	event.preventDefault();
	event.stopPropagation();
	return false;
};
$.fn.showSVGLogo = function(width) {
	var $logo = $($('#wwm-svg-logo').html());
	$logo.width(width || '100%');
	this.prepend($logo);
	return this;
};
$.fn.showCanvasLogo = function(width) {
	var $logo = $($('#wwm-canvas-logo').html());
	var canvas = $logo[0];
	var ctx = canvas.getContext('2d');
	var drawEqTriangle = function(ctx, side, cx, cy, color){
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
	};
	var drawRevEqTriangle = function(ctx, side, cx, cy, color){
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
	};
	drawEqTriangle(ctx, 50, canvas.width/2 + 13, canvas.height/2, 'magenta');
	drawRevEqTriangle(ctx, 50, canvas.width/2 + 7, canvas.height/2, 'cyan');
	drawEqTriangle(ctx, 50, canvas.width/2 - 16, canvas.height/2 - 49, 'yellow');
	drawRevEqTriangle(ctx, 50, canvas.width/2 + 36, canvas.height/2 + 49, 'greenyellow');
	$logo.width(width || '100%');
	this.prepend($logo);
	return this;
};
var eval_dust_string = function(str, chunk, context) {
	var buf;
	if (typeof str === "function") {
		if (str.length === 0) {
			str = str();
		} else {
			buf = '';
			(chunk.tap(function(data) {
				buf += data;
				return '';
			})).render(str, context).untap();
			str = buf;
		}
	}
	return str;
};
if (!dust.helpers) { dust.helpers = {}; }
dust.helpers.repeat = function(chunk, context, bodies, params) {
	var i, times;
	times = parseInt(eval_dust_string(params.times, chunk, context), 10);
	if ((times !== null) && !isNaN(times)) {
		if (context.stack.head !== null) {
			context.stack.head.$len = times;
		}
		for (i = 0; i < times; i++) {
			if (context.stack.head !== null) {
				context.stack.head.$idx = i;
			}
			chunk = bodies.block(chunk, context.push(i, i, times));
		}
		if (context.stack.head !== null) {
			context.stack.head.$idx = 0;
		}
		if (context.stack.head !== null) {
			context.stack.head.$len = 0;
		}
	}
	return chunk;
};
var wwm = (function () {
	'use strict';
	var initModule;
	initModule = function() {
		wwm.model.initModule();
		wwm.shell.initModule();
	};
	return {
		initModule: initModule
	};
}());

/**
 * Created by Zero on 2015-07-25.
 */
wwm.model = (function () {
	'use strict';
	var join, getRoomList, getRoomInfo, getUser, searchList, createRoom, enterRoom, report,
		banPerson, changeTitle, changeLimit, confirm, deleteRoom, introDone, initModule;
	join = function(data) {
		var deferred = $.Deferred();
		$.ajax('/join', {
			data: data,
			type: 'post',
			contentType: 'application/x-www-form-urlencoded;charset=utf-8'
		}).done(function(res) {
			deferred.resolve(res);
		}).fail(function(err) {
			deferred.reject(err);
		});
		return deferred.promise();
	};
	getRoomList = function(id) {
		var deferred = $.Deferred();
		$.get('/rooms/' + id).done(function (res) {
			if (res.length === 0) {
				deferred.reject('no_room');
			} else {
				deferred.resolve(res);
			}
		}).fail(function (err) {
			deferred.reject(err);
		});
		return deferred.promise();
	};
	getUser = function(id) {
		var deferred = $.Deferred();
		$.get('/member/' + id).done(function (res) {
			deferred.resolve(res);
		}).fail(function(err) {
			deferred.reject(err);
		});
		return deferred.promise();
	};
	searchList = function(query) {
		var deferred = $.Deferred();
		$.post('/search/' + query).done(function (res) {
			if (res.length === 0) {
				deferred.reject('no_room');
			}
			deferred.resolve(res);
		}).fail(function (err) {
			deferred.reject(err);
		});
		return deferred.promise();
	};
	createRoom = function(data) {
		var deferred = $.Deferred();
		var userPromise = getUser(data.maker);
		var msg;
		userPromise.done(function(res) {
			if (res.roomcount >= 3) {
				msg = '방은 최대 세 개까지 만들 수 있습니다.';
				deferred.reject(msg);
			} else {
				$.post('/addroom/' + data.rid, data).done(function (r) {
					deferred.resolve(r);
				}).fail(function (err) {
					console.log(err);
					deferred.reject(err);
				});
			}
		});
		userPromise.fail(function (err) {
			console.log(err);
			deferred.reject(err);
		});
		return deferred.promise();
	};
	enterRoom = function(data) {
		var deferred = $.Deferred();
		$.post('/enterroom/' + data.rid, data).done(function(res) {
			console.log(res);
			deferred.resolve(res);
		}).fail(function(err) {
			console.log(err);
			deferred.reject(err);
		});
		return deferred.promise();
	};
	banPerson = function(id, rid) {
		var deferred = $.Deferred();
		$.post('/ban/' + id, {rid: rid}).done(function(res) {
			console.log(res);
			deferred.resolve(res);
		}).fail(function(err) {
			console.log(err);
			deferred.reject(err);
		});
		return deferred.promise();
	};
	changeTitle = function(rid, title) {
		var deferred = $.Deferred();
		$.post('/changeroom/' + rid, {title: title}).done(function(res) {
			console.log(res);
			deferred.resolve(res);
		}).fail(function(err) {
			console.log(err);
			deferred.reject(err);
		});
		return deferred.promise();
	};
	changeLimit = function(rid, limit) {
		var deferred = $.Deferred();
		$.post('/changeroom/' + rid, {limit: limit}).done(function(res) {
			console.log(res);
			deferred.resolve(res);
		}).fail(function(err) {
			console.log(err);
			deferred.reject(err);
		});
		return deferred.promise();
	};
	confirm = function(data) {
		var deferred = $.Deferred();
		var rid = data.rid;
		data.day = JSON.stringify(data.day);
		data.night = JSON.stringify(data.night);
		console.log('confirm model', data);
		$.post('/confirm/' + rid, data).done(function(res) {
			console.log(res);
			deferred.resolve(res);
		}).fail(function(err) {
			console.log('confirmerror', err);
			deferred.reject(err);
		});
		return deferred.promise();
	};
	deleteRoom = function(rid, maker) {
		var deferred = $.Deferred();
		var msg;
		$.post('/deleteroom/' + rid, {maker: maker}).done(function (res) {
			console.log(res);
			if (res === 'no_room') {
				msg = '심각한 오류! 방장이 아닙니다.';
				deferred.reject(msg);
			}
			deferred.resolve(res);
		}).fail(function(err){
			deferred.reject(err);
		});
		return deferred.promise();
	};
	getRoomInfo = function(rid) {
		var deferred = $.Deferred();
		var msg;
		$.post('/roominfo/' + rid).done(function (res) {
			console.log(res);
			if (res === 'no_room') {
				msg = '심각한 오류! 방장이 아닙니다.';
				deferred.reject(msg);
			}
			deferred.resolve(res);
		}).fail(function(err){
			deferred.reject(err);
		});
		return deferred.promise();
	};
	introDone = function (id) {
		var deferred = $.Deferred();
		$.post('/introdone/' + id).done(function (res) {
			console.log(res);
			deferred.resolve(res);
		}).fail(function(err){
			deferred.reject(err);
		});
		return deferred.promise();
	};
	report = function(data) {
		var deferred = $.Deferred();
		$.post('/report', data).done(function (res) {
			console.log(res);
			deferred.resolve(res);
		}).fail(function(err){
			deferred.reject(err);
		});
		return deferred.promise();
	};
	initModule = function() {
		if (localStorage.login) {
			window.userInfo = JSON.parse(localStorage.login);
		} else {
			window.userInfo = {};
		}
	};
	return {
		initModule: initModule,
		createRoom: createRoom,
		getRoomList: getRoomList,
		getUser: getUser,
		enterRoom: enterRoom,
		deleteRoom: deleteRoom,
		ban: banPerson,
		changeTitle: changeTitle,
		changeLimit: changeLimit,
		searchList: searchList,
		confirm: confirm,
		join: join,
		getRoomInfo: getRoomInfo,
		introDone: introDone,
		report: report
	};
}());

wwm.shell = (function () {
	'use strict';
	var cfMap = {
		$con: $('#whenwemeet'),
		$view: $('#view'),
		$modal: $('#modal'),
		$logo: $('#logo'),
		$intro: $('#intro')
	};
	var onPopstate, initModule;
	onPopstate = function(e) {
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
				wwm.lobby.searchRoom(state.query);
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

	initModule = function() {
		var logged = localStorage.login && JSON.parse(localStorage.login);
		console.log('login', localStorage.login);
		console.log('first', localStorage.first);
		$(window).on('popstate', onPopstate);

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
		logo: cfMap.$logo,
		intro: cfMap.$intro
	};
}());

wwm.confirm = (function() {
	'use strict';
	var jqMap;
	var stMap = {};
	var setJqMap, gatherResult, showResult, toLobby, toRoom, toKakao, toFacebook, initModule;
	setJqMap = function($con) {
		jqMap = {
			$con: $con,
			$toLobbyBtn: $con.find('#to-lobby'),
			$toRoom: $con.find('#to-room'),
			$toKakao: $con.find('#result-to-kakao'),
			$toFacebook: $con.find('#result-to-fb'),
			$result: $con.find('#result')
		};
	};
	gatherResult = function() {
		var sun = [[null, null]];
		var mon = [[null, null]];
		var tue = [[null, null]];
		var wed = [[null, null]];
		var thu = [[null, null]];
		var fri = [[null, null]];
		var sat = [[null, null]];
		var week = [sun, mon, tue, wed, thu, fri, sat];
		var j, temp;
		console.log(stMap.dayArray, stMap.nightArray);
		week.forEach(function(day, i) {
			temp = 0;
			for (j = 0; j < 12; j++) {
				console.log(j, stMap.dayArray[j][i].length === 0);
				if (stMap.dayArray[j][i].length === 0) {
					console.log(day[temp][0] === null);
					if (day[temp][0] === null) { /* 처음이면 */
						day[temp][0] = j;
						day[temp][1] = day[temp][0] + 1;
					} else {
						console.log(day[temp][1] === j);
						if (day[temp][1] === j) { /* 연속된 시간 array */
							day[temp][1] = j + 1;
						} else { /* 새로운 시간 array */
							day[++temp] = [j, j + 1];
						}
					}
				}
				console.log(day, temp);
			}
			for (j = 12; j < 24; j++) {
				if (stMap.nightArray[j - 12][i].length === 0) {
					if (day[temp][0] === null) { /* 처음이면 */
						day[temp][0] = j;
						day[temp][1] = day[temp][0] + 1;
					} else {
						if (day[temp][1] === j) { /* 연속된 시간 array */
							day[temp][1] = j + 1;
						} else { /* 새로운 시간 array */
							day[++temp] = [j, j + 1];
						}
					}
				}
				console.log(day, temp);
			}
		});
		return week;
	};
	showResult = function(rangeList) {
		var str = '';
		var dayList = ['일', '월', '화', '수', '목', '금', '토'];
		var prefix = '';
		dayList.forEach(function(day, i) {
			str += '<p class="result-date">' + day + '요일: </p>';
			rangeList[i].forEach(function(range) {
				if (range[0] === null) {
					return false;
				}
				if (range[0] < 12) {
					prefix = '오전';
				} else if (range[0] === 12) {
					prefix = '오후';
				} else {
					prefix = '오후';
					range[0] -= 12;
				}
				str += prefix + ' ' + range[0] + '시 ~ ';
				if (range[1] < 12) {
					prefix = '오전';
				} else if (range[1] === 12) {
					prefix = '오후';
				} else if (range[1] === 24) {
					prefix = '밤';
					range[1] -= 12;
				} else {
					prefix = '오후';
					range[1] -= 12;
				}
				str += prefix + ' ' + range[1] + '시<br>';
			});
		});
		jqMap.$result.html(str);
	};
	toLobby = function() {
		jqMap.$con.fadeOut('slow');
		history.pushState({mod: 'lobby'}, '', '/lobby/' + stMap.myInfo.id);
		wwm.lobby.initModule(jqMap.$con);
	};
	toRoom = function() {
		history.pushState({mod: 'room'}, '', '/room/' + stMap.rid);
		jqMap.$con.fadeOut('slow');
	};
	toKakao = function() {
		/* TODO: kakao에 결과 링크 보내기 */
		console.log('kakao send');
	};
	toFacebook = function() {
		FB.ui({
			method: 'send',
			link: 'http%3A%2F%2Fwww.nytimes.com%2F2011%2F06%2F15%2Farts%2Fpeople-argue-just-to-win-scholars-assert.html'
		});
	};
	initModule = function(data) {
		var src = $('#wwm-confirm').html();
		stMap = $.extend(stMap, data);
		console.log(data, stMap);
		wwm.shell.modal.html(src);
		setJqMap(wwm.shell.modal);
		showResult(gatherResult());
		jqMap.$toLobbyBtn.click(toLobby);
		jqMap.$toRoom.click(toRoom);
		jqMap.$toKakao.on({
			click:toKakao,
			mouseover: function() {
				this.src = '/kakaolink_btn_medium_ov.png';
			},
			mouseout: function() {
				this.src = '/kakaolink_btn_medium.png';
			}
		});
		jqMap.$toFacebook.on({
			click: toFacebook,
			mouseover: function() {
				this.src = '/facebook_invite_ov.png';
			},
			mouseout: function() {
				this.src = '/facebook_invite.png';
			}
		});
		jqMap.$con.fadeIn('slow');
	};
	return {
		initModule: initModule,
		info: stMap
	};
}());	
wwm.intro = (function() {
	var jqMap = {};
	var stMap = {
		phase: 0
	};
	var initModule, skipIntro, toNextPhase, createRoom, bounce, setJqMap, endIntro, checkPhase;
	setJqMap = function ($con) {
		jqMap = {
			$con: $con,
			$main: $con.find('#intro-main'),
			$skip: $con.find('#skip-intro'),
			$next: $con.find('.next-phase')
		};
	};
	bounce = function($target, horizontal) {
		if (horizontal) {
			$target.animate({right: '+=4'}, 500).animate({right: '-=4'}, 500, function() {
				bounce($target, true);
			});
		} else {
			$target.animate({bottom: '+=4'}, 500).animate({bottom: '-=4'}, 500, function() {
				bounce($target);
			});
		}
	};
	checkPhase = function () {
		var phase = stMap.phase || parseInt(jqMap.$main.find('div').attr('class').slice(6), 10);
		switch (phase) {
			case 0:
				jqMap.$main.find('.intro-logo').showSVGLogo(100);
				break;
			case 1:
				bounce(jqMap.$main.find('#arrow-to-modal'));
				break;
			case 2:
				jqMap.$main.find('#intro-create-room, #arrow-to-create').css('left', $(window).width() * 0.5 - 50);
				bounce(jqMap.$main.find('#arrow-to-create'));
				jqMap.$con.css({height: '250px', bottom: 0});
				break;
			case 3:
				jqMap.$con.css({height: '50px', top: 0});
				bounce(jqMap.$main.find('#arrow-to-confirm'), true);
				jqMap.$main.find('.intro-wrapper').css({background: 'white', opacity: 0.9, top: '70%'});
				break;
			case 4:
				bounce(jqMap.$main.find('#arrow-to-aside'));
				jqMap.$main.find('.intro-wrapper').css({background: 'white', opacity: 0.9, top: '125%'});
				break;
			case 5:
				bounce(jqMap.$main.find('#arrow-to-result'), true);
				jqMap.$con.css({height: '50px'});
				jqMap.$main.find('.intro-wrapper').css({background: 'white', opacity: 0.9, top: '50%'});
				break;
			case 6:
				jqMap.$con.css({top: 'auto', background: 'white', textAlign: 'center'});
				jqMap.$main.find('.intro-wrapper').css({background: 'white', opacity: 0.9});
				break;
			default:
				break;
		}
	};
	toNextPhase = function () {
		var src, phase = ++stMap.phase;
		console.log('toFirstPhase', phase);
		src = $('#wwm-phase-' + phase).html();
		jqMap.$main.html(src);
		checkPhase();
	};
	skipIntro = function () {
		console.log('skipIntro');
		if ($(this).is(':checked')) {
			localStorage.first = 'false';
			wwm.shell.intro.fadeOut('slow');
			wwm.model.introDone(userInfo.id);
		}
	};
	endIntro = function () {
		localStorage.first = 'false';
		wwm.shell.intro.fadeOut('slow');
		wwm.model.introDone(userInfo.id);
	};
	createRoom = function (e) {
		var spinner = new Spinner().spin();
		var title = $('#room-title').val();
		var limit = $('#room-limit').val();
		var password = $('#room-password').val();
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
		console.log('intro createroom', data);
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
			alert('방 생성에러! 콘솔확인');
		});
		createRoomPromise.always(function () {
			$(spinner.el).remove();
		});
		toNextPhase();
	};
	initModule = function () {
		var src = $('#wwm-intro').html();
		wwm.shell.intro.html(src).fadeIn('slow');
		setJqMap(wwm.shell.intro);
		checkPhase();
		jqMap.$skip.change(skipIntro);
		jqMap.$next.click(toNextPhase);
		jqMap.$main.on('click', '#intro-show-modal', function() {
			console.log('intro showModal');
			wwm.modal.initModule($('#wwm-create-modal').html());
			toNextPhase();
		});
		jqMap.$main.on('click', '#intro-create-room', createRoom);
		jqMap.$main.on('click', '#intro-confirm', function() {
			wwm.room.confirmTable(userInfo.id, wwm.room.info.rid);
			toNextPhase();
		});
		jqMap.$main.on('click', '#intro-aside', function() {
			wwm.room.toggleAside();
			setTimeout(wwm.room.toggleAside, 3000);
			toNextPhase();
		});
		jqMap.$main.on('click', '#intro-result', function() {
			wwm.lobby.showResult(wwm.room.info.rid);
			toNextPhase();
		});
		jqMap.$main.on('click', '#intro-end', function() {
			endIntro();
		});
	};
	return {
		initModule: initModule
	};
}());
wwm.lobby = (function (){
	'use strict';
	var jqMap;
	var socket = io();
	var getList, onSearchRoom, showRooms, showCreateroom, logout, enterRoom, refreshList, refreshProfile, showResult, setJqMap, initModule;
	showCreateroom = function() {
		wwm.modal.initModule($('#wwm-create-modal').html());
	};
	getList = function() {
		var spinner = new Spinner().spin();
		var getListPromise = wwm.model.getRoomList(userInfo.id);
		jqMap.$list.append(spinner.el);
		getListPromise.done(function (res) {
			showRooms(res);
		});		getListPromise.fail(function (err) {
			if (err === 'no_room') {
				jqMap.$list.html('<span class="info-message">방이 없습니다. +를 눌러 방을 만들어보세요.</span>');
				return;
			}
			console.error(err);
			jqMap.$list.html(err.responseText);
		});
		getListPromise.always(function() {
			$(spinner.el).remove();
		});
	};
	onSearchRoom = function(e) {
		var query = e;
		var spinner = new Spinner().spin();
		var searchPromise;
		if (typeof query !== 'string') {
			query = $(this).parent().prev().val().trim();
			e.preventDefault();
		}
		if (query === '') {
			refreshList();
			return;
		}
		history.pushState({mod: 'search', query: query}, '', '/search/' + query);
		jqMap.$list.append(spinner.el);
		searchPromise = wwm.model.searchList(query);
		searchPromise.done(function (res) {
			showRooms(res);
		});
		searchPromise.fail(function (err) {
			if (err === 'no_room') {
				jqMap.$list.html('<span class="info-message">검색 결과가 없습니다.</span>');
				return;
			}
			console.error(err);
			jqMap.$list.html(err.responseText);
		});
		searchPromise.always(function() {
			$(spinner.el).remove();
		});
	};
	showRooms = function(res) {
		var $frag = $(document.createDocumentFragment());
		var tmpl, password, unlocked, parser;
		var src = $('#wwm-room-list').html();
		res.forEach(function(room) {
			tmpl = dust.loadSource(dust.compile(src));
			password = room.password || false;
			unlocked = false;
			if (password) {
				room.members.some(function(member) {
					if (member.id === userInfo.id) {
						unlocked = true;
						return unlocked;
					}
					return false;
				});
			}
			parser = {
				rid: room.rid,
				picture: room.picture,
				title: room.title,
				current: room.members.length,
				limit: room.limit,
				vacant: room.limit - room.members.length,
				result: room.result,
				password: password,
				unlocked: unlocked
			};
			dust.render(tmpl, parser, function(err, out) {
				if (err) {
					return;
				}
				$frag.append(out);
			});
		});
		jqMap.$list.html($frag);
	};
	logout = function() {
		console.info('logout');
		history.pushState({mod: 'logout'}, '', '/');
		delete window.userInfo;
		localStorage.removeItem('login');
		localStorage.removeItem('loginType');
		wwm.login.initModule();
	};
	enterRoom = function(rid) {
		/* TODO: 처음 방에 들어갔을 시 멤버정보가 안뜨는 현상 수정하기 */
		var $this = $(this);
		var spinner = new Spinner().spin();
		var enterRoomPromise, data, pw;
		jqMap.$list.append(spinner.el);
		if (typeof rid !== 'string') {
			rid = $(this).data('rid');
			if ($(this).has('.locked').length) {
				pw = prompt('비밀번호', '');
				if (pw === null || pw.trim() === '') {
					$(spinner.el).remove();
					return;
				}
			}
		}
		data = {
			rid: rid,
			pw: pw,
			pid: userInfo.id,
			name: userInfo.name,
			picture: userInfo.picture
		};
		enterRoomPromise = wwm.model.enterRoom(data);
		enterRoomPromise.done(function(res) {
			if (res === 'no_room') {
				alert('방이 없습니다');
				return;
			}
			if (res === 'full') {
				alert('방이 다 찼습니다.');
				return;
			}
			if (res === 'wrong_password') {
				alert('비밀번호가 틀렸습니다.');
				return;
			}
			if (res === 'ban') {
				alert('강퇴당한 방에는 들어갈 수 없습니다.');
				return;
			}
			res.current = $this.find('.current').text();
			console.info('enter room post result', res);
			history.pushState({mod: 'room', data: res}, '', '/room/' + rid);
			wwm.room.initModule(res, 'enter');
		});
		enterRoomPromise.fail(function(err) {
			console.error(err.responseText);
			alert('오류발생! 콘솔확인');
		});
		enterRoomPromise.always(function() {
			$(spinner.el).remove();
		});
	};
	refreshList = function() {
		console.info('refreshlist');
		getList();
	};
	refreshProfile = function() {
		var userPromise = wwm.model.getUser(userInfo.id);
		var json = JSON.parse(localStorage.login);
		userPromise.done(function(res) {
			jqMap.$profilePicture.attr('src', res.picture);
			jqMap.$profileName.text(res.name);
			userInfo.picture = res.picture;
			userInfo.name = res.name;
			json.picture = res.picture;
			json.name = res.name;
			localStorage.login = JSON.stringify(json);
		});
	};
	showResult = function(rid) {
		var resultPromise, data = {};
		if (rid) {
			resultPromise = wwm.model.getRoomInfo(rid);
			resultPromise.done(function(doc) {
				if (doc === 'no_room') {
					alert('방이 없습니다');
				} else {
					history.pushState({mod: 'confirm'}, '', '/result/' + rid);
					data.dayArray = doc.day;
					data.nightArray = doc.night;
					data.rid = doc.rid;
					wwm.confirm.initModule(data);
				}
			});
			resultPromise.fail(function(err) {
				console.error(err);
			});
		} else {
			rid = $(this).parent().data('rid');
			history.pushState({mod: 'confirm'}, '', '/result/' + rid);
			wwm.confirm.initModule(data);
		}
	};
	setJqMap = function($con) {
		jqMap = {
			$con: $con,
			$showCreateroom: $con.find('#show-createroom-modal'),
			$searchroomBtn: $con.find('#searchroom-btn'),
			$main: $con.find('#lobby-main'),
			$list: $con.find('#rooms'),
			$logout: $con.find('#logout-btn'),
			$refresh: $con.find('#refresh-list'),
			$refreshProfile: $con.find('#refresh-profile'),
			$result: $con.find('.result'),
			$profilePicture: $con.find('#profile-picture'),
			$profileName: $con.find('#profile-name')
		};
	};
	initModule = function() {
		var name, picture, src, first;
		if (!localStorage.login) {
			history.pushState({mod: 'login'}, '', '/login');
			wwm.login.initModule();
		}
		if (!localStorage.first) {
			localStorage.first = 'true';
		}
		first  = JSON.parse(localStorage.first);
		if (first) {
			wwm.intro.initModule($('#wwm-intro').html());
		}
		if (!window.userInfo) {window.userInfo = JSON.parse(localStorage.login);}
		src = $('#wwm-lobby').text();
		name =  userInfo.name;
		picture = userInfo.picture;
		dust.render(dust.loadSource(dust.compile(src)), {
			name: name,
			picture: picture
		}, function(err, out) {
			if (err) {
				console.error(err);
				alert('rendering error! 콘솔 확인');
			} else {
				wwm.shell.view.html(out).fadeIn('slow');
				setJqMap(wwm.shell.view);
				jqMap.$main.showSVGLogo();
				getList();
				jqMap.$showCreateroom.click(showCreateroom);
				jqMap.$searchroomBtn.click(onSearchRoom);
				jqMap.$logout.click(logout);
				jqMap.$refresh.click(refreshList);
				jqMap.$refreshProfile.click(refreshProfile);
				jqMap.$list.on('click', '.room', enterRoom);
				jqMap.$list.on('click', '.result', showResult);
				socket.on('titleChanged', function(data) {
					var $rooms = $('.room');
					var rid = $rooms.map(function(idx, item) {
						$(item).data('rid');
					}).get();
					rid.every(function(room, i) {
						if (data.rid === room) {
							$rooms.eq(i).find('.title').text(data.title);
							return false;
						}
						return true;
					});
				});
				socket.on('currentChanged', function(data) {
					var $rooms = $('.room');
					var rid = $rooms.map(function(idx, item) {
						$(item).data('rid');
					}).get();
					rid.every(function(room, i) {
						if (data.rid === room) {
							$rooms.eq(i).find('.current').text(data.number);
							return false;
						}
						return true;
					});
				});
				socket.on('limitChanged', function(data) {
					var $rooms = $('.room');
					var rid = $rooms.map(function(idx, item) {
						$(item).data('rid');
					}).get();
					rid.every(function(room, i) {
						if (data.rid === room) {
							$rooms.eq(i).find('.total').text(data.number);
							return false;
						}
						return true;
					});
				});
			}
		});
	};
	return {
		initModule: initModule,
		enterRoom: enterRoom,
		showResult: showResult,
		searchRoom: onSearchRoom,
		refreshList: refreshList
	};
}());

wwm.login = (function () {
	'use strict';
	var jqMap;
	var adminLogin, testLogin, kakaoLogin, fbLogin, setJqMap, kakaoCallback, fbCallback, initModule;
	adminLogin = function() {
		var res = {id: "123456789", name: '관리자', picture: '//graph.facebook.com/874512615962577/picture'};
		var joinPromise = wwm.model.join(res);
		joinPromise.fail(function(err){
			alert('가입 오류 발생!');
			console.log(err.responseText);
		});
		history.pushState({mod: 'login', data: res, type: 'local'}, '', '/lobby/123456789');
		window.userInfo = res;
		localStorage.login = JSON.stringify(res);
		localStorage.loginType = 'local';
		wwm.lobby.initModule(wwm.shell.view);
	};
	testLogin = function() {
		var res = {id: "987654321", name: '테스터', picture: 'http://th-p.talk.kakao.co.kr/th/talkp/wkkZf8zHlk/lxr9VefTlrfUr7FAzsAgJk/ljh2mh_640x640_s.jpg'};
		var joinPromise = wwm.model.join(res);
		joinPromise.fail(function(err){
			alert('가입 오류 발생!');
			console.log(err.responseText);
		});
		history.pushState({mod: 'login', data: res, type: 'local2'}, '', '/lobby/987654321');
		window.userInfo = res;
		localStorage.login = JSON.stringify(res);
		localStorage.loginType = 'local2';
		wwm.lobby.initModule(wwm.shell.view);
	};
	kakaoLogin = function() {
		Kakao.Auth.login({
			success: function () {
				Kakao.API.request({
					url: '/v1/user/me',
					success: function(result) {
						console.log(result);
						Kakao.API.request({
							url: '/v1/api/talk/profile',
							success: function(res) {
								res = $.extend(res, result);
								kakaoCallback(res);
								console.log(res);
							},
							fail: function (error) {
								alert(JSON.stringify(error));
							}
						});
					},
					fail: function (error) {
						alert(JSON.stringify(error));
					}
				});
			},
			fail: function (err) {
				alert(JSON.stringify(err));
			}
		});
	};
	kakaoCallback = function(res) {
		var joinPromise;
		console.log(JSON.stringify(res));
		res.name = res.nickName;
		res.picture = res.profileImageURL;
		res.thumb = res.thumbnailURL;
		joinPromise = wwm.model.join(res);
		joinPromise.fail(function(err){
			alert('가입 오류 발생!');
			console.log(err.responseText);
		});
		history.pushState({mod: 'login', data: res, type: 'kakao'}, '', '/lobby/' + res.id);
		window.userInfo = res;
		localStorage.login = JSON.stringify(res);
		localStorage.loginType = 'kakao';
		wwm.lobby.initModule(wwm.shell.view);
	};
	fbLogin = function() {
		FB.login(function (res) {
			if (res.status === 'connected') {
				FB.api('/me', fbCallback);
			} else if (res.status === 'not_authorized') {
				/* The person is logged into Facebook, but not your app. */
				alert('Please log log into this app.');
			} else {
				alert('Please log into Facebook.');
			}
		});
	};
	fbCallback = function(res) {
		var joinPromise;
		console.log(JSON.stringify(res));
		res.picture = '//graph.facebook.com/' + res.id + '/picture';
		joinPromise = wwm.model.join(res);
		joinPromise.fail(function(err){
			alert('가입 오류 발생!');
			console.log(err.responseText);
		});
		history.pushState({mod: 'login', data: res, type: 'facebook'}, '', '/lobby/' + res.id);
		window.userInfo = res;
		localStorage.login = JSON.stringify(res);
		localStorage.loginType = 'facebook';
		wwm.lobby.initModule(wwm.shell.view);
	};
	setJqMap = function($con) {
		jqMap = {
			$con: $con,
			$logo: $con.find('#login-logo'),
			$wrapper: $con.find('#login-wrapper'),
			$kakaoLogin: $con.find('#kakao-login-btn'),
			$fbLogin: $con.find('#fb-login-btn'),
			$localhost: $con.find('#localhost-login'),
			$localhost2: $con.find('#localhost2-login')
		};
	};
	initModule = function() {
		wwm.shell.view.html($('#wwm-login').html());
		setJqMap(wwm.shell.view);
		jqMap.$logo.showSVGLogo();
		jqMap.$logo.animate({height: '70%'});
		jqMap.$wrapper.fadeIn('slow');
		jqMap.$kakaoLogin.on({
			click: kakaoLogin,
			mouseover: function () {
				this.src = '/kakao_account_login_btn_medium_narrow_ov.png';
			},
			mouseout: function () {
				this.src = '/kakao_account_login_btn_medium_narrow.png';
			}
		});
		jqMap.$fbLogin.on({
			click: fbLogin,
			mouseover: function () {
				this.src = '/facebook_ov.png';
			},
			mouseout: function () {
				this.src = '/facebook.png';
			}
		});
		jqMap.$localhost.click(adminLogin);
		jqMap.$localhost2.click(testLogin);
	};
	return {
		initModule: initModule
	};
}());
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
wwm.room = (function(){
	'use strict';
	var cfMap = {
		colorList: ['red', 'orange', 'yellow', 'yellowgreen', 'skyblue', 'purple', 'violet', 'pink'],
		memberList: $('#wwm-member-list').text(),
		adminMenu: $('#wwm-admin-menu').text()
	};
	var stMap = {
		now: 'day',
		dayArray: null,
		nightArray: null,
		memberList: [],
		myInfo: {
			id: null,
			name: null,
			confirm: false,
			order: 0
		},
		onlineList: new Array(8),
		maker: 0,
		rid: null,
		title: null,
		picture: null,
		limit: 0,
		current: 0,
		event: false,
		clickMod: null,
		currentCell: null
	};
	var jqMap;
	var socket = io();
	var setJqMap, createArray, cellToCoord, coordListToTable, renderTable, showMembers, addNewMember, showOnlineStatus, checkCellStatus,
		banPerson, changeTitle, changeLimit, changeCurrentNumber, onClickDay, onClickTime, onClickCell, onMouseupCell, onMouseupDay, onMouseupTime,
		showAdminMenu, deleteRoom, checkConfirmStatus, toLobby, quitRoom, showReportModal, handleSocketEvent,
		toggleTable, sendChat, toggleChatList, refreshTable, removeSchedule, findInfoById,
		confirmTable, toConfirmPage, kakaoInvite, fbInvite, toggleAside, showMemberMenu, initModule;
	setJqMap = function($con) {
		jqMap = {
			$con: $con,
			$picture: $con.find('#room-header img'),
			$table: $con.find('table'),
			$dayTable: $con.find('#day-table'),
			$nightTable: $con.find('#night-table'),
			$thDay: $con.find('#day-table tr:first-child, #night-table tr:first-child').find('th'),
			$thTime: $con.find('#day-table, #night-table').find('tr').find('th:first-child'),
			$memberList: $con.find('#member-list'),
			$toggleTable: $con.find('#toggle-table'),
			$toLobbyBtn: $con.find('#back-to-lobby'),
			$quitBtn: $con.find('#quit'),
			$admin: $con.find('#manage-btn, #invite-btn'),
			$explodeRoom: $con.find('#explode-room'),
			$changeLimit: $con.find('#change-limit-btn'),
			$changeTitle: $con.find('#change-room-title'),
			$roomTitle: $con.find('#title'),
			$report: $con.find('#report-error'),
			$roomPeople: $con.find('#room-people-info'),
			$sendChat: $con.find('#send-chat'),
			$chatbox: $con.find('#chatbox'),
			$chatWrap: $con.find('#chat-wrapper'),
			$chatList: $con.find('#chat-list'),
			$chatToggler: $con.find('.chat-toggler'),
			$confirm: $con.find('#confirm-calendar'),
			$refresh: $con.find('#refresh-calendar'),
			$allConfirmed: $con.find('#all-confirmed'),
			$kakaoInvite: $con.find('#kakao-invite'),
			$fbInvite: $con.find('#fb-invite'),
			$aside: $con.find('#room-aside'),
			$asideFooter: $con.find('#aside-footer'),
			$asideToggler: $con.find('#show-aside, #close-aside')
		};
	};
	createArray = function(length) { /* dayArray, nightArray를 만든다 */
		var arr = new Array(length || 0);
		var i;
		var args = [].slice.call(arguments, 1);
		if (arguments.length > 1) {
			for (i = 0; i < length; i++) {
				arr[i] = createArray.apply(this, args);
			}
		} else if (arguments.length === 1) {
			for (i = 0; i < arr.length; i++) {
				arr[i] = [];
			}
		}
		return arr;
	};
	cellToCoord = function(cellList) { /* cell을 선택했을 때 coord로 바꿔 coordList에 넣는다 */
		var coord, coordList = [];
		cellList.forEach(function(cell) {
			coord = [cell.parentNode.rowIndex - 1, cell.cellIndex - 1];
			coordList.push(coord);
		});
		console.info('cellToCoord', coordList);
		return coordList;
	};
	coordListToTable = function(coordList, sid, cur, busy) { /* array를 table로 만든다. */
		var stMapArray, $table, $cell, $target, index, oneCell;
		console.info('coordListToTable', coordList, sid, cur, busy);
		if (cur === 'day') {
			$table = jqMap.$dayTable;
			stMapArray = stMap.dayArray;
		} else {
			$table = jqMap.$nightTable;
			stMapArray = stMap.nightArray;
		}
		coordList.forEach(function(coord) {
			$cell = $table.find('tr').eq(coord[0] + 1).find('td').eq(coord[1]);
			oneCell = stMapArray[coord[0]][coord[1]];
			if (busy) {
				index = oneCell.indexOf(sid);
				if (index === -1) {
					oneCell.push(sid);
				}
				$target = $cell.find('div').eq(sid);
				$target.addClass(cfMap.colorList[sid]);
				$cell.addClass('busy');
			} else {
				index = oneCell.indexOf(sid);
				if (index > -1) {
					oneCell.splice(index, 1);
				}
				$target = $cell.find('div').eq(sid);
				$target.removeClass(cfMap.colorList[sid]);
				if (!oneCell.length) { $cell.removeClass('busy'); }
			}
			stMapArray[coord[0]][coord[1]] = oneCell;
		});
	};
	renderTable = function() {
		var $cell;
		var stMapArrayList = [stMap.dayArray, stMap.nightArray];
		console.info('renderTable', stMap.dayArray, stMap.nightArray);
		stMapArrayList.forEach(function(stMapArray) {
			stMapArray.forEach(function(tr, i) {
				tr.forEach(function(target, j) {
					target.forEach(function(index) {
						$cell = jqMap.$dayTable.find('tr').eq(i + 1).find('td').eq(j).addClass('busy');
						$cell.find('div').eq(index).addClass(cfMap.colorList[index]);
					});
				});
			});
		});
	};
	removeSchedule = function(order) {
		var stMapArrayList = [stMap.dayArray, stMap.nightArray];
		console.info('removeSchedule', stMap.dayArray, stMap.nightArray);
		stMapArrayList.forEach(function(stMapArray) {
			stMapArray.forEach(function(tr) {
				tr.forEach(function(target) {
					var idx = target.indexOf(order);
					if (idx > -1) {
						target.splice(idx, 1);
						target.forEach(function(color, i) {
							if (order < color) {
								target[i]--;
							}
						});
					}
				});
			});
		});
		renderTable();
	};
	showMembers = function() {
		console.info('showMembers', stMap.memberList);
		jqMap.$memberList.find('ul').empty();
		stMap.memberList.forEach(function(member, i) {
			dust.render(dust.loadSource(dust.compile(cfMap.memberList)), {id: member.id, color: cfMap.colorList[i], name: member.name, picture: member.picture}, function(err, out){
				if (err) {
					jqMap.$memberList.find('ul').html(err);
				} else {
					jqMap.$memberList.find('ul').append(out);
				}
			});
		});
		showOnlineStatus();
	};
	addNewMember = function(doc) {
		console.info('newMember', doc, doc.id, stMap.memberList);
		stMap.memberList.push({id: doc.id, name: doc.name, picture: doc.picture, confirm: false});
		dust.render(dust.loadSource(dust.compile(cfMap.memberList)), {id: doc.id, color: findInfoById(doc.id).color, name: doc.name, picture: doc.picture}, function(err, out) {
			if (err) {
				jqMap.$memberList.find('ul').html(err);
			} else {
				jqMap.$memberList.find('ul').append(out);
			}
		});
		showOnlineStatus();
	};
	showOnlineStatus = function() {
		var $list;
		console.info('showOnline onlineList', stMap.onlineList);
		stMap.memberList.forEach(function(member, i) {
			$list = jqMap.$memberList.find('li').eq(i);
			if (stMap.onlineList[i]) {
				if ($list.has('.offline').length !== 0) {
					$list.find('.offline').toggleClass('offline online');
				}
			} else {
				if ($list.has('.online').length !== 0) {
					$list.find('.online').toggleClass('online offline');
				}
			}
		});
	};
	findInfoById = function(id) {
		var info = {};
		console.info('findInfo', id);
		stMap.memberList.every(function(member) {
			if (id === member.id) {
				info = member;
				return false;
			}
			return true;
		});
		return info;
	};
	banPerson = function(e, rid) {
		var banned, banPromise;
		if (typeof e === 'string') {
			banned = e;
		} else {
			banned = $(this).prev().val();
			rid = e.data.rid;
			e.preventDefault();
		}
		console.info('banPerson', arguments);
		if (banned === stMap.maker) {
			alert('자기 자신을 강퇴시키면 안 되겠죠?');
			return;
		}
		banPromise = wwm.model.ban(banned, rid);
		banPromise.done(function() {
			socket.emit('ban', {rid: stMap.rid, id: banned, order: findInfoById(banned).order});
		});
		banPromise.fail(function(err) {
			console.error(err);
			alert('퇴장당하지 않으려고 버티는중! 다시 시도하세요.');
		});
	};
	changeTitle = function(e) {
		var title = $(this).parent().prev().val();
		var titlePromise = wwm.model.changeTitle(stMap.rid, title);
		e.preventDefault();
		console.info('changeTitle', title);
		titlePromise.done(function() {
			stMap.title = title;
			jqMap.$roomTitle.text(title);
		});
		titlePromise.fail(function(err) {
			alert('제목 바꾸기 실패!');
			console.error(err);
		});
	};
	changeLimit = function(e) {
		var number = Number($(this).parent().prev().val());
		var limitPromise;
		e.preventDefault();
		if (isNaN(number)) {
			alert('숫자를 입력해야 합니다.');
			return;
		}
		console.info('changeLiimit', number);
		if (number < stMap.current) {
			alert('현재 사람이 설정한 수보다 많습니다.');
			return;
		}
		limitPromise = wwm.model.changeLimit(stMap.rid, number);
		limitPromise.done(function() {
			var original = stMap.limit, i;
			stMap.limit = number;
			if (original < number) {
				for (i = 0; i < number - original; i++) {
					jqMap.$roomPeople.append('<i class="fa fa-child vacant"></i>');
				}
			} else {
				for (i = 0; i < original - number; i++) {
					jqMap.$roomPeople.find('.vacant').last().remove();
				}
			}
		});
		limitPromise.fail(function(err) {
			alert('인원수 바꾸기 실패!');
			console.error(err);
		});
	};
	changeCurrentNumber = function(gap) {
		console.info('changeCurrentNumber', gap);
		stMap.current += gap;
		if (gap > 0) {
			jqMap.$roomPeople.find('.vacant').first().removeClass('vacant');
		} else {
			jqMap.$roomPeople.find('.fa-child').not('.vacant').last().addClass('vacant');
		}
		$('#current-people-limit').val(stMap.current);
	};
	showAdminMenu = function(e) {
		var $this = $(this);
		e.stopPropagation();
		console.info('showAdminMenu', $this.parent().hasClass('opened'));
		if ($this.parent().hasClass('opened')) {
			$this.parent().removeClass('opened');
		} else {
			$('.opened').removeClass('opened');
			$this.parent().addClass('opened');
		}
	};

	deleteRoom = function(e) {
		var rid = e.data.rid;
		var deletePromise = wwm.model.deleteRoom(rid, userInfo.id);
		console.info('room deleteRoom', rid);
		deletePromise.done(function() {
			alert('삭제되었습니다.');
			wwm.lobby.initModule(jqMap.$con);
			socket.emit('explode', rid);
		});
		deletePromise.fail(function(err) {
			console.error(err);
			alert('방 지우기 오류발생');
		});
	};
	checkConfirmStatus = function() {
		if (jqMap.$confirm.hasClass('confirmed')) {
			alert('확정 상태가 해제됩니다.');
			jqMap.$table.find('td').off('mouseover touchmove');
			jqMap.$confirm.removeClass('confirmed');
			stMap.myInfo.confirm = false;
			socket.emit('confirmed', {id: stMap.myInfo.id, bool: false});
		}
	};
	onClickDay = function(e) {
		var day = this.cellIndex - 1;
		var arr, dayList = [];
		var allSelected = true;
		var clearAll = false;
		checkConfirmStatus();
		console.info('onClickDay', day);
		jqMap.$thDay.off('mouseover').on('mouseover', onClickDay);
		if (stMap.now === 'day') {
			arr = stMap.dayArray;
		} else {
			arr = stMap.nightArray;
		}
		if (day === -1) {
			if (confirm('전체를 선택하거나 취소합니다.')) {
				e.stopPropagation();
				arr.forEach(function (tr, i) {
					tr.forEach(function (cell, j) {
						dayList.push([i, j]);
						if (!clearAll && cell.indexOf(stMap.myInfo.order) > -1) {
							clearAll = true;
						}
					});
				});
				console.log(clearAll, dayList);
				if (clearAll) {
					socket.emit('not-busy', {rid: stMap.rid, cur: stMap.now, sid: stMap.myInfo.order, arr: dayList});
				} else {
					socket.emit('busy', {rid: stMap.rid, cur: stMap.now, sid: stMap.myInfo.order, arr: dayList});
				}
				return;
			}
			jqMap.$thDay.off('mouseover');
		}
		arr.forEach(function(tr, i) {
			if (tr[day].indexOf(stMap.myInfo.order) === -1) {
				allSelected = false;
				dayList.push([i, day]);
			}
		});
		if (allSelected) {
			dayList = [];
			arr.forEach(function(tr, i) {
				dayList.push([i, day]);
			});
			socket.emit('not-busy', {rid: stMap.rid, cur: stMap.now, sid: stMap.myInfo.order, arr: dayList});
		} else {
			socket.emit('busy', {rid: stMap.rid, cur: stMap.now, sid: stMap.myInfo.order, arr: dayList});
		}
	};
	onMouseupDay = function () {
		jqMap.$thDay.off('mouseover');
	};
	onClickTime = function() {
		var time = this.parentNode.rowIndex - 1;
		var arr, timeList = [];
		var allSelected = true;
		checkConfirmStatus();
		console.info('onClickTime',  time);
		jqMap.$thTime.off('mouseover').on('mouseover', onClickTime);
		if (stMap.now === 'day') {
			arr = stMap.dayArray;
		} else {
			arr = stMap.nightArray;
		}
		if (time === -1) {
			jqMap.$thTime.off('mouseover');
			return;
		}
		arr[time].forEach(function(target, i) {
			if (target.indexOf(stMap.myInfo.order) === -1) {
				allSelected = false;
				timeList.push([time, i]);
			}
		});
		if (allSelected) {
			timeList = [];
			arr[time].forEach(function(target, i) {
				timeList.push([time, i]);
			});
			socket.emit('not-busy', {rid: stMap.rid, cur: stMap.now, sid: stMap.myInfo.order, arr: timeList});
		} else {
			socket.emit('busy', {rid: stMap.rid, cur: stMap.now, sid: stMap.myInfo.order, arr: timeList});
		}
	};
	onMouseupTime = function () {
		jqMap.$thTime.off('mouseover');
	};
	checkCellStatus = function(cell) {

	};
	onClickCell = function(e) {
		var arr, cell;
		checkConfirmStatus();
		/* TODO: 모바일에서도 가능하게 만들기 - 현재 touchmove시 cell이 고정되어있음 */
		jqMap.$table.find('td').off('mouseover touchmove').on('mouseover touchmove', onClickCell);
		if (stMap.now === 'day') {
			arr = stMap.dayArray;
		} else {
			arr = stMap.nightArray;
		}
		checkCellStatus(this);
		cell = arr[this.parentNode.rowIndex - 1][this.cellIndex - 1];
		console.info('onclickCell', this.parentNode.rowIndex - 1, this.cellIndex - 1, e.type);
		if (!stMap.currentCell) {stMap.currentCell = cell;}
		if (stMap.clickMod === 'busy') { /* 연속 상황 중 busy */
			if ((e.type === 'mouseover' || e.type === 'touchmove') && stMap.currentCell === cell) {return;}
			stMap.currentCell = cell;
			socket.emit('busy', {rid: stMap.rid, cur: stMap.now, sid: stMap.myInfo.order, arr: cellToCoord([this], false)});
		} else if (stMap.clickMod === 'not-busy') { /* 연속 상황 중 not-busy */
			if ((e.type === 'mouseover' || e.type === 'touchmove') && stMap.currentCell === cell) {return;}
			stMap.currentCell = cell;
			socket.emit('not-busy', {rid: stMap.rid, cur: stMap.now, sid: stMap.myInfo.order, arr: cellToCoord([this], false)});
		} else { /* 기본 상황 */
			if (cell.length && cell.indexOf(stMap.myInfo.order) > -1) {
				stMap.clickMod = 'not-busy';
				socket.emit('not-busy', {rid: stMap.rid, cur: stMap.now, sid: stMap.myInfo.order, arr: cellToCoord([this], false)});
			} else {
				stMap.clickMod = 'busy';
				socket.emit('busy', {rid: stMap.rid, cur: stMap.now, sid: stMap.myInfo.order, arr: cellToCoord([this], true)});
			}
		}
	};
	onMouseupCell = function() {
		jqMap.$table.find('td').off('mouseover touchmove');
		stMap.clickMod = null;
		stMap.currentCell = null;
	};
	toggleChatList = function() {
		var $wrap = jqMap.$chatWrap;
		var $list = jqMap.$chatList;
		if ($wrap.hasClass('minified')) {
			$wrap.removeClass('minified');
			$wrap.css({height: '100px'});
			$list.css({height: '100px'});
			$list.animate({scrollTop: $list[0].scrollHeight}, "slow");
			$(this).toggleClass('fa-chevron-down fa-chevron-up');
		} else {
			$wrap.addClass('minified');
			$wrap.css({height: '20px'});
			$list.css({height: '20px'});
			$list.animate({scrollTop: $list[0].scrollHeight}, "slow");
			$(this).toggleClass('fa-chevron-down fa-chevron-up');
		}
	};
	toLobby = function(e) {
		console.info('toLobby', e.data.rid);
		if (jqMap.$confirm.hasClass('confirmed')) {
			history.pushState({mod: 'lobby'}, '', '/lobby/' + stMap.myInfo.id);
			socket.emit('out', {id: stMap.myInfo.id, rid: e.data.rid, order: stMap.myInfo.order});
			wwm.lobby.initModule(jqMap.$con);
		} else {
			if (confirm('확정 버튼을 누르지 않고 나가면 저장되지 않은 사항은 사라집니다.')) {
				history.pushState({mod: 'lobby'}, '', '/lobby/' + stMap.myInfo.id);
				socket.emit('out', {id: stMap.myInfo.id, rid: e.data.rid, order: stMap.myInfo.order});
				wwm.lobby.initModule(jqMap.$con);
			}
		}
		userInfo.rid = null;
	};
	quitRoom = function(e) {
		var admin, picture, deleteRoomPromise;
		console.info('quit', e.data.rid);
		if (stMap.current === 1) { /* 방장 혼자 남았을 때 */
			if (confirm('혼자 있을 때 방을 나가면 방이 사라집니다.그래도 나가시겠습니까?')) {
				deleteRoomPromise = wwm.model.deleteRoom(e.data.rid, stMap.myInfo.id);
				deleteRoomPromise.done(function() {
					wwm.lobby.initModule(jqMap.$con);
				});
				deleteRoomPromise.fail(function (err) {
					console.error(err);
					alert('방 삭제 실패!');
				});
			}
		} else {
			if (stMap.maker === stMap.myInfo.id) { /* 방장이 다른 사람보다 먼저 나갈 때 */
				if (confirm('지금 나가면 방장이 다른 사람에게 넘어갑니다.')) {
					admin = stMap.memberList[1].id;
					picture = stMap.memberList[1].picture;
					history.replaceState({mod: 'lobby'}, '', '/lobby/' + stMap.myInfo.id);
					socket.emit('delegate', {id: stMap.myInfo.id, order: stMap.myInfo.order, rid: e.data.rid, admin: admin, picture: picture});
				}
			} else {
				if (confirm('정말 나가시겠습니까? 잠시 나가는 거면 로비 버튼을 클릭하세요.')) {
					history.replaceState({mod: 'lobby'}, '', '/lobby/' + stMap.myInfo.id);
					socket.emit('quit', {id: stMap.myInfo.id, order: stMap.myInfo.order, rid: e.data.rid});
				}
			}
		}
		userInfo.rid = null;
		wwm.lobby.initModule(jqMap.$con);
	};
	sendChat = function(e) {
		var text = $(this).parent().prev().val();
		e.preventDefault();
		console.info('sendChat', stMap.myInfo.id, text);
		socket.emit('chat', {
			id: stMap.myInfo.id,
			name: stMap.myInfo.name,
			order: stMap.myInfo.order,
			text: text,
			rid: stMap.rid
		});
	};
	refreshTable = function() {
		console.info('refresh', {rid: stMap.rid, id: stMap.myInfo.id});
		socket.on('responseArr', function(data) {
			console.info('socket responseArr');
			stMap.dayArray = data.day;
			stMap.nightArray = data.night;
			renderTable();
		});
		socket.emit('requestArr', {rid: stMap.rid, id: stMap.myInfo.id});
	};
	confirmTable = function(e, rid) {
		var data = {}, confirmPromise;
		if (typeof e === 'string') {
			data.id = e;
			data.rid = rid;
		} else {
			data = e.data;
		}
		data.bool = !stMap.myInfo.confirm;
		data.day = stMap.dayArray;
		data.night = stMap.nightArray;
		console.info('change confirm to', data.bool, data);
		confirmPromise = wwm.model.confirm(data);
		confirmPromise.done(function() {
			if (jqMap.$confirm.hasClass('confirmed')) {
				jqMap.$confirm.removeClass('confirmed');
			} else {
				jqMap.$confirm.addClass('confirmed');
			}
			stMap.myInfo.confirm = data.bool;
			socket.emit('confirmed', {id: stMap.myInfo.id, bool: data.bool});
		});
		confirmPromise.fail(function(err) {
			console.error(err);
			alert('confirm error!');
		});
	};
	toggleTable = function() {
		if (stMap.now === 'day') {
			stMap.now = 'night';
			jqMap.$dayTable.hide();
			jqMap.$nightTable.show();
		} else {
			stMap.now = 'day';
			jqMap.$dayTable.show();
			jqMap.$nightTable.hide();
		}
		$(this).find('div').toggleClass('tapped');
	};
	toConfirmPage = function() {
		console.info('toConfirmPage', stMap);
		history.pushState({mod: 'confirm'}, '', '/result/' + stMap.rid);
		wwm.confirm.initModule(stMap);
	};
	kakaoInvite = function() {
		Kakao.Link.createTalkLinkButton({
			container: '#kakao-invite',
			label: '카카오링크 샘플에 오신 것을 환영합니다.',
			image: {
				src: 'http://dn.api1.kage.kakao.co.kr/14/dn/btqaWmFftyx/tBbQPH764Maw2R6IBhXd6K/o.jpg',
				width: '300',
				height: '200'
			},
			webButton: {
				text: '우리 언제 만나',
				url: 'http://whenwemeet.herokuapp.com' /* The URLs domain should be configured in app settings. */
			},
			fail: function() {
				alert('KakaoLink is currently only supported in iOS and Android platforms.');
			}
		});
	};
	fbInvite = function() {
		FB.ui({
			method: 'send',
			link: 'http%3A%2F%2Fwww.nytimes.com%2F2011%2F06%2F15%2Farts%2Fpeople-argue-just-to-win-scholars-assert.html'
		});
	};
	toggleAside = function() {
		console.info('toggleAside', jqMap.$aside.hasClass('opened'));
		if (jqMap.$aside.hasClass('opened')) {
			jqMap.$aside.removeClass('opened');
			jqMap.$aside.css('left', '-100%');
		} else {
			jqMap.$aside.addClass('opened');
			jqMap.$aside.css('left', '0');

		}
	};
	showMemberMenu = function() {
		var $this = $(this);
		console.info('showMemberMenu', stMap.maker === stMap.myInfo.id);
		if (stMap.maker === stMap.myInfo.id) {
			if (!$this.has('.ban-this-btn').length) {
				$this.append('<span class="ban-this-btn">강퇴</span>');
				setTimeout(function () {
					$this.find('.ban-this-btn').fadeOut('slow').remove();
				}, 5000);
			}
		} else {
			return false;
		}
	};
	showReportModal = function () {
		wwm.modal.initModule($('#wwm-report').html());
	};
	handleSocketEvent = function () {
		console.info('handleEvnet', stMap.event);
		if (stMap.event) {
			return;
		}
		socket.on('out', function(data) {
			stMap.memberList.every(function(member, i) {
				if (member.id === data.id) {
					stMap.onlineList[i] = false;
					return false;
				}
				return true;
			});
			showOnlineStatus();
			jqMap.$chatList.append('<p><span class="' + cfMap.colorList[data.order] + '-text">' + findInfoById(data.id).name + '님이 오프라인입니다.</span></p>');
			jqMap.$chatList.animate({ scrollTop: jqMap.$chatList[0].scrollHeight }, "slow");
			console.info('socket out', stMap.onlineList, stMap.memberList);
		});
		socket.on('quit', function(data) {
			jqMap.$chatList.append('<p><span class="' + cfMap.colorList[data.order] + '-text">' + findInfoById(data.id).name + '님이 퇴장하셨습니다.</span></p>');
			jqMap.$chatList.animate({ scrollTop: jqMap.$chatList[0].scrollHeight }, "slow");
			stMap.memberList.forEach(function(member, i) {
				if (member.id === data.id) {
					stMap.onlineList.splice(i, 1);
					stMap.memberList.splice(i, 1);
					return false;
				}
				return true;
			});
			changeCurrentNumber(-1);
			showMembers();
			removeSchedule(data.order);
			console.info('socket quit', stMap.onlineList, stMap.memberList);
		});
		socket.on('delegate', function(data) {
			jqMap.$chatList.append('<p><span class="' + cfMap.colorList[data.order] + '-text">' + findInfoById(data.id).name + '님이 퇴장하셨습니다.</span></p>');
			jqMap.$chatList.append('<p><span class="' + findInfoById(data.admin).color + '-text">' + findInfoById(data.admin).name + '님이 이제 방장입니다.</span></p>');
			jqMap.$chatList.animate({ scrollTop: jqMap.$chatList[0].scrollHeight }, "slow");
			stMap.memberList.forEach(function(member, i) {
				if (member.id === data.id) {
					stMap.onlineList.splice(i, 1);
					stMap.memberList.splice(i, 1);
					return false;
				}
				return true;
			});
			changeCurrentNumber(-1);
			showMembers();
			removeSchedule(data.order);
			stMap.maker = data.admin;
			stMap.picture = data.picture;
			jqMap.$picture.attr('src', stMap.picture);
			if (stMap.myInfo.id === data.admin) {
				dust.render(dust.loadSource(dust.compile(cfMap.adminMenu)), {admin: true}, function(err, out) {
					if (err) {
						console.error(err);
					} else {
						jqMap.$admin.replaceWith(out);
					}
				});
			}
			console.info('socket quit', stMap.onlineList, stMap.memberList);
		});
		socket.on('newMember', function(data) {
			console.info('socket newmember', data);
			stMap.onlineList[data.order] = true;
			socket.emit('uptodateArr', {sid: data.socket, day: stMap.dayArray, night: stMap.nightArray, online: stMap.onlineList});
			if (data.order >= stMap.current) {
				changeCurrentNumber(1);
				addNewMember(data);
			}
			jqMap.$chatList.append('<p><span class="' + cfMap.colorList[data.order] + '-text">' + data.name + '님이 입장하셨습니다.</span></p>');
			jqMap.$chatList.animate({ scrollTop: jqMap.$chatList[0].scrollHeight }, "slow");
			showOnlineStatus();
		});
		socket.on('uptodateArr', function(data) {
			console.info('socket uptodateArr');
			stMap.dayArray = data.day;
			stMap.nightArray = data.night;
			stMap.onlineList = data.online;
			showOnlineStatus();
			renderTable();
		});
		socket.on('chat', function(data) {
			console.info('socket chat', data.id, data.text);
			jqMap.$chatList.append('<p><span class="' + cfMap.colorList[data.order] + '-text">' + data.name + '</span>: ' + data.text + '</p>');
			jqMap.$chatbox.val('').focus();
			jqMap.$chatList.animate({ scrollTop: jqMap.$chatList[0].scrollHeight }, "slow");
		});
		socket.on('busy', function(data) {
			console.info('socket busy:', data.arr, data.sid, data.cur);
			coordListToTable(data.arr, data.sid, data.cur, true);
		});
		socket.on('not-busy', function(data) {
			console.info('socket notbusy:', data.arr, data.sid, data.cur);
			coordListToTable(data.arr, data.sid, data.cur, false);
		});
		socket.on('requestArr', function(data) {
			console.info('socket requestArr');
			socket.emit('responseArr', {sid: data.sid, day: stMap.dayArray, night: stMap.nightArray});
		});
		socket.on('ban', function(data) {
			console.info('socket ban', data.id, data.order);
			/* 강퇴당한 경우. */
			if (stMap.myInfo.order === data.order) {
				alert('강퇴당하셨습니다...');
				wwm.lobby.initModule(jqMap.$con);
				userInfo.rid = null;
				return;
			}
			/* 다른 사람이 강퇴당한 경우. */
			if (stMap.myInfo.order > data.order) {
				stMap.myInfo.order--;
			}
			alert(findInfoById(data.id).name + '님이 강제퇴장 되었습니다. 잘가요!');
			stMap.memberList.every(function(member, i) {
				if (data.id === member.id) {
					stMap.memberList.splice(i, 1);
					stMap.onlineList.splice(i, 1);
					return false;
				}
				return true;
			});
			changeCurrentNumber(-1);
			removeSchedule(data.order);
			showMembers();
		});
		socket.on('confirmed', function(data) {
			var confirmCount = 0;
			stMap.memberList.forEach(function(member) {
				if (member.id === data.id) {
					member.confirm = data.bool;
				}
				if (member.confirm === true) {
					confirmCount++;
				}
			});
			if (confirmCount === stMap.memberList.length) {
				jqMap.$allConfirmed.show();
			} else {
				jqMap.$allConfirmed.hide();
			}
			console.info('socket confirmed', confirmCount);
		});
		socket.on('explode', function() {
			alert('방이 폭파되었습니다. 로비로 이동합니다.');
			wwm.lobby.initModule(jqMap.$con);
			console.info('socket explode');
		});
		stMap.event = true;
	};
	initModule = function(doc) {
		var parser;
		var src = $('#wwm-room').text();
		stMap.title = doc.title;
		stMap.limit = Number(doc.limit);
		stMap.rid = doc.rid.toString();
		userInfo.rid = stMap.rid;
		stMap.maker = doc.maker.toString();
		stMap.dayArray = doc.day || createArray(12,7);
		stMap.nightArray = doc.night || createArray(12,7);
		console.info('initiating room #' + stMap.rid, stMap.dayArray, stMap.nightArray);
		stMap.memberList = Array.isArray(doc.members) ? doc.members : JSON.parse(doc.members);
		stMap.current = stMap.memberList.length;
		stMap.picture = doc.picture;
		stMap.myInfo.id = userInfo.id.toString();
		stMap.myInfo.name = userInfo.name;
		stMap.memberList.every(function(member, i) {
			if (member.id === userInfo.id) {
				stMap.myInfo.order = i;
				stMap.myInfo.confirm = member.confirm;
				return false;
			}
			return true;
		});
		stMap.onlineList[stMap.myInfo.order] = true;
		parser = {
			name: stMap.myInfo.name,
			title: stMap.title,
			current: stMap.current,
			limit: stMap.limit,
			members: stMap.memberList,
			picture: stMap.picture,
			vacant: stMap.limit - stMap.current
		};
		if (stMap.myInfo.id === stMap.maker) {
			parser.admin = true;
		}
		dust.render(dust.loadSource(dust.compile(src)), parser, function(err, out) {
			if (err) {
				wwm.shell.view.html(err);
				return;
			}
			wwm.shell.view.html(out);
			dust.render(dust.loadSource(dust.compile(cfMap.adminMenu)), parser, function(err, out) {
				var confirmCount = 0;
				if (err) {
					wwm.shell.view.html(err);
					return;
				}
				wwm.shell.view.find('#aside-footer').prepend(out);
				setJqMap(wwm.shell.view);
				renderTable();
				if (stMap.myInfo.confirm) {
					jqMap.$confirm.addClass('confirmed');
				}
				stMap.memberList.forEach(function(member) {
					if (member.confirm === true) {
						confirmCount++;
					}
				});
				console.log('confirmCount', confirmCount);
				if (confirmCount === stMap.memberList.length) {
					jqMap.$allConfirmed.show();
				} else {
					jqMap.$allConfirmed.hide();
				}
				jqMap.$roomTitle.addClass(cfMap.colorList[stMap.myInfo.order] + '-text');
				showMembers();
				handleSocketEvent();
				socket.emit('enter', {
					'id': stMap.myInfo.id,
					'rid': stMap.rid,
					'name': stMap.myInfo.name,
					'order': stMap.myInfo.order,
					'picture': userInfo.picture
				});
				jqMap.$table.find('td').on('mousedown', onClickCell);
				jqMap.$table.find('td').on('mouseup', onMouseupCell);
				jqMap.$thDay.mousedown(onClickDay);
				jqMap.$thDay.mouseup(onMouseupDay);
				jqMap.$thTime.mousedown(onClickTime);
				jqMap.$thTime.mouseup(onMouseupTime);
				jqMap.$explodeRoom.click({rid: stMap.rid}, deleteRoom);
				jqMap.$toLobbyBtn.click({rid: stMap.rid}, toLobby);
				jqMap.$toggleTable.click(toggleTable);
				jqMap.$admin.click(showAdminMenu);
				jqMap.$changeLimit.click({rid: stMap.rid}, changeLimit);
				jqMap.$changeTitle.click({rid: stMap.rid}, changeTitle);
				jqMap.$sendChat.click(sendChat);
				jqMap.$memberList.on('click', 'li', showMemberMenu);
				jqMap.$memberList.on('click', '.ban-this-btn', function () {
					var id = $(this).parent().data('id');
					banPerson(id.toString(), stMap.rid);
				});
				jqMap.$confirm.click({id: stMap.myInfo.id, rid: stMap.rid}, confirmTable);
				jqMap.$chatToggler.click(toggleChatList);
				jqMap.$refresh.click(refreshTable);
				jqMap.$allConfirmed.click(toConfirmPage);
				jqMap.$quitBtn.click({id: stMap.myInfo.id, rid: stMap.rid}, quitRoom);
				jqMap.$asideToggler.click(toggleAside);
				jqMap.$report.click(showReportModal);
				jqMap.$kakaoInvite.on({
					click: kakaoInvite,
					mouseover: function() {
						this.src = '/kakaolink_btn_medium_ov.png';
					},
					mouseout: function() {
						this.src = '/kakaolink_btn_medium.png';
					}
				});
				jqMap.$fbInvite.on({
					click: fbInvite,
					mouseover: function() {
						this.src = '/facebook_invite_ov.png';
					},
					mouseout: function() {
						this.src = '/facebook_invite.png';
					}
				});
			});
		});
	};
	return {
		initModule: initModule,
		info: stMap,
		confirmTable: confirmTable,
		toggleAside: toggleAside
	};
}());