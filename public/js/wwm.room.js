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
				arr[j] = 0;
			}
		}
		return arr;
	}
	function tableToArray(cellList, busy) {
		var arrList = [];
		console.log('cellList.length', cellList.length);
		for (var i = 0; i < cellList.length; i++) {
			var cell = cellList[i];
			var arr = [cell.parentNode.rowIndex - 1, cell.cellIndex - 1];
			console.log(arr);
			var cellArray;
			if (stMap.current === 'day') {
				cellArray = stMap.dayArray[arr[0]][arr[1]];
				if (busy) {
					console.log('busy:stMap.dayArray[arr[0]][arr[1]]', cellArray);
					cellArray ? cellArray.push(stMap.personColor) : (cellArray = [stMap.personColor]);
					console.log('cellresult', cellArray);
					$(cell).addClass('busy');
				} else {				
					console.log('not-busy:stMap.dayArray[arr[0]][arr[1]]', cellArray);
					var index = cellArray.indexOf(stMap.personColor);
					if (index > -1) {
						cellArray.splice(index, 1);
					}
					$(cell).removeClass('busy');
				}
			} else { // current === 'night'
				cellArray = stMap.nightArray[arr[0]][arr[1]];
				if (busy) {
					console.log('busy:stMap.nightArray[arr[0]][arr[1]]', cellArray);
					cellArray ? cellArray.push(stMap.personColor) : (cellArray = [stMap.personColor]);
					$(cell).addClass('busy');
				} else {
					console.log('not-busy:stMap.nightArray[arr[0]][arr[1]]', cellArray);
					var index = cellArray.indexOf(stMap.personColor);
					if (index > -1) {
						cellArray.splice(index, 1);
					}
					$(cell).removeClass('busy');
				}
			}
			stMap.dayArray[arr[0]][arr[1]] = cellArray;
			arrList.push(arr);
		}
		console.log('arrList', arrList);
		return arrList;
	}
	function arrayToTable(cellList, busy) {
		console.log(cellList, busy);
		if (stMap.current === 'day') {
			for (var i = 0; i < cellList.length; i++) {
				var cell = cellList[i];
				var $cell = jqMap.$calendar.find('tr').eq(cell[0] + 1).find('td').eq(cell[1]);
				var number = parseInt($cell.attr('data-number'), 10) || 0;
				var cellArray = stMap.dayArray[cell[0]][cell[1]];
				if (busy) {
					number += 1;
					$cell.attr('data-number', number);
					$cell.find('div').remove();
					var $box = $('<div/>').addClass('box-' + number);
					for (var k = 0; k < number; k++) {
						$box.append($('<div/>', {class: cfMap.colorList[cellArray[k] - 1]}));
					}
					$box.appendTo($cell);
				} else {
					number -= 1;
					$cell.attr('data-number', number);
					$cell.find('div').remove();
					var $box = $('<div/>').addClass('box-' + number);
					for (var k = 0; k < number; k++) {
						$box.append($('<div/>', {class: cfMap.colorList[cellArray[k] - 1]}));
					}
					$box.appendTo($cell);
				}
				console.log($cell);
			}
		} else if (stMap.current === 'night') {}
	}
	function renderTable(current) {
		var i, j, k;
		if (current === 'day') {
			for (i = 0; i < 12; i++) {
				for (j = 0; j < 7; j++) {
					var $cell = jqMap.$calendar.find('tr').eq(i + 1).find('td').eq(j);
					var number = $cell.data('number') || 0;
					var cellArray = stMap.dayArray[i][j];
					console.log($cell, number, cellArray);
					if (cellArray && cellArray.length > 0) {
						console.log('stMap.dayArray[i][j]', cellArray);
						console.log('number', number);
						var $box = $('<div/>').addClass('box-' + number);
						for (k = 0; k < number; k++) {
							$box.append($('<div/>', {class: cfMap.colorList[cellArray[k] - 1]}));
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
						console.log('stMap.nightArray[i][j]', stMap.nightArray[i][j]);
						console.log('number', number);
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
	function newMember(doc) {
		console.log(doc.id, stMap.memberList.indexOf(doc.id) == -1);
		if (stMap.memberList.indexOf(doc.id) == -1) {
			stMap.memberList.push(doc.id);
			jqMap.$memberList.find('ul').append('<li data-id="' + doc.id + '"><span class="online">온라인</span>&nbsp;<span>' + doc.name + '</span></li>');
		} else {
			jqMap.$memberList.find('[data-id=' + doc.id + ']').find('.online').text('온라인');
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
	function onClickDay() {}
	function onClickTime() {}
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
			renderTalbe();
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
		// docs를 방 모듈에 입력.
		socket.emit('enter', {id: userInfo.id, rid: doc.rid, name: userInfo.name});
		if (status === 'create') {
			stMap.dayArray = createArray(12,7);
			stMap.nightArray = createArray(12,7);
			console.log(stMap.dayArray, stMap.nightArray);
		} else if (status === 'enter') {
			 // 방에 참가했음을 알림.
			stMap.dayArray = doc.day || createArray(12,7);
			stMap.nightArray = doc.night || createArray(12,7);
			console.log(stMap.dayArray, stMap.nightArray);
		}
		stMap.rid = doc.rid;
		stMap.memberList = Array.isArray(doc.member) ? doc.member : [doc.member];
		console.log('doc.member', doc.member);
		stMap.personColor = Array.isArray(doc.member) ?  doc.member.indexOf(userInfo.id) + 1 : 1;
		console.log('stMap.personColor', stMap.personColor);
		var parser = {
			name: userInfo.name || userInfo.properties.nickname, //유저네임
			title: doc.title, //타이틀
			current: doc.current, //현재원
			total: doc.number //총원
		};
		console.log('userinfo.id', userInfo.id);
		console.log('doc.maker', doc.maker);
		console.log('admin?', userInfo.id == doc.maker);
		if (userInfo.id == doc.maker) { // 아이디가 방장 아이디와 같으면
			parser.admin = true;
		}
		console.log('parser', parser);
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
				newMember(data);
			});
			socket.on('chat', function(data) {
				jqMap.$chatList.text(data.name + ' send: ' + data.text);
			});
			socket.on('busy', function(list) {
				console.log(list);
				arrayToTable(list, true);
			});
			socket.on('not-busy', function(list) {
				console.log(list);
				arrayToTable(list, false);
			});
			jqMap.$calendar.find('td').click(onClickCell);
			jqMap.$explode.click({id: doc.rid}, deleteRoom);
			jqMap.$back.click({rid: doc.rid}, goBack);
			jqMap.$day.click(toDay);
			jqMap.$night.click(toNight);
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
