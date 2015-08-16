/**
 * Created by Zero on 2015-07-25.
 */
var wwm = (function () {
	function initModule($container) {
		wwm.model.initModule();
		wwm.shell.initModule($container);
	}
	return {
		initModule: initModule
	};
}());
$(function () {
	var KAKAO_KEY = 'a35623411563ec424430d3bd5dc7a93e';
	$.ajaxSetup({cache: true});
	$.getScript('//connect.facebook.net/ko_KR/sdk.js', function () {
		FB.init({
			appId: '1617440885181938',
			xfbml: true,
			version: 'v2.4'
		});
	});
	Kakao.init(KAKAO_KEY);
	wwm.initModule($('#whenwemeet'));
});
/**
 * Created by Zero on 2015-07-25.
 */
wwm.model = (function () {
	function join(data) {
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
	}
	function getRoomList(id) {
		var deferred = $.Deferred();
		$.get('/rooms/' + id).done(function (res) {
			if (res.length === 0) {
				deferred.reject('no_room');
			}
			deferred.resolve(res);
		}).fail(function (err) {
			deferred.reject(err);
		});
		return deferred.promise();
	}
	function searchList(query) {
		var deferred = $.Deferred();
		$.get('/search/' + query).done(function (res) {
			if (res.length === 0) {
				deferred.reject('no_room');
			}
			deferred.resolve(res);
		}).fail(function (err) {
			deferred.reject(err);
		});
		return deferred.promise();
	}
	function ban(id, rid) {
		var deferred = $.Deferred();
		$.post('/ban/' + id, {rid: rid}).done(function(res) {
			console.log(res);
			deferred.resolve(res);
		}).fail(function(err) {
			console.log(err);
			deferred.reject(err);
		});
		return deferred.promise();
	}
	function changeTitle(rid, title) {
		var deferred = $.Deferred();
		$.post('/changeroom/' + rid, {title: title}).done(function(res) {
			console.log(res);
			deferred.resolve(res);
		}).fail(function(err) {
			console.log(err);
			deferred.reject(err);
		});
		return deferred.promise();
	}
	function changeLimit(rid, number) {
		var deferred = $.Deferred();
		$.post('/changeroom/' + rid, {number: number}).done(function(res) {
			console.log(res);
			deferred.resolve(res);
		}).fail(function(err) {
			console.log(err);
			deferred.reject(err);
		});
		return deferred.promise();
	}
	function confirm(data) {
		var deferred = $.Deferred();
		var rid = data.rid;
		$.post('/confirm/' + rid, {day: data.day, night: data.night}).done(function(res) {
			console.log(res);
			deferred.resolve(res);
		}).fail(function(err) {
			console.log(err);
			deferred.reject(err);
		});
		return deferred.promise();
	}
	function createRoom(data) {
		var deferred = $.Deferred();
		console.log('modeldata', data);
		$.get('/member/' + data.maker).done(function(res) {
			console.log(res);
			if (res[0].roomcount >= 3) {
				var msg = '방은 최대 세 개까지 만들 수 있습니다.';
				deferred.reject(msg);
			} else {
				$.post('/addroom/' + data.rid, data).done(function () {
					deferred.resolve(res);				
				}).fail(function (err) {
					console.log(err);
					deferred.reject(err);
				});
			}
		}).fail(function (err) {
			console.log(err);
			deferred.reject(err);
		});
		return deferred.promise();
	}
	function deleteRoom(id, maker) {
		var deferred = $.Deferred();
		$.post('/deleteroom/' + id, {maker: maker}).done(function (res) {
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
	}
	function initModule() {
		if (localStorage.login) {
			window.userInfo = JSON.parse(localStorage.login);
		}
	}
	return {
		initModule: initModule,
		createRoom: createRoom,
		getRoomList: getRoomList,
		deleteRoom: deleteRoom,
		ban: ban,
		changeTitle: changeTitle,
		changeLimit: changeLimit,
		searchList: searchList,
		confirm: confirm,
		join: join
	};
}());

wwm.shell = (function () {
	var jqMap;
	function setJqMap($con) {
		jqMap = {
			$con: $con,
			$view: $con.find('#view'),
			$modal: $con.find('#modal'),
			$kakaoLogin: $con.find('#kakao-login-btn'),
			$fbLogin: $con.find('#fb-login-btn')
		};
	}

	function onError(errorMsg, url, lineNumber, column, errorObj) {
		if (typeof errorMsg === 'string' && errorMsg.indexOf('Script error.') > -1) {
			return;
		}
		console.log('Error: ', errorMsg, ' Script: ' + url + ' Line: ' + lineNumber + ' Column: ' + column + ' StackTrace: ' + errorObj);
	}

	function initModule($con) {
		console.log('login', localStorage.login);
		console.log('first', localStorage.first);
		var logged = localStorage.login && JSON.parse(localStorage.login);
		var first = localStorage.first && JSON.parse(localStorage.first);
		setJqMap($con);
		if (first) {
			wwm.modal.initModule($('#wwm-intro').html());
		}
		if (logged) {
			wwm.lobby.initModule(jqMap.$view);
		} else {
			wwm.login.initModule(jqMap.$view);
		}
		$(window).on('error', onError);
	}

	return {
		initModule: initModule
	};
}());

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
						'data-members': JSON.stringify(res[i].members)
					})
					.append($title)
					.append($number);
				if (res[i].password) {
					var $password = $('<div/>').addClass('passwordroom').html('<i class="fa fa-lock"></i>');
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
						'data-members': JSON.stringify(res[i].members)
					})
					.append($title)
					.append($number);
				if (res[i].password) {
					var $password = $('<div/>').addClass('passwordroom').html('<i class="fa fa-lock"></i>');
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
		console.log($(this).data('members'));
		var data = {
			rid: $(this).data('rid'),
			title: $(this).find('.title').text(),
			current: $(this).find('.current').text(),
			number: $(this).find('.total').text(),
			maker: $(this).data('maker'),
			members: $(this).data('members')
		};
		var pw = '';
		var spinner = new Spinner().spin();
		jqMap.$list.append(spinner.el);
		if ($(this).has('.passwordroom').length) {
			pw = prompt('비밀번호');
		}
		$.post('/enterroom/' + data.rid, {pw: pw, pid: userInfo.id, name: userInfo.name})
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

wwm.login = (function () {
	var jqMap;
	function localhostLogin() {
		var res = {id: "123456789", name: '관리자'};
		var joinPromise = wwm.model.join(res);
		joinPromise.fail(function(err){
			alert('가입 오류 발생!');
			console.log(err.responseText);
		});
		window.userInfo = res;
		localStorage.login = JSON.stringify(res);
		localStorage.loginType = 'localhost';
		wwm.lobby.initModule(jqMap.$con);
	}
	function localhost2Login() {
		var res = {id: "987654321", name: '테스터'};
		var joinPromise = wwm.model.join(res);
		joinPromise.fail(function(err){
			alert('가입 오류 발생!');
			console.log(err.responseText);
		});
		window.userInfo = res;
		localStorage.login = JSON.stringify(res);
		localStorage.loginType = 'localhost';
		wwm.lobby.initModule(jqMap.$con);
	}
	function kakaoLogin() {
		Kakao.Auth.login({
			success: function () {
				Kakao.API.request({
					url: '/v1/user/me',
					success: function (res) {
						var id = res.id;
						var name = res.properties.nickname;
						var data = {
							name: name,
							id: id
						};
						var joinPromise = wwm.model.join(data);
						joinPromise.fail(function(err){
							alert('가입 오류 발생!');
							console.log(err.responseText);
						});
						window.userInfo = res;
						localStorage.login = JSON.stringify(res);
						localStorage.loginType = 'kakao';
						wwm.lobby.initModule(jqMap.$con);
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
	}
	function fbLogin() {
		FB.login(function (res) {
			if (res.status === 'connected') {
				FB.api('/me', function (res) {
					var id = res.id;
					var name = res.name;
					var data = {
						name: name,
						id: id
					};
					var joinPromise = wwm.model.join(data);
					joinPromise.fail(function(err){
						alert('가입 오류 발생!');
						console.log(err.responseText);
					});
					window.userInfo = res;
					localStorage.login = JSON.stringify(res);
					localStorage.loginType = 'facebook';
					wwm.lobby.initModule(jqMap.$con);
				});
			} else if (res.status === 'not_authorized') {
				// The person is logged into Facebook, but not your app.
				alert('Please log log into this app.');
			} else {
				alert('Please log into Facebook.');
			}
		});
	}
	function setJqMap($con) {
		jqMap = {
			$con: $con,
			$kakaoLogin: $con.find('#kakao-login-btn'),
			$fbLogin: $con.find('#fb-login-btn'),
			$localhost: $con.find('#localhost-login'),
			$localhost2: $con.find('#localhost2-login'),
			$canvas: $con.find('#canvas-logo')
		};
	}
	function initModule($con) {
		$con.html($('#wwm-login').html());
		setJqMap($con);
		var ctx = jqMap.$canvas[0].getContext('2d');
		var path= new Path2D();
		path.arc(75,75,50,0,Math.PI*2,true); // Outer circle
		path.moveTo(110,75);
		path.arc(75,75,35,0,Math.PI,false);  // Mouth (clockwise)
		path.moveTo(65,65);
		path.arc(60,65,5,0,Math.PI*2,true);  // Left eye
		path.moveTo(95,65);
		path.arc(90,65,5,0,Math.PI*2,true);  // Right eye
		ctx.stroke(path);
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
		jqMap.$localhost.click(localhostLogin);
		jqMap.$localhost2.click(localhost2Login);
	}
	return {
		initModule: initModule
	};
}());

wwm.modal = (function (){
	var stMap = {
		$modal: $('#modal')
	};
	var jqMap;
	function setJqMap($con) {
		jqMap = {
			$con: $con,
			$close: $con.find('.modal-close'),
			$title: $con.find('#room-title'),
			$number: $con.find('#room-people-number'),
			$password: $con.find('#room-password'),
			$createRoom: $con.find('#create-room-btn')
		};
	}
	function onCloseModal() {
		stMap.$modal.hide();
	}
	function createRoom() {
		var spinner = new Spinner().spin();
		jqMap.$con.append(spinner.el);
		var data;
		var title = jqMap.$title.val();
		var number = jqMap.$number.val();
		var password = jqMap.$password.val();
		var userInfo = JSON.parse(localStorage.login);
		var maker = userInfo.id || userInfo._id;
		if (!title) {
			$(spinner.el).remove();
			alert('제목을 입력하세요.');
			return;
		}
		data = {
			rid: new Date().getTime().toString(),
			title: title,
			maker: maker.toString(),
			number: number,
			password: password || null,
			members: JSON.stringify([{id: userInfo.id, name: userInfo.name}])
		};
		console.log('createroom data', data);
		var createRoomPromise = wwm.model.createRoom(data);
		createRoomPromise.done(function (result) {
			console.log(result);
			data.current = 1;
			wwm.room.initModule(data, 'create');
			stMap.$modal.hide();
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
		stMap.$modal.html($target);
		setJqMap(stMap.$modal);
		jqMap.$close.click(onCloseModal);
		stMap.$modal.show();
		jqMap.$createRoom.click(createRoom);
	}
	return {
		initModule: initModule
	};
}());
wwm.room = (function(){
	var jqMap;
	var stMap = {
		current: 'day',
		dayArray: null,
		nightArray: null,
		memberList: [],
		onlineList: [],
		personColor: 0,
		rid: null
	};
	var cfMap = {
		$con: $('#view'),
		colorList: ['red', 'orange', 'yellow', 'yellowgreen', 'skyblue', 'purple', 'violet', 'pink']
	};
	var socket = io();
	function setJqMap($con) {
		jqMap = {
			$con: $con,
			$explode: $con.find('#explode-room'),
			$ban: $con.find('#ban-people-btn'),
			$changeLimit: $con.find('#change-number-btn'),
			$changeTitle: $con.find('#change-room-title'),
			$calendar: $con.find('table'),
			$thDay: $con.find('table').find('tr').eq(0).find('th'),
			$thTime: $con.find('table').find('tr').first(),
			$memberList: $con.find('#member-list'),
			$day: $con.find('#day'),
			$night: $con.find('#night'),
			$back: $con.find('#room-back'),
			$admin: $con.find('#admin-menu'),
			$dayExp: $con.find('#day-exception'),
			$notDay: $con.find('#day-exception').find('li'),
			$timeExp: $con.find('#time-exception'),
			$notTime: $con.find('#time-exception').find('li'),
			$title: $con.find('#title'),
			$total: $con.find('#total-number'),
			$sendChat: $con.find('#send-chat'),
			$chatList: $con.find('#chat-list'),
			$confirm: $con.find('#confirm-calendar'),
			$refresh: $con.find('#refresh-calendar')
		};
	}
	function createArray(length) {
		var arr = new Array(length || 0), i = length, j = 0;
		if (arguments.length > 1) {
			var args = Array.prototype.slice.call(arguments, 1);
			while(i--) arr[length-1 - i] = createArray.apply(this, args);
		}
		if (arguments.length == 1) {
			for (j; j < arr.length; j++) {
				arr[j] = [];
			}
		}
		return arr;
	}
	function tableToArray(cellList, busy) {
		var arrList = [];
		for (var i = 0; i < cellList.length; i++) {
			var cell = cellList[i];
			var arr = [cell.parentNode.rowIndex - 1, cell.cellIndex - 1];
			arrList.push(arr);
		}
		console.log('tableToArray', arrList);
		return arrList;
	}
	function arrayToTable(cellList, sid, cur, busy) {
		console.log(cellList, sid, cur, stMap.current, busy);
		if (cur !== stMap.current) {
			if (cur === 'day') {
				for (var i = 0; i < cellList.length; i++) {
					var cell = cellList[i];
					var dayCell = stMap.dayArray[cell[0]][cell[1]];
					dayCell.push(sid);
					console.log('different day', dayCell);
					stMap.dayArray[cell[0]][cell[1]] = dayCell;
				}
			} else {
				for (var i = 0; i < cellList.length; i++) {
					var cell = cellList[i];
					var nightCell = stMap.nightArray[cell[0]][cell[1]];
					nightCell.push(sid);
					console.log('different night', nightCell);
					stMap.nightArray[cell[0]][cell[1]] = nightCell;
				}
			}
			return;
		}
		if (stMap.current === 'day') {
			for (var i = 0; i < cellList.length; i++) {		
				var cell = cellList[i];
				var $cell = jqMap.$calendar.find('tr').eq(cell[0] + 1).find('td').eq(cell[1]);
				var dayCell = stMap.dayArray[cell[0]][cell[1]];
				var number;							
				if (busy) {
					dayCell.push(sid);
					number = dayCell.length;
					$cell.find('div').remove();
					var $box = $('<div/>').addClass('box-' + number);
					for (var k = 0; k < number; k++) {
						$box.append($('<div/>', {class: cfMap.colorList[dayCell[k] - 1]}));
					}
					$box.appendTo($cell);
				} else {
					var index = dayCell.indexOf(sid);
					if (index > -1) {
						dayCell.splice(index, 1);
					}
					number = dayCell.length;
					$cell.find('div').remove();
					var $box = $('<div/>').addClass('box-' + number);
					for (var k = 0; k < number; k++) {
						console.log(cfMap.colorList[dayCell[k] - 1]);
						$box.append($('<div/>', {class: cfMap.colorList[dayCell[k] - 1]}));
					}
					$box.appendTo($cell);
				}
				stMap.dayArray[cell[0]][cell[1]] = dayCell;
			}
			console.log('arrToTable:day', stMap.dayArray, stMap.nightArray);
		} else {
			for (var i = 0; i < cellList.length; i++) {
				var cell = cellList[i];
				var number;
				var $cell = jqMap.$calendar.find('tr').eq(cell[0] + 1).find('td').eq(cell[1]);
				var nightCell = stMap.nightArray[cell[0]][cell[1]];				
				if (busy) {
					nightCell.push(sid);
					number = nightCell.length;
					$cell.find('div').remove();
					var $box = $('<div/>').addClass('box-' + number);
					for (var k = 0; k < number; k++) {
						$box.append($('<div/>', {class: cfMap.colorList[nightCell[k] - 1]}));
					}
					$box.appendTo($cell);
				} else {
					var index = nightCell.indexOf(sid);
					if (index > -1) {
						nightCell.splice(index, 1);
					}
					number = nightCell.length;
					$cell.find('div').remove();
					var $box = $('<div/>').addClass('box-' + number);
					for (var k = 0; k < number; k++) {
						$box.append($('<div/>', {class: cfMap.colorList[nightCell[k] - 1]}));
					}
					$box.appendTo($cell);
				}
				stMap.nightArray[cell[0]][cell[1]] = nightCell;
			}
			console.log('arrToTable:night', stMap.dayArray, stMap.nightArray);
		}
	}
	function renderTable(current) {
		var i, j, k;
		if (current === 'day') {
			console.log('renderTable:day', stMap.dayArray);
			for (i = 0; i < 12; i++) {
				for (j = 0; j < 7; j++) {
					var $cell = jqMap.$calendar.find('tr').eq(i + 1).find('td').eq(j);
					var dayCell = stMap.dayArray[i][j];
					var number = dayCell.length;
					$cell.find('div').remove();
					if (number > 0) {
						var $box = $('<div/>').addClass('box-' + number);
						for (k = 0; k < number; k++) {
							$box.append($('<div/>', {class: cfMap.colorList[dayCell[k] - 1]}));
						}
						$box.appendTo($cell);
					}
				}
			}
		} else {
			console.log('renderTable:night', stMap.nightArray);
			for (i = 0; i < 12; i++) {
				for (j = 0; j < 7; j++) {
					var $cell = jqMap.$calendar.find('tr').eq(i + 1).find('td').eq(j);
					var nightCell = stMap.nightArray[i][j];
					var number = nightCell.length;
					$cell.find('div').remove();
					if (number > 0) {
						var $box = $('<div/>').addClass('box-' + number);
						for (k = 0; k < number; k++) {
							$box.append($('<div/>', {class: cfMap.colorList[nightCell[k] - 1]}));
						}
						$box.appendTo($cell);
					}
				}
			}
		}
	}
	function showMembers() {
		console.log('showMembers', stMap.memberList);
		for (var i = 0; i < stMap.memberList.length; i++) {
			jqMap.$memberList.find('ul').append('<li data-id="' + stMap.memberList[i].id + '"><span class="online">오프라인</span>&nbsp;<span>' + stMap.memberList[i].name + '</span></li>');
		}
	}
	function newMember(doc) {
		console.log(doc.id, stMap.memberList);
		var alreadyMember = false;
		for (var i = 0; i < stMap.memberList.length; i++) {
			if (stMap.memberList[i].id == doc.id) {
				alreadyMember = true;
				break;
			}
		}
		console.log(alreadyMember);
		if (alreadyMember) {
			jqMap.$memberList.find('[data-id=' + doc.id + ']').find('.online').text('온라인');		
		} else {			
			jqMap.$memberList.find('ul').append('<li data-id="' + doc.id + '"><span class="online">온라인</span>&nbsp;<span>' + doc.name + '</span></li>');
		}
	}
	function ban(e) {
		var banPromise = wwm.model.ban(e.data.rid);
		banPromise.done(function(res) {});
		banPromise.fail(function(err) {});
	}
	function changeTitle(e) {
		var title = $(this).prev().val();
		var titlePromise = wwm.model.changeTitle(e.data.rid, title);
		titlePromise.done(function(res) {
			jqMap.$title.text(title);
		});
		titlePromise.fail(function(err) {
			alert('제목 바꾸기 실패!');
			console.log(err);
		});
	}
	function changeLimit(e) {
		var number = $(this).prev().val();
		var limitPromise = wwm.model.changeLimit(e.data.rid, number);
		limitPromise.done(function(res) {
			jqMap.$total.text(number);
		});
		limitPromise.fail(function(err) {
			alert('인원수 바꾸기 실패!');
			console.log(err);
		});
	}
	function onClickDay() {
		var day = this.cellIndex - 1;
		var arr;
		if (stMap.current === 'day') {
			arr = stMap.dayArray;
		} else {
			arr = stMap.nightArray;
		}
		var allSelected = true;
		for (var i = 0; i < 12; i++) {
			if (arr[i][day].indexOf(stMap.personColor) == -1) {
				allSelected = false;
				break;
			}
		}
		if (allSelected) {
			socket.emit('not-busy', {cur: stMap.current, sid: stMap.personColor, arr: tableToArray([this], false)});
		} else {
			socket.emit('busy', {cur: stMap.current, sid: stMap.personColor, arr: tableToArray([this], true)});
		}
	}
	function onClickTime() {
		var time = this.parentNode.rowIndex - 1;
		var arr;
		if (stMap.current === 'day') {
			arr = stMap.dayArray;
		} else {
			arr = stMap.nightArray;
		}
		var allSelected = true;
		for (var i = 0; i < 12; i++) {
			if (arr[time][i].indexOf(stMap.personColor) == -1) {
				allSelected = false;
				break;
			}
		}
		if (allSelected) {
			socket.emit('not-busy', {cur: stMap.current, sid: stMap.personColor, arr: tableToArray([this], false)});
		} else {
			socket.emit('busy', {cur: stMap.current, sid: stMap.personColor, arr: tableToArray([this], true)});
		}
	}
	function showAdminMenu() {
		var $this = $(this);
		if ($this.hasClass('opened')) {				
			$this.removeClass('opened');
			$this.find('ul').hide();
		} else {
			$this.addClass('opened');
			$this.find('ul').show();
		}
	}
	function showDayException() {
		var $this = $(this);
		if ($this.hasClass('opened')) {				
			$this.removeClass('opened');
			$this.find('ul').hide();
		} else {
			$this.addClass('opened');
			$this.find('ul').show();
		}
	}
	function showTimeException() {
		var $this = $(this);
		if ($this.hasClass('opened')) {
			$this.removeClass('opened');
			$this.find('ul').hide();
		} else {
			$this.addClass('opened');
			$this.find('ul').show();
		}
	}
	function deleteRoom(e) {
		var id = e.data.rid;
		var deletePromise = wwm.model.deleteRoom(id, userInfo.id);
		deletePromise.done(function(res) {
			alert('삭제되었습니다.');
			wwm.lobby.initModule(jqMap.$con);
		});
		deletePromise.fail(function(err) {
			console.log(err);
			alert('방 지우기 오류발생');
		});
	}
	function onClickCell() {
		// 어레이를 발송
		var arr, cell;
		if (stMap.current === 'day') {
			arr = stMap.dayArray;
		} else if (stMap.current === 'night') {
			arr = stMap.nightArray;
		}
		cell = arr[this.parentNode.rowIndex - 1][this.cellIndex - 1];
		console.log('not-busy', cell, cell.length, stMap.personColor);
		if (cell) {
			console.log(cell.indexOf(stMap.personColor) > -1);
			if (cell.length && cell.indexOf(stMap.personColor) > -1) {
				socket.emit('not-busy', {cur: stMap.current, sid: stMap.personColor, arr: tableToArray([this], false)});
			} else {
				socket.emit('busy', {cur: stMap.current, sid: stMap.personColor, arr: tableToArray([this], true)});
			}
		} else {
			socket.emit('busy', {cur: stMap.current, sid: stMap.personColor, arr: tableToArray([this], true)});
		}
	}
	function excludeDay(e) {
		// 해당일에 대한 어레이를 발송
		e.stopPropagation();
		alert($(this).index());
		var idx = $(this).index();
		var arr = [];
		for (var i = 0; i < 12; i++) {
			arr.push([i, idx]);
		}
		if ($(this).hasClass('selected')) {
			socket.emit('not-busy', arr);
			$(this).removeClass('selected');
		} else {
			socket.emit('busy', arr);
			$(this).addClass('selected');
		}
	}
	function excludeTime(e) {
		// 해당 시간에 대한 어레이를 발송
		e.stopPropagation();
		alert($(this).index());
		var idx = $(this).index();
		var time = $(this).find('input').val();
		if (!time) {
			return;
		}
		var arr = [];
		if (idx === 0) { // not before
			for (var i = 0; i < time; i++) {
				for (var j = 0; j < 7; j++) {
					arr.push([time, j]);
				}
			}
			console.log('arr', arr);
			if ($(this).hasClass('selected')) {
				socket.emit('not-busy', arr);
				$(this).removeClass('selected');
			} else { // no selected
				socket.emit('busy', arr);
				$(this).addClass('selected');
			} // not before
		} else { // not after
			for (var i = time - 1; i < 12; i++) {
				for (var j = 0; j < 7; j++) {
					console.log(arr);
					arr.push([time, j]);
				}
			}
			console.log('arr', arr);
			if ($(this).hasClass('selected')) {
				socket.emit('not-busy', arr);
				$(this).removeClass('selected');
			} else {
				socket.emit('busy', arr);
				$(this).addClass('selected');
			}
		} // not after
	}
	function goBack(e) {
		socket.emit('out', {id: userInfo.id, rid: e.data.rid});
		wwm.lobby.initModule(jqMap.$con);
	}
	function quit() {
		socket.emit('quit', {id: userInfo.id, rid: e.data.rid});
		wwm.lobby.initModule(jqMap.$con);
	}
	function sendChat() {
		var text = $(this).prev('#chatbox').val();
		socket.emit('chat', {
			id: userInfo.id,
			name: userInfo.name,
			text: text
		});
	}
	function refresh(e) {
		$.post('/roominfo/' + stMap.rid).done(function(res) {
			stMap.day =  res[0].day ? res[0].day : stMap.day;
			stMap.night = res[0].night ? res[0].night : stMap.night;
			renderTable();
		}).fail(function(err) {
			console.log(err);
			alert('새로고침 오류!');
		});
	}
	function confirm(e) {
		var data = e.data;
		wwm.model.confirm(data);
	}
	function toDay() {
		stMap.current = 'day';
		renderTable(stMap.current);
		jqMap.$night.css('background', 'white');
		jqMap.$day.css('background', 'gray');
	}
	function toNight() {
		stMap.current = 'night';
		renderTable(stMap.current);
		jqMap.$day.css('background', 'white');
		jqMap.$night.css('background', 'gray');
	}
	function initModule(doc, status) {
		// docs 정보를 방 모듈에 입력 및 다른 유저들에게 방에 입장했음을 알림.
		socket.emit('enter', {id: userInfo.id, rid: doc.rid, name: userInfo.name});
		if (status === 'create') { // dayArray와 nightArray를 설정.
			stMap.dayArray = createArray(12,7);
			stMap.nightArray = createArray(12,7);
			console.log(stMap.dayArray, stMap.nightArray);
		} else if (status === 'enter') {
			stMap.dayArray = doc.day || createArray(12,7);
			stMap.nightArray = doc.night || createArray(12,7);
			console.log(stMap.dayArray, stMap.nightArray);
		}
		stMap.rid = doc.rid;
		console.log('doc.members', doc.members);
		stMap.memberList = Array.isArray(doc.members) ? doc.members : JSON.parse(doc.members);
		for (var i = 0; i < doc.members.length; i++) {
			if (doc.members[i].id == userInfo.id) {
				stMap.personColor = i + 1;
			}
		}
		console.log('stMap.personColor', stMap.personColor);
		var parser = {
			name: userInfo.name || userInfo.properties.nickname, //유저네임
			title: doc.title, //타이틀
			current: doc.current, //현재원
			total: doc.number, //총원
			members: stMap.memberList
		};
		if (userInfo.id == doc.maker) {
			parser.admin = true;
		}
		console.log('admin?', userInfo.id == doc.maker);
		console.log('parser', parser);
		var src = $('#wwm-room').text();
		var comp = dust.compile(src);
		var tmpl = dust.loadSource(comp);
		dust.render(tmpl, parser, function(err, out) {
			if (err) {
				cfMap.$con.html(err);
				return;
			}
			cfMap.$con.html(out);
			setJqMap(cfMap.$con);
			jqMap.$day.css({
				background: 'gray'
			});
			showMembers();
			socket.on('out', function(id) {
				var target = stMap.onlineList.indexOf(id);
				stMap.onlineList.splice(target, 1);
				console.log(jqMap.$memberList, jqMap.$memberList.find('[data-id=' + id + ']'));
				jqMap.$memberList.find('[data-id=' + id + ']').find('.online').text('오프라인');
				console.log('out', stMap.onlineList, stMap.memberList);
			});
			socket.on('quit', function(id) {
				var target = stMap.onlineList.indexOf(id);
				stMap.onlineList.splice(target, 1);
				var target = stMap.memberList.indexOf(id);
				stMap.memberList.splice(target, 1);
				console.log(jqMap.$memberList, jqMap.$memberList.find('[data-id=' + id + ']'));
				jqMap.$memberList.find('[data-id=' + id + ']').remove();
				console.log('quit', stMap.onlineList, stMap.memberList);
			});
			socket.on('newMember', function(data) {
				console.log('new member entered', data);
				socket.emit('uptodateArr', {sid: data.socket, day: stMap.dayArray, night: stMap.nightArray});				
				newMember(data);
			});
			socket.on('uptodateArr', function(data) {
				console.log('info transferred');
				stMap.dayArray = data.day;
				stMap.nightArray = data.night;
				renderTable(stMap.current);
			});
			socket.on('chat', function(data) {
				jqMap.$chatList.append('<div>' + data.name + ' send: ' + data.text + '</div>');
			});
			socket.on('busy', function(data) {
				console.log('socketbusy:', data.arr, data.sid, data.cur);
				arrayToTable(data.arr, data.sid, data.cur, true);
			});
			socket.on('not-busy', function(data) {
				console.log('socketnotbusy:', data.arr, data.sid, data.cur);
				arrayToTable(data.arr, data.sid, data.cur, false);
			});
			jqMap.$calendar.find('td').click(onClickCell);
			jqMap.$explode.click({id: doc.rid}, deleteRoom);
			jqMap.$back.click({rid: doc.rid}, goBack);
			jqMap.$day.click(toDay);
			jqMap.$night.click(toNight);
			jqMap.$admin.click(showAdminMenu);
			jqMap.$dayExp.click(showDayException);
			jqMap.$timeExp.click(showTimeException);
			jqMap.$ban.click({id: doc.rid}, ban);
			jqMap.$changeLimit.click({id: doc.rid}, changeLimit);
			jqMap.$changeTitle.click({id: doc.rid}, changeTitle);
			jqMap.$sendChat.click(sendChat);
			jqMap.$notDay.click(excludeDay);
			jqMap.$notTime.click(excludeTime);
			jqMap.$confirm.click({rid: doc.rid, day: stMap.dayArray, night: stMap.nightArray}, confirm);
			jqMap.$refresh.click(refresh);
		});
	}
	
	return {
		initModule: initModule,
		info: stMap
	};
}());