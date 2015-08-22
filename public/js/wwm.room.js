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
		onlineList: [],
		maker: 0,
		rid: null,
		title: null,
		total: 0,
		current: 0
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
			$banList: $con.find('#ban-member-list'),
			$changeLimit: $con.find('#change-number-btn'),
			$changeTitle: $con.find('#change-room-title'),
			$calendar: $con.find('table'),
			$thDay: $con.find('table').find('tr').eq(0).find('th'),
			$thTime: $con.find('table').find('tr').first(),
			$memberList: $con.find('#member-list'),
			$day: $con.find('#day'),
			$night: $con.find('#night'),
			$back: $con.find('#room-back'),
			$quit: $con.find('#quit'),
			$admin: $con.find('#admin-menu'),
			$dayExp: $con.find('#day-exception'),
			$notDay: $con.find('#day-exception').find('li'),
			$timeExp: $con.find('#time-exception'),
			$notTime: $con.find('#time-exception').find('li'),
			$title: $con.find('#title'),
			$current: $con.find('#current-number'),
			$total: $con.find('#total-number'),
			$sendChat: $con.find('#send-chat'),
			$chatList: $con.find('#chat-list'),
			$confirm: $con.find('#confirm-calendar'),
			$refresh: $con.find('#refresh-calendar'),
			$allConfirmed: $con.find('#all-confirmed'),
			$kakaoInvite: $con.find('#kakao-invite'),
			$fbInvite: $con.find('#fb-invite')
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
		console.log('tableToArray');
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
		console.log('arrayTotable', cellList, sid, cur, stMap.now, busy);
		if (cur !== stMap.now) {
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
		if (stMap.now === 'day') {
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
						$box.append($('<div/>', {class: cfMap.colorList[dayCell[k]]}));
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
						console.log(cfMap.colorList[dayCell[k]]);
						$box.append($('<div/>', {class: cfMap.colorList[dayCell[k]]}));
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
						$box.append($('<div/>', {class: cfMap.colorList[nightCell[k]]}));
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
						$box.append($('<div/>', {class: cfMap.colorList[nightCell[k]]}));
					}
					$box.appendTo($cell);
				}
				stMap.nightArray[cell[0]][cell[1]] = nightCell;
			}
			console.log('arrToTable:night', stMap.dayArray, stMap.nightArray);
		}
	}
	function renderTable(now) {
		var i, j, k;
		if (now === 'day') {
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
							$box.append($('<div/>', {class: cfMap.colorList[dayCell[k]]}));
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
							$box.append($('<div/>', {class: cfMap.colorList[nightCell[k]]}));
						}
						$box.appendTo($cell);
					}
				}
			}
		}
	}
	function showMembers() {
		console.log('showMembers', stMap.memberList);
		jqMap.$memberList.find('ul').empty();
		for (var i = 0; i < stMap.memberList.length; i++) {
			var member = stMap.memberList[i];
			jqMap.$memberList.find('ul').append('<li data-id="' + member.id + '"><span class="offline">오프라인</span>&nbsp;<span class="' + cfMap.colorList[i] + '-text">' + member.name + '</span><span class="chat"></span></li>');
		}
	}
	function newMember(doc) {
		console.log('newMember', doc, doc.id, stMap.memberList);
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
			jqMap.$memberList.find('ul').append('<li data-id="' + doc.id + '"><span class="online">온라인</span>&nbsp;<span class="' + findInfo(id).color + '-text">' + doc.name + '</span><span class="chat"></span></li>');
		}
	}
	function findInfo(id) {
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
	}
	function ban(e) {
		var banned = $(this).prev().val();
		console.log('ban', banned);
		if (banned == stMap.maker) {
			alert('자기 자신을 강퇴시키면 안 되겠죠?');
			return;
		}
		var banPromise = wwm.model.ban(banned, e.data.rid);
		banPromise.done(function(res) {
			socket.emit('ban', {id: banned, order: findInfo(banned).personColor});
		});
		banPromise.fail(function(err) {
			console.log(err);
			alert('퇴장당하지 않으려고 버티는중! 다시 시도하세요.');
		});
	}
	function changeTitle(e) {
		var title = $(this).prev().val();
		console.log('changeTitle', title);
		var titlePromise = wwm.model.changeTitle(e.data.rid, title);
		titlePromise.done(function(res) {
			stMap.title = title;
			jqMap.$title.text(title);
		});
		titlePromise.fail(function(err) {
			alert('제목 바꾸기 실패!');
			console.log(err);
		});
	}
	function changeLimit(e) {
		var number = $(this).prev().val();
		console.log('changeLiimit', number);
		if (number < stMap.current) {
			alert('현재 사람이 설정한 수보다 많습니다.');
			return;
		}
		var limitPromise = wwm.model.changeLimit(e.data.rid, number);
		limitPromise.done(function(res) {
			changeTotalNumber(number);	
		});
		limitPromise.fail(function(err) {
			alert('인원수 바꾸기 실패!');
			console.log(err);
		});
	}
	function onClickDay() {
		console.log('onClickDay');
		var day = this.cellIndex - 1;
		var arr;
		if (stMap.now === 'day') {
			arr = stMap.dayArray;
		} else {
			arr = stMap.nightArray;
		}
		var allSelected = true;
		for (var i = 0; i < 12; i++) {
			if (arr[i][day].indexOf(stMap.myInfo.personColor) == -1) {
				allSelected = false;
				break;
			}
		}
		if (allSelected) {
			socket.emit('not-busy', {cur: stMap.now, sid: stMap.myInfo.personColor, arr: tableToArray([this], false)});
		} else {
			socket.emit('busy', {cur: stMap.now, sid: stMap.myInfo.personColor, arr: tableToArray([this], true)});
		}
	}
	function onClickTime() {
		conosle.log('onClickTime');
		var time = this.parentNode.rowIndex - 1;
		var arr;
		if (stMap.now === 'day') {
			arr = stMap.dayArray;
		} else {
			arr = stMap.nightArray;
		}
		var allSelected = true;
		for (var i = 0; i < 12; i++) {
			if (arr[time][i].indexOf(stMap.myInfo.personColor) == -1) {
				allSelected = false;
				break;
			}
		}
		if (allSelected) {
			socket.emit('not-busy', {cur: stMap.now, sid: stMap.myInfo.personColor, arr: tableToArray([this], false)});
		} else {
			socket.emit('busy', {cur: stMap.now, sid: stMap.myInfo.personColor, arr: tableToArray([this], true)});
		}
	}
	function showAdminMenu() {
		console.log('showAdminMenu');
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
		console.log('showDayException');
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
		console.log('showTimeexception');
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
		console.log('deleteRoom', e.data.rid);
		var rid = e.data.rid;
		var deletePromise = wwm.model.deleteRoom(rid, userInfo.id);
		deletePromise.done(function(res) {
			alert('삭제되었습니다.');
			wwm.lobby.initModule(jqMap.$con);
			socket.emit('explode', rid);
		});
		deletePromise.fail(function(err) {
			console.log(err);
			alert('방 지우기 오류발생');
		});
	}
	function onClickCell() {
		console.log('onclickCell');
		// 어레이를 발송
		var arr, cell;
		if (stMap.now === 'day') {
			arr = stMap.dayArray;
		} else {
			arr = stMap.nightArray;
		}
		cell = arr[this.parentNode.rowIndex - 1][this.cellIndex - 1];
		console.log('not-busy', cell, cell.length, stMap.myInfo.personColor);
		if (cell) {
			console.log(cell.indexOf(stMap.myInfo.personColor) > -1);
			if (cell.length && cell.indexOf(stMap.myInfo.personColor) > -1) {
				socket.emit('not-busy', {cur: stMap.now, sid: stMap.myInfo.personColor, arr: tableToArray([this], false)});
			} else {
				socket.emit('busy', {cur: stMap.now, sid: stMap.myInfo.personColor, arr: tableToArray([this], true)});
			}
		} else {
			socket.emit('busy', {cur: stMap.now, sid: stMap.myInfo.personColor, arr: tableToArray([this], true)});
		}
	}
	function excludeDay(e) {
		console.log('excludeDay');
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
		conosle.log('excludeTime');
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
		console.log('goBack', e.data.rid);
		socket.emit('out', {id: stMap.myInfo.id, rid: e.data.rid});
		wwm.lobby.initModule(jqMap.$con);
	}
	function quit(e) {
		console.log('quit', e.data.rid);
		if (stMap.current === 1) {
			if (confirm('혼자 있을 때 방을 나가면 방이 사라집니다.그래도 나가시겠습니까?')) {
				wwm.model.deleteRoom(e.data.rid, stMap.myInfo.id);
			}
			return;
		}
		if (confirm('정말 나가시겠습니까? 잠시 나가는 거면 목록 버튼을 클릭하세요.')) {
			socket.emit('quit', {id: stMap.myInfo.id, rid: e.data.rid});
			wwm.lobby.initModule(jqMap.$con);
		}
	}
	function changeCurrentNumber(gap) {
		console.log('changeCurrentNumber', gap);
		stMap.current += gap;
		jqMap.$current.text(stMap.current);		
	}
	function changeTotalNumber(num) {
		console.log('changeTotalNumber', num);
		stMap.total = number;
		jqMap.$total.text(number);
	}
	function sendChat() {
		var text = $(this).prev('#chatbox').val();
		console.log('sendChat', stMap.myInfo.id, text);		
		socket.emit('chat', {
			id: stMap.myInfo.id,
			name: stMap.myInfo.name,
			text: text
		});
	}
	function refresh(e) {
		console.log('refresh', stMap.rid);
		$.post('/roominfo/' + stMap.rid).done(function(res) {
			stMap.day =  res[0].day ? res[0].day : stMap.day;
			stMap.night = res[0].night ? res[0].night : stMap.night;
			renderTable();
		}).fail(function(err) {
			console.log(err);
			alert('새로고침 오류!');
		});
	}
	function confirmCalendar(e) {
		console.log('confirm', e.data);
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
			socket.emit('confirmed', {id: stMap.myInfo.id, bool: data.bool});
		});
		confirmPromise.fail(function(err) {
			console.log(err);
			alert('confrim error!');
		});
	}
	function toDay() {
		console.log('toDay', stMap.now);
		stMap.now = 'day';
		renderTable(stMap.now);
		jqMap.$night.css('background', 'white');
		jqMap.$day.css('background', 'gray');
	}
	function toNight() {
		console.log('toNight', stMap.now);
		stMap.now = 'night';
		renderTable(stMap.now);
		jqMap.$day.css('background', 'white');
		jqMap.$night.css('background', 'gray');
	}
	function toConfirmPage() {
		console.log('toConfirmPage', stMap);
		wwm.confirm.initModule(stMap);
	}
	function kakaoInvite() {
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
			appButton: {
				text: '우리 언제 만나'
			},
			fail: function() {
				alert('KakaoLink is currently only supported in iOS and Android platforms.');
			}
		});
	}
	function fbInvite() {}
	function initModule(doc, status) {
		console.log('room initModule', status);
		// docs 정보를 방 모듈에 입력.
		stMap.title = doc.title;
		stMap.total = doc.number;
		stMap.rid = doc.rid;
		stMap.maker = doc.maker;
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
		for (var i = 0; i < stMap.memberList.length; i++) {
			if (stMap.memberList[i].id == userInfo.id) {
				stMap.myInfo.personColor = i;
				stMap.myInfo.id = userInfo.id;
				stMap.myInfo.name = userInfo.name || userInfo.properties.nickname;
				stMap.myInfo.confirm = stMap.memberList[i].confirm;
				if (stMap.myInfo.confirm) {
					jqMap.$confirm.addClass('confirmed');
				}
			}
		}
		socket.emit('enter', {id: stMap.myInfo.id, rid: stMap.rid, name: stMap.myInfo.name});
		var parser = {
			name: stMap.myInfo.name, //유저네임
			title: stMap.title, //타이틀
			current: stMap.current, //현재원
			total: stMap.total, //총원
			members: stMap.memberList
		};
		if (stMap.myInfo.id == stMap.maker) {
			parser.admin = true;
		}
		console.log('admin?', stMap.myInfo.id == stMap.maker);
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
			showMembers();
			socket.on('out', function(id) {
				var target = stMap.onlineList.indexOf(id);
				stMap.onlineList.splice(target, 1);
				console.log(jqMap.$memberList, jqMap.$memberList.find('[data-id=' + id + ']'));
				jqMap.$memberList.find('[data-id=' + id + ']').find('.online').addClass('offline').removeClass('online').text('오프라인');
				console.log('socketout', stMap.onlineList, stMap.memberList);
			});
			socket.on('quit', function(id) {
				var target = stMap.onlineList.indexOf(id);
				stMap.onlineList.splice(target, 1);
				for (var i = 0; i < stMap.memberList.length; i++) {
					if (stMap.memberList[i].id == id) {
						stMap.memberList.splice(i, 1);
					}
				}
				console.log(jqMap.$memberList, jqMap.$memberList.find('[data-id=' + id + ']'));
				changeCurrentNumber(-1);
				showMembers();
				console.log('socketquit', stMap.onlineList, stMap.memberList);
			});
			socket.on('newMember', function(data) {
				console.log('socket newmember', data);
				socket.emit('uptodateArr', {sid: data.socket, day: stMap.dayArray, night: stMap.nightArray});	
				changeCurrentNumber(1);
				jqMap.$banList.append('<option value="' + data.id + '">' + findInfo(data.id).name + '</option>');
				newMember(data);
			});
			socket.on('uptodateArr', function(data) {
				console.log('socket uptodateArr');
				stMap.dayArray = data.day;
				stMap.nightArray = data.night;
				renderTable(stMap.now);
			});
			socket.on('chat', function(data) {
				console.log('socket chat', data.id, data.text);
				jqMap.$memberList.find('li').eq(findInfo(data.id).personColor).find('.chat').text(data.text);
			});
			socket.on('busy', function(data) {
				console.log('socketbusy:', data.arr, data.sid, data.cur);
				arrayToTable(data.arr, data.sid, data.cur, true);
			});
			socket.on('not-busy', function(data) {
				console.log('socketnotbusy:', data.arr, data.sid, data.cur);
				arrayToTable(data.arr, data.sid, data.cur, false);
			});
			socket.on('ban', function(data) {
				// 강퇴당한 경우.
				if (stMap.myInfo.personColor == data.id) {
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
					if (banned == stMap.memberList[i].id) {
						stMap.memberList.splice(i, 1);
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
				console.log('socket confirmed');
			});
			socket.on('explode', function(rid) {
				alert('방이 폭파되었습니다. 로비로 이동합니다.');
				wwm.lobby.initModule(jqMap.$con);
				console.log('socket explode');
			});
			jqMap.$calendar.find('td').click(onClickCell);
			jqMap.$explode.click({id: stMap.rid}, deleteRoom);
			jqMap.$back.click({rid: stMap.rid}, goBack);
			jqMap.$day.click(toDay);
			jqMap.$night.click(toNight);
			jqMap.$admin.click(showAdminMenu);
			jqMap.$dayExp.click(showDayException);
			jqMap.$timeExp.click(showTimeException);
			jqMap.$ban.click({rid: stMap.rid}, ban);
			jqMap.$changeLimit.click({id: stMap.rid}, changeLimit);
			jqMap.$changeTitle.click({id: stMap.rid}, changeTitle);
			jqMap.$sendChat.click(sendChat);
			jqMap.$notDay.click(excludeDay);
			jqMap.$notTime.click(excludeTime);
			jqMap.$confirm.click({id: stMap.myInfo.id, rid: stMap.rid, day: stMap.dayArray, night: stMap.nightArray}, confirmCalendar);
			jqMap.$refresh.click(refresh);
			jqMap.$allConfirmed.click(toConfirmPage);
			jqMap.$quit.click({id: stMap.myInfo.id, rid: stMap.rid}, quit);
			jqMap.$kakaoInvite.click(kakaoInvite);
			jqMap.$fbInvite.click(fbInvite);
		});
	}
	
	return {
		initModule: initModule,
		info: stMap
	};
}());
