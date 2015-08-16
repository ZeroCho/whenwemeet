wwm.room = (function(){
	var jqMap;
	var stMap = {
		current: 'day',
		dayArray: null,
		nightArray: null,
		memberList: [],
		myInfo: {
			id: userInfo.id,
			name: userInfo.name,
			confirm: false
		},
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
			$refresh: $con.find('#refresh-calendar'),
			$allConfirmed: $con.find('#all-confirmed')
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
			jqMap.$memberList.find('ul').append('<li data-id="' + stMap.memberList[i].id + '"><span class="online">오프라인</span>&nbsp;<span class="' + cfMap.colorList[i] + '-text">' + stMap.memberList[i].name + '</span></li>');
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
		if (stMap.myInfo.confirm) { //이미 confirm했으면.
			data.bool = false;
		} else {
			data.bool = true;
		}
		var confirmPromise = wwm.model.confirm(data);
		confirmPromise.done(function(res) {
			stMap.myInfo.confirm = data.bool;
			if (data.bool) {
				jqMap.$confirm.addClass('confirmed');
			} else {
				jqMap.$confirm.removeClass('confirmed');
			}
			socket.emit('confirmed', {id: userInfo.id, bool: data.bool});
		});
		confirmPromise.fail(function(err) {
			console.log(err);
			alert('confrim error!');
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
	function toConfirmPage() {
		wwm.confirm.initModule(stMap);
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
		for (var i = 0; i < stMap.memberList.length; i++) {
			if (stMap.memberList[i].id == userInfo.id) {
				stMap.personColor = i + 1;
				stMap.myInfo.confirm = stMap.memberList[i].confirm;
				if (stMap.myInfo.confirm) {
					jqMap.$confirm.addClass('confirmed');
				}
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
			socket.on('confirmed', function(data) {
				var confirmCount = 0;
				for (var i = 0; i < stMap.memberList.length; i++) {
					if (stMap.memberList[i].id == data.id) {
						stMap.memberList[i].confirm == data.bool;
					}
					if (stMap.memberList[i].confirm == true) {
						confirmCount++;
					}
				}
				if (confirmCount == stMap.memberList.length) {
					jqMap.$allConfirmed.show();
				} else {
					jqMap.$allConfirmed.hide();
				}
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
			jqMap.$confirm.click({id: userInfo.id, rid: doc.rid, day: stMap.dayArray, night: stMap.nightArray}, confirm);
			jqMap.$refresh.click(refresh);
			jqMap.$allConfirmed.clck(toConfirmPage);
		});
	}
	
	return {
		initModule: initModule,
		info: stMap
	};
}());