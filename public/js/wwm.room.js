wwm.room = (function(){
  var jqMap;
  var stMap = {
    $con: $('#view')
  };
  var cfMap = {
    current: 'day'
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
      $back: $con.find('#room-back')
    };
  }
  function tableToArr(cell) {
    var arr = [cell.cellIndex, cell.parentNode.rowIndex];
    console.log('tableToArr', arr);
    return arr;
  }
  function deleteRoom() {
    wwm.model.deleteRoom();
  }
  function goBack() {
    wwm.lobby.initModule(jqMap.$con);
  }
  function onClickCell() {
    if ($(this).hasClass('busy')) {
      socket.emit('not-busy', tableToArr(this));
      $(this).removeClass('busy');
    } else {
      socket.emit('busy', tableToArr(this));
      $(this).addClass('busy');
    }
  }
  function toDay() {
    cfMap.current = 'day';
  }
  function toNight() {
    cfMap.current = 'night';
  }
  function initModule(data) {
    userInfo = JSON.parse(localStorage.login);
    var src = $('#wwm-room').text();
    dust.render(dust.loadSource(dust.compile(src)), {
      name: userInfo.username
    }, function(err, out) {
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
  }

  return {
    initModule: initModule
  };
}());
