wwm.lobby = (function (){
	var jqMap;
	var socket = io();
	function showCreateroom() {
		wwm.modal.initModule($('#wwm-createroom-modal').html());
	}
	function getList() {
		var spinner = new Spinner().spin();
		jqMap.$list.append(spinner.el);
		var $frag = $(document.createDocumentFragment());
		var getListPromise = wwm.model.getRoomList(userInfo.id);
		getListPromise.done(function (res) {
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
				console.log('parser', parser, password);
				dust.render(tmpl, parser, function(err, out) {
					console.log(src, tmpl, out);
					$frag.append(out);
				});
			}
			jqMap.$list.html($frag);
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
		var query = $(this).parent().prev().val().trim();
		console.log('query', query);
		var spinner = new Spinner().spin();
		jqMap.$list.append(spinner.el);
		var searchPromise = wwm.model.searchList(query);
		searchPromise.done(function (res) {
			history.pushState({mod: 'search', data: res}, '', '/search/' + query);
			showSearchResult(res);
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
	function showSearchResult(res) {
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
				console.log('parser', parser, password);
				dust.render(tmpl, parser, function(err, out) {
					console.log(src, tmpl, out);
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
	function enterRoom() {
		var $this = $(this);
		var pw;
		var rid = $(this).data('rid');
		var spinner = new Spinner().spin();
		jqMap.$list.append(spinner.el);
		if ($(this).has('.locked').length) {
			pw = prompt('비밀번호', '');
			if (pw === null || pw.trim() === '') {
				$(spinner.el).remove();
				return;
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
	function showResult() {
		history.pushState({mod: 'confirm'}, '', '/result');
		wwm.confirm.initModule();
	}
	function setJqMap($con) {
		jqMap = {
			$con: $con,
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
				if (picture === null) {
					jqMap.$profilePicture.replaceWith($('<div style="display:inline;"/>').showCanvasLogo(60));
				}
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
		showSearchResult: showSearchResult
	};
}());