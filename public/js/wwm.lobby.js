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
	};
	onSearchRoom = function(e) {
		var query = e;
		var spinner = new Spinner().spin();
		var searchPromise;
		if (typeof e !== 'string') {
			query = $(this).parent().prev().val().trim();
			e.preventDefault();
		}
		history.pushState({mod: 'search', query: query}, '', '/search/' + query);
		console.log('query', query);
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
			console.log(err);
			jqMap.$list.html(err.responseText);
		});
		searchPromise.always(function() {
			$(spinner.el).remove();
		});
	};
	showRooms = function(res) {
		var $frag = $(document.createDocumentFragment());
		var room, tmpl, password, unlocked, parser;
		var src = $('#wwm-room-list').html();
		res.forEach(function(room) {
			tmpl = dust.loadSource(dust.compile(src));
			password = room.password || false;
			unlocked = false;
			if (password) {
				room.members.some(function(member) {
					if (member.id === userInfo.id) {
						return unlocked = true;
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
				$frag.append(out);
			});
		});
		jqMap.$list.html($frag);
	};
	logout = function() {
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
				console.log(pw);
				if (pw === null || pw.trim() === '') {
					$(spinner.el).remove();
					return;
				}
			}
		}
		console.log(rid);
		data = {
			rid: rid,
			pw: pw,
			pid: userInfo.id,
			name: userInfo.name,
			picture: userInfo.picture
		};
		enterRoomPromise = wwm.model.enterRoom(data);
		enterRoomPromise.done(function(res) {
			console.log(res);
			if (res === 'no_room') {
				alert('방이 없습니다');
				return;
			} else if (res === 'full') {
				alert('방이 다 찼습니다.');
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
		});
		enterRoomPromise.fail(function(err) {
			console.log(err.responseText);
			alert('오류발생! 콘솔확인');
		});
		enterRoomPromise.always(function() {
			$(spinner.el).remove();
		});
	};
	refreshList = function() {
		console.log('refreshlist');
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
				console.log(err);
				alert('rendering error! 콘솔 확인');
			} else {
				wwm.shell.view.html(out).fadeIn('slow');
				setJqMap(wwm.shell.view);
				jqMap.$main.showSVGLogo(100);
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
