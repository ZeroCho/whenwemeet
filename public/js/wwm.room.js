wwm.room = (function(){
  var jqMap;
  var stMap = {
    current: 'day',
    dayArray: [[],[],[],[],[],[],[],[],[],[],[],[]],
    nightArray: [[],[],[],[],[],[],[],[],[],[],[],[]],
    memberList: [],
    onlineList: [],
    userInfo: null,
    personColor: 0
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
  function tableToArray(cell, busy) {
    var arr = [cell.cellIndex - 1, cell.parentNode.rowIndex - 1];
    if (stMap.current === 'day') {
      if (busy) {
        stMap.dayArray[arr[1]][arr[0]].push(stMap.personColor);
      } else {
        var index = stMap.dayArray[arr[1]][arr[0]].indexOf(stMap.personColor);
        if (index > -1) {
          stMap.dayArray[arr[1]][arr[0]].splice(index, 1);
        }
      }
    } else {
      if (busy) {
        stMap.nightArray[arr[1]][arr[0]].push(stMap.personColor);
      } else {
        var index = stMap.nightArray[arr[1]][arr[0]].indexOf(stMap.personColor);
        if (index > -1) {
          stMap.nightArray[arr[1]][arr[0]].splice(index, 1);
        }
      }
    }
    console.log('tableToArr', arr);
    return arr;
  }
  function arrayToTable(msg) {
    var $cell = jqMap.$calendar.find('tr').eq(msg[1] + 1).find('td').eq(msg[0] + 1);
    var number = $cell.data('number') || 0;
    $cell.attr('data-number', number + 1);
  }
  function renderTable(current) {
    if (current === 'day') {
      for (var i = 0; i < 12; i++) {
        for (var j = 0; j < 7; j++) {
          var $cell = jqMap.$calendar.find('tr').eq(i).find('td').eq(j);
          var number = $cell.data('number') || 0;
          if (stMap.dayArr[i][j].length > 0) {
            var $box = $('<div/>').addClass('box-' + number);
            for (var k = 0; k < number; k++) {
              $box.append($('<div/>', {class: cfMap.colorList[stMap.dayArr[i][j][k]]}));
            }
            $box.appendTo($cell);
          }
        }
      }
    } else {
      
    }
  }
  function ban(e) {
    var banPromise = wwm.model.ban(e.data.id);
    banPromise.done(function(res) {});
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
    var text = $(this).prev('#chatbox').val();
    socket.emit('chat', {
      id: cfMap.userInfo.id,
      text: text
    });
  }
  function onClickCell() {
    if ($(this).hasClass('busy')) {
      socket.emit('not-busy', tableToArray(this, false));
      $(this).removeClass('busy');
    } else {
      socket.emit('busy', tableToArray(this, true));
      $(this).addClass('busy');
    }
  }
  function toDay() {
    stMap.current = 'day';
    renderTable(stMap.current);
    jqMap.$night.css('background', 'white');
    jqMap.$day.css('background', 'gray');
  }
  function toNight() {
    stMap.current = 'night';
    render(stMap.current);
    jqMap.$day.css('background', 'white');
    jqMap.$night.css('background', 'gray');
  }
  function initModule(data) {
    stMap.userInfo = JSON.parse(localStorage.login);
    stMap.memberList = data.member;
		stMap.onlineList.push(stMap.userInfo.id);
		stMap.personColor = data.member.indexOf(stMap.userInfo.id) + 1;
    var parser = {
    	name: stMap.userInfo.name || stMap.userInfo.properties.nickname,
    	title: data.title,
    	current: data.current,
    	total: data.number
    };
    if (stMap.userInfo.id === data.maker) {
    	parser.admin = true;
    }
    var src = $('#wwm-room').text();
    dust.render(dust.loadSource(dust.compile(src)), parser, function(err, out) {
      if (err) {
        console.log(err);
        return;
      }
      cfMap.$con.html(out);
    });
    setJqMap(cfMap.$con);
    jqMap.$day.css({
    	background: 'gray'
    });
   	socket.on('chat', function(data) {
   		jqMap.$chatList.text(data.id + ' send ' + data.text);
   	});
   	socket.on('busy', function(msg) {
   	  arrayToTable(msg);
   		alert(msg);
   	});
   	socket.on('not-busy', function(msg) {
   		alert(msg);
   		arrayToTable(msg);
   	});
   	jqMap.$calendar.find('td').click(onClickCell);
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
