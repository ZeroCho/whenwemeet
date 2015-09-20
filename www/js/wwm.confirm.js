wwm.confirm = (function() {
	'use strict';
	var jqMap;
	var stMap = {};
	var setJqMap, gatherResult, showResult, toLobby, toRoom, toKakao, toFacebook, initModule;
	setJqMap = function($con) {
		jqMap = {
			$con: $con,
			$toLobbyBtn: $con.find('#to-lobby'),
			$toRoom: $con.find('#to-room'),
			$toKakao: $con.find('#result-to-kakao'),
			$toFacebook: $con.find('#result-to-fb'),
			$result: $con.find('#result')
		};
	};
	gatherResult = function() {
		var sun = [[null, null]];
		var mon = [[null, null]];
		var tue = [[null, null]];
		var wed = [[null, null]];
		var thu = [[null, null]];
		var fri = [[null, null]];
		var sat = [[null, null]];
		var week = [sun, mon, tue, wed, thu, fri, sat];
		var j, temp;
		console.log(stMap.dayArray, stMap.nightArray);
		week.forEach(function(day, i) {
			temp = 0;
			for (j = 0; j < 12; j++) {
				console.log(j, stMap.dayArray[j][i].length === 0);
				if (stMap.dayArray[j][i].length === 0) {
					console.log(day[temp][0] === null);
					if (day[temp][0] === null) { /* 처음이면 */
						day[temp][0] = j;
						day[temp][1] = day[temp][0] + 1;
					} else {
						console.log(day[temp][1] === j);
						if (day[temp][1] === j) { /* 연속된 시간 array */
							day[temp][1] = j + 1;
						} else { /* 새로운 시간 array */
							day[++temp] = [j, j + 1];
						}
					}
				}
				console.log(day, temp);
			}
			for (j = 12; j < 24; j++) {
				if (stMap.nightArray[j - 12][i].length === 0) {
					if (day[temp][0] === null) { /* 처음이면 */
						day[temp][0] = j;
						day[temp][1] = day[temp][0] + 1;
					} else {
						if (day[temp][1] === j) { /* 연속된 시간 array */
							day[temp][1] = j + 1;
						} else { /* 새로운 시간 array */
							day[++temp] = [j, j + 1];
						}
					}
				}
				console.log(day, temp);
			}
		});
		return week;
	};
	showResult = function(rangeList) {
		var str = '';
		var dayList = ['일', '월', '화', '수', '목', '금', '토'];
		var prefix = '';
		dayList.forEach(function(day, i) {
			str += '<p class="result-date">' + day + '요일: </p>';
			rangeList[i].forEach(function(range) {
				if (range[0] === null) {
					return false;
				}
				if (range[0] < 12) {
					prefix = '오전';
				} else if (range[0] === 12) {
					prefix = '오후';
				} else {
					prefix = '오후';
					range[0] -= 12;
				}
				str += prefix + ' ' + range[0] + '시 ~ ';
				if (range[1] < 12) {
					prefix = '오전';
				} else if (range[1] === 12) {
					prefix = '오후';
				} else if (range[1] === 24) {
					prefix = '밤';
					range[1] -= 12;
				} else {
					prefix = '오후';
					range[1] -= 12;
				}
				str += prefix + ' ' + range[1] + '시<br>';
			});
		});
		jqMap.$result.html(str);
	};
	toLobby = function() {
		jqMap.$con.fadeOut('slow');
		history.pushState({mod: 'lobby'}, '', '/lobby/' + stMap.myInfo.id);
		wwm.lobby.initModule(jqMap.$con);
	};
	toRoom = function() {
		history.pushState({mod: 'room'}, '', '/room/' + stMap.rid);
		jqMap.$con.fadeOut('slow');
	};
	toKakao = function() {
		/* TODO: kakao에 결과 링크 보내기 */
		console.log('kakao send');
	};
	toFacebook = function() {
		FB.ui({
			method: 'send',
			link: 'http%3A%2F%2Fwww.nytimes.com%2F2011%2F06%2F15%2Farts%2Fpeople-argue-just-to-win-scholars-assert.html'
		});
	};
	initModule = function(data) {
		var src = $('#wwm-confirm').html();
		stMap = $.extend(stMap, data);
		console.log(data, stMap);
		wwm.shell.modal.html(src);
		setJqMap(wwm.shell.modal);
		showResult(gatherResult());
		jqMap.$toLobbyBtn.click(toLobby);
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