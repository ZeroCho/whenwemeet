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
		var dayArr = [], nightArr = [];
		for (var i = 0; i < 12; i++) {
			for (var j = 0; j < 7; j++) {
				if (stMap.dayArray[i][j].length == 0) {
					dayArr.push([i, j]);
				} 
			}
		}
		return [dayArr, nightArr];
	}
	function calculateResult(arr) {
	
	}
	function showResult() {
		var str = '가능한 시간은' + '입니다.';
		jqMap.$result.html(str);
	}
	function toLobby() {
		wwm.lobby.initModule(jqMap.$con);
	}
	function toRoom() {}
	}
	function toKakao() {}
	function toFacebook() {}
	function initModule($con, data) {
		stMap = data;
		var src = $('#wwm-confirm').html();
		setJqMap($con);
		var arr = gatherResult();
		calculateResult(arr);
		showResult();
		jqMap.$toLobby.click(toLobby);
		jqMap.$toRoom.click(toRoom);
		jqMap.$toKakao.click(toKakao);
		jqMap.$toFacebook.click(toFacebook);
	}
	return {
		initModule: initModule
	}
}());