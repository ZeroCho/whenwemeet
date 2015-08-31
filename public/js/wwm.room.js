wwm.room = (function(){
	'use strict';
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
		onlineList: new Array(8),
		maker: 0,
		rid: null,
		title: null,
		limit: 0,
		current: 0
	};
	var cfMap = {
		colorList: ['red', 'orange', 'yellow', 'yellowgreen', 'skyblue', 'purple', 'violet', 'pink']
	};
	var socket = io();
	var setJqMap, createArray, tableToArray, arrayToTable, renderTable, showMembers, newMember, showOnline, findInfo, banPerson, changeTitle, changeLimit, onClickDay, onClickTime, onClickCell, excludeDay, excludeTime, showAdminMenu, showDayException, showTimeException, deleteRoom, checkConfirmed, toLobby, quit, toggleCalendar, changeCurrentNumber, changeLimitNumber, sendChat, refresh, confirmCalendar, toConfirmPage, kakaoInvite, fbInvite, toggleAside, initModule;
	setJqMap = function($con) {
		jqMap = {
			$con: $con,
			$calendar: $con.find('table'),
			$dayTable: $con.find('#day-table'),
			$nightTable: $con.find('#night-table'),
			$thDay: $con.find('#day-table, #night-table').find('tr').eq(0).find('th'),
			$thTime: $con.find('#day-table, #night-table').find('tr').find('th:first-child'),
			$memberList: $con.find('#member-list'),
			$toggleCalendar: $con.find('#toggle-table'),
			$toLobby: $con.find('#back-to-lobby'),
			$quit: $con.find('#quit'),
			$myMenu: $con.find('#my-menu'),
			$admin: $con.find('#manage-btn, #invite-btn'),
			$dayExp: $con.find('#day-exc-btn'),
			$notDay: $con.find('#day-exception').find('li'),
			$timeExp: $con.find('#time-exc-btn'),
			$notTime: $con.find('#time-exception').find('li'),
			$explode: $con.find('#explode-room'),
			$ban: $con.find('#ban-people-btn'),
			$banList: $con.find('#ban-member-list'),
			$changeLimit: $con.find('#change-limit-btn'),
			$changeTitle: $con.find('#change-room-title'),
			$title: $con.find('#title'),
			$current: $con.find('#current-number'),
			$limit: $con.find('#limit-number'),
			$sendChat: $con.find('#send-chat'),
			$chatList: $con.find('#chat-list'),
			$confirm: $con.find('#confirm-calendar'),
			$refresh: $con.find('#refresh-calendar'),
			$allConfirmed: $con.find('#all-confirmed'),
			$kakaoInvite: $con.find('#kakao-invite'),
			$fbInvite: $con.find('#fb-invite'),
			$aside: $con.find('#room-aside'),
			$toggleAside: $con.find('#show-aside, #close-aside')
		};
	};
	createArray = function(length) {
		var arr = new Array(length || 0);
		var i, j;
		var args = Array.prototype.slice.call(arguments, 1);
		if (arguments.length > 1) {
			for (i = length; i > 0; i--) {
				arr[length - 1 - i] = createArray.apply(this, args);
			}
		} else if (arguments.length == 1) {
			for (j = 0; j < arr.length; j++) {
				arr[j] = [];
			}
		}
		return arr;
	};
	tableToArray = function(cellList) { // cell을 선택했을 때 array로 바꾼다
		var i, cell, arr;
		var arrList = [];
		console.log('tableToArray');
		for (i = 0; i < cellList.length; i++) {
			cell = cellList[i];
			arr = [cell.parentNode.rowIndex - 1, cell.cellIndex - 1];
			arrList.push(arr);
		}
		console.log('tableToArray', arrList);
		return arrList;
	};
	arrayToTable = function(cellList, sid, cur, busy) { // array를 table로 만든다.
		var i, k, cell, number, $cell, $box, index, dayCell, nightCell;
		console.log('arrayToTable', cellList, sid, cur, busy);
		if (cur === 'day') {
			for (i = 0; i < cellList.length; i++) {
				cell = cellList[i];
				$cell = jqMap.$dayTable.find('tr').eq(cell[0] + 1).find('td').eq(cell[1]);
				dayCell = stMap.dayArray[cell[0]][cell[1]];
				if (busy) {
					dayCell.push(sid);
					number = dayCell.length;
					$cell.find('div').remove();
					$box = $('<div/>').addClass('box-' + number);
					for (k = 0; k < number; k++) {
						$box.append($('<div/>', {class: cfMap.colorList[dayCell[k]]}));
					}
					$box.appendTo($cell);
				} else {
					index = dayCell.indexOf(sid);
					if (index > -1) {
						dayCell.splice(index, 1);
					}
					number = dayCell.length;
					$cell.find('div').remove();
					$box = $('<div/>').addClass('box-' + number);
					for (k = 0; k < number; k++) {
						console.log(cfMap.colorList[dayCell[k]]);
						$box.append($('<div/>', {class: cfMap.colorList[dayCell[k]]}));
					}
					$box.appendTo($cell);
				}
				stMap.dayArray[cell[0]][cell[1]] = dayCell;
			}
			console.log('arrToTable:day', stMap.dayArray);
		} else if (cur === 'night') {
			for (i = 0; i < cellList.length; i++) {
				cell = cellList[i];
				$cell = jqMap.$nightTable.find('tr').eq(cell[0] + 1).find('td').eq(cell[1]);
				nightCell = stMap.nightArray[cell[0]][cell[1]];		
				if (busy) {
					nightCell.push(sid);
					number = nightCell.length;
					$cell.find('div').remove();
					$box = $('<div/>').addClass('box-' + number);
					for (k = 0; k < number; k++) {
						$box.append($('<div/>', {class: cfMap.colorList[nightCell[k]]}));
					}
					$box.appendTo($cell);
				} else {
					index = nightCell.indexOf(sid);
					if (index > -1) {
						nightCell.splice(index, 1);
					}
					number = nightCell.length;
					$cell.find('div').remove();
					$box = $('<div/>').addClass('box-' + number);
					for (k = 0; k < number; k++) {
						$box.append($('<div/>', {class: cfMap.colorList[nightCell[k]]}));
					}
					$box.appendTo($cell);
				}
				stMap.nightArray[cell[0]][cell[1]] = nightCell;
			}
			console.log('arrToTable:night', stMap.nightArray);
		}
	};
	renderTable = function() {
		var i, j, k, $cell, number, $box, dayCell, nightCell;
		console.log('renderTable');
		for (i = 0; i < 12; i++) {
			for (j = 0; j < 7; j++) {
				$cell = jqMap.$dayTable.find('tr').eq(i + 1).find('td').eq(j);
				dayCell = stMap.dayArray[i][j];
				number = dayCell.length;
				$cell.find('div').remove();
				console.log($cell, dayCell, number);
				if (number > 0) {
					$box = $('<div/>').addClass('box-' + number);
					for (k = 0; k < number; k++) {
						$box.append($('<div/>', {class: cfMap.colorList[dayCell[k]]}));
					}
					$box.appendTo($cell);
				}
			}
		}
		for (i = 0; i < 12; i++) {
			for (j = 0; j < 7; j++) {
				$cell = jqMap.$nightTable.find('tr').eq(i + 1).find('td').eq(j);
				nightCell = stMap.nightArray[i][j];
				number = nightCell.length;
				$cell.find('div').remove();
				if (number > 0) {
					$box = $('<div/>').addClass('box-' + number);
					for (k = 0; k < number; k++) {
						$box.append($('<div/>', {class: cfMap.colorList[nightCell[k]]}));
					}
					$box.appendTo($cell);
				}
			}
		}
	};
	showMembers = function() {
		var src = $('#wwm-member-list').html();
		var i, member;
		console.log('showMembers', stMap.memberList);
		jqMap.$memberList.find('ul').empty();
		for (i = 0; i < stMap.memberList.length; i++) {
			member = stMap.memberList[i];
			dust.render(dust.loadSource(dust.compile(src)), {id: member.id, color: cfMap.colorList[i], name: member.name, picture: member.picture}, function(err, out){
				if (err) {
					jqMap.$memberList.find('ul').html(err);
				} else {
					jqMap.$memberList.find('ul').append(out);
				}
			});
		}
		showOnline();
	};
	newMember = function(doc) {
		var src = $('#wwm-member-list').html();
		console.log('newMember', doc, doc.id, stMap.memberList);
		stMap.memberList.push({id: doc.id, name: doc.name, picture: doc.picture, confirm: false});
		jqMap.$banList.append('<option value="' + doc.id + '">' + findInfo(doc.id).name + '</option>');
		dust.render(dust.loadSource(dust.compile(src)), {id: doc.id, color: findInfo(id).color, name: doc.name, picture: doc.picture}, function(err, out) {
			if (err) {
				jqMap.$memberList.find('ul').html(err);
			} else {
				jqMap.$memberList.find('ul').append(out);
			}
		});
		showOnline();
	};
	showOnline = function() {
		var $list, i;
		console.log('showOnline onlineList', stMap.onlineList);
		for (i = 0; i < stMap.memberList.length; i++) {
		 	$list = jqMap.$memberList.find('li').eq(i);
			if (stMap.onlineList[i]) {
				if ($list.has('.offline').length !== 0) {
					$list.find('.offline').toggleClass('offline online');
				}
			} else {
				 if ($list.has('.online').length !== 0) {
					 $list.find('.online').toggleClass('online offline');
				 }
			}
		}
	};
	findInfo = function(id) {
		var info = {}, i;
		console.log('findInfo', id);
		for (i = 0; i < stMap.memberList.length; i++) {
			if (id == stMap.memberList[i].id) {
				info.personColor = i;
				info.name = stMap.memberList[i].name;
				info.color = cfMap.colorList[i];
			}
		}
		return info;
	};
	banPerson = function(e) {	
		var banned = $(this).prev().val();
		var banPromise;
		console.log('banPerson', banned);
		e.preventDefault();
		if (banned == stMap.maker) {
			alert('자기 자신을 강퇴시키면 안 되겠죠?');
			return;
		}
		banPromise = wwm.model.ban(banned, e.data.rid);
		banPromise.done(function() {
			socket.emit('ban', {id: banned, order: findInfo(banned).personColor});
		});
		banPromise.fail(function(err) {
			console.log(err);
			alert('퇴장당하지 않으려고 버티는중! 다시 시도하세요.');
		});
	};
	changeTitle = function(e) {
		var title = $(this).prev().val();
		var titlePromise = wwm.model.changeTitle(stMap.rid, title);
		e.preventDefault();
		console.log('changeTitle', title);
		titlePromise.done(function() {
			stMap.title = title;
			jqMap.$title.text(title);
		});
		titlePromise.fail(function(err) {
			alert('제목 바꾸기 실패!');
			console.log(err);
		});
	};
	changeLimit = function(e) {
		var number = Number($(this).prev().val());
		var limitPromise;
		e.preventDefault();
		if (number !== number) {
			alert('숫자를 입력해야 합니다.');
			return;
		}
		console.log('changeLiimit', number);
		if (number < stMap.current) {
			alert('현재 사람이 설정한 수보다 많습니다.');
			return;
		}
		limitPromise = wwm.model.changeLimit(stMap.rid, number);
		limitPromise.done(function() {
			changeLimitNumber(number);
		});
		limitPromise.fail(function(err) {
			alert('인원수 바꾸기 실패!');
			console.log(err);
		});
	};
	changeCurrentNumber = function(gap) {
		console.log('changeCurrentNumber', gap);
		stMap.current += gap;
		jqMap.$current.text(stMap.current);
		$('#current-people-limit').val(stMap.current);
	};
	changeLimitNumber = function(num) {
		console.log('changeLimitNumber', num);
		stMap.limit = num;
		jqMap.$limit.text(num);
	};
	showAdminMenu = function(e) {
		var $this = $(this);
		e.stopPropagation();
		console.log('showAdminMenu');
		if ($this.parent().hasClass('opened')) {
			$this.parent().removeClass('opened');
		} else {
			$('.opened').removeClass('opened');
			$this.parent().addClass('opened');
		}
	};
	showDayException = function(e) {
		var $this = $(this);
		e.stopPropagation();		
		console.log('showDayException');
		if ($this.parent().hasClass('opened')) {
			$this.parent().removeClass('opened');
		} else {
			$('.opened').removeClass('opened');
			$this.parent().addClass('opened');
		}
	};
	showTimeException = function(e) {
		var $this = $(this);
		e.stopPropagation();		
		console.log('showTimeexception');
		if ($this.parent().hasClass('opened')) {
			$this.parent().removeClass('opened');
		} else {
			$('.opened').removeClass('opened');
			$this.parent().addClass('opened');
		}
	};
	deleteRoom = function(e) {
		var rid = e.data.rid;
		var deletePromise = wwm.model.deleteRoom(rid, userInfo.id);
		console.log('deleteRoom', rid);
		deletePromise.done(function() {
			alert('삭제되었습니다.');
			wwm.lobby.initModule(jqMap.$con);
			socket.emit('explode', rid);
		});
		deletePromise.fail(function(err) {
			console.log(err);
			alert('방 지우기 오류발생');
		});
	};
	checkConfirmed = function() {
		if (jqMap.$confirm.hasClass('confirmed')) {
			alert('확정 상태가 해제됩니다.');
			jqMap.$confirm.removeClass('confirmed');
			stMap.myInfo.confirm = false;
			socket.emit('confirmed', {id: stMap.myInfo.id, bool: false});
		}
	};
	onClickDay = function() {
		var day = this.cellIndex - 1;
		var arr, dayList = [], i;
		var allSelected = true;
		checkConfirmed();
		console.log('onClickDay');
		if (stMap.now === 'day') {
			arr = stMap.dayArray;
		} else {
			arr = stMap.nightArray;
		}
		for (i = 0; i < 12; i++) {
			if (arr[i][day].indexOf(stMap.myInfo.personColor) == -1) {
				allSelected = false;
				dayList.push([i, day]);
			}
		}
		
		if (allSelected) {
			dayList = [];
			for (i = 0; i < 12; i++) {
				dayList.push([i, day]);
			}
			$(this).removeClass('selected');
			socket.emit('not-busy', {cur: stMap.now, sid: stMap.myInfo.personColor, arr: dayList});
		} else {
			$(this).addClass('selected');
			socket.emit('busy', {cur: stMap.now, sid: stMap.myInfo.personColor, arr: dayList});
		}
	};
	onClickTime = function() {
		var time = this.parentNode.rowIndex - 1;
		var arr, timeList = [], i;
		var allSelected = true;
		checkConfirmed();
		console.log('onClickTime',  time);
		
		if (stMap.now === 'day') {
			arr = stMap.dayArray;
		} else {
			arr = stMap.nightArray;
		}
		
		console.log(arr[time]);
		for (i = 0; i < 7; i++) {
			if (arr[time][i].indexOf(stMap.myInfo.personColor) == -1) {
				allSelected = false;
				timeList.push([time, i]);
			}
		}
		if (allSelected) {
			timeList = [];
			for (i = 0; i < 7; i++) {
				timeList.push([time, i]);
			}
			$(this).removeClass('selected');
			socket.emit('not-busy', {cur: stMap.now, sid: stMap.myInfo.personColor, arr: timeList});
		} else {
			$(this).addClass('selected');
			socket.emit('busy', {cur: stMap.now, sid: stMap.myInfo.personColor, arr: timeList});
		}
	};
	onClickCell = function() {
		var arr, cell;
		checkConfirmed();
		// 어레이를 발송
		if (stMap.now === 'day') {
			arr = stMap.dayArray;
		} else {
			arr = stMap.nightArray;
		}
		cell = arr[this.parentNode.rowIndex - 1][this.cellIndex - 1];
		console.log('onclickCell', this.parentNode.rowIndex - 1, this.cellIndex - 1, cell, cell.length, stMap.myInfo.personColor);
		if (cell) {
			console.log(cell.length, cell.indexOf(stMap.myInfo.personColor) > -1);
			if (cell.length && cell.indexOf(stMap.myInfo.personColor) > -1) {
				socket.emit('not-busy', {cur: stMap.now, sid: stMap.myInfo.personColor, arr: tableToArray([this], false)});
			} else {
				socket.emit('busy', {cur: stMap.now, sid: stMap.myInfo.personColor, arr: tableToArray([this], true)});
			}
		} else {
			socket.emit('busy', {cur: stMap.now, sid: stMap.myInfo.personColor, arr: tableToArray([this], true)});
		}
	};
	excludeDay = function() {
		// 해당일에 대한 어레이를 발송
		var idx = $(this).index();
		var arr = [], i;
		checkConfirmed();
		console.log('excludeDay', idx);
		for (i = 0; i < 12; i++) {
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
	};
	excludeTime = function() {
		// 해당 시간에 대한 어레이를 발송
		
		var idx = $(this).index();
		var time = $(this).find('input').val();
		var i, j, arr = [];
		checkConfirmed();
		console.log('excludeTime', idx, time);
		if (!time) {
			return;
		}
		if (idx === 0) { // not before
			for (i = 0; i < time; i++) {
				for (j = 0; j < 7; j++) {
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
			for (i = time - 1; i < 12; i++) {
				for (j = 0; j < 7; j++) {
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
	};
	toLobby = function(e) {
		console.log('toLobby', e.data.rid);
		if (jqMap.$confirm.hasClass('confirmed')) {
			history.pushState({mod: 'lobby'}, '', '/lobby/' + stMap.myInfo.id);
			socket.emit('out', {id: stMap.myInfo.id, rid: e.data.rid});
			wwm.lobby.initModule(jqMap.$con);
		} else {
			if (confirm('확정 버튼을 누르지 않고 나가면 저장되지 않은 사항은 사라집니다.')) {
				history.pushState({mod: 'lobby'}, '', '/lobby/' + stMap.myInfo.id);
				socket.emit('out', {id: stMap.myInfo.id, rid: e.data.rid});
				wwm.lobby.initModule(jqMap.$con);
			}
		}
	};
	quit = function(e) {
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
	};
	sendChat = function(e) {		
		var text = $(this).parent().prev().val();
		e.preventDefault();
		console.log('sendChat', stMap.myInfo.id, text);		
		socket.emit('chat', {
			id: stMap.myInfo.id,
			name: stMap.myInfo.name,
			text: text
		});
	};
	refresh = function() {
		console.log('refresh', {rid: stMap.rid, id: stMap.myInfo.id});
		socket.on('responseArr', function(data) {
			console.log('socket responseArr');
			stMap.dayArray = data.day;
			stMap.nightArray = data.night;
			renderTable();
		});
		socket.emit('requestArr', {rid: stMap.rid, id: stMap.myInfo.id});
	};
	confirmCalendar = function(e) {
		var data = e.data;
		var confirmPromise;
		data.bool = !stMap.myInfo.confirm;
		data.day = stMap.dayArray;
		data.night = stMap.nightArray;
		console.log('change confirm to', data.bool, data);
		confirmPromise = wwm.model.confirm(data);
		confirmPromise.done(function() {
			if (jqMap.$confirm.hasClass('confirmed')) {
				jqMap.$confirm.removeClass('confirmed');
			} else {
				jqMap.$confirm.addClass('confirmed');
			}
			stMap.myInfo.confirm = data.bool;
			socket.emit('confirmed', {id: stMap.myInfo.id, bool: data.bool});
			console.log(stMap.dayArray);
		});
		confirmPromise.fail(function(err) {
			console.log(err);
			alert('confirm error!');
		});
	};
	toggleCalendar = function() {
		if (stMap.now === 'day') {
			stMap.now = 'night';
			jqMap.$dayTable.hide();
			jqMap.$nightTable.show();
		} else {
			stMap.now = 'day';
			jqMap.$dayTable.show();
			jqMap.$nightTable.hide();
		}
		$(this).find('div').toggleClass('tapped');
	};
	toConfirmPage = function() {
		console.log('toConfirmPage', stMap);
		history.pushState({mod: 'confirm'}, '', '/result/' + stMap.rid);
		wwm.confirm.initModule(stMap);
	};
	kakaoInvite = function() {
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
	};
	fbInvite = function() {
		FB.ui({
			method: 'send',
			link: 'http%3A%2F%2Fwww.nytimes.com%2F2011%2F06%2F15%2Farts%2Fpeople-argue-just-to-win-scholars-assert.html'
		});
	};
	toggleAside = function() {
		console.log('toggleAside', jqMap.$aside.hasClass('opened'));
		if (jqMap.$aside.hasClass('opened')) { // 닫는다.
			jqMap.$aside.removeClass('opened');
			jqMap.$aside.css('left', '-100%');
		} else { // 연다.
			jqMap.$aside.addClass('opened');
			jqMap.$aside.css('left', '0');

		}
	};
	initModule = function(doc, status) {
		var parser, i;
		var src = $('#wwm-room').text();
		console.log('room initModule', status, stMap.rid);
		// docs 정보를 방 모듈에 입력.
		stMap.title = doc.title;
		stMap.limit = Number(doc.limit);
		stMap.rid = doc.rid.toString();
		stMap.maker = doc.maker.toString();
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
		stMap.myInfo.id = userInfo.id.toString();
		stMap.myInfo.name = userInfo.name;
		for (i = 0; i < stMap.memberList.length; i++) {
			if (stMap.memberList[i].id == userInfo.id) {
				stMap.myInfo.personColor = i;
				stMap.myInfo.confirm = stMap.memberList[i].confirm;
				break;
			}
		}
		stMap.onlineList[stMap.myInfo.personColor] = true;
		socket.emit('enter', {
			'id': stMap.myInfo.id,
			'rid': stMap.rid,
			'name': stMap.myInfo.name,
			'color': stMap.myInfo.personColor,
			'picture': userInfo.picture
		});
		parser = {
			name: stMap.myInfo.name, //유저네임
			title: stMap.title, //타이틀
			current: stMap.current, //현재원
			limit: stMap.limit, //총원
			members: stMap.memberList
		};
		if (stMap.myInfo.id == stMap.maker) {
			parser.admin = true;
		}
		dust.render(dust.loadSource(dust.compile(src)), parser, function(err, out) {
			var confirmCount = 0, i;
			if (err) {
				wwm.shell.view.html(err);
				return;
			}
			wwm.shell.view.html(out);
			setJqMap(wwm.shell.view);
			renderTable();
			if (stMap.myInfo.confirm) {
				jqMap.$confirm.addClass('confirmed');
			}
			for (i = 0; i < stMap.memberList.length; i++) {
				console.log(stMap.memberList[i].confirm === true, stMap.memberList[i].confirm);
				if (stMap.memberList[i].confirm === true) {
					confirmCount++;
				}
			}
			if (confirmCount === stMap.memberList.length) {
				jqMap.$allConfirmed.show();
			} else {
				jqMap.$allConfirmed.hide();
			}
			showMembers();
			socket.on('out', function(id) {
				var i;
				console.log(jqMap.$memberList, jqMap.$memberList.find('[data-id=' + id + ']'));
				for (i = 0; i < stMap.memberList.length; i++) {
					if (stMap.memberList[i].id == id) {
						stMap.onlineList[i] = false;
						break;
					}
				}
				showOnline();
				console.log('socketout', stMap.onlineList, stMap.memberList);
			});
			socket.on('quit', function(id) {
				var i;
				for (i = 0; i < stMap.memberList.length; i++) {
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
				stMap.onlineList[data.color] = true;
				socket.emit('uptodateArr', {sid: data.socket, day: stMap.dayArray, night: stMap.nightArray, online: stMap.onlineList});
				if (data.color >= stMap.current) { // 신규멤버면,
					changeCurrentNumber(1);
					newMember(data);
				}
				showOnline();
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
				jqMap.$chatList.append('<p>' + data.name + ': ' + data.text + '</p>');
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
				socket.emit('responseArr', {sid: data.sid, day: stMap.dayArray, night: stMap.nightArray});
			});
			socket.on('ban', function(data) {
				var i;
				// 강퇴당한 경우.
				if (stMap.myInfo.personColor == data.order) {
					alert('강퇴당하셨습니다...');
					wwm.lobby.initModule(jqMap.$con);
					return;
				}
				// 다른 사람이 강퇴당한 경우.
				if (stMap.myInfo.personColor > data.order) {
					stMap.myInfo.personColor--;
				}
				alert(findInfo(id).name + '님이 강제퇴장 되었습니다. 잘가요!');
				for (i = 0; i < stMap.memberList.length; i++) {
					if (data.id == stMap.memberList[i].id) {
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
				var confirmCount = 0, i;
				for (i = 0; i < stMap.memberList.length; i++) {
					if (stMap.memberList[i].id == data.id) {
						stMap.memberList[i].confirm = data.bool;
					}
					if (stMap.memberList[i].confirm === true) {
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
			socket.on('explode', function() {
				alert('방이 폭파되었습니다. 로비로 이동합니다.');
				wwm.lobby.initModule(jqMap.$con);
				console.log('socket explode');
			});
			jqMap.$calendar.find('td').click(onClickCell);
			jqMap.$explode.click({id: stMap.rid}, deleteRoom);
			jqMap.$toLobby.click({rid: stMap.rid}, toLobby);
			jqMap.$toggleCalendar.click(toggleCalendar);
			jqMap.$admin.click(showAdminMenu);
			jqMap.$dayExp.click(showDayException);
			jqMap.$timeExp.click(showTimeException);
			jqMap.$ban.click({rid: stMap.rid}, banPerson);
			jqMap.$changeLimit.click({id: stMap.rid}, changeLimit);
			jqMap.$changeTitle.click({id: stMap.rid}, changeTitle);
			jqMap.$sendChat.click(sendChat);
			jqMap.$notDay.click(excludeDay);
			jqMap.$notTime.click(excludeTime);
			jqMap.$thDay.click(onClickDay);
			jqMap.$thTime.click(onClickTime);
			jqMap.$confirm.click({id: stMap.myInfo.id, rid: stMap.rid}, confirmCalendar);
			jqMap.$refresh.click(refresh);
			jqMap.$allConfirmed.click(toConfirmPage);
			jqMap.$quit.click({id: stMap.myInfo.id, rid: stMap.rid}, quit);
			jqMap.$toggleAside.click(toggleAside);
			jqMap.$kakaoInvite.on({
				click: kakaoInvite,
				mouseover: function() {
					this.src = '/kakaolink_btn_medium_ov.png';
				},
				mouseout: function() {
					this.src = '/kakaolink_btn_medium.png';
				}
			});
			jqMap.$fbInvite.on({
				click: fbInvite,
				mouseover: function() {
					this.src = '/facebook_invite_ov.png';
				},
				mouseout: function() {
					this.src = '/facebook_invite.png';
				}
			});
		});
	};
	return {
		initModule: initModule,
		info: stMap
	};
}());
