wwm.lobby = (function (){
	var jqMap;
	var userInfo;
	function showCreateroom() {
		wwm.modal.initModule($('#wwm-createroom-modal').html());
	}
	function getList() {
		var spinner = new Spinner().spin();
		jqMap.$list.append(spinner.el);
		var $frag = $(document.createDocumentFragment());
		var getListPromise = wwm.model.getRoomList();
		getListPromise.done(function (res) {
			console.log(res);
			for (var i = 0; i < res.length; i++) {
				var $title = $('<div/>').addClass('title').text(res[i].title);
				var $number = $('<div/>').addClass('number').text(res[i].number);
				var $room = $('<div/>').addClass('room').attr('data-id', res[i].id).attr('data-maker', res[i].maker).attr('data-member
				, res[i].member).append($title).append($number);
				if (res[i].password) {
					var $password = $('<div/>').addClass('password').html('비번');
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
	}
	function onSearchRoom (query) {
		var $frag = $(document.createDocumentFragment());
		var searchPromise = wwm.model.getRoomList(query);
		searchPromise.done(function (res) {
			for (var i = 0; i < res.length; i++) {
				var $title = $('<div/>').addClass('title').text(res[i].title);
				var $current = $('<span/>').addClass('current').text(JSON.parse(res[i].member).length);
				var $total = $('<span/>').addClass('total').text(res[i].number);
				var $number = $('<div/>').addClass('number').append($current).append('<span>/</span>').append($total);
				var $room = $('<div/>')
					.addClass('room')
					.attr({
						'data-id': res[i].id,
						'data-maker': res[i].maker,
						'data-member': res[i].member
					})
					.append($title)
					.append($number);
				if (res[i].password) {
					var $password = $('<div/>').addClass('password').html('비번');
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
	}
	function logout() {
		localStorage.removeItem('login');
		localStorage.removeItem('loginType');
		wwm.login.initModule(jqMap.$con);
	}
	function enterRoom() {
		var data = {
			id: $(this).data('id'),
			title: $(this).find('.title').text(),
			current: $(this).find('.current').text(),
			number: $(this).find('.total').text(),
			maker: $(this).data('maker')
			member: JSON.parse($(this).data('member'))
		};
		if ($(this).has('.password').length) {
			var pw = prompt('비밀번호');
			$.post('/enterroom/' + id, {pw: pw}).done(function() {
				wwm.room.initModule(data);	
			}).fail(function(err) {
				alert('비밀번호가 틀렸습니다.);
			};
		} else {
			wwm.room.initModule(data);
		}
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
		console.log($con);
		var src = document.getElementById('wwm-lobby').textContent;
		userInfo = JSON.parse(localStorage.login);
		var name =  userInfo.name || userInfo.properties.nickname;
		dust.render(dust.loadSource(dust.compile(src)), {
			name: name
		}, function(err, out) {
			if (err) {
				console.log(err);
				alert('error! 콘솔 확인');
			} else {
				console.log($con);
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
