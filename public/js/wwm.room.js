wwm.room = (function(){
  var jqMap;
  var stMap = {
    $con: $('#view')
  };
  var cfMap = {
    current: 'day',
    dayArray: [],
    nightArray: [],
    memberList: [],
    onlineList: []
  };
  var userInfo;
  var socket = io();
  function setJqMap($con) {
    jqMap = {
      $con: $con,
      $explode: $con.find('#explode-room'),
      $ban: $con.find('#ban-people-btn'),
      $changeNumber: $con.find('#change-number-btn'),
      $changeTitle: $con.find('#change-room-title'),
      $calendar: $con.find('table'),
      $day: $con.find('#day'),
      $night: $con.find('#night'),
      $back: $con.find('#room-back'),
      $dayExp: $con.find('#day-exception'),
      $timeExp: $con.find('#time-exception')
    };
  }
  function tableToArray(cell) {
    var arr = [cell.cellIndex, cell.parentNode.rowIndex];
    console.log('tableToArr', arr);
    return arr;
  }
  function arrayToTable(current) {
  		if (current === 'day') {
  		
  		} else {
  		
  		}
  }
  function ban() {}
  function changeTitle() {}
  function changeLimit() {}
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
  function deleteRoom() {
    wwm.model.deleteRoom();
  }
  function goBack() {
    wwm.lobby.initModule(jqMap.$con);
  }
  function onClickCell() {
    if ($(this).hasClass('busy')) {
      socket.emit('not-busy', tableToArray(this));
      $(this).removeClass('busy');
    } else {
      socket.emit('busy', tableToArray(this));
      $(this).addClass('busy');
    }
  }
  function toDay() {
    cfMap.current = 'day';
    arrayToTable(cfMap.current);
  }
  function toNight() {
    cfMap.current = 'night';
    arrayToTable(cfMap.current);
  }
  function initModule(data) {
    userInfo = JSON.parse(localStorage.login);
    cfMap.memberList = data.member;
    var parser = {
    		name: userInfo.name || userInfo.properties.nickname,
    		title: data.title,
    		current: data.member.length,
    		total: data.number
    	};
    if (userInfo.id === data.maker) {
    		parser.admin = true;
    }
    var src = $('#wwm-room').text();
    dust.render(dust.loadSource(dust.compile(src)), parser, function(err, out) {
      if (err) {
        console.log(err);
        return;
      }
      stMap.$con.html(out);
    });
    setJqMap(stMap.$con);
    jqMap.$calendar.find('td').click(onClickCell);
    jqMap.$explode.click(deleteRoom);
    jqMap.$back.click(goBack);
    jqMap.$day.click(toDay);
    jqMap.$night.click(toNight);
    jqMap.$dayExp.click(showDayException);
    jqMap.$timeExp.click(showTimeException);
  }

  return {
    initModule: initModule
  };
}());
