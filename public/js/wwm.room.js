wwm.room = (function(){
	var jqMap;
	var stMap = {
		current: 'day',
		dayArray: [[],[],[],[],[],[],[],[],[],[],[],[]],
		nightArray: [[],[],[],[],[],[],[],[],[],[],[],[]],
		memberList: [],
		onlineList: [],
		userInfo: null,
		personColor: 0
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
			$day: $con.find('#day'),
			$night: $con.find('#night'),
			$back: $con.find('#room-back'),
			$dayExp: $con.find('#day-exception'),
			$notDay: $con.find('#day-exception').find('li'),
			$timeExp: $con.find('#time-exception'),
			$notTime: $con.find('#time-exception').find('li'),
			$title: $con.find('#title'),
			$total: $con.find('#total-number'),
			$sendChat: $con.find('#send-chat'),
			$chatList: $con.find('#chat-list')
		};
	}
	function tableToArray(cellList, busy) {
		var arrList = [];
		for (var i = 0; i < cellList.length; i++) {
			var cell = cellList[i];
			var arr = [cell.parentNode.rowIndex - 1, cell.cellIndex - 1];
			if (stMap.current === 'day') {
				if (busy) {
					stMap.dayArray[arr[0]][arr[1]].push(stMap.personColor);
					$(cell).addClass('busy');
				} else {
					var index = stMap.dayArray[arr[0]][arr[1]].indexOf(stMap.personColor);
					if (index > -1) {
						stMap.dayArray[arr[0]][arr[1]].splice(index, 1);
					}
					$(cell).removeClass('busy');
				}
			} else { // current === 'night'
				if (busy) {
					stMap.nightArray[arr[0]][arr[1]].push(stMap.personColor);
					$(cell).addClass('busy');
				} else {
					var index = stMap.nightArray[arr[0]][arr[1]].indexOf(stMap.personColor);
					if (index > -1) {
						stMap.nightArray[arr[0]][arr[1]].splice(index, 1);
					}
					$(cell).removeClass('busy');
				}
			}
			arrList.push(arr);
		}
		return arrList;
	}
	function arrayToTable(msgList) {
		for (var i = 0; i < msgList.length; i++) {
			var msg = msgList[i];
			var $cell = jqMap.$calendar.find('tr').eq(msg[0] + 1).find('td').eq(msg[1] + 1);
			var number = $cell.data('number') || 0;
			$cell.attr('data-number', number + 1);
		}
		renderTable(stMap.current);
	}
	function renderTable(current) {
		var i, j, k;
		if (current === 'day') {
			for (i = 0; i < 12; i++) {
				for (j = 0; j < 7; j++) {
					var $cell = jqMap.$calendar.find('tr').eq(i).find('td').eq(j);
					var number = $cell.data('number') || 0;
					if (stMap.dayArray[i][j].length > 0) {
						var $box = $('<div/>').addClass('box-' + number);
						for (k = 0; k < number; k++) {
							$box.append($('<div/>', {class: cfMap.colorList[stMap.dayArray[i][j][k] - 1]}));
						}
						$box.appendTo($cell);
					}
				}
			}
		} else {
			for (i = 0; i < 12; i++) {
				for (j = 0; j < 7; j++) {
					var $cell = jqMap.$calendar.find('tr').eq(i).find('td').eq(j);
					var number = $cell.data('number') || 0;
					if (stMap.nightArray[i][j].length > 0) {
						var $box = $('<div/>').addClass('box-' + number);
						for (k = 0; k < number; k++) {
							$box.append($('<div/>', {class: cfMap.colorList[stMap.nightArray[i][j][k] - 1]}));
						}
						$box.appendTo($cell);
					}
				}
			}
		}
	}
	function ban(e) {
		var banPromise = wwm.model.ban(e.data.id);
		banPromise.done(function(res) {});
		banPromise.fail(function(err) {});
	}
	function changeTitle(e) {
		var title = $(this).prev().val();
		var titlePromise = wwm.model.changeTitle(e.data.id, title);
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
		var limitPromise = wwm.model.changeLimit(e.data.id, number);
		limitPromise.done(function(res) {
			jqMap.$total.text(number);
		});
		limitPromise.fail(function(err) {
			alert('인원수 바꾸기 실패!');
			console.log(err);
		});
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
		var id = e.data.id;
		var deletePromise = wwm.model.deleteRoom(id);
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
		if ($(this).hasClass('busy')) {
			socket.emit('not-busy', tableToArray([this], false));
		} else {
			socket.emit('busy', tableToArray([this], true));
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
	function excludeTime() {
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
					console.log(arr);
					arr.push([time, j]);
				}
			}
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
			if ($(this).hasClass('selected')) {
				socket.emit('not-busy', arr);
				$(this).removeClass('selected');
			} else {
				socket.emit('busy', arr);
				$(this).addClass('selected');
			}
		} // not after
	}
	function goBack() {
		wwm.lobby.initModule(jqMap.$con);
	}
	function sendChat() {
		var text = $(this).prev('#chatbox').val();
		socket.emit('chat', {
			id: cfMap.userInfo.id,
			text: text
		});
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
	function initModule(data) {
		// data를 방 모듈에 입력.
		stMap.userInfo = JSON.parse(localStorage.login);
		socket.emit('enter', {id: stMap.userInfo, rid: data.id}); // 방에 참가했음을 알림.
		socket.on('onlineList', function(list) {
			console.log('onlinelist', list);
		stMap.onlineList = list;
		});
		stMap.onlineList.push(stMap.userInfo.id);
		stMap.memberList = data.member;
		console.log(data.member);
		stMap.personColor = data.member.indexOf(stMap.userInfo.id) + 1;
		var parser = {
			name: stMap.userInfo.name || stMap.userInfo.properties.nickname, //유저네임
			title: data.title, //타이틀
			current: data.current, //현재원
			total: data.number //총원
		};
		if (stMap.userInfo.id === data.maker) { // 아이디가 방장 아이디와 같으면
			parser.admin = true;
		}
		var src = $('#wwm-room').text();
		dust.render(dust.loadSource(dust.compile(src)), parser, function(err, out) {
			if (err) {
				cfMap.$con.html(err);
				return;
			}
			cfMap.$con.html(out);
			setJqMap(cfMap.$con);
			jqMap.$day.css({
				background: 'gray'
			});
			socket.on('chat', function(data) {
				jqMap.$chatList.text(data.id + ' send ' + data.text);
			});
			socket.on('busy', function(msg) {
				arrayToTable(msg);
			});
			socket.on('not-busy', function(msg) {
				arrayToTable(msg);
			});
			jqMap.$calendar.find('td').click(onClickCell);
			jqMap.$explode.click({id: data.id}, deleteRoom);
			jqMap.$back.click(goBack);
			jqMap.$day.click(toDay);
			jqMap.$night.click(toNight);
			jqMap.$dayExp.click(showDayException);
			jqMap.$timeExp.click(showTimeException);
			jqMap.$ban.click({id: data.id}, ban);
			jqMap.$changeLimit.click({id: data.id}, changeLimit);
			jqMap.$changeTitle.click({id: data.id}, changeTitle);
			jqMap.$sendChat.click(sendChat);
			jqMap.$notDay.click(excludeDay);
			jqMap.$notTime.click(excludeTime);
		});
	}
	
	return {
		initModule: initModule
	};
}());
