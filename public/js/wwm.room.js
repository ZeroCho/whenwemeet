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
			$calendar: $con.find('table'),
			$dayTable: $con.find('#day-table'),
			$nightTable: $con.find('#night-table'),
			$thDay: $con.find('table').find('tr').eq(0).find('th'),
			$thTime: $con.find('table').find('tr').find('th:first-child'),
			$memberList: $con.find('#member-list'),
			$day: $con.find('#day'),
			$night: $con.find('#night'),
			$back: $con.find('#room-back'),
			$quit: $con.find('#quit'),
			$myMenu: $con.find('#my-menu'),
			$admin: $con.find('#manage-btn'),
			$dayExp: $con.find('#day-exc-btn'),
			$notDay: $con.find('#day-exception').find('li'),
			$timeExp: $con.find('#time-exc-btn'),
			$notTime: $con.find('#time-exception').find('li'),
			$explode: $con.find('#explode-room'),
			$ban: $con.find('#ban-people-btn'),
			$banList: $con.find('#ban-member-list'),
			$changeLimit: $con.find('#change-number-btn'),
			$changeTitle: $con.find('#change-room-title'),
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
	function tableToArray(cellList, busy) { // cell을 선택했을 때 array로 바꾼다
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
	function arrayToTable(cellList, sid, cur, busy) { // array를 table로 만든다.
		console.log('arrayTotable', cellList, sid, cur, busy);
		if (cur === 'day') {
			for (var i = 0; i < cellList.length; i++) {		
				var cell = cellList[i];
				var $cell = jqMap.$dayTable.find('tr').eq(cell[0] + 1).find('td').eq(cell[1]);
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
		} else if (cur === 'night') {
			for (var i = 0; i < cellList.length; i++) {
				var cell = cellList[i];
				var number;
				var $cell = jqMap.$nightTable.find('tr').eq(cell[0] + 1).find('td').eq(cell[1]);
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
	function renderTable() {
		var i, j, k;
		for (i = 0; i < 12; i++) {
			for (j = 0; j < 7; j++) {
				var $cell = jqMap.$dayTalbe.find('tr').eq(i + 1).find('td').eq(j);
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
		for (i = 0; i < 12; i++) {
			for (j = 0; j < 7; j++) {
				var $cell = jqMap.$nightTable.find('tr').eq(i + 1).find('td').eq(j);
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
	function showMembers() {
		console.log('showMembers', stMap.memberList);
		jqMap.$memberList.find('ul').empty();
		var src = $('#wwm-member-list').html();
		for (var i = 0; i < stMap.memberList.length; i++) {
			var member = stMap.memberList[i];
			dust.render(dust.loadSource(dust.compile(src)), {id: member.id, color: cfMap.colorList[i], name: member.name}, function(err, out){
				if (err) {
					jqMap.$memberList.find('ul').html(err);
					return;
				} else {
					jqMap.$memberList.find('ul').append(out);
				}
			});
		}
		showOnline();
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
		var src = $('#wwm-member-list').html();
		if (!alreadyMember) {
			jqMap.$banList.append('<option value="' + data.id + '">' + findInfo(data.id).name + '</option>');
			dust.render(dust.loadSource(dust.compile(src)), {id: doc.id, color: findInfo(id).color, name: doc.name}, function(err, out) {
				if (err) {
					jqMap.$memberList.find('ul').html(err);
					return;
				} else {
					jqMap.$memberList.find('ul').append(out);
				}
			});
		}
		showOnline();
	}
	function showOnline() {
		console.log('showOnline');
		console.log('onlineList', stMap.onlineList);		
		for (var i = 0; i < stMap.memberList.length; i++) {
		 	var $list = jqMap.$memberList.find('ul').eq(i);
		 	console.log(stMap.onlineList[i]);
			if (stMap.onlineList[i]) {			
			 if ($list.has('.offline')) {
			 	$list.find('.offline').toggleClass('offline online').text('온라인');
			 } else {
			 	$list.find('.online').text('온라인');
			 }
			} else {
			 if ($list.has('.online')) {
			 	$list.find('.online').toggleClass('online offline').text('오프라인');
			 } else {
			 	$list.find('.offline').text('오프라인');
			 }
			}
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
		var dayList = [];
		var allSelected = true;
		for (var i = 0; i < 12; i++) {
			if (arr[i][day].indexOf(stMap.myInfo.personColor) == -1) {
				allSelected = false;
			}
			dayList.push([i, day]);
		}
		
		if (allSelected) {
			$(this).removeClass('selected');
			socket.emit('not-busy', {cur: stMap.now, sid: stMap.myInfo.personColor, arr: dayList});
		} else {
			$(this).addClass('selected');
			socket.emit('busy', {cur: stMap.now, sid: stMap.myInfo.personColor, arr: dayList});
		}
	}
	function onClickTime() {
		var time = this.parentNode.rowIndex - 1;
		console.log('onClickTime',  time);
		var arr;
		if (stMap.now === 'day') {
			arr = stMap.dayArray;
		} else {
			arr = stMap.nightArray;
		}
		var timeList = [];
		var allSelected = true;
		console.log(arr[time]);
		for (var i = 0; i < 7; i++) {
			if (arr[time][i].indexOf(stMap.myInfo.personColor) == -1) {
				allSelected = false;
			}
			timeList.push([time, i]);
		}
		if (allSelected) {
			$(this).removeClass('selected');
			socket.emit('not-busy', {cur: stMap.now, sid: stMap.myInfo.personColor, arr: timeList});
		} else {
			$(this).addClass('selected');
			socket.emit('busy', {cur: stMap.now, sid: stMap.myInfo.personColor, arr: timeList});
		}
	}
	function showAdminMenu() {
		console.log('showAdminMenu');
		var $this = $(this);
		jqMap.$myMenu.find('ul').hide();
		if ($this.hasClass('opened')) {				
			$this.removeClass('opened');
			$this.prev('ul').hide();
		} else {
			$this.addClass('opened');
			$this.prev('ul').show();
		}
	}
	function showDayException() {
		console.log('showDayException');
		var $this = $(this);
		jqMap.$myMenu.find('ul').hide();
		if ($this.hasClass('opened')) {				
			$this.removeClass('opened');
			$this.prev('ul').hide();
		} else {
			$this.addClass('opened');
			$this.prev('ul').show();
		}
	}
	function showTimeException() {
		console.log('showTimeexception');
		var $this = $(this);
		jqMap.$myMenu.find('ul').hide();
		if ($this.hasClass('opened')) {
			$this.removeClass('opened');
			$this.prev('ul').hide();
		} else {
			$this.addClass('opened');
			$this.prev('ul').show();
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
		// 해당일에 대한 어레이를 발송
		var idx = $(this).index();
		console.log('excludeDay', idx);
		var arr = [];
		for (var i = 0; i < 12; i++) {
			arr.push([i, idx]);
		}
		if ($(this).hasClass('selected')) {
			socket.emit('not-busy', {cur: 'day', sid: stMap.myInfo.personColor, arr: arr});
			socket.emit('not-busy', {cur: 'night', sid: stMap.myInfo.personColor, arr: arr});
			$(this).removeClass('selected');
		} else {
			socket.emit('busy', {cur: 'day', sid: stMap.myInfo.personColor, arr: arr});
			socket.emit('busy', {cur: 'night', sid: stMap.myInfo.personColor, arr: arr});
			$(this).addClass('selected');
		}
	}
	function excludeTime(e) {
		// 해당 시간에 대한 어레이를 발송
		var idx = $(this).index();
		var time = $(this).find('input').val();
		console.log('excludeTime', idx, time);
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
				socket.emit('not-busy', {cur: 'day', sid: stMap.myInfo.personColor, arr: arr});
				socket.emit('not-busy', {cur: 'night', sid: stMap.myInfo.personColor, arr: arr});
				$(this).removeClass('selected');
			} else { // no selected
				socket.emit('busy', {cur: 'day', sid: stMap.myInfo.personColor, arr: arr});
				socket.emit('busy', {cur: 'night', sid: stMap.myInfo.personColor, arr: arr});
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
				socket.emit('not-busy', {cur: 'day', sid: stMap.myInfo.personColor, arr: arr});
				socket.emit('not-busy', {cur: 'night', sid: stMap.myInfo.personColor, arr: arr});
				$(this).removeClass('selected');
			} else { // no selected
				socket.emit('busy', {cur: 'day', sid: stMap.myInfo.personColor, arr: arr});
				socket.emit('busy', {cur: 'night', sid: stMap.myInfo.personColor, arr: arr});
				$(this).addClass('selected');
			}
		} // not after
	}
	function goBack(e) {
		console.log('goBack', e.data.rid);
		history.pushState({mod: 'lobby'}, '', '/lobby/' + stMap.myInfo.id);
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
			history.replaceState({mod: 'lobby'}, '', '/lobby/' + stMap.myInfo.id);
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
		stMap.total = num;
		jqMap.$total.text(num);
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
		console.log('refresh', {rid: stMap.rid, id: stMap.myInfo.id});
		socket.on('responseArr', function(data) {
			console.log('socket responㅁseArr');
			stMap.dayArray = data.day;
			stMap.nightArray = data.night;
		});
		socket.emit('requestArr', stMap.rid);
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
			alert('confirm error!');
		});
	}
	function toDay() {
		console.log('toDay', stMap.now);
		stMap.now = 'day';
		jqMap.$night.css('background', 'white');
		jqMap.$day.css('background', 'crimson');
		jqMap.$dayTable.show();
		jqMap.$nightTable.hide();
	}
	function toNight() {
		console.log('toNight', stMap.now);
		stMap.now = 'night';
		jqMap.$day.css('background', 'white');
		jqMap.$night.css('background', 'crimson');
		jqMap.$dayTable.hide();
		jqMap.$nightTable.show();
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
		stMap.onlineList[stMap.myInfo.personColor] = true;
		console.log('onlineList', stMap.onlineList);
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
				wwm.shell.view.html(err);
				return;
			}
			wwm.shell.view.html(out);
			setJqMap(wwm.shell.view);
			showMembers();
			socket.on('out', function(id) {
				console.log(jqMap.$memberList, jqMap.$memberList.find('[data-id=' + id + ']'));
				for (var i = 0; i < stMap.memberList.length; i++) {
					if (stMap.memberList[i].id == id) {
						stMap.onlineList[i] = false;
						break;
					}
				}
				showOnline();
				console.log('socketout', stMap.onlineList, stMap.memberList);
			});
			socket.on('quit', function(id) {
				for (var i = 0; i < stMap.memberList.length; i++) {
					if (stMap.memberList[i].id == id) {
						stMap.onlineList.splice(i, 1);
						stMap.memberList.splice(i, 1);
						break;
					}
				}
				console.log(jqMap.$memberList, jqMap.$memberList.find('[data-id=' + id + ']'));
				jqMap.$banList.find('[value=' + id + ']').remove();
				changeCurrentNumber(-1);
				showMembers();
				console.log('socketquit', stMap.onlineList, stMap.memberList);
			});
			socket.on('newMember', function(data) {
				console.log('socket newmember', data);
				socket.emit('uptodateArr', {sid: data.socket, day: stMap.dayArray, night: stMap.nightArray});	
				stMap.onlineList[stMap.memberList.length] = true;
				changeCurrentNumber(1);
				newMember(data);
			});
			socket.on('uptodateArr', function(data) {
				console.log('socket uptodateArr');
				stMap.dayArray = data.day;
				stMap.nightArray = data.night;
				stMap.onlineList = data.online;
				showOnline();
				renderTable();
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
			socket.on('requestArr', function(data) {
				console.log('socket requestArr');
				socket.emit('responseArr', {rid: data.rid, id: data.id, day: stMap.dayArray, night: stMap.nightArray});
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
						stMap.onlineList.splice(i, 1);
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
			$(document).not(jqMap.$myMenu).click(function() {
				jqMap.$myMenu.find('button').removeClass('opened');
				jqMap.$myMenu.find('ul').hide();
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
			jqMap.$thDay.click(onClickDay);
			jqMap.$thTime.click(onClickTime);
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