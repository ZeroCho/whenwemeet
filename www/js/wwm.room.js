wwm.room = (function(){
	'use strict';
	var cfMap = {
		colorList: ['red', 'orange', 'yellow', 'yellowgreen', 'skyblue', 'purple', 'violet', 'pink'],
		memberList: $('#wwm-member-list').text(),
		adminMenu: $('#wwm-admin-menu').text()
	};
	var stMap = {
		now: 'day',
		dayArray: null,
		nightArray: null,
		memberList: [],
		myInfo: {
			id: null,
			name: null,
			confirm: false,
			order: 0
		},
		onlineList: new Array(8),
		maker: 0,
		rid: null,
		title: null,
		picture: null,
		limit: 0,
		current: 0,
		event: false,
		clickMod: null,
		currentCell: null
	};
	var jqMap;
	var socket = io();
	var setJqMap, createArray, cellToCoord, coordListToTable, renderTable, showMembers, addNewMember, showOnlineStatus,
		banPerson, changeTitle, changeLimit, changeCurrentNumber, onClickDay, onClickTime, onClickCell, onMouseupCell, onMouseupDay, onMouseupTime,
		showAdminMenu, deleteRoom, checkConfirmStatus, toLobby, quitRoom, showReportModal, handleSocketEvent,
		toggleTable, sendChat, toggleChatList, refreshTable, removeSchedule, findInfoById,
		confirmTable, toConfirmPage, kakaoInvite, fbInvite, toggleAside, showMemberMenu, initModule;
	setJqMap = function($con) {
		jqMap = {
			$con: $con,
			$picture: $con.find('#room-header img'),
			$table: $con.find('table'),
			$dayTable: $con.find('#day-table'),
			$nightTable: $con.find('#night-table'),
			$thDay: $con.find('#day-table tr:first-child, #night-table tr:first-child').find('th'),
			$thTime: $con.find('#day-table, #night-table').find('tr').find('th:first-child'),
			$memberList: $con.find('#member-list'),
			$toggleTable: $con.find('#toggle-table'),
			$toLobbyBtn: $con.find('#back-to-lobby'),
			$quitBtn: $con.find('#quit'),
			$admin: $con.find('#manage-btn, #invite-btn'),
			$explodeRoom: $con.find('#explode-room'),
			$changeLimit: $con.find('#change-limit-btn'),
			$changeTitle: $con.find('#change-room-title'),
			$roomTitle: $con.find('#title'),
			$report: $con.find('#report-error'),
			$roomPeople: $con.find('#room-people-info'),
			$sendChat: $con.find('#send-chat'),
			$chatbox: $con.find('#chatbox'),
			$chatWrap: $con.find('#chat-wrapper'),
			$chatList: $con.find('#chat-list'),
			$chatToggler: $con.find('.chat-toggler'),
			$confirm: $con.find('#confirm-calendar'),
			$refresh: $con.find('#refresh-calendar'),
			$allConfirmed: $con.find('#all-confirmed'),
			$kakaoInvite: $con.find('#kakao-invite'),
			$fbInvite: $con.find('#fb-invite'),
			$aside: $con.find('#room-aside'),
			$asideFooter: $con.find('#aside-footer'),
			$asideToggler: $con.find('#show-aside, #close-aside')
		};
	};
	createArray = function(length) { /* dayArray, nightArray를 만든다 */
		var arr = new Array(length || 0);
		var i;
		var args = [].slice.call(arguments, 1);
		if (arguments.length > 1) {
			for (i = 0; i < length; i++) {
				arr[i] = createArray.apply(this, args);
			}
		} else if (arguments.length === 1) {
			for (i = 0; i < arr.length; i++) {
				arr[i] = [];
			}
		}
		return arr;
	};
	cellToCoord = function(cellList) { /* cell을 선택했을 때 coord로 바꿔 coordList에 넣는다 */
		var coord, coordList = [];
		cellList.forEach(function(cell) {
			coord = [cell.parentNode.rowIndex - 1, cell.cellIndex - 1];
			coordList.push(coord);
		});
		console.info('cellToCoord', coordList);
		return coordList;
	};
	coordListToTable = function(coordList, sid, cur, busy) { /* array를 table로 만든다. */
		var stMapArray, $table, $cell, $target, index, oneCell;
		console.info('coordListToTable', coordList, sid, cur, busy);
		if (cur === 'day') {
			$table = jqMap.$dayTable;
			stMapArray = stMap.dayArray;
		} else {
			$table = jqMap.$nightTable;
			stMapArray = stMap.nightArray;
		}
		coordList.forEach(function(coord) {
			$cell = $table.find('tr').eq(coord[0] + 1).find('td').eq(coord[1]);
			oneCell = stMapArray[coord[0]][coord[1]];
			if (busy) {
				index = oneCell.indexOf(sid);
				if (index === -1) {
					oneCell.push(sid);
				}
				$target = $cell.find('div').eq(sid);
				$target.addClass(cfMap.colorList[sid]);
				$cell.addClass('busy');
			} else {
				index = oneCell.indexOf(sid);
				if (index > -1) {
					oneCell.splice(index, 1);
				}
				$target = $cell.find('div').eq(sid);
				$target.removeClass(cfMap.colorList[sid]);
				if (!oneCell.length) { $cell.removeClass('busy'); }
			}
			stMapArray[coord[0]][coord[1]] = oneCell;
		});
	};
	renderTable = function() {
		var $cell;
		var stMapArrayList = [stMap.dayArray, stMap.nightArray];
		console.info('renderTable', stMap.dayArray, stMap.nightArray);
		stMapArrayList.forEach(function(stMapArray) {
			stMapArray.forEach(function(tr, i) {
				tr.forEach(function(target, j) {
					target.forEach(function(index) {
						$cell = jqMap.$dayTable.find('tr').eq(i + 1).find('td').eq(j).addClass('busy');
						$cell.find('div').eq(index).addClass(cfMap.colorList[index]);
					});
				});
			});
		});
	};
	removeSchedule = function(order) {
		var stMapArrayList = [stMap.dayArray, stMap.nightArray];
		console.info('removeSchedule', stMap.dayArray, stMap.nightArray);
		stMapArrayList.forEach(function(stMapArray) {
			stMapArray.forEach(function(tr) {
				tr.forEach(function(target) {
					var idx = target.indexOf(order);
					if (idx > -1) {
						target.splice(idx, 1);
						target.forEach(function(color, i) {
							if (order < color) {
								target[i]--;
							}
						});
					}
				});
			});
		});
		renderTable();
	};
	showMembers = function() {
		console.info('showMembers', stMap.memberList);
		jqMap.$memberList.find('ul').empty();
		stMap.memberList.forEach(function(member, i) {
			dust.render(dust.loadSource(dust.compile(cfMap.memberList)), {id: member.id, color: cfMap.colorList[i], name: member.name, picture: member.picture}, function(err, out){
				if (err) {
					jqMap.$memberList.find('ul').html(err);
				} else {
					jqMap.$memberList.find('ul').append(out);
				}
			});
		});
		showOnlineStatus();
	};
	addNewMember = function(doc) {
		console.info('newMember', doc, doc.id, stMap.memberList);
		stMap.memberList.push({id: doc.id, name: doc.name, picture: doc.picture, confirm: false});
		dust.render(dust.loadSource(dust.compile(cfMap.memberList)), {id: doc.id, color: findInfoById(doc.id).color, name: doc.name, picture: doc.picture}, function(err, out) {
			if (err) {
				jqMap.$memberList.find('ul').html(err);
			} else {
				jqMap.$memberList.find('ul').append(out);
			}
		});
		showOnlineStatus();
	};
	showOnlineStatus = function() {
		var $list;
		console.info('showOnline onlineList', stMap.onlineList);
		stMap.memberList.forEach(function(member, i) {
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
		});
	};
	findInfoById = function(id) {
		var info = {};
		console.info('findInfo', id);
		stMap.memberList.forEach(function(member, i) {
			if (id === member.id) {
				info.order = i;
				info.name = member.name;
				info.color = cfMap.colorList[i];
			}
		});
		return info;
	};
	banPerson = function(e, rid) {
		var banned, banPromise;
		if (typeof e === 'string') {
			banned = e;
		} else {
			banned = $(this).prev().val();
			rid = e.data.rid;
			e.preventDefault();
		}
		console.info('banPerson', arguments);
		if (banned === stMap.maker) {
			alert('자기 자신을 강퇴시키면 안 되겠죠?');
			return;
		}
		banPromise = wwm.model.ban(banned, rid);
		banPromise.done(function() {
			socket.emit('ban', {id: banned, order: findInfoById(banned).order});
		});
		banPromise.fail(function(err) {
			console.error(err);
			alert('퇴장당하지 않으려고 버티는중! 다시 시도하세요.');
		});
	};
	changeTitle = function(e) {
		var title = $(this).parent().prev().val();
		var titlePromise = wwm.model.changeTitle(stMap.rid, title);
		e.preventDefault();
		console.info('changeTitle', title);
		titlePromise.done(function() {
			stMap.title = title;
			jqMap.$roomTitle.text(title);
		});
		titlePromise.fail(function(err) {
			alert('제목 바꾸기 실패!');
			console.error(err);
		});
	};
	changeLimit = function(e) {
		var number = Number($(this).parent().prev().val());
		var limitPromise;
		e.preventDefault();
		if (isNaN(number)) {
			alert('숫자를 입력해야 합니다.');
			return;
		}
		console.info('changeLiimit', number);
		if (number < stMap.current) {
			alert('현재 사람이 설정한 수보다 많습니다.');
			return;
		}
		limitPromise = wwm.model.changeLimit(stMap.rid, number);
		limitPromise.done(function() {
			var original = stMap.limit, i;
			stMap.limit = number;
			if (original < number) {
				for (i = 0; i < number - original; i++) {
					jqMap.$roomPeople.append('<i class="fa fa-child vacant"></i>');
				}
			} else {
				for (i = 0; i < original - number; i++) {
					jqMap.$roomPeople.find('.vacant').last().remove();
				}
			}
		});
		limitPromise.fail(function(err) {
			alert('인원수 바꾸기 실패!');
			console.error(err);
		});
	};
	changeCurrentNumber = function(gap) {
		console.info('changeCurrentNumber', gap);
		stMap.current += gap;
		if (gap > 0) {
			jqMap.$roomPeople.find('.vacant').first().removeClass('vacant');
		} else {
			jqMap.$roomPeople.find('.fa-child').not('.vacant').last().addClass('vacant');
		}
		$('#current-people-limit').val(stMap.current);
	};
	showAdminMenu = function(e) {
		var $this = $(this);
		e.stopPropagation();
		console.info('showAdminMenu', $this.parent().hasClass('opened'));
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
		console.info('room deleteRoom', rid);
		deletePromise.done(function() {
			alert('삭제되었습니다.');
			wwm.lobby.initModule(jqMap.$con);
			socket.emit('explode', rid);
		});
		deletePromise.fail(function(err) {
			console.error(err);
			alert('방 지우기 오류발생');
		});
	};
	checkConfirmStatus = function() {
		if (jqMap.$confirm.hasClass('confirmed')) {
			alert('확정 상태가 해제됩니다.');
			jqMap.$confirm.removeClass('confirmed');
			stMap.myInfo.confirm = false;
			socket.emit('confirmed', {id: stMap.myInfo.id, bool: false});
		}
	};
	onClickDay = function(e) {
		var day = this.cellIndex - 1;
		var arr, dayList = [];
		var allSelected = true;
		var clearAll = false;
		checkConfirmStatus();
		console.info('onClickDay', day);
		jqMap.$thDay.off('mouseover').on('mouseover', onClickDay);
		if (stMap.now === 'day') {
			arr = stMap.dayArray;
		} else {
			arr = stMap.nightArray;
		}
		if (day === -1) {
			if (confirm('전체를 선택하거나 취소합니다.')) {
				e.stopPropagation();
				arr.forEach(function (tr, i) {
					tr.forEach(function (cell, j) {
						dayList.push([i, j]);
						if (!clearAll && cell.indexOf(stMap.myInfo.order) > -1) {
							clearAll = true;
						}
					});
				});
				console.log(clearAll, dayList);
				if (clearAll) {
					socket.emit('not-busy', {cur: stMap.now, sid: stMap.myInfo.order, arr: dayList});
				} else {
					socket.emit('busy', {cur: stMap.now, sid: stMap.myInfo.order, arr: dayList});
				}
				return;
			}
			jqMap.$thDay.off('mouseover');
		}
		arr.forEach(function(tr, i) {
			if (tr[day].indexOf(stMap.myInfo.order) === -1) {
				allSelected = false;
				dayList.push([i, day]);
			}
		});
		if (allSelected) {
			dayList = [];
			arr.forEach(function(tr, i) {
				dayList.push([i, day]);
			});
			socket.emit('not-busy', {cur: stMap.now, sid: stMap.myInfo.order, arr: dayList});
		} else {
			socket.emit('busy', {cur: stMap.now, sid: stMap.myInfo.order, arr: dayList});
		}
	};
	onMouseupDay = function () {
		jqMap.$thDay.off('mouseover');
	};
	onClickTime = function() {
		var time = this.parentNode.rowIndex - 1;
		var arr, timeList = [];
		var allSelected = true;
		checkConfirmStatus();
		console.info('onClickTime',  time);
		jqMap.$thTime.off('mouseover').on('mouseover', onClickTime);
		if (stMap.now === 'day') {
			arr = stMap.dayArray;
		} else {
			arr = stMap.nightArray;
		}
		if (time === -1) {
			jqMap.$thTime.off('mouseover');
			return;
		}
		arr[time].forEach(function(target, i) {
			if (target.indexOf(stMap.myInfo.order) === -1) {
				allSelected = false;
				timeList.push([time, i]);
			}
		});
		if (allSelected) {
			timeList = [];
			arr[time].forEach(function(target, i) {
				timeList.push([time, i]);
			});
			socket.emit('not-busy', {cur: stMap.now, sid: stMap.myInfo.order, arr: timeList});
		} else {
			socket.emit('busy', {cur: stMap.now, sid: stMap.myInfo.order, arr: timeList});
		}
	};
	onMouseupTime = function () {
		jqMap.$thTime.off('mouseover');
	};
	onClickCell = function(e) {
		var arr, cell;
		checkConfirmStatus();
		/* TODO: 모바일에서도 가능하게 만들기 */
		jqMap.$table.find('td').off('mouseover').on('mouseover', onClickCell);
		if (stMap.now === 'day') {
			arr = stMap.dayArray;
		} else {
			arr = stMap.nightArray;
		}
		cell = arr[this.parentNode.rowIndex - 1][this.cellIndex - 1];
		console.info('onclickCell', this.parentNode.rowIndex - 1, this.cellIndex - 1);
		if (!stMap.currentCell) {stMap.currentCell = cell;}
		if (stMap.clickMod === 'busy') { /* 연속 상황 중 busy */
			if (e.type === 'mouseover' && stMap.currentCell === cell) {return;}
			stMap.currentCell = cell;
			socket.emit('busy', {cur: stMap.now, sid: stMap.myInfo.order, arr: cellToCoord([this], false)});
		} else if (stMap.clickMod === 'not-busy') { /* 연속 상황 중 not-busy */
			if (e.type === 'mouseover' && stMap.currentCell === cell) {return;}
			stMap.currentCell = cell;
			socket.emit('not-busy', {cur: stMap.now, sid: stMap.myInfo.order, arr: cellToCoord([this], false)});
		} else { /* 기본 상황 */
			if (cell.length && cell.indexOf(stMap.myInfo.order) > -1) {
				stMap.clickMod = 'not-busy';
				socket.emit('not-busy', {cur: stMap.now, sid: stMap.myInfo.order, arr: cellToCoord([this], false)});
			} else {
				stMap.clickMod = 'busy';
				socket.emit('busy', {cur: stMap.now, sid: stMap.myInfo.order, arr: cellToCoord([this], true)});
			}
		}
	};
	onMouseupCell = function() {
		jqMap.$table.find('td').off('mouseover');
		stMap.clickMod = null;
		stMap.currentCell = null;
	};
	toggleChatList = function() {
		var $wrap = jqMap.$chatWrap;
		var $list = jqMap.$chatList;
		if ($wrap.hasClass('minified')) {
			$wrap.removeClass('minified');
			$wrap.css({height: '100px'});
			$list.css({height: '100px'});
			$list.animate({scrollTop: $list.scrollHeight}, "slow");
			$(this).toggleClass('fa-chevron-down fa-chevron-up');
		} else {
			$wrap.addClass('minified');
			$wrap.css({height: '20px'});
			$list.css({height: '20px'});
			$list.animate({scrollTop: $list.scrollHeight}, "slow");
			$(this).toggleClass('fa-chevron-down fa-chevron-up');
		}
	};
	toLobby = function(e) {
		console.info('toLobby', e.data.rid);
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
		userInfo.rid = null;
	};
	quitRoom = function(e) {
		var admin, picture, deleteRoomPromise;
		console.info('quit', e.data.rid);
		if (stMap.current === 1) { /* 방장 혼자 남았을 때 */
			if (confirm('혼자 있을 때 방을 나가면 방이 사라집니다.그래도 나가시겠습니까?')) {
				deleteRoomPromise = wwm.model.deleteRoom(e.data.rid, stMap.myInfo.id);
				deleteRoomPromise.done(function() {
					wwm.lobby.initModule(jqMap.$con);
				});
				deleteRoomPromise.fail(function (err) {
					console.error(err);
					alert('방 삭제 실패!');
				});
			}
		} else {
			if (stMap.maker === stMap.myInfo.id) { /* 방장이 다른 사람보다 먼저 나갈 때 */
				if (confirm('지금 나가면 방장이 다른 사람에게 넘어갑니다.')) {
					admin = stMap.memberList[1].id;
					picture = stMap.memberList[1].picture;
					history.replaceState({mod: 'lobby'}, '', '/lobby/' + stMap.myInfo.id);
					socket.emit('delegate', {id: stMap.myInfo.id, order: stMap.myInfo.order, rid: e.data.rid, admin: admin, picture: picture});
				}
			} else {
				if (confirm('정말 나가시겠습니까? 잠시 나가는 거면 로비 버튼을 클릭하세요.')) {
					history.replaceState({mod: 'lobby'}, '', '/lobby/' + stMap.myInfo.id);
					socket.emit('quit', {id: stMap.myInfo.id, order: stMap.myInfo.order, rid: e.data.rid});
				}
			}
		}
		userInfo.rid = null;
		wwm.lobby.initModule(jqMap.$con);
	};
	sendChat = function(e) {
		var text = $(this).parent().prev().val();
		e.preventDefault();
		console.info('sendChat', stMap.myInfo.id, text);
		socket.emit('chat', {
			id: stMap.myInfo.id,
			name: stMap.myInfo.name,
			color: stMap.myInfo.order,
			text: text
		});
	};
	refreshTable = function() {
		console.info('refresh', {rid: stMap.rid, id: stMap.myInfo.id});
		socket.on('responseArr', function(data) {
			console.info('socket responseArr');
			stMap.dayArray = data.day;
			stMap.nightArray = data.night;
			renderTable();
		});
		socket.emit('requestArr', {rid: stMap.rid, id: stMap.myInfo.id});
	};
	confirmTable = function(e, rid) {
		var data = {}, confirmPromise;
		if (typeof e === 'string') {
			data.id = e;
			data.rid = rid;
		} else {
			data = e.data;
		}
		data.bool = !stMap.myInfo.confirm;
		data.day = stMap.dayArray;
		data.night = stMap.nightArray;
		console.info('change confirm to', data.bool, data);
		confirmPromise = wwm.model.confirm(data);
		confirmPromise.done(function() {
			if (jqMap.$confirm.hasClass('confirmed')) {
				jqMap.$confirm.removeClass('confirmed');
			} else {
				jqMap.$confirm.addClass('confirmed');
			}
			stMap.myInfo.confirm = data.bool;
			socket.emit('confirmed', {id: stMap.myInfo.id, bool: data.bool});
		});
		confirmPromise.fail(function(err) {
			console.error(err);
			alert('confirm error!');
		});
	};
	toggleTable = function() {
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
		console.info('toConfirmPage', stMap);
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
				url: 'http://whenwemeet.herokuapp.com' /* The URLs domain should be configured in app settings. */
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
		console.info('toggleAside', jqMap.$aside.hasClass('opened'));
		if (jqMap.$aside.hasClass('opened')) {
			jqMap.$aside.removeClass('opened');
			jqMap.$aside.css('left', '-100%');
		} else {
			jqMap.$aside.addClass('opened');
			jqMap.$aside.css('left', '0');

		}
	};
	showMemberMenu = function() {
		var $this = $(this);
		console.info('showMemberMenu', stMap.maker === stMap.myInfo.id);
		if (stMap.maker === stMap.myInfo.id) {
			if (!$this.has('.ban-this-btn').length) {
				$this.append('<span class="ban-this-btn">강퇴</span>');
				setTimeout(function () {
					$this.find('.ban-this-btn').fadeOut('slow').remove();
				}, 5000);
			}
		} else {
			return false;
		}
	};
	showReportModal = function () {
		wwm.modal.initModule($('#wwm-report').html());
	};
	handleSocketEvent = function () {
		console.info('handleEvnet', stMap.event);
		if (stMap.event) {
			return;
		}
		socket.on('out', function(id) {
			stMap.memberList.every(function(member, i) {
				if (member.id === id) {
					stMap.onlineList[i] = false;
					return false;
				}
				return true;
			});
			showOnlineStatus();
			console.info('socket out', stMap.onlineList, stMap.memberList);
		});
		socket.on('quit', function(data) {
			stMap.memberList.forEach(function(member, i) {
				if (member.id === data.id) {
					stMap.onlineList.splice(i, 1);
					stMap.memberList.splice(i, 1);
					return false;
				}
				return true;
			});
			changeCurrentNumber(-1);
			showMembers();
			removeSchedule(data.order);
			console.info('socket quit', stMap.onlineList, stMap.memberList);
		});
		socket.on('delegate', function(data) {
			stMap.memberList.forEach(function(member, i) {
				if (member.id === data.id) {
					stMap.onlineList.splice(i, 1);
					stMap.memberList.splice(i, 1);
					return false;
				}
				return true;
			});
			changeCurrentNumber(-1);
			showMembers();
			removeSchedule(data.order);
			stMap.maker = data.admin;
			stMap.picture = data.picture;
			jqMap.$picture.attr('src', stMap.picture);
			if (stMap.myInfo.id === data.admin) {
				dust.render(dust.loadSource(dust.compile(cfMap.adminMenu)), {admin: true}, function(err, out) {
					if (err) {
						console.error(err);
					} else {
						jqMap.$admin.replaceWith(out);
					}
				});
			}
			console.info('socket quit', stMap.onlineList, stMap.memberList);
		});
		socket.on('newMember', function(data) {
			console.info('socket newmember', data);
			stMap.onlineList[data.color] = true;
			socket.emit('uptodateArr', {sid: data.socket, day: stMap.dayArray, night: stMap.nightArray, online: stMap.onlineList});
			if (data.color >= stMap.current) {
				changeCurrentNumber(1);
				addNewMember(data);
			}
			showOnlineStatus();
		});
		socket.on('uptodateArr', function(data) {
			console.info('socket uptodateArr');
			stMap.dayArray = data.day;
			stMap.nightArray = data.night;
			stMap.onlineList = data.online;
			showOnlineStatus();
			renderTable();
		});
		socket.on('chat', function(data) {
			console.info('socket chat', data.id, data.text);
			jqMap.$chatList.append('<p><span class="' + cfMap.colorList[data.color] + '-text">' + data.name + '</span>: ' + data.text + '</p>');
			jqMap.$chatbox.val('').focus();
			jqMap.$chatList.animate({ scrollTop: jqMap.$chatList[0].scrollHeight }, "slow");
		});
		socket.on('busy', function(data) {
			console.info('socket busy:', data.arr, data.sid, data.cur);
			coordListToTable(data.arr, data.sid, data.cur, true);
		});
		socket.on('not-busy', function(data) {
			console.info('socket notbusy:', data.arr, data.sid, data.cur);
			coordListToTable(data.arr, data.sid, data.cur, false);
		});
		socket.on('requestArr', function(data) {
			console.info('socket requestArr');
			socket.emit('responseArr', {sid: data.sid, day: stMap.dayArray, night: stMap.nightArray});
		});
		socket.on('ban', function(data) {
			console.info('socket ban', data.id, data.order);
			/* 강퇴당한 경우. */
			if (stMap.myInfo.order === data.order) {
				alert('강퇴당하셨습니다...');
				wwm.lobby.initModule(jqMap.$con);
				userInfo.rid = null;
				return;
			}
			/* 다른 사람이 강퇴당한 경우. */
			if (stMap.myInfo.order > data.order) {
				stMap.myInfo.order--;
			}
			alert(findInfoById(data.id).name + '님이 강제퇴장 되었습니다. 잘가요!');
			stMap.memberList.every(function(member, i) {
				if (data.id === member.id) {
					stMap.memberList.splice(i, 1);
					stMap.onlineList.splice(i, 1);
					return false;
				}
				return true;
			});
			changeCurrentNumber(-1);
			removeSchedule(data.order);
			showMembers();
		});
		socket.on('confirmed', function(data) {
			var confirmCount = 0;
			stMap.memberList.forEach(function(member) {
				if (member.id === data.id) {
					member.confirm = data.bool;
				}
				if (member.confirm === true) {
					confirmCount++;
				}
			});
			if (confirmCount === stMap.memberList.length) {
				jqMap.$allConfirmed.show();
			} else {
				jqMap.$allConfirmed.hide();
			}
			console.info('socket confirmed', confirmCount);
		});
		socket.on('explode', function() {
			alert('방이 폭파되었습니다. 로비로 이동합니다.');
			wwm.lobby.initModule(jqMap.$con);
			console.info('socket explode');
		});
		stMap.event = true;
	};
	initModule = function(doc) {
		var parser;
		var src = $('#wwm-room').text();
		stMap.title = doc.title;
		stMap.limit = Number(doc.limit);
		stMap.rid = doc.rid.toString();
		userInfo.rid = stMap.rid;
		stMap.maker = doc.maker.toString();
		stMap.dayArray = doc.day || createArray(12,7);
		stMap.nightArray = doc.night || createArray(12,7);
		console.info('initiating room #' + stMap.rid, stMap.dayArray, stMap.nightArray);
		stMap.memberList = Array.isArray(doc.members) ? doc.members : JSON.parse(doc.members);
		stMap.current = stMap.memberList.length;
		stMap.picture = doc.picture;
		stMap.myInfo.id = userInfo.id.toString();
		stMap.myInfo.name = userInfo.name;
		stMap.memberList.every(function(member, i) {
			if (member.id === userInfo.id) {
				stMap.myInfo.order = i;
				stMap.myInfo.confirm = member.confirm;
				return false;
			}
			return true;
		});
		stMap.onlineList[stMap.myInfo.order] = true;
		parser = {
			name: stMap.myInfo.name,
			title: stMap.title,
			current: stMap.current,
			limit: stMap.limit,
			members: stMap.memberList,
			picture: stMap.picture,
			vacant: stMap.limit - stMap.current
		};
		if (stMap.myInfo.id === stMap.maker) {
			parser.admin = true;
		}
		dust.render(dust.loadSource(dust.compile(src)), parser, function(err, out) {
			if (err) {
				wwm.shell.view.html(err);
				return;
			}
			wwm.shell.view.html(out);
			dust.render(dust.loadSource(dust.compile(cfMap.adminMenu)), parser, function(err, out) {
				var confirmCount = 0;
				if (err) {
					wwm.shell.view.html(err);
					return;
				}
				wwm.shell.view.find('#aside-footer').prepend(out);
				setJqMap(wwm.shell.view);
				renderTable();
				if (stMap.myInfo.confirm) {
					jqMap.$confirm.addClass('confirmed');
				}
				stMap.memberList.forEach(function(member) {
					if (member.confirm === true) {
						confirmCount++;
					}
				});
				console.log('confirmCount', confirmCount);
				if (confirmCount === stMap.memberList.length) {
					jqMap.$allConfirmed.show();
				} else {
					jqMap.$allConfirmed.hide();
				}
				jqMap.$roomTitle.addClass(cfMap.colorList[stMap.myInfo.order] + '-text');
				showMembers();
				handleSocketEvent();
				socket.emit('enter', {
					'id': stMap.myInfo.id,
					'rid': stMap.rid,
					'name': stMap.myInfo.name,
					'color': stMap.myInfo.order,
					'picture': userInfo.picture
				});
				jqMap.$table.find('td').mousedown(onClickCell);
				jqMap.$table.find('td').mouseup(onMouseupCell);
				jqMap.$thDay.mousedown(onClickDay);
				jqMap.$thDay.mouseup(onMouseupDay);
				jqMap.$thTime.mousedown(onClickTime);
				jqMap.$thTime.mouseup(onMouseupTime);
				jqMap.$explodeRoom.click({rid: stMap.rid}, deleteRoom);
				jqMap.$toLobbyBtn.click({rid: stMap.rid}, toLobby);
				jqMap.$toggleTable.click(toggleTable);
				jqMap.$admin.click(showAdminMenu);
				jqMap.$changeLimit.click({rid: stMap.rid}, changeLimit);
				jqMap.$changeTitle.click({rid: stMap.rid}, changeTitle);
				jqMap.$sendChat.click(sendChat);
				jqMap.$memberList.on('click', 'li', showMemberMenu);
				jqMap.$memberList.on('click', '.ban-this-btn', function () {
					var id = $(this).parent().data('id');
					banPerson(id.toString(), stMap.rid);
				});
				jqMap.$confirm.click({id: stMap.myInfo.id, rid: stMap.rid}, confirmTable);
				jqMap.$chatToggler.click(toggleChatList);
				jqMap.$refresh.click(refreshTable);
				jqMap.$allConfirmed.click(toConfirmPage);
				jqMap.$quitBtn.click({id: stMap.myInfo.id, rid: stMap.rid}, quitRoom);
				jqMap.$asideToggler.click(toggleAside);
				jqMap.$report.click(showReportModal);
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
		});
	};
	return {
		initModule: initModule,
		info: stMap,
		confirmTable: confirmTable,
		toggleAside: toggleAside
	};
}());