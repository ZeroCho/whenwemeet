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
    onlineList: [],
    userInfo: null
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
      $day: $con.find('#day'),
      $night: $con.find('#night'),
      $back: $con.find('#room-back'),
      $dayExp: $con.find('#day-exception'),
      $notDay: $con.find('#day-exception').find('li'),
      $timeExp: $con.find('#time-exception'),
      $notTime: $con.find('#time-exception').find('li'),
      $title: $con.find('#title'),
      $total: $con.find('#total-number'),
      $sendChat: $con.find('#send-chat'),
      $chatList: $con.find('#chat-list')
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
  function ban(e) {
  		var banPromise = wwm.model.ban(e.data.id);
  		banPromise.done(function(res) {
  		});
  		banPromise.fail(function(err) {});
  }
  function changeTitle(e) {
  		var title = $(this).prev().val();
  		var titlePromise = wwm.model.changeTitle(e.data.id, title);
  		titlePromise.done(function(res) {
  			jqMap.$title.text(title);
  		});
  		titlePromise.fail(function(err) {});
  }
  function changeLimit(e) {
  		var number = $(this).prev().val();
  		var limitPromise = wwm.model.changeLimit(e.data.id, number);
  		limitPromise.done(function(res) {
  			jqMap.$total.text(number);
  		});
  		limitPromise.fail(function(err) {});
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
  		var id = e.data.id;
    var deletePromise = wwm.model.deleteRoom(id);
    deletePromise.done(function(res) {
    		alert('삭제되었습니다.');
    		wwm.lobby.initModule(jqMap.$con);
    });
    deletePromise.fail(function(err) {
    		console.log(err);
    		alert('오류발생');
    });
  }
  function excludeDay() {
  		alert($(this).index());
  		var idx = $(this).index();
  		// remove date that matches index
  }
  function excludeTime() {
  		alert($(this).index());
  		var idx = $(this).index();
  		var time = $(this).find('input').val();
  		if (idx === 0) {
  		// not before
  		} else {
  		// not after
  		}
  }
  function goBack() {
    wwm.lobby.initModule(jqMap.$con);
  }
  function sendChat() {
  		var text = $(this).prev('#chatbox').text();
  		socket.emit('chat', {
  			id: cfMap.userInfo.id,
  			text: text
  		});
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
    jqMap.$night.css('background', 'white');
    jqMap.$day.css('background', 'gray');
  }
  function toNight() {
    cfMap.current = 'night';
    arrayToTable(cfMap.current);
    jqMap.$day.css('background', 'white');
    jqMap.$night.css('background', 'gray');
  }
  function initModule(data) {
    cfMap.userInfo = JSON.parse(localStorage.login);
    cfMap.memberList = data.member;
			cfMap.onlineList.push(cfMap.userInfo.id);
    var parser = {
    		name: cfMap.userInfo.name || cfMap.userInfo.properties.nickname,
    		title: data.title,
    		current: data.current,
    		total: data.number
    	};
    if (cfMap.userInfo.id === data.maker) {
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
    jqMap.$day.css({
    		background: 'gray'
    });
   	socket.on('chat', function(data) {
   		jqMap.$chatList.text(data.id + ' send ' + data.text);
   	});
   	socket.on('busy', function(msg) {
   		alert(msg);
   	});
   	socket.on('not-busy', function(msg) {
   		alert(msg);
   	}); jqMap.$calendar.find('td').click(onClickCell);
    jqMap.$explode.click({id: data.id}, deleteRoom);
    jqMap.$back.click(goBack);
    jqMap.$day.click(toDay);
    jqMap.$night.click(toNight);
    jqMap.$dayExp.click(showDayException);
    jqMap.$timeExp.click(showTimeException);
    jqMap.$ban.click({id: data.id}, ban);
    jqMap.$changeLimit.click({id: data.id}, changeLimit);
    jqMap.$changeTitle.click({id: data.id}, changeTitle);
    jqMap.$sendChat.click(sendChat);
    jqMap.$notDay.click(excludeDay);
    jqMap.$notTime.click(excludeTime);
  }

  return {
    initModule: initModule
  };
}());
