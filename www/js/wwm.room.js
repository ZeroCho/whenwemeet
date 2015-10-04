wwm.room = (function () {
	'use strict';
	var cfMap = {
		colorList: ['red', 'orange', 'yellow', 'yellowgreen', 'skyblue', 'purple', 'violet', 'pink'],
		memberList: $('#wwm-member-list').text(),
		adminMenu: $('#wwm-admin-menu').text(),
		room: $('#wwm-room').text()
	};
	var stMap = {
		rid: null,
		maker: null,
		title: null,
		picture: null,
		limit: 0,
		current: 0,
		dayArray: null,
		nightArray: null,
		memberList: [],
		memberColor: [],
		myInfo: {
			confirm: false,
			order: 0
		},
		now: 'day',
		event: false,
		clickMod: null,
		currentCell: null,
		confirmCount: 0
	};
	var jqMap;
	var socket = io();
	var setJqMap, createArray, cellToCoord, coordListToTable, renderTable, showMembers, showOnlineStatus,
		banPerson, changeTitle, changeLimit, changeCurrentNumber, onClickDay, onClickTime, onClickCell, onMouseupCell, onMouseupDay, onMouseupTime,
		showAdminMenu, deleteRoom, checkConfirmStatus, toLobby, quitRoom, showReportModal, handleSocketEvent, setStMap, afterQuit,
		toggleTable, sendChat, toggleChatList, refreshTable, removeSchedule, findInfoById, checkMyOrder, changeColor, toggleMember,
		confirmTable, toConfirmPage, kakaoInvite, fbInvite, toggleAside, showMemberMenu, initModule;
	checkMyOrder = function (pid) {
		var order = 0;
		stMap.memberColor.forEach(function (id, i) {
			if (id === pid) {
				order = i;
			}
		});
		console.info('checkMyOrder', pid, order);
		return order;
	};
	changeColor = function () {
		var color = $(this).attr('class').split(' ')[1];
		var original = stMap.myInfo.order;
		if ($(this).hasClass('chosen')) {
			alert('이미 남이 선택한 색상입니다.');
			return;
		}
		stMap.memberColor[original] = null;
		cfMap.colorList.every(function (item, i) {
			console.log(color + ' ' + item);
			if (color === item) {
				stMap.myInfo.order = i;
				stMap.memberColor[i] = userInfo.id;
				return false;
			}
			return true;
		});
		socket.emit('changeColor', {
			id: userInfo.id,
			name: userInfo.name,
			rid: stMap.rid,
			color: stMap.memberColor,
			orig: original,
			now: stMap.myInfo.order
		});
		console.info('changeColor');
	};
	createArray = function (length) { /* dayArray, nightArray를 만든다 */
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
	cellToCoord = function (cellList) { /* cell을 선택했을 때 coord로 바꿔 coordList에 넣는다 */
		var coord, coordList = [];
		cellList.forEach(function (cell) {
			coord = [cell.parentNode.rowIndex - 1, cell.cellIndex - 1];
			coordList.push(coord);
		});
		console.info('cellToCoord', coordList);
		return coordList;
	};
	coordListToTable = function (coordList, sid, cur, busy) { /* array를 table로 만든다. */
		var stMapArray, $table, $cell, index, oneCell;
		console.info('coordListToTable', coordList, sid, cur, busy);
		if (cur === 'day') {
			$table = jqMap.$dayTable;
			stMapArray = stMap.dayArray;
		} else {
			$table = jqMap.$nightTable;
			stMapArray = stMap.nightArray;
		}
		coordList.forEach(function (coord) {
			$cell = $table.find('tr').eq(coord[0] + 1).find('td').eq(coord[1]);
			oneCell = stMapArray[coord[0]][coord[1]];
			if (busy) {
				index = oneCell.indexOf(sid);
				if (index === -1) {
					oneCell.push(sid);
				}
				if (sid === stMap.myInfo.order) {
					$cell.addClass('busy ' + cfMap.colorList[sid]);
				} else {
					$cell.addClass('busy');
				}
			} else {
				index = oneCell.indexOf(sid);
				if (index > -1) {
					oneCell.splice(index, 1);
				}
				if (sid === stMap.myInfo.order) {
					$cell.removeClass(cfMap.colorList[sid]);
				}
				if (!oneCell.length) {
					$cell.removeClass('busy');
				}
			}
			stMapArray[coord[0]][coord[1]] = oneCell;
		});
	};
	renderTable = function (viewpoint) {
		var $cell;
		var stMapArrayList = [stMap.dayArray, stMap.nightArray];
		var $tables = [jqMap.$dayTable, jqMap.$nightTable];
		var order = (viewpoint === undefined) ? stMap.myInfo.order : viewpoint;
		console.info('renderTable', stMap.dayArray, stMap.nightArray);
		stMapArrayList.forEach(function (stMapArray, h) {
			stMapArray.forEach(function (tr, i) {
				tr.forEach(function (target, j) {
					var $target = $tables[h].find('tr').eq(i + 1).find('td').eq(j);
					$target.removeClass();
					target.forEach(function (index) {
						console.log(order, index);
						$cell = $target.addClass('busy');
						if (order === index) {
							$cell.addClass(cfMap.colorList[index]);
						}
					});
				});
			});
		});
	};
	removeSchedule = function (order) {
		var stMapArrayList = [stMap.dayArray, stMap.nightArray];
		stMapArrayList.forEach(function (stMapArray) {
			stMapArray.forEach(function (tr, i) {
				tr.forEach(function (target, j) {
					var idx = target.indexOf(order);
					console.log(target, idx);
					if (idx > -1) {
						stMapArray[i][j].splice(idx, 1);
					}
				});
			});
		});
		console.log('removeSchedule', order, stMap.dayArray);
		renderTable();
	};
	showMembers = function () {
		console.info('showMembers', stMap.memberList);
		jqMap.$memberList.find('ul').empty();
		jqMap.$toggleMember.empty();
		stMap.memberList.forEach(function (member) {
			var $img = $('<img/>').attr('src', member.picture).width('100%');
			var $div = $('<div/>').addClass('toggle-member').attr('data-id', member.id);
			$div.append($img);
			jqMap.$toggleMember.append($div);
			dust.render(dust.loadSource(dust.compile(cfMap.memberList)), {
				id: member.id,
				color: cfMap.colorList[checkMyOrder(member.id)],
				name: member.name,
				picture: member.picture,
				confirm: member.confirm
			}, function (err, out) {
				if (err) {
					jqMap.$memberList.find('ul').html(err);
				} else {
					jqMap.$memberList.find('ul').append(out);
				}
			});
		});
		showOnlineStatus();
	};
	showOnlineStatus = function () {
		var $list;
		console.info('showOnline');
		stMap.memberList.forEach(function (member, i) {
			$list = jqMap.$memberList.find('li').eq(i);
			if (member.online) {
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
	findInfoById = function (id) {
		var info = {};
		console.info('findInfo', id);
		stMap.memberList.every(function (member, i) {
			if (id === member.id) {
				info = member;
				info.idx = i;
				return false;
			}
			return true;
		});
		return info;
	};
	banPerson = function (e) {
		var banned, banPromise;
		if (typeof e === 'string') {
			banned = e;
		} else {
			banned = $(this).prev().val();
			e.preventDefault();
		}
		console.info('banPerson', arguments);
		if (banned === stMap.maker) {
			alert('자기 자신을 강퇴시키면 안 되겠죠?');
			return;
		}
		banPromise = wwm.model.ban(banned, stMap.rid);
		banPromise.done(function () {
			removeSchedule(findInfoById(banned).order);
			socket.emit('ban', {rid: stMap.rid, id: banned, order: findInfoById(banned).order, day: stMap.dayArray, night: stMap.nightArray});
		});
		banPromise.fail(function (err) {
			console.error(err);
			alert('퇴장당하지 않으려고 버티는중! 다시 시도하세요.');
		});
	};
	changeTitle = function (e) {
		var title = $(this).parent().prev().val();
		var titlePromise = wwm.model.changeTitle(stMap.rid, title);
		e.preventDefault();
		console.info('changeTitle', title);
		titlePromise.done(function () {
			stMap.title = title;
			jqMap.$roomTitle.text(title);
		});
		titlePromise.fail(function (err) {
			alert('제목 바꾸기 실패!');
			console.error(err);
		});
	};
	changeLimit = function (e) {
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
		limitPromise.done(function () {
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
			$('#current-people-limit').val(stMap.limit);
		});
		limitPromise.fail(function (err) {
			alert('인원수 바꾸기 실패!');
			console.error(err);
		});
	};
	changeCurrentNumber = function (gap) {
		console.info('changeCurrentNumber', gap);
		stMap.current += gap;
		if (gap > 0) {
			jqMap.$roomPeople.find('.vacant').first().removeClass('vacant');
		} else {
			jqMap.$roomPeople.find('.fa-child').not('.vacant').last().addClass('vacant');
		}
	};
	showAdminMenu = function (e) {
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
	deleteRoom = function () {
		var rid = stMap.rid;
		if (!confirm('정말 방을 폭파하실 건가요?')) {
			return;
		}
		socket.emit('explode', {
			rid: rid,
			id: userInfo.id
		});
		wwm.lobby.initModule(jqMap.$con);
	};
	checkConfirmStatus = function () {
		if (jqMap.$confirm.hasClass('confirmed')) {
			alert('확정 상태가 해제됩니다.');
			jqMap.$table.find('td').off('mouseover touchmove');
			jqMap.$confirm.removeClass('confirmed');
			stMap.myInfo.confirm = false;
			socket.emit('confirmed', {id: userInfo.id, bool: false});
			return true;
		}
	};
	onClickDay = function (e) {
		var day = this.cellIndex - 1;
		var arr, dayList = [];
		var allSelected = true;
		var clearAll = false;
		if (checkConfirmStatus()) {
			return;
		}
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
					socket.emit('not-busy', {rid: stMap.rid, cur: stMap.now, sid: stMap.myInfo.order, arr: dayList});
				} else {
					socket.emit('busy', {rid: stMap.rid, cur: stMap.now, sid: stMap.myInfo.order, arr: dayList});
				}
				return;
			}
			jqMap.$thTime.off('mouseover');
			jqMap.$thDay.off('mouseover');
		}
		arr.forEach(function (tr, i) {
			if (tr[day].indexOf(stMap.myInfo.order) === -1) {
				allSelected = false;
				dayList.push([i, day]);
			}
		});
		if (allSelected) {
			dayList = [];
			arr.forEach(function (tr, i) {
				dayList.push([i, day]);
			});
			socket.emit('not-busy', {rid: stMap.rid, cur: stMap.now, sid: stMap.myInfo.order, arr: dayList});
		} else {
			socket.emit('busy', {rid: stMap.rid, cur: stMap.now, sid: stMap.myInfo.order, arr: dayList});
		}
	};
	onMouseupDay = function () {
		jqMap.$thDay.off('mouseover');
	};
	onClickTime = function () {
		var time = this.parentNode.rowIndex - 1;
		var arr, timeList = [];
		var allSelected = true;
		if (checkConfirmStatus()) {
			return;
		}
		console.info('onClickTime', time);
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
		arr[time].forEach(function (target, i) {
			if (target.indexOf(stMap.myInfo.order) === -1) {
				allSelected = false;
				timeList.push([time, i]);
			}
		});
		if (allSelected) {
			timeList = [];
			arr[time].forEach(function (target, i) {
				timeList.push([time, i]);
			});
			socket.emit('not-busy', {rid: stMap.rid, cur: stMap.now, sid: stMap.myInfo.order, arr: timeList});
		} else {
			socket.emit('busy', {rid: stMap.rid, cur: stMap.now, sid: stMap.myInfo.order, arr: timeList});
		}
	};
	onMouseupTime = function () {
		jqMap.$thTime.off('mouseover');
	};
	onClickCell = function (e) {
		var arr, cell;
		jqMap.$table.find('td').off('mouseover touchmove').on('mouseover touchmove', onClickCell);
		if (checkConfirmStatus()) {
			return;
		}
		/* TODO: 모바일에서도 가능하게 만들기 - 현재 touchmove시 cell이 고정되어있음 */
		arr = (stMap.now === 'day') ? stMap.dayArray : stMap.nightArray;
		cell = arr[this.parentNode.rowIndex - 1][this.cellIndex - 1];
		console.info('onclickCell', this.parentNode.rowIndex - 1, this.cellIndex - 1, e.type);
		if (!stMap.currentCell) {
			stMap.currentCell = cell;
		}
		if (stMap.clickMod === 'busy') { /* 연속 상황 중 busy */
			if ((e.type === 'mouseover' || e.type === 'touchmove') && stMap.currentCell === cell) {
				return;
			}
			stMap.currentCell = cell;
			socket.emit('busy', {
				rid: stMap.rid,
				cur: stMap.now,
				sid: stMap.myInfo.order,
				arr: cellToCoord([this])
			});
		} else if (stMap.clickMod === 'not-busy') { /* 연속 상황 중 not-busy */
			if ((e.type === 'mouseover' || e.type === 'touchmove') && stMap.currentCell === cell) {
				return;
			}
			stMap.currentCell = cell;
			socket.emit('not-busy', {
				rid: stMap.rid,
				cur: stMap.now,
				sid: stMap.myInfo.order,
				arr: cellToCoord([this])
			});
		} else { /* 기본 상황 */
			console.log(arr, cell, cell.length, cell.indexOf(stMap.myInfo.order) > -1);
			if (cell.length && cell.indexOf(stMap.myInfo.order) > -1) {
				stMap.clickMod = 'not-busy';
				socket.emit('not-busy', {
					rid: stMap.rid,
					cur: stMap.now,
					sid: stMap.myInfo.order,
					arr: cellToCoord([this])
				});
			} else {
				stMap.clickMod = 'busy';
				socket.emit('busy', {
					rid: stMap.rid,
					cur: stMap.now,
					sid: stMap.myInfo.order,
					arr: cellToCoord([this])
				});
			}
		}
	};
	onMouseupCell = function () {
		jqMap.$table.find('td').off('mouseover touchmove');
		stMap.clickMod = null;
		stMap.currentCell = null;
	};
	toggleChatList = function () {
		var $wrap = jqMap.$chatWrap;
		var $list = jqMap.$chatList;
		if ($wrap.hasClass('minified')) {
			$wrap.removeClass('minified');
			$wrap.css({height: '100px'});
			$list.css({height: '100px'});
			$list.animate({scrollTop: $list[0].scrollHeight}, "slow");
			$(this).toggleClass('fa-chevron-down fa-chevron-up');
		} else {
			$wrap.addClass('minified');
			$wrap.css({height: '20px'});
			$list.css({height: '20px'});
			$list.animate({scrollTop: $list[0].scrollHeight}, "slow");
			$(this).toggleClass('fa-chevron-down fa-chevron-up');
		}
	};
	toLobby = function () {
		console.info('toLobby', stMap.rid);
		if (jqMap.$confirm.hasClass('confirmed')) {
			history.pushState({mod: 'lobby'}, '', '/lobby/' + userInfo.id);
			socket.emit('out', {id: userInfo.id, rid: stMap.rid, order: stMap.myInfo.order});
			wwm.lobby.initModule(jqMap.$con);
		} else {
			if (confirm('확정 버튼을 누르지 않고 나가면 저장되지 않은 사항은 사라집니다.')) {
				history.pushState({mod: 'lobby'}, '', '/lobby/' + userInfo.id);
				socket.emit('out', {id: userInfo.id, rid: stMap.rid, order: stMap.myInfo.order});
				wwm.lobby.initModule(jqMap.$con);
			}
		}
		userInfo.rid = null;
	};
	quitRoom = function () {
		var admin, picture, deleteRoomPromise;
		if (stMap.current === 1) { /* 방장 혼자 남았을 때 */
			if (confirm('혼자 있을 때 방을 나가면 방이 사라집니다.그래도 나가시겠습니까?')) {
				deleteRoomPromise = wwm.model.deleteRoom(stMap.rid, userInfo.id);
				deleteRoomPromise.done(function () {
					wwm.lobby.initModule(jqMap.$con);
				});
				deleteRoomPromise.fail(function (err) {
					console.error(err);
					alert('방 삭제 실패!');
				});
			} else {
				return;
			}
		} else {
			if (stMap.maker === userInfo.id) { /* 방장이 다른 사람보다 먼저 나갈 때 */
				if (confirm('지금 나가면 방장이 다른 사람에게 넘어갑니다.')) {
					admin = stMap.memberList[1].id;
					picture = stMap.memberList[1].picture;
					history.replaceState({mod: 'lobby'}, '', '/lobby/' + userInfo.id);
					removeSchedule(stMap.myInfo.order);
					socket.emit('delegate', {
						id: userInfo.id,
						order: stMap.myInfo.order,
						rid: stMap.rid,
						admin: admin,
						picture: picture,
						day: stMap.dayArray,
						night: stMap.nightArray
					});
				} else {
					return;
				}
			} else {
				if (confirm('정말 나가시겠습니까? 잠시 나가는 거면 로비 버튼을 클릭하세요.')) {
					history.replaceState({mod: 'lobby'}, '', '/lobby/' + userInfo.id);
					removeSchedule(stMap.myInfo.order);
					socket.emit('quit', {
						id: userInfo.id,
						order: stMap.myInfo.order,
						rid: stMap.rid,
						day: stMap.dayArray,
						night: stMap.nightArray
					});
				} else {
					return;
				}
			}
		}
		console.info('quit', stMap.rid);
		userInfo.rid = null;
		wwm.lobby.initModule(jqMap.$con);
	};
	sendChat = function (e) {
		var text = $(this).parent().prev().val();
		e.preventDefault();
		console.info('sendChat', userInfo.id, text);
		socket.emit('chat', {
			id: userInfo.id,
			name: userInfo.name,
			order: stMap.myInfo.order,
			text: text,
			rid: stMap.rid
		});
	};
	refreshTable = function () {
		console.info('refresh', {rid: stMap.rid, id: userInfo.id});
		socket.on('responseArr', function (data) {
			console.info('socket responseArr');
			stMap.dayArray = data.day;
			stMap.nightArray = data.night;
			renderTable();
		});
		socket.emit('requestArr', {rid: stMap.rid, id: userInfo.id});
	};
	confirmTable = function () {
		var data = {}, confirmPromise;
		data.id = userInfo.id;
		data.rid = stMap.rid;
		data.bool = !stMap.myInfo.confirm;
		data.day = stMap.dayArray;
		data.night = stMap.nightArray;
		console.info(data.id, 'change confirm to', data.bool, data);
		confirmPromise = wwm.model.confirm(data);
		confirmPromise.done(function () {
			jqMap.$confirm.toggleClass('confirmed');
			stMap.myInfo.confirm = data.bool;
			socket.emit('confirmed', {id: userInfo.id, bool: data.bool, rid: stMap.rid});
		});
		confirmPromise.fail(function (err) {
			console.error(err);
			alert('confirm error!');
		});
	};
	toggleTable = function () {
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
	toggleMember = function () {
		var $this = $(this);
		var id = $this.data('id').toString();
		jqMap.$toggleMember.find('.toggle-member').removeClass('chosen');
		$this.addClass('chosen');
		console.info('toggleMember', id, checkMyOrder(id));
		renderTable(checkMyOrder(id));
	};
	toConfirmPage = function () {
		console.info('toConfirmPage', stMap);
		history.pushState({mod: 'confirm'}, '', '/result/' + stMap.rid);
		wwm.confirm.initModule(stMap);
	};
	kakaoInvite = function () {
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
			fail: function () {
				alert('KakaoLink is currently only supported in iOS and Android platforms.');
			}
		});
	};
	fbInvite = function () {
		FB.ui({
			method: 'send',
			link: 'http%3A%2F%2Fwww.nytimes.com%2F2011%2F06%2F15%2Farts%2Fpeople-argue-just-to-win-scholars-assert.html'
		});
	};
	toggleAside = function () {
		console.info('toggleAside', jqMap.$aside.hasClass('opened'));
		if (jqMap.$aside.hasClass('opened')) {
			jqMap.$aside.removeClass('opened');
			jqMap.$aside.css('left', '-100%');
		} else {
			jqMap.$aside.addClass('opened');
			jqMap.$aside.css('left', '0');
		}
	};
	showMemberMenu = function () {
		var $this = $(this);
		console.info('showMemberMenu', stMap.maker === userInfo.id);
		if (stMap.maker === userInfo.id) {
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
	afterQuit = function (data) {
		jqMap.$chatList.append('<p><span class="' + cfMap.colorList[data.order] + '-text">' + findInfoById(data.id).name + '님이 퇴장하셨습니다.</span></p>');
		jqMap.$chatList.animate({scrollTop: jqMap.$chatList[0].scrollHeight}, "slow");
		stMap.memberList.forEach(function (member, i) {
			if (member.id === data.id) {
				stMap.memberList.splice(i, 1);
				return false;
			}
			return true;
		});
		stMap.dayArray = data.day;
		stMap.nightArray = data.night;
		changeCurrentNumber(-1);
		showMembers();
		renderTable();
	};
	handleSocketEvent = function () {
		console.info('handleEvent', stMap.event);
		if (stMap.event) {
			return;
		}
		socket.on('out', function (data) {
			stMap.memberList.every(function (member) {
				if (member.id === data.id) {
					member.online = false;
					return false;
				}
				return true;
			});
			showOnlineStatus();
			jqMap.$chatList.append('<p><span class="' + cfMap.colorList[data.order] + '-text">' + findInfoById(data.id).name + '님이 오프라인입니다.</span></p>');
			jqMap.$chatList.animate({scrollTop: jqMap.$chatList[0].scrollHeight}, "slow");
			console.info('socket out', stMap.memberList);
		});
		socket.on('quit', function (data) {
			afterQuit(data);
			console.info('socket quit', stMap.memberList);
		});
		socket.on('delegate', function (data) {
			afterQuit(data);
			jqMap.$chatList.append('<p><span class="' + findInfoById(data.admin).color + '-text">' + findInfoById(data.admin).name + '님이 이제 방장입니다.</span></p>');
			stMap.maker = data.admin;
			stMap.picture = data.picture;
			jqMap.$picture.attr('src', stMap.picture);
			if (userInfo.id === data.admin) {
				dust.render(dust.loadSource(dust.compile(cfMap.adminMenu)), {admin: true}, function (err, out) {
					if (err) {
						console.error(err);
					} else {
						jqMap.$admin.replaceWith(out);
					}
				});
			}
			console.info('socket delegate', stMap.memberList);
		});
		socket.on('newMember', function (data) {
			console.log('already?', data.alreadyMember);
			if (!data.alreadyMember) {
				stMap.memberList.push({
					id: data.id,
					name: data.name,
					confirm: false,
					picture: data.picture
				});
			}
			console.info('socket newmember', data);
			stMap.memberList[findInfoById(data.id).idx].online = true;
			socket.emit('uptodateArr', {
				sid: data.socket,
				day: stMap.dayArray,
				id: userInfo.id,
				rid: stMap.rid,
				night: stMap.nightArray,
				order: stMap.myInfo.order,
				online: findInfoById(userInfo.id).idx
			});
			console.log(findInfoById(userInfo.id).idx, stMap.current, findInfoById(userInfo.id).idx >= stMap.current);
			if (findInfoById(userInfo.id).idx >= stMap.current) {
				changeCurrentNumber(1);
			}
			jqMap.$chatList.append('<p><span class="' + cfMap.colorList[data.order] + '-text">' + data.name + '님이 입장하셨습니다.</span></p>');
			jqMap.$chatList.animate({scrollTop: jqMap.$chatList[0].scrollHeight}, "slow");
			showMembers();
			showOnlineStatus();
		});
		socket.on('uptodateArr', function (data) {
			console.info('socket uptodateArr');
			stMap.dayArray = data.day;
			stMap.nightArray = data.night;
			stMap.memberList[data.online].online = true;
			stMap.memberColor[data.order] = data.id;
			showOnlineStatus();
			renderTable();
		});
		socket.on('chat', function (data) {
			console.info('socket chat', data.id, data.text);
			jqMap.$chatList.append('<p><span class="' + cfMap.colorList[data.order] + '-text">' + data.name + '</span>: ' + data.text + '</p>');
			jqMap.$chatbox.val('').focus();
			jqMap.$chatList.animate({scrollTop: jqMap.$chatList[0].scrollHeight}, "slow");
		});
		socket.on('busy', function (data) {
			console.info('socket busy:', data.arr, data.sid, data.cur);
			coordListToTable(data.arr, data.sid, data.cur, true);
		});
		socket.on('not-busy', function (data) {
			console.info('socket notbusy:', data.arr, data.sid, data.cur);
			coordListToTable(data.arr, data.sid, data.cur, false);
		});
		socket.on('requestArr', function (data) {
			console.info('socket requestArr');
			socket.emit('responseArr', {sid: data.sid, day: stMap.dayArray, night: stMap.nightArray});
		});
		socket.on('ban', function (data) {
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
			stMap.memberList.every(function (member, i) {
				if (data.id === member.id) {
					stMap.memberList.splice(i, 1);
					return false;
				}
				return true;
			});
			changeCurrentNumber(-1);
			stMap.dayArray = data.day;
			stMap.nightArray = data.night;
			showMembers();
			renderTable();
		});
		socket.on('confirmed', function (data) {
			var confirmCount = 0;
			stMap.memberList.forEach(function (member) {
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
			console.log(jqMap.$memberList.find('[data-id=' + data.id + ']'));
			if (data.bool) {
				jqMap.$memberList.find('[data-id=' + data.id + ']').find('.member-confirmed').show();
			} else {
				jqMap.$memberList.find('[data-id=' + data.id + ']').find('.member-confirmed').hide();
			}
			console.info('socket confirmed', confirmCount);
		});
		socket.on('explode', function () {
			alert('방이 폭파되었습니다. 로비로 이동합니다.');
			wwm.lobby.initModule(jqMap.$con);
			console.info('socket explode');
		});
		socket.on('changeColor', function (data) {
			var orig = cfMap.colorList[data.orig];
			var now = cfMap.colorList[data.now];
			var stMapList = [stMap.dayArray, stMap.nightArray];
			jqMap.$roomTitle.removeClass(orig + '-text').addClass(now + '-text');
			console.log(data, jqMap.$memberList.find('[data-id=' + data.id + ']'), '.' + orig + '-text');
			jqMap.$memberList.find('[data-id=' + data.id + ']').find('.' + orig + '-text').removeClass().addClass(now + '-text');
			jqMap.$changeColor.eq(data.orig).removeClass('chosen');
			jqMap.$changeColor.eq(data.now).addClass('chosen');
			jqMap.$chatList.append('<p><span class="' + now + '-text">' + data.name + '</span>님이 색깔을 바꾸셨습니다.</p>');
			stMapList.forEach(function (list) {
				list.forEach(function (tr) {
					tr.forEach(function (target) {
						console.log(target);
						target.forEach(function (idx, i) {
							if (idx === data.orig) {
								target[i] = data.now;
							}
						});
					});
				});
			});
			renderTable();
			console.info('socket' + data.id + ' changed color from' + orig + 'to' + now);
		});
		stMap.event = true;
	};
	setJqMap = function ($con) {
		jqMap = {
			$con: $con,
			$picture: $con.find('#room-header img'),
			$table: $con.find('#day-table, #night-table'),
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
			$changeColor: $con.find('#change-color').find('.color-option'),
			$toggleMember: $con.find('#toggle-member'),
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
	setStMap = function (doc) {
		stMap.rid = doc.rid.toString();
		stMap.maker = doc.maker.toString();
		stMap.title = doc.title;
		stMap.limit = parseInt(doc.limit, 10);
		stMap.picture = doc.picture;
		userInfo.rid = stMap.rid;
		stMap.dayArray = doc.day || createArray(12, 7);
		stMap.nightArray = doc.night || createArray(12, 7);
		console.info('initiating room #' + stMap.rid, stMap.dayArray, stMap.nightArray);
		stMap.memberList = Array.isArray(doc.members) ? doc.members : JSON.parse(doc.members);
		stMap.current = stMap.memberList.length;
		stMap.memberColor = doc.color;
		stMap.memberList.forEach(function (member) {
			if (member.confirm === true) {
				stMap.confirmCount++;
			}
			if (member.id === userInfo.id) {
				member.online = true;
				stMap.myInfo.confirm = member.confirm;
			}
		});
		stMap.myInfo.order = checkMyOrder(userInfo.id);
	};
	initModule = function (doc) {
		var parser;
		setStMap(doc);
		parser = {
			name: userInfo.name,
			title: stMap.title,
			current: stMap.current,
			limit: stMap.limit,
			members: stMap.memberList,
			picture: stMap.picture,
			vacant: stMap.limit - stMap.current,
			confirm: stMap.myInfo.confirm,
			allConfirmed: stMap.confirmCount === stMap.memberList.length,
			color: cfMap.colorList[stMap.myInfo.order]
		};
		if (userInfo.id === stMap.maker) {
			parser.admin = true;
		}
		dust.render(dust.loadSource(dust.compile(cfMap.room)), parser, function (err, out) {
			if (err) {
				wwm.shell.view.html(err);
				return;
			}
			wwm.shell.view.html(out);
			dust.render(dust.loadSource(dust.compile(cfMap.adminMenu)), parser, function (err, out) {
				if (err) {
					wwm.shell.view.html(err);
					return;
				}
				wwm.shell.view.find('#aside-footer').prepend(out);
				setJqMap(wwm.shell.view);
				renderTable();
				stMap.memberColor.forEach(function (id, i) {
					if (id !== null) {
						jqMap.$changeColor.eq(i).addClass('chosen');
					}
				});
				showMembers();
				handleSocketEvent();
				socket.emit('enter', {
					'id': userInfo.id,
					'rid': stMap.rid,
					'name': userInfo.name,
					'order': stMap.myInfo.order,
					'picture': userInfo.picture,
					alreadyMember: doc.alreadyMember
				});
				jqMap.$table.find('td').on('mousedown', onClickCell);
				jqMap.$table.find('td').on('mouseup', onMouseupCell);
				jqMap.$thDay.mousedown(onClickDay);
				jqMap.$thDay.mouseup(onMouseupDay);
				jqMap.$thTime.mousedown(onClickTime);
				jqMap.$thTime.mouseup(onMouseupTime);
				jqMap.$explodeRoom.click(deleteRoom);
				jqMap.$toLobbyBtn.click(toLobby);
				jqMap.$toggleTable.click(toggleTable);
				jqMap.$toggleMember.on('click', '.toggle-member', toggleMember);
				jqMap.$admin.click(showAdminMenu);
				jqMap.$changeLimit.click(changeLimit);
				jqMap.$changeTitle.click(changeTitle);
				jqMap.$changeColor.click(changeColor);
				jqMap.$sendChat.click(sendChat);
				jqMap.$memberList.on('click', 'li', showMemberMenu);
				jqMap.$memberList.on('click', '.ban-this-btn', function () {
					var id = $(this).parent().data('id');
					banPerson(id.toString());
				});
				jqMap.$confirm.click(confirmTable);
				jqMap.$chatToggler.click(toggleChatList);
				jqMap.$refresh.click(refreshTable);
				jqMap.$allConfirmed.click(toConfirmPage);
				jqMap.$quitBtn.click(quitRoom);
				jqMap.$asideToggler.click(toggleAside);
				jqMap.$report.click(showReportModal);
				jqMap.$kakaoInvite.on({
					click: kakaoInvite,
					mouseover: function () {
						this.src = '/kakaolink_btn_medium_ov.png';
					},
					mouseout: function () {
						this.src = '/kakaolink_btn_medium.png';
					}
				});
				jqMap.$fbInvite.on({
					click: fbInvite,
					mouseover: function () {
						this.src = '/facebook_invite_ov.png';
					},
					mouseout: function () {
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
		toggleAside: toggleAside,
		showOnlineStatus: showOnlineStatus,
		showMembers: showMembers,
		renderTable: renderTable
	};
}());