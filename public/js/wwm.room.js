wwm.room = (function(){
  var jqMap;
  var userInfo;
  var socket = io();
  function setJqMap($con) {
    jqMap = {
      $con: $con,
      $explode: $con.find('#explode-room'),
      $ban: $con.find('#ban-people-btn'),
      $changeNumber: $con.find('#change-number-btn'),
      $changeTitle: $con.find('#change-room-title'),
      $calendar: $con.find('table')
    };
  }
  function tableToArr(cell) {
    var arr = [cell.cellIndex, cell.parentNode.rowIndex];
    console.log('tableToArr', arr);
    return arr;
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
  function initModule($con) {
    userInfo = JSON.parse(localStorage.login);
    var src = $('#wwm-room').text();
    dust.render(dust.loadSource(dust.compile(src)), {
      name: userInfo.username
    }, function(err, out) {
      $con.html(out);
    });
    setJqMap($con);
    jqMap.$calendar.find('td').click(onClickCell);
  }
  return {
    initModule: initModule
  };
}());
