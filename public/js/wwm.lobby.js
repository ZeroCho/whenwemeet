wwm.lobby = (function (){
	var jqMap;
	function showCreateroom() {
		wwm.modal.initModule($('#wwm-createroom-modal').html());
	}
	function getList() {
		var spinner = new Spinner().spin();
		jqMap.$list.append(spinner.el);
		var $frag = $(document.createDocumentFragment());
		var getListPromise = wwm.model.getRoomList(userInfo.id);
		getListPromise.done(function (res) {
			console.log(res, res.length);
			for (var i = 0; i < res.length; i++) {
				var $title = $('<div/>').addClass('title').text(res[i].title);
				var $current = $('<span/>').addClass('current').text(res[i].members.length);
				var $total = $('<span/>').addClass('total').text(res[i].number);
				var $number = $('<div/>').addClass('number').append($current).append('<span>/</span>').append($total);
				var $room = $('<div/>')
					.addClass('room')
					.attr({
						'data-rid': res[i].rid,
						'data-maker': res[i].maker,
						'data-member': res[i].members
					})
					.append($title)
					.append($number);
				if (res[i].password) {
					var $password = $('<div/>').addClass('passwordroom').html('비번');
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
				var $title = $('<div/>').addClass('title').text(res[i].title);
				var $current = $('<span/>').addClass('current').text(res[i].members.length);
				var $total = $('<span/>').addClass('total').text(res[i].number);
				var $number = $('<div/>').addClass('number').append($current).append('<span>/</span>').append($total);
				var $room = $('<div/>')
					.addClass('room')
					.attr({
						'data-rid': res[i].rid,
						'data-maker': res[i].maker,
						'data-member': res[i].members
					})
					.append($title)
					.append($number);
				if (res[i].password) {
					var $password = $('<div/>').addClass('passwordroom').html('비번');
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
		var data = {
			rid: $(this).data('rid'),
			title: $(this).find('.title').text(),
			current: $(this).find('.current').text(),
			number: $(this).find('.total').text(),
			maker: $(this).data('maker'),
			member: JSON.parse($(this).data('member'))
		};
		var pw = '';
		var spinner = new Spinner().spin();
		jqMap.$list.append(spinner.el);
		if ($(this).has('.passwordroom').length) {
			pw = prompt('비밀번호');
		}
		$.post('/enterroom/' + data.rid, {pw: pw, pid: userInfo.id})
			.done(function(res) {
				console.log(res);
				data.day = res[0].day;
				data.night = res[0].night;
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
				$(document).on('click', '.room', enterRoom);
			}
		});
	}
	return {
		initModule: initModule
	};
}());
