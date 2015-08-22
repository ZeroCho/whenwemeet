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
				var $title = $('<div/>').addClass('title').text(room.title);
				var $current = $('<span/>').addClass('current').text(room.members.length);
				var $total = $('<span/>').addClass('total').text(room.number);
				var $number = $('<div/>').addClass('number').append($current).append('<span>/</span>').append($total);
				var $room = $('<div/>')
					.addClass('room')
					.attr({
						'data-rid': room.rid.toString(),
						'data-maker': room.maker.toString(),
						'data-members': JSON.stringify(room.members)
					})
					.append($title)
					.append($number);
				if (room.password) {
					var $password = $('<div/>').addClass('locked').html('<i class="fa fa-lock"></i>');
					for (var j = 0; j < room.members.length; j++) {
						if (room.members[j].id == userInfo.id) {
							$password = $('<div/>').addClass('unlocked').html('<i class="fa fa-unlock"></i>');
							break;
						}
					}
					$room.prepend($password);
				}
				$frag.append($room);
			}
			jqMap.$list.html($frag);
		});
		getListPromise.fail(function (err) {
			if (err === 'no_room') {
				jqMap.$list.html('방이 없습니다. 방을 만들어보세요.');
				return;
			}
			console.log(err);
			jqMap.$list.html(err.responseText);
		});
		getListPromise.always(function() {
			$(spinner.el).remove();
		});
	}
	function onSearchRoom () {
		var query = $(this).prev().val();
		console.log('query', query);
		var spinner = new Spinner().spin();
		jqMap.$list.append(spinner.el);
		var $frag = $(document.createDocumentFragment());
		var searchPromise = wwm.model.searchList(query);
		searchPromise.done(function (res) {
			for (var i = 0; i < res.length; i++) {
				var room = res[i];
				var $title = $('<div/>').addClass('title').text(room.title);
				var $current = $('<span/>').addClass('current').text(room.members.length);
				var $total = $('<span/>').addClass('total').text(room.number);
				var $number = $('<div/>').addClass('number').append($current).append('<span>/</span>').append($total);
				var $room = $('<div/>')
					.addClass('room')
					.attr({
						'data-rid': room.rid,
						'data-maker': room.maker,
						'data-members': JSON.stringify(room.members)
					})
					.append($title)
					.append($number);
				if (room.password) {
					var $password = $('<div/>').addClass('locked').html('<i class="fa fa-lock"></i>');
					for (var j = 0; j < room.members.length; j++) {
						if (room.members[j].id == userInfo.id) {
							$password = $('<div/>').addClass('unlocked').html('<i class="fa fa-unlock"></i>');
							break;
						}
					}
					$room.prepend($password);
				}
				$frag.append($room);
			}
			jqMap.$list.html($frag);
		});
		searchPromise.fail(function (err) {
			if (err === 'no_room') {
				jqMap.$list.html('검색 결과가 없습니다.');
				return;
			}
			console.log(err);
			jqMap.$list.html(err.responseText);
		});
		searchPromise.always(function() {
			$(spinner.el).remove();
		});
	}
	function logout() {
		delete window.userInfo;
		localStorage.removeItem('login');
		localStorage.removeItem('loginType');
		wwm.login.initModule(jqMap.$con);
	}
	function enterRoom() {
		var $this = $(this);
		console.log($this.data('members'));
		var data = {
			rid: $this.data('rid'),
			title: $this.find('.title').text(),
			current: $this.find('.current').text(),
			number: $this.find('.total').text(),
			maker: $this.data('maker'),
			members: $this.data('members')
		};
		var pw = '';
		var spinner = new Spinner().spin();
		jqMap.$list.append(spinner.el);
		if ($this.has('.locked').length) {
			pw = prompt('비밀번호');
		} else if ($this.has('.unlocked').length) {
			pw = 'master';
		}
		$.post('/enterroom/' + data.rid, {pw: pw, pid: userInfo.id, name: userInfo.name})
			.done(function(res) {
				console.log(res);
				data.day = res[0].day || null;
				data.night = res[0].night || null;
				wwm.room.initModule(data, 'enter');	
			})
			.fail(function(err) {
				alert('비밀번호가 틀렸습니다.');
			})
			.always(function() {
				$(spinner.el).remove();
			});
	}
	function refreshList() {
		console.log('refreshlist');
		getList();
	}
	function setJqMap($con) {
		jqMap = {
			$con: $con,
			$showCreateroom: $con.find('#show-createroom-modal'),
			$searchroomBtn: $con.find('#searchroom-btn'),
			$list: $con.find('#rooms'),
			$logout: $con.find('#logout-btn'),
			$refresh: $con.find('#refresh-list')
		};
	}
	function initModule($con) {
		if (!window.userInfo) window.userInfo = JSON.parse(localStorage.login);
		var src = $('#wwm-lobby').text();
		var name =  userInfo.name || userInfo.properties.nickname;
		dust.render(dust.loadSource(dust.compile(src)), {
			name: name
		}, function(err, out) {
			if (err) {
				console.log(err);
				alert('rendering error! 콘솔 확인');
			} else {
				$con.html(out);
				setJqMap($con);
				getList();
				jqMap.$showCreateroom.click(showCreateroom);
				jqMap.$searchroomBtn.click(onSearchRoom);
				jqMap.$logout.click(logout);
				jqMap.$refresh.click(refreshList);
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
			}
		});
	}
	return {
		initModule: initModule
	};
}());
