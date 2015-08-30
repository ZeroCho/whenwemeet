/**
 * Created by Zero on 2015-07-25.
 */
window.onerror = function(errorMsg, url, lineNumber, column, errorObj) {
	if (typeof errorMsg === 'string' && errorMsg.indexOf('Script error.') > -1) {
		return;
	}
	console.log('Error: ', errorMsg, ' Script: ' + url + ' Line: ' + lineNumber + ' Column: ' + column + ' StackTrace: ' + errorObj);
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
	drawEqTriangle(ctx, 50, canvas.width/2 + 13, canvas.height/2, 'magenta');
	drawRevEqTriangle(ctx, 50, canvas.width/2 + 7, canvas.height/2, 'cyan');
	drawEqTriangle(ctx, 50, canvas.width/2 - 16, canvas.height/2 - 49, 'yellow');
	drawRevEqTriangle(ctx, 50, canvas.width/2 + 36, canvas.height/2 + 49, 'greenyellow');
	$logo.width(width || '100%');
	this.prepend($logo);
	return this;
};
var wwm = (function () {
	function initModule() {
		wwm.model.initModule();
		wwm.shell.initModule();
	}
	return {
		initModule: initModule
	};
}());
/**
 * Created by Zero on 2015-07-25.
 */
wwm.model = (function () {
	var join = function(data) {
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
	var getRoomList = function(id) {
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
	var getUser = function(id) {
		var deferred = $.Deferred();
		$.get('/member/' + id).done(function (res) {
			deferred.resolve(res);
		}).fail(function(err) {
			deferred.reject(err);
		});
		return deferred.promise();
	};
	var searchList = function(query) {
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
	var banPerson = function(id, rid) {
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
	var enterRoom = function() {

	};
	var changeTitle = function(rid, title) {
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
	var changeLimit = function(rid, limit) {
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
	var confirm = function(data) {
		var deferred = $.Deferred();
		var rid = data.rid;
		data.day = JSON.stringify(data.day);
		data.night = JSON.stringify(data.night)
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
	var createRoom = function(data) {
		var deferred = $.Deferred();
		var userPromise = getUser(data.maker);
		userPromise.done(function(res) {
			if (res.roomcount >= 3) {
				var msg = '방은 최대 세 개까지 만들 수 있습니다.';
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
	var deleteRoom = function(rid, maker) {
		var deferred = $.Deferred();
		$.post('/deleteroom/' + rid, {maker: maker}).done(function (res) {
			console.log(res);
			if (res === 'no_room') {
				var msg = '심각한 오류! 방장이 아닙니다.';
				deferred.reject(msg);
			}
			deferred.resolve(res);
		}).fail(function(err){
			deferred.reject(err);
		});
		return deferred.promise();
	};
	var getRoomInfo = function(rid) {
		var deferred = $.Deferred();
		$.post('/roominfo/' + rid).done(function (res) {
			console.log(res);
			if (res === 'no_room') {
				var msg = '심각한 오류! 방장이 아닙니다.';
				deferred.reject(msg);
			}
			deferred.resolve(res);
		}).fail(function(err){
			deferred.reject(err);
		});
		return deferred.promise();
	};
	var initModule = function() {
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
		getRoomInfo: getRoomInfo
	};
}());
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
wwm.confirm = (function() {
	var jqMap;
	var stMap = {};
	function setJqMap($con) {
		jqMap = {
			$con: $con,
			$toLobby: $con.find('#to-lobby'),
			$toRoom: $con.find('#to-room'),
			$toKakao: $con.find('#result-to-kakao'),
			$toFacebook: $con.find('#result-to-fb'),
			$result: $con.find('#result')
		};
	}
	function gatherResult() {
		var sun = [[null, null]];
		var mon = [[null, null]];
		var tue = [[null, null]];
		var wed = [[null, null]];
		var thu = [[null, null]];
		var fri = [[null, null]];
		var sat = [[null, null]];
		var week = [sun, mon, tue, wed, thu, fri, sat];
		var i, j;
		for (i = 0; i < 7; i++) {
			var temp = 0;
			for (j = 0; j < 12; j++) {
				console.log(j, stMap.dayArray[j][i].length === 0);
				if (stMap.dayArray[j][i].length === 0) {
					console.log(week[i][temp][0] === null);
					if (week[i][temp][0] === null) { // 처음이면
						week[i][temp][0] = j;
						week[i][temp][1] = week[i][temp][0] + 1;
					} else {
						console.log(week[i][temp][1] === j);
						if (week[i][temp][1] === j) { // 연속된 시간 array
							week[i][temp][1] = j + 1;
						} else { // 새로운 시간 array
							week[i][++temp] = [j, j + 1];
						}
					}
				}
				console.log(week[i], temp);
			}
			for (j = 0; j < 12; j++) {
				if (stMap.nightArray[j][i].length === 0) {
					if (week[i][temp][0] === null) { // 처음이면
						week[i][temp][0] = j + 12;
						week[i][temp][1] = week[i][temp][0] + 1;
					} else {
						if (week[i][temp][1] === j + 12) { // 연속된 시간 array
							week[i][temp][1] = j + 13;
						} else { // 새로운 시간 array
							week[i][++temp] = [j + 12, j + 13];
						}
					}
				}
				console.log(week[i], temp);
			}
		}
		return week;
	}
	var showResult = function(week) {
		var str = '가능한 시간은<br>';
		var dayList = ['일', '월', '화', '수', '목', '금', '토'];
		for (var i = 0; i < 7; i++) {
			str += dayList[i] + '요일:<br>';
			for (var j = 0; j < week[i].length; j++) {
				var prefix = '';
				if (week[i][j][0] < 12) {
					prefix = '오전'
				} else if (week[i][j][0] === 12) {
					prefix = '오후';
				} else if (week[i][j][0] === 24) {
					prefix = '밤';
					week[i][j][0] -= 12;
				} else {
					prefix = '오후';
					week[i][j][0] -= 12;
				}
				str += prefix + ' ' + week[i][j][0] + '시부터 ~ ';
				if (week[i][j][1] < 12) {
					prefix = '오전'
				} else if (week[i][j][1] === 12) {
					prefix = '오후';
				} else if (week[i][j][1] === 24) {
					prefix = '밤';
					week[i][j][1] -= 12;
				} else {
					prefix = '오후';
					week[i][j][1] -= 12;
				}
				str += prefix + ' ' + week[i][j][1] + '시까지<br>';
			}
		}
		str += '입니다.';
		jqMap.$result.html(str);
	};
	var toLobby = function() {
		jqMap.$con.fadeOut('slow');
		history.pushState({mod: 'lobby'}, '', '/lobby/' + stMap.myInfo.id);
		wwm.lobby.initModule(jqMap.$con);
	};
	var toRoom = function() {
		history.pushState({mod: 'room'}, '', '/room/' + stMap.rid);
		jqMap.$con.fadeOut('slow');
	};
	var toKakao = function() {};
	var toFacebook = function() {
		FB.ui({
			method: 'send',
			link: 'http%3A%2F%2Fwww.nytimes.com%2F2011%2F06%2F15%2Farts%2Fpeople-argue-just-to-win-scholars-assert.html'
		});
	};
	var initModule = function(data) {
		stMap = $.extend(stMap, data);
		console.log(data, stMap);
		var src = $('#wwm-confirm').html();
		wwm.shell.modal.html(src);
		setJqMap(wwm.shell.modal);
		var arr = gatherResult();
		showResult(arr);
		jqMap.$toLobby.click(toLobby);
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
wwm.lobby = (function (){
	var jqMap;
	var socket = io();
	function showCreateroom() {
		wwm.modal.initModule($('#wwm-createroom-modal').html());
	}
	function getList() {
		var spinner = new Spinner().spin();
		jqMap.$list.append(spinner.el);
		var getListPromise = wwm.model.getRoomList(userInfo.id);
		getListPromise.done(function (res) {
			showRooms(res);
		});
		getListPromise.fail(function (err) {
			if (err === 'no_room') {
				jqMap.$list.html('<span class="info-message">방이 없습니다. 방을 만들어보세요.</span>');
				return;
			}
			console.log(err);
			jqMap.$list.html(err.responseText);
		});
		getListPromise.always(function() {
			$(spinner.el).remove();
		});
	}
	function onSearchRoom (e) {
		e.preventDefault();
		var query = e;
		if (typeof e !== string) {
			query = $(this).parent().prev().val().trim();
		}
		console.log('query', query);
		var spinner = new Spinner().spin();
		jqMap.$list.append(spinner.el);
		history.pushState({mod: 'search', data: res}, '', '/search/' + query);
		var searchPromise = wwm.model.searchList(query);
		searchPromise.done(function (res) {
			showRooms(res);
		});
		searchPromise.fail(function (err) {
			if (err === 'no_room') {
				jqMap.$list.html('<span class="info-message">검색 결과가 없습니다.</span>');
				return;
			}
			console.log(err);
			jqMap.$list.html(err.responseText);
		});
		searchPromise.always(function() {
			$(spinner.el).remove();
		});
	}
	function showRooms(res) {
		var $frag = $(document.createDocumentFragment());
		for (var i = 0; i < res.length; i++) {
			var room = res[i];
			var src = $('#wwm-room-list').html();
			var tmpl = dust.loadSource(dust.compile(src));
			var password = room.password || false;
			var unlocked = false;
			if (password) {
				for (var j = 0; j < room.members.length; j++) {
					if (room.members[j].id == userInfo.id) {
						unlocked = true;
						break;
					}
				}
			}
			var parser = {
				rid: room.rid,
				picture: room.picture,
				title: room.title,
				current: room.members.length,
				limit: room.limit,
				result: room.result,
				password: password,
				unlocked: unlocked
			};
			dust.render(tmpl, parser, function(err, out) {
				$frag.append(out);
			});
		}
		jqMap.$list.html($frag);
	}
	function logout() {
		history.pushState({mod: 'logout'}, '', '/');
		delete window.userInfo;
		localStorage.removeItem('login');
		localStorage.removeItem('loginType');
		wwm.login.initModule();
	}
	function enterRoom(rid) {
		var $this = $(this);
		var pw;
		var spinner = new Spinner().spin();
		jqMap.$list.append(spinner.el);
		console.log(rid);
		if (typeof rid !== 'string') {
			rid = $(this).data('rid');
			if ($(this).has('.locked').length) {
				pw = prompt('비밀번호', '');
				console.log(pw);
				if (pw === null || pw.trim() === '') {
					$(spinner.el).remove();
					return;
				}
			}
		}
		var ajax = $.post('/enterroom/' + rid, {pw: pw, pid: userInfo.id, name: userInfo.name, picture: userInfo.picture});
		ajax.done(function(res) {
			if (res === 'no_room') {
				alert('방이 없습니다');
				return;
			} else if (res === 'wrong_password') {
				alert('비밀번호가 틀렸습니다.');
				return;
			} else if (res === 'ban') {
				alert('강퇴당한 방에는 들어갈 수 없습니다.');
				return;
			}
			res.current = $this.find('.current').text();
			console.log('enter room post result', res);
			history.pushState({mod: 'room', data: res}, '', '/room/' + rid);
			wwm.room.initModule(res, 'enter');
		})
		.fail(function(err) {
			console.log(err.responseText);
			alert('오류발생! 콘솔확인');
		})
		.always(function() {
			$(spinner.el).remove();
		});
	}
	function refreshList() {
		console.log('refreshlist');
		getList();
	}
	function refreshProfile() {
		var userPromise = wwm.model.getUser(userInfo.id);
		userPromise.done(function(res) {
			jqMap.$profilePicture.attr('src', res.picture);
			jqMap.$profileName.text(res.name);
			userInfo.picture = res.picture;
			userInfo.name = res.name;
			var json = JSON.parse(localStorage.login);
			json.picture = res.picture;
			json.name = res.name;
			localStorage.login = JSON.stringify(json);
		});
	}
	function showResult(rid) {
		if (rid) {
			$.post('/roominfo/' + rid)
				.done(function (doc) {
					if (doc === 'no_room') {
						alert('방이 없습니다');
					} else {
						history.pushState({mod: 'confirm'}, '', '/result/' + rid);
						var data = {};
						data.dayArray = doc.day;
						data.nightArray = doc.night;
						data.rid = doc.rid;
						wwm.confirm.initModule(data);
					}
				})
				.fail(function (err) {
					console.error(err);
				});
		} else {
			rid = $(this).parent().data('rid');
			history.pushState({mod: 'confirm'}, '', '/result/' + rid);
			wwm.confirm.initModule(data);
		}
	}
	function setJqMap($con) {
		jqMap = {
			$con: $con,
			$logo: $con.find('#lobby-logo'),
			$showCreateroom: $con.find('#show-createroom-modal'),
			$searchroomBtn: $con.find('#searchroom-btn'),
			$list: $con.find('#rooms'),
			$logout: $con.find('#logout-btn'),
			$refresh: $con.find('#refresh-list'),
			$refreshProfile: $con.find('#refresh-profile'),
			$result: $con.find('.result'),
			$profilePicture: $con.find('#profile-picture'),
			$profileName: $con.find('#profile-name')
		};
	}
	function initModule() {
		if (!localStorage.login) {
			history.pushState({mod: 'login'}, '', '/login');
			wwm.login.initModule();
		}
		if (!window.userInfo) {window.userInfo = JSON.parse(localStorage.login);}
		var src = $('#wwm-lobby').text();
		var name =  userInfo.name;
		var picture = userInfo.picture;
		dust.render(dust.loadSource(dust.compile(src)), {
			name: name,
			picture: picture
		}, function(err, out) {
			if (err) {
				console.log(err);
				alert('rendering error! 콘솔 확인');
			} else {
				wwm.shell.view.html(out).fadeIn('slow');
				setJqMap(wwm.shell.view);
				getList();
				jqMap.$showCreateroom.click(showCreateroom);
				jqMap.$searchroomBtn.click(onSearchRoom);
				jqMap.$logout.click(logout);
				jqMap.$refresh.click(refreshList);
				jqMap.$refreshProfile.click(refreshProfile);
				socket.on('titleChanged', function(data) {
					var $rooms = $('.room');
					var rid = $rooms.map(function(idx, item) {
						$(item).data('rid');
					}).get();
					for (var i = 0; i < rid.length; i++) {
						if (data.rid === rid[i]) {
							$rooms.eq(i).find('.title').text(data.title);
							break;
						}
					}
				});
				socket.on('currentChanged', function(data) {
					var $rooms = $('.room');
					var rid = $rooms.map(function(idx, item) {
						$(item).data('rid');
					}).get();
					for (var i = 0; i < rid.length; i++) {
						if (data.rid === rid[i]) {
							$rooms.eq(i).find('.current').text(data.number);
							break;
						}
					}	
				});
				socket.on('limitChanged', function(data) {
					var $rooms = $('.room');
					var rid = $rooms.map(function(idx, item) {
						$(item).data('rid');
					}).get();
					for (var i = 0; i < rid.length; i++) {
						if (data.rid === rid[i]) {
							$rooms.eq(i).find('.total').text(data.number);
							break;
						}
					}
				});
				$(document).on('click', '.room', enterRoom);
				$(document).on('click', '.result', showResult);
			}
		});
	}
	return {
		initModule: initModule,
		enterRoom: enterRoom,
		showResult: showResult,
		searchRoom: onSearchRoom
	};
}());
wwm.login = (function () {
	var jqMap;
	var adminLogin = function() {
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
	var testLogin = function() {
		var res = {id: "987654321", name: '테스터', picture: '//graph.facebook.com/874512615962577/picture'};
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
	var kakaoLogin = function() {
		Kakao.Auth.login({
			success: function () {
				Kakao.API.
				Kakao.API.request({ // TODO: 카카오 프로필 업데이트에 대비한 상황 (update_profile)
					url: '/v1/api/talk/profile',
					success: function (res) {
						console.log(JSON.stringify(res));
						res.name = res.nickName;
						res.picture = res.profileImageURL;
						res.thumb = res.thumbnailURL;
						var joinPromise = wwm.model.join(res);
						joinPromise.fail(function(err){
							alert('가입 오류 발생!');
							console.log(err.responseText);
						});
						history.pushState({mod: 'login', data: res, type: 'kakao'}, '', '/lobby/' + res.id);
						window.userInfo = res;
						localStorage.login = JSON.stringify(res);
						localStorage.loginType = 'kakao';
						wwm.lobby.initModule(wwm.shell.view);
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
	var fbLogin = function() {
		FB.login(function (res) {
			if (res.status === 'connected') {
				FB.api('/me', function (res) {
					console.log(JSON.stringify(res));
					res.picture = '//graph.facebook.com/' + res.id + '/picture';
					var joinPromise = wwm.model.join(res);
					joinPromise.fail(function(err){
						alert('가입 오류 발생!');
						console.log(err.responseText);
					});
					history.pushState({mod: 'login', data: res, type: 'facebook'}, '', '/lobby/' + res.id);
					window.userInfo = res;
					localStorage.login = JSON.stringify(res);
					localStorage.loginType = 'facebook';
					wwm.lobby.initModule(wwm.shell.view);
				});
			} else if (res.status === 'not_authorized') {
				// The person is logged into Facebook, but not your app.
				alert('Please log log into this app.');
			} else {
				alert('Please log into Facebook.');
			}
		});
	};
	var setJqMap = function($con) {
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
	var initModule = function() {
		wwm.shell.view.html($('#wwm-login').html());
		setJqMap(wwm.shell.view);
		jqMap.$logo.showSVGLogo(100);
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
	var jqMap;
	function setJqMap($con) {
		jqMap = {
			$con: $con,
			$close: $con.find('.modal-close'),
			$title: $con.find('#room-title'),
			$limit: $con.find('#room-people-limit'),
			$password: $con.find('#room-password'),
			$createRoom: $con.find('#create-room-btn')
		};
	}
	function onCloseModal(e) {
		e.preventDefault();
		wwm.shell.modal.hide();
	}
	function createRoom(e) {
		e.preventDefault();
		var spinner = new Spinner().spin();
		jqMap.$con.append(spinner.el);
		var title = jqMap.$title.val().trim();
		var limit = jqMap.$limit.val();
		var password = jqMap.$password.val().trim() || null;
		var maker = userInfo.id.toString();
		var picture = userInfo.picture;
		if (!title) {
			$(spinner.el).remove();
			alert('제목을 입력하세요.');
			return;
		}
		var data = {
			rid: new Date().getTime().toString(),
			title: title,
			maker: maker,
			limit: limit,
			picture: picture,
			password: password,
			members: JSON.stringify([{id: userInfo.id, name: userInfo.name, picture: userInfo.picture, confirm: false}])
		};
		console.log('createroom data', data);
		var createRoomPromise = wwm.model.createRoom(data);
		createRoomPromise.done(function (result) {
			console.log(result);
			data.current = 1;
			wwm.room.initModule(data, 'create');
			wwm.shell.modal.hide();
		});
		createRoomPromise.fail(function (err) {
			console.log(err);
			alert('방 생성에러! 콘솔확인');
		});
		createRoomPromise.always(function () {
			$(spinner.el).remove();
		});
	}
	function initModule($target) {
		wwm.shell.modal.html($target);
		setJqMap(wwm.shell.modal);
		wwm.shell.modal.fadeIn('slow');
		jqMap.$close.click(onCloseModal);
		jqMap.$createRoom.click(createRoom);
	}
	return {
		initModule: initModule
	};
}());
wwm.room = (function(){
	var jqMap;
	var stMap = {
		now: 'day',
		dayArray: null,
		nightArray: null,
		memberList: [],
		myInfo: {
			id: null,
			name: null,
			confirm: false,
			personColor: 0
		},
		onlineList: new Array(8),
		maker: 0,
		rid: null,
		title: null,
		limit: 0,
		current: 0
	};
	var cfMap = {
		colorList: ['red', 'orange', 'yellow', 'yellowgreen', 'skyblue', 'purple', 'violet', 'pink']
	};
	var socket = io();
	var setJqMap = function($con) {
		jqMap = {
			$con: $con,
			$calendar: $con.find('table'),
			$dayTable: $con.find('#day-table'),
			$nightTable: $con.find('#night-table'),
			$thDay: $con.find('#day-table, #night-table').find('tr').eq(0).find('th'),
			$thTime: $con.find('#day-table, #night-table').find('tr').find('th:first-child'),
			$memberList: $con.find('#member-list'),
			$toggleCalendar: $con.find('#toggle-table'),
			$toLobby: $con.find('#back-to-lobby'),
			$quit: $con.find('#quit'),
			$myMenu: $con.find('#my-menu'),
			$admin: $con.find('#manage-btn, #invite-btn'),
			$dayExp: $con.find('#day-exc-btn'),
			$notDay: $con.find('#day-exception').find('li'),
			$timeExp: $con.find('#time-exc-btn'),
			$notTime: $con.find('#time-exception').find('li'),
			$explode: $con.find('#explode-room'),
			$ban: $con.find('#ban-people-btn'),
			$banList: $con.find('#ban-member-list'),
			$changeLimit: $con.find('#change-limit-btn'),
			$changeTitle: $con.find('#change-room-title'),
			$title: $con.find('#title'),
			$current: $con.find('#current-number'),
			$limit: $con.find('#limit-number'),
			$sendChat: $con.find('#send-chat'),
			$chatList: $con.find('#chat-list'),
			$confirm: $con.find('#confirm-calendar'),
			$refresh: $con.find('#refresh-calendar'),
			$allConfirmed: $con.find('#all-confirmed'),
			$kakaoInvite: $con.find('#kakao-invite'),
			$fbInvite: $con.find('#fb-invite'),
			$aside: $con.find('#room-aside'),
			$toggleAside: $con.find('#show-aside, #close-aside')
		};
	};
	var createArray = function(length) {
		var arr = new Array(length || 0);
		var i = length, j = 0;
		if (arguments.length > 1) {
			var args = Array.prototype.slice.call(arguments, 1);
			while (i--) {arr[length - 1 - i] = createArray.apply(this, args);}
		}
		if (arguments.length == 1) {
			for (j; j < arr.length; j++) {
				arr[j] = [];
			}
		}
		return arr;
	};
	var tableToArray = function(cellList) { // cell을 선택했을 때 array로 바꾼다
		console.log('tableToArray');
		var arrList = [];
		for (var i = 0; i < cellList.length; i++) {
			var cell = cellList[i];
			var arr = [cell.parentNode.rowIndex - 1, cell.cellIndex - 1];
			arrList.push(arr);
		}
		console.log('tableToArray', arrList);
		return arrList;
	};
	var arrayToTable = function(cellList, sid, cur, busy) { // array를 table로 만든다.
		console.log('arrayTotable', cellList, sid, cur, busy);
		var i, k, cell, number, $cell, $box, index;
		if (cur === 'day') {
			for (i = 0; i < cellList.length; i++) {
				cell = cellList[i];
				$cell = jqMap.$dayTable.find('tr').eq(cell[0] + 1).find('td').eq(cell[1]);
				var dayCell = stMap.dayArray[cell[0]][cell[1]];
				if (busy) {
					dayCell.push(sid);
					number = dayCell.length;
					$cell.find('div').remove();
					$box = $('<div/>').addClass('box-' + number);
					for (k = 0; k < number; k++) {
						$box.append($('<div/>', {class: cfMap.colorList[dayCell[k]]}));
					}
					$box.appendTo($cell);
				} else {
					index = dayCell.indexOf(sid);
					if (index > -1) {
						dayCell.splice(index, 1);
					}
					number = dayCell.length;
					$cell.find('div').remove();
					$box = $('<div/>').addClass('box-' + number);
					for (k = 0; k < number; k++) {
						console.log(cfMap.colorList[dayCell[k]]);
						$box.append($('<div/>', {class: cfMap.colorList[dayCell[k]]}));
					}
					$box.appendTo($cell);
				}
				stMap.dayArray[cell[0]][cell[1]] = dayCell;
			}
			console.log('arrToTable:day', stMap.dayArray, stMap.nightArray);
		} else if (cur === 'night') {
			for (i = 0; i < cellList.length; i++) {
				cell = cellList[i];
				$cell = jqMap.$nightTable.find('tr').eq(cell[0] + 1).find('td').eq(cell[1]);
				var nightCell = stMap.nightArray[cell[0]][cell[1]];				
				if (busy) {
					nightCell.push(sid);
					number = nightCell.length;
					$cell.find('div').remove();
					$box = $('<div/>').addClass('box-' + number);
					for (k = 0; k < number; k++) {
						$box.append($('<div/>', {class: cfMap.colorList[nightCell[k]]}));
					}
					$box.appendTo($cell);
				} else {
					index = nightCell.indexOf(sid);
					if (index > -1) {
						nightCell.splice(index, 1);
					}
					number = nightCell.length;
					$cell.find('div').remove();
					$box = $('<div/>').addClass('box-' + number);
					for (k = 0; k < number; k++) {
						$box.append($('<div/>', {class: cfMap.colorList[nightCell[k]]}));
					}
					$box.appendTo($cell);
				}
				stMap.nightArray[cell[0]][cell[1]] = nightCell;
			}
			console.log('arrToTable:night', stMap.dayArray, stMap.nightArray);
		}
	};
	var renderTable = function() {
		var i, j, k, $cell, number, $box;
		for (i = 0; i < 12; i++) {
			for (j = 0; j < 7; j++) {
				$cell = jqMap.$dayTable.find('tr').eq(i + 1).find('td').eq(j);
				var dayCell = stMap.dayArray[i][j];
				number = dayCell.length;
				$cell.find('div').remove();
				console.log($cell, dayCell, number);
				if (number > 0) {
					$box = $('<div/>').addClass('box-' + number);
					for (k = 0; k < number; k++) {
						$box.append($('<div/>', {class: cfMap.colorList[dayCell[k]]}));
					}
					$box.appendTo($cell);
				}
			}
		}
		for (i = 0; i < 12; i++) {
			for (j = 0; j < 7; j++) {
				$cell = jqMap.$nightTable.find('tr').eq(i + 1).find('td').eq(j);
				var nightCell = stMap.nightArray[i][j];
				number = nightCell.length;
				$cell.find('div').remove();
				if (number > 0) {
					$box = $('<div/>').addClass('box-' + number);
					for (k = 0; k < number; k++) {
						$box.append($('<div/>', {class: cfMap.colorList[nightCell[k]]}));
					}
					$box.appendTo($cell);
				}
			}
		}
	};
	var showMembers = function() {
		console.log('showMembers', stMap.memberList);
		jqMap.$memberList.find('ul').empty();
		var src = $('#wwm-member-list').html();
		for (var i = 0; i < stMap.memberList.length; i++) {
			var member = stMap.memberList[i];
			dust.render(dust.loadSource(dust.compile(src)), {id: member.id, color: cfMap.colorList[i], name: member.name, picture: member.picture}, function(err, out){
				if (err) {
					jqMap.$memberList.find('ul').html(err);
				} else {
					jqMap.$memberList.find('ul').append(out);
				}
			});
		}
		showOnline();
	};
	var newMember = function(doc) {
		console.log('newMember', doc, doc.id, stMap.memberList);
		var src = $('#wwm-member-list').html();
		stMap.memberList.push({id: doc.id, name: doc.name, picture: doc.picture, confirm: false});
		jqMap.$banList.append('<option value="' + doc.id + '">' + findInfo(doc.id).name + '</option>');
		dust.render(dust.loadSource(dust.compile(src)), {id: doc.id, color: findInfo(id).color, name: doc.name, picture: doc.picture}, function(err, out) {
			if (err) {
				jqMap.$memberList.find('ul').html(err);
			} else {
				jqMap.$memberList.find('ul').append(out);
			}
		});
		showOnline();
	};
	var showOnline = function() {
		console.log('showOnline onlineList', stMap.onlineList);
		for (var i = 0; i < stMap.memberList.length; i++) {
		 	var $list = jqMap.$memberList.find('li').eq(i);
			if (stMap.onlineList[i]) {
				if ($list.has('.offline').length !== 0) {
					$list.find('.offline').toggleClass('offline online');
				}
			} else {
				 if ($list.has('.online').length !== 0) {
					 $list.find('.online').toggleClass('online offline');
				 }
			}
		}
	};
	var findInfo = function(id) {
		console.log('findInfo', id);
		var info = {};
		for (var i = 0; i < stMap.memberList.length; i++) {
			if (id == stMap.memberList[i].id) {
				info.personColor = i;
				info.name = stMap.memberList[i].name;
				info.color = cfMap.colorList[i];
			}
		}
		return info;
	};
	var banPerson = function(e) {
		e.preventDefault();
		var banned = $(this).prev().val();
		console.log('ban', banned);
		if (banned == stMap.maker) {
			alert('자기 자신을 강퇴시키면 안 되겠죠?');
			return;
		}
		var banPromise = wwm.model.ban(banned, e.data.rid);
		banPromise.done(function() {
			socket.emit('ban', {id: banned, order: findInfo(banned).personColor});
		});
		banPromise.fail(function(err) {
			console.log(err);
			alert('퇴장당하지 않으려고 버티는중! 다시 시도하세요.');
		});
	};
	var changeTitle = function(e) {
		e.preventDefault();
		var title = $(this).prev().val();
		console.log('changeTitle', title);
		var titlePromise = wwm.model.changeTitle(stMap.rid, title);
		titlePromise.done(function() {
			stMap.title = title;
			jqMap.$title.text(title);
		});
		titlePromise.fail(function(err) {
			alert('제목 바꾸기 실패!');
			console.log(err);
		});
	};
	var changeLimit = function(e) {
		e.preventDefault();
		var number = Number($(this).prev().val());
		if (number !== number) {
			alert('숫자를 입력해야 합니다.');
			return;
		}
		console.log('changeLiimit', number);
		if (number < stMap.current) {
			alert('현재 사람이 설정한 수보다 많습니다.');
			return;
		}
		var limitPromise = wwm.model.changeLimit(stMap.rid, number);
		limitPromise.done(function() {
			changeLimitNumber(number);
		});
		limitPromise.fail(function(err) {
			alert('인원수 바꾸기 실패!');
			console.log(err);
		});
	};
	var onClickDay = function() {
		checkConfirmed();
		console.log('onClickDay');
		var day = this.cellIndex - 1;
		var arr;
		if (stMap.now === 'day') {
			arr = stMap.dayArray;
		} else {
			arr = stMap.nightArray;
		}
		var dayList = [];
		var allSelected = true;
		for (var i = 0; i < 12; i++) {
			if (arr[i][day].indexOf(stMap.myInfo.personColor) == -1) {
				allSelected = false;
				dayList.push([i, day]);
			}
		}
		
		if (allSelected) {
			dayList = [];
			for (i = 0; i < 12; i++) {
				dayList.push([i, day]);
			}
			$(this).removeClass('selected');
			socket.emit('not-busy', {cur: stMap.now, sid: stMap.myInfo.personColor, arr: dayList});
		} else {
			$(this).addClass('selected');
			socket.emit('busy', {cur: stMap.now, sid: stMap.myInfo.personColor, arr: dayList});
		}
	};
	var onClickTime = function() {
		checkConfirmed();
		var time = this.parentNode.rowIndex - 1;
		console.log('onClickTime',  time);
		var arr;
		if (stMap.now === 'day') {
			arr = stMap.dayArray;
		} else {
			arr = stMap.nightArray;
		}
		var timeList = [];
		var allSelected = true;
		console.log(arr[time]);
		for (var i = 0; i < 7; i++) {
			if (arr[time][i].indexOf(stMap.myInfo.personColor) == -1) {
				allSelected = false;
				timeList.push([time, i]);
			}
		}
		if (allSelected) {
			timeList = [];
			for (i = 0; i < 7; i++) {
				timeList.push([time, i]);
			}
			$(this).removeClass('selected');
			socket.emit('not-busy', {cur: stMap.now, sid: stMap.myInfo.personColor, arr: timeList});
		} else {
			$(this).addClass('selected');
			socket.emit('busy', {cur: stMap.now, sid: stMap.myInfo.personColor, arr: timeList});
		}
	};
	var showAdminMenu = function(e) {
		e.stopPropagation();
		console.log('showAdminMenu');
		var $this = $(this);
		if ($this.parent().hasClass('opened')) {
			$this.parent().removeClass('opened');
		} else {
			$('.opened').removeClass('opened');
			$this.parent().addClass('opened');
		}
	};
	var showDayException = function(e) {
		e.stopPropagation();		
		console.log('showDayException');
		var $this = $(this);
		if ($this.parent().hasClass('opened')) {
			$this.parent().removeClass('opened');
		} else {
			$('.opened').removeClass('opened');
			$this.parent().addClass('opened');
		}
	};
	var showTimeException = function(e) {
		e.stopPropagation();		
		console.log('showTimeexception');
		var $this = $(this);
		if ($this.parent().hasClass('opened')) {
			$this.parent().removeClass('opened');
		} else {
			$('.opened').removeClass('opened');
			$this.parent().addClass('opened');
		}
	};
	var deleteRoom = function(e) {
		console.log('deleteRoom', e.data.rid);
		var rid = e.data.rid;
		var deletePromise = wwm.model.deleteRoom(rid, userInfo.id);
		deletePromise.done(function() {
			alert('삭제되었습니다.');
			wwm.lobby.initModule(jqMap.$con);
			socket.emit('explode', rid);
		});
		deletePromise.fail(function(err) {
			console.log(err);
			alert('방 지우기 오류발생');
		});
	};
	var checkConfirmed = function() {
		if (jqMap.$confirm.hasClass('confirmed')) {
			alert('확정 상태가 해제됩니다.');
			jqMap.$confirm.removeClass('confirmed');
			stMap.myInfo.confirm = false;
			socket.emit('confirmed', {id: stMap.myInfo.id, bool: false});
		}
	};
	var onClickCell = function() {
		console.log('onclickCell', stMap.dayArray);
		checkConfirmed();
		// 어레이를 발송
		var arr, cell;
		if (stMap.now === 'day') {
			arr = stMap.dayArray;
		} else {
			arr = stMap.nightArray;
		}
		cell = arr[this.parentNode.rowIndex - 1][this.cellIndex - 1];
		console.log(this.parentNode.rowIndex - 1, this.cellIndex - 1, cell, cell.length, stMap.myInfo.personColor);
		if (cell) {
			console.log(cell.length, cell.indexOf(stMap.myInfo.personColor) > -1);
			if (cell.length && cell.indexOf(stMap.myInfo.personColor) > -1) {
				socket.emit('not-busy', {cur: stMap.now, sid: stMap.myInfo.personColor, arr: tableToArray([this], false)});
			} else {
				socket.emit('busy', {cur: stMap.now, sid: stMap.myInfo.personColor, arr: tableToArray([this], true)});
			}
		} else {
			socket.emit('busy', {cur: stMap.now, sid: stMap.myInfo.personColor, arr: tableToArray([this], true)});
		}
	};
	var excludeDay = function() {
		checkConfirmed();
		// 해당일에 대한 어레이를 발송
		var idx = $(this).index();
		console.log('excludeDay', idx);
		var arr = [];
		for (var i = 0; i < 12; i++) {
			arr.push([i, idx]);
		}
		if ($(this).hasClass('selected')) {
			socket.emit('not-busy', {cur: 'day', sid: stMap.myInfo.personColor, arr: arr});
			socket.emit('not-busy', {cur: 'night', sid: stMap.myInfo.personColor, arr: arr});
			$(this).removeClass('selected');
		} else {
			socket.emit('busy', {cur: 'day', sid: stMap.myInfo.personColor, arr: arr});
			socket.emit('busy', {cur: 'night', sid: stMap.myInfo.personColor, arr: arr});
			$(this).addClass('selected');
		}
	};
	var excludeTime = function() {
		// 해당 시간에 대한 어레이를 발송
		checkConfirmed();
		var idx = $(this).index();
		var time = $(this).find('input').val();
		var i, j;
		console.log('excludeTime', idx, time);
		if (!time) {
			return;
		}
		var arr = [];
		if (idx === 0) { // not before
			for (i = 0; i < time; i++) {
				for (j = 0; j < 7; j++) {
					arr.push([time, j]);
				}
			}
			console.log('arr', arr);
			if ($(this).hasClass('selected')) {
				socket.emit('not-busy', {cur: 'day', sid: stMap.myInfo.personColor, arr: arr});
				socket.emit('not-busy', {cur: 'night', sid: stMap.myInfo.personColor, arr: arr});
				$(this).removeClass('selected');
			} else { // no selected
				socket.emit('busy', {cur: 'day', sid: stMap.myInfo.personColor, arr: arr});
				socket.emit('busy', {cur: 'night', sid: stMap.myInfo.personColor, arr: arr});
				$(this).addClass('selected');
			} // not before
		} else { // not after
			for (i = time - 1; i < 12; i++) {
				for (j = 0; j < 7; j++) {
					console.log(arr);
					arr.push([time, j]);
				}
			}
			console.log('arr', arr);
			if ($(this).hasClass('selected')) {
				socket.emit('not-busy', {cur: 'day', sid: stMap.myInfo.personColor, arr: arr});
				socket.emit('not-busy', {cur: 'night', sid: stMap.myInfo.personColor, arr: arr});
				$(this).removeClass('selected');
			} else { // no selected
				socket.emit('busy', {cur: 'day', sid: stMap.myInfo.personColor, arr: arr});
				socket.emit('busy', {cur: 'night', sid: stMap.myInfo.personColor, arr: arr});
				$(this).addClass('selected');
			}
		} // not after
	};
	var toLobby = function(e) {
		console.log('toLobby', e.data.rid);
		if (jqMap.$confirm.hasClass('confirmed')) {
			history.pushState({mod: 'lobby'}, '', '/lobby/' + stMap.myInfo.id);
			socket.emit('out', {id: stMap.myInfo.id, rid: e.data.rid});
			wwm.lobby.initModule(jqMap.$con);
		} else {
			if (confirm('확정 버튼을 누르지 않고 나가면 저장되지 않은 사항은 사라집니다.')) {
				history.pushState({mod: 'lobby'}, '', '/lobby/' + stMap.myInfo.id);
				socket.emit('out', {id: stMap.myInfo.id, rid: e.data.rid});
				wwm.lobby.initModule(jqMap.$con);
			}
		}
	};
	var quit = function(e) {
		console.log('quit', e.data.rid);
		if (stMap.current === 1) {
			if (confirm('혼자 있을 때 방을 나가면 방이 사라집니다.그래도 나가시겠습니까?')) {
				wwm.model.deleteRoom(e.data.rid, stMap.myInfo.id);
			}
			return;
		}
		if (confirm('정말 나가시겠습니까? 잠시 나가는 거면 목록 버튼을 클릭하세요.')) {
			history.replaceState({mod: 'lobby'}, '', '/lobby/' + stMap.myInfo.id);
			socket.emit('quit', {id: stMap.myInfo.id, rid: e.data.rid});
			wwm.lobby.initModule(jqMap.$con);
		}
	};
	var changeCurrentNumber = function(gap) {
		console.log('changeCurrentNumber', gap);
		stMap.current += gap;
		jqMap.$current.text(stMap.current);
		$('#current-people-limit').val(stMap.current);
	};
	var changeLimitNumber = function(num) {
		console.log('changeLimitNumber', num);
		stMap.limit = num;
		jqMap.$limit.text(num);
	};
	var sendChat = function(e) {
		e.preventDefault();
		var text = $(this).parent().prev().val();
		console.log('sendChat', stMap.myInfo.id, text);		
		socket.emit('chat', {
			id: stMap.myInfo.id,
			name: stMap.myInfo.name,
			text: text
		});
	};
	var refresh = function() {
		console.log('refresh', {rid: stMap.rid, id: stMap.myInfo.id});
		socket.on('responseArr', function(data) {
			console.log('socket responseArr');
			stMap.dayArray = data.day;
			stMap.nightArray = data.night;
			renderTable();
		});
		socket.emit('requestArr', {rid: stMap.rid, id: stMap.myInfo.id});
	};
	var confirmCalendar = function(e) {
		console.log('confirm', e.data);
		var data = e.data;
		data.bool = !stMap.myInfo.confirm;
		data.day = stMap.dayArray;
		data.night = stMap.nightArray;
		console.log('change confirm to', data.bool, stMap.dayArray, data.day, stMap.dayArray===data.day);
		var confirmPromise = wwm.model.confirm(data);
		confirmPromise.done(function() {
			if (jqMap.$confirm.hasClass('confirmed')) {
				jqMap.$confirm.removeClass('confirmed');
			} else {
				jqMap.$confirm.addClass('confirmed');
			}
			stMap.myInfo.confirm = data.bool;
			socket.emit('confirmed', {id: stMap.myInfo.id, bool: data.bool});
			console.log(stMap.dayArray);
		});
		confirmPromise.fail(function(err) {
			console.log(err);
			alert('confirm error!');
		});

	};
	var toggleCalendar = function() {
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
	var toConfirmPage = function() {
		console.log('toConfirmPage', stMap);
		history.pushState({mod: 'confirm'}, '', '/result/' + stMap.rid);
		wwm.confirm.initModule(stMap);
	};
	var kakaoInvite = function() {
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
				url: 'http://whenwemeet.herokuapp.com' // The URLs domain should be configured in app settings.
			},
			fail: function() {
				alert('KakaoLink is currently only supported in iOS and Android platforms.');
			}
		});
	};
	var fbInvite = function() {
		FB.ui({
			method: 'send',
			link: 'http%3A%2F%2Fwww.nytimes.com%2F2011%2F06%2F15%2Farts%2Fpeople-argue-just-to-win-scholars-assert.html'
		});
	};
	var toggleAside = function() {
		console.log('toggleAside', jqMap.$aside.hasClass('opened'));
		if (jqMap.$aside.hasClass('opened')) { // 닫는다.
			jqMap.$aside.removeClass('opened');
			jqMap.$aside.css('left', '-100%');
		} else { // 연다.
			jqMap.$aside.addClass('opened');
			jqMap.$aside.css('left', '0');

		}
	};
	var initModule = function(doc, status) {
		console.log('room initModule', status);
		// docs 정보를 방 모듈에 입력.
		stMap.title = doc.title;
		stMap.limit = Number(doc.limit);
		stMap.rid = doc.rid.toString();
		stMap.maker = doc.maker.toString();
		console.log('entered room id' + stMap.rid);
		console.log('is doc.member array? ' + Array.isArray(doc.members));
		if (status === 'create') { // dayArray와 nightArray를 설정.
			stMap.dayArray = createArray(12,7);
			stMap.nightArray = createArray(12,7);
		} else if (status === 'enter') {
			stMap.dayArray = doc.day || createArray(12,7);
			stMap.nightArray = doc.night || createArray(12,7);
		}
		// 내 정보를 입력.
		stMap.memberList = Array.isArray(doc.members) ? doc.members : JSON.parse(doc.members);
		stMap.current = stMap.memberList.length;
		stMap.myInfo.id = userInfo.id.toString();
		stMap.myInfo.name = userInfo.name;
		for (var i = 0; i < stMap.memberList.length; i++) {
			if (stMap.memberList[i].id == userInfo.id) {
				stMap.myInfo.personColor = i;
				stMap.myInfo.confirm = stMap.memberList[i].confirm;
				break;
			}
		}
		stMap.onlineList[stMap.myInfo.personColor] = true;
		console.log('onlineList', stMap.onlineList);
		socket.emit('enter', {
			'id': stMap.myInfo.id,
			'rid': stMap.rid,
			'name': stMap.myInfo.name,
			'color': stMap.myInfo.personColor,
			'picture': userInfo.picture
		});
		var parser = {
			name: stMap.myInfo.name, //유저네임
			title: stMap.title, //타이틀
			current: stMap.current, //현재원
			limit: stMap.limit, //총원
			members: stMap.memberList
		};
		if (stMap.myInfo.id == stMap.maker) {
			parser.admin = true;
		}
		console.log('admin?', stMap.myInfo.id == stMap.maker);
		var src = $('#wwm-room').text();
		dust.render(dust.loadSource(dust.compile(src)), parser, function(err, out) {
			if (err) {
				wwm.shell.view.html(err);
				return;
			}
			wwm.shell.view.html(out);
			setJqMap(wwm.shell.view);
			renderTable();
			if (stMap.myInfo.confirm) {
				jqMap.$confirm.addClass('confirmed');
			}
			var confirmCount = 0;
			for (var i = 0; i < stMap.memberList.length; i++) {
				console.log(stMap.memberList[i].confirm === true, stMap.memberList[i].confirm);
				if (stMap.memberList[i].confirm === true) {
					confirmCount++;
				}
			}
			console.log(confirmCount === stMap.memberList.length, confirmCount, stMap.memberList.length);
			if (confirmCount === stMap.memberList.length) {
				jqMap.$allConfirmed.show();
			} else {
				jqMap.$allConfirmed.hide();
			}
			showMembers();
			socket.on('out', function(id) {
				console.log(jqMap.$memberList, jqMap.$memberList.find('[data-id=' + id + ']'));
				for (var i = 0; i < stMap.memberList.length; i++) {
					if (stMap.memberList[i].id == id) {
						stMap.onlineList[i] = false;
						break;
					}
				}
				showOnline();
				console.log('socketout', stMap.onlineList, stMap.memberList);
			});
			socket.on('quit', function(id) {
				for (var i = 0; i < stMap.memberList.length; i++) {
					if (stMap.memberList[i].id == id) {
						stMap.onlineList.splice(i, 1);
						stMap.memberList.splice(i, 1);
						break;
					}
				}
				console.log(jqMap.$memberList, jqMap.$memberList.find('[data-id=' + id + ']'));
				jqMap.$banList.find('[value=' + id + ']').remove();
				changeCurrentNumber(-1);
				showMembers();
				console.log('socketquit', stMap.onlineList, stMap.memberList);
			});
			socket.on('newMember', function(data) {
				console.log('socket newmember', data);
				stMap.onlineList[data.color] = true;
				socket.emit('uptodateArr', {sid: data.socket, day: stMap.dayArray, night: stMap.nightArray, online: stMap.onlineList});
				if (data.color >= stMap.current) { // 신규멤버면,
					changeCurrentNumber(1);
					newMember(data);
				}
				showOnline();
			});
			socket.on('uptodateArr', function(data) {
				console.log('socket uptodateArr');
				stMap.dayArray = data.day;
				stMap.nightArray = data.night;
				stMap.onlineList = data.online;
				showOnline();
				renderTable();
			});
			socket.on('chat', function(data) {
				console.log('socket chat', data.id, data.text);
				jqMap.$chatList.append('<p>' + data.name + ': ' + data.text + '</p>');
			});
			socket.on('busy', function(data) {
				console.log('socketbusy:', data.arr, data.sid, data.cur);
				arrayToTable(data.arr, data.sid, data.cur, true);
			});
			socket.on('not-busy', function(data) {
				console.log('socketnotbusy:', data.arr, data.sid, data.cur);
				arrayToTable(data.arr, data.sid, data.cur, false);
			});
			socket.on('requestArr', function(data) {
				console.log('socket requestArr');
				socket.emit('responseArr', {sid: data.sid, day: stMap.dayArray, night: stMap.nightArray});
			});
			socket.on('ban', function(data) {
				// 강퇴당한 경우.
				if (stMap.myInfo.personColor == data.order) {
					alert('강퇴당하셨습니다...');
					wwm.lobby.initModule(jqMap.$con);
					return;
				}
				// 다른 사람이 강퇴당한 경우.
				if (stMap.myInfo.personColor > data.order) {
					stMap.myInfo.personColor--;
				}
				alert(findInfo(id).name + '님이 강제퇴장 되었습니다. 잘가요!');
				for (var i = 0; i < stMap.memberList.length; i++) {
					if (data.id == stMap.memberList[i].id) {
						stMap.memberList.splice(i, 1);
						stMap.onlineList.splice(i, 1);
						break;
					}
				}
				changeCurrentNumber(-1);
				jqMap.$banList.find('option').eq(data.order).remove();
				showMembers();
				console.log('socket ban');
			});
			socket.on('confirmed', function(data) {
				var confirmCount = 0;
				for (var i = 0; i < stMap.memberList.length; i++) {
					if (stMap.memberList[i].id == data.id) {
						stMap.memberList[i].confirm = data.bool;
					}
					if (stMap.memberList[i].confirm === true) {
						confirmCount++;
					}
				}
				if (confirmCount == stMap.memberList.length) {
					jqMap.$allConfirmed.show();
				} else {
					jqMap.$allConfirmed.hide();
				}
				console.log('socket confirmed');
			});
			socket.on('explode', function() {
				alert('방이 폭파되었습니다. 로비로 이동합니다.');
				wwm.lobby.initModule(jqMap.$con);
				console.log('socket explode');
			});
			jqMap.$calendar.find('td').click(onClickCell);
			jqMap.$explode.click({id: stMap.rid}, deleteRoom);
			jqMap.$toLobby.click({rid: stMap.rid}, toLobby);
			jqMap.$toggleCalendar.click(toggleCalendar);
			jqMap.$admin.click(showAdminMenu);
			jqMap.$dayExp.click(showDayException);
			jqMap.$timeExp.click(showTimeException);
			jqMap.$ban.click({rid: stMap.rid}, banPerson);
			jqMap.$changeLimit.click({id: stMap.rid}, changeLimit);
			jqMap.$changeTitle.click({id: stMap.rid}, changeTitle);
			jqMap.$sendChat.click(sendChat);
			jqMap.$notDay.click(excludeDay);
			jqMap.$notTime.click(excludeTime);
			jqMap.$thDay.click(onClickDay);
			jqMap.$thTime.click(onClickTime);
			jqMap.$confirm.click({id: stMap.myInfo.id, rid: stMap.rid}, confirmCalendar);
			jqMap.$refresh.click(refresh);
			jqMap.$allConfirmed.click(toConfirmPage);
			jqMap.$quit.click({id: stMap.myInfo.id, rid: stMap.rid}, quit);
			jqMap.$toggleAside.click(toggleAside);
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
	};
	
	return {
		initModule: initModule,
		info: stMap
	};
}());