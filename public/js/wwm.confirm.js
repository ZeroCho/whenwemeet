wwm.confirm = (function() {
	var jqMap;
	var stMap = {};
	function setJqMap($con) {
		jqMap = {
			$con: $con,
			$toLobby: $con.find('#to-lobby'),
			$toRoom: $con.find('#to-room'),
			$toKakao: $con.find('#result-to-kakao'),
			$toFacebook: $con.find('#result-to-fb'),
			$result: $con.find('#result')
		};
	}
	function gatherResult() {
		var sun = [[null, null]];
		var mon = [[null, null]];
		var tue = [[null, null]];
		var wed = [[null, null]];
		var thu = [[null, null]];
		var fri = [[null, null]];
		var sat = [[null, null]];
		var week = [sun, mon, tue, wed, thu, fri, sat];
		var i, j;
		for (i = 0; i < 7; i++) {
			var temp = 0;
			for (j = 0; j < 12; j++) {
				console.log(j, stMap.dayArray[j][i].length === 0);
				if (stMap.dayArray[j][i].length === 0) {
					console.log(week[i][temp][0] === null);
					if (week[i][temp][0] === null) { // 처음이면
						week[i][temp][0] = j;
						week[i][temp][1] = week[i][temp][0] + 1;
					} else {
						console.log(week[i][temp][1] === j);
						if (week[i][temp][1] === j) { // 연속된 시간 array
							week[i][temp][1] = j + 1;
						} else { // 새로운 시간 array
							week[i][++temp] = [j, j + 1];
						}
					}
				}
				console.log(week[i], temp);
			}
			for (j = 0; j < 12; j++) {
				if (stMap.nightArray[j][i].length === 0) {
					if (week[i][temp][0] === null) { // 처음이면
						week[i][temp][0] = j + 12;
						week[i][temp][1] = week[i][temp][0] + 1;
					} else {
						if (week[i][temp][1] === j + 12) { // 연속된 시간 array
							week[i][temp][1] = j + 13;
						} else { // 새로운 시간 array
							week[i][++temp] = [j + 12, j + 13];
						}
					}
				}
				console.log(week[i], temp);
			}
		}
		return week;
	}
	var showResult = function(week) {
		var str = '가능한 시간은<br>';
		var dayList = ['일', '월', '화', '수', '목', '금', '토'];
		for (var i = 0; i < 7; i++) {
			str += dayList[i] + '요일:<br>';
			for (var j = 0; j < week[i].length; j++) {
				var prefix = '';
				if (week[i][j][0] < 12) {
					prefix = '오전'
				} else if (week[i][j][0] === 12) {
					prefix = '오후';
				} else if (week[i][j][0] === 24) {
					prefix = '밤';
					week[i][j][0] -= 12;
				} else {
					prefix = '오후';
					week[i][j][0] -= 12;
				}
				str += prefix + ' ' + week[i][j][0] + '시부터 ~ ';
				if (week[i][j][1] < 12) {
					prefix = '오전'
				} else if (week[i][j][1] === 12) {
					prefix = '오후';
				} else if (week[i][j][1] === 24) {
					prefix = '밤';
					week[i][j][1] -= 12;
				} else {
					prefix = '오후';
					week[i][j][1] -= 12;
				}
				str += prefix + ' ' + week[i][j][1] + '시까지<br>';
			}
		}
		str += '입니다.';
		jqMap.$result.html(str);
	};
	var toLobby = function() {
		jqMap.$con.fadeOut('slow');
		history.pushState({mod: 'lobby'}, '', '/lobby/' + stMap.myInfo.id);
		wwm.lobby.initModule(jqMap.$con);
	};
	var toRoom = function() {
		history.pushState({mod: 'room'}, '', '/room/' + stMap.rid);
		jqMap.$con.fadeOut('slow');
	};
	var toKakao = function() {};
	var toFacebook = function() {
		FB.ui({
			method: 'send',
			link: 'http%3A%2F%2Fwww.nytimes.com%2F2011%2F06%2F15%2Farts%2Fpeople-argue-just-to-win-scholars-assert.html'
		});
	};
	var initModule = function(data) {
		stMap = $.extend(stMap, data);
		console.log(data, stMap);
		var src = $('#wwm-confirm').html();
		wwm.shell.modal.html(src);
		setJqMap(wwm.shell.modal);
		var arr = gatherResult();
		showResult(arr);
		jqMap.$toLobby.click(toLobby);
		jqMap.$toRoom.click(toRoom);
		jqMap.$toKakao.on({
			click:toKakao,
			mouseover: function() {
				this.src = '/kakaolink_btn_medium_ov.png';
			},
			mouseout: function() {
				this.src = '/kakaolink_btn_medium.png';
			}
		});
		jqMap.$toFacebook.on({
			click: toFacebook,
			mouseover: function() {
				this.src = '/facebook_invite_ov.png';
			},
			mouseout: function() {
				this.src = '/facebook_invite.png';
			}
		});
		jqMap.$con.fadeIn('slow');
	};
	return {
		initModule: initModule,
		info: stMap
	};
}());