wwm.room = (function(){
  var jqMap;
  var userInfo;
  function setJqMap($con) {
    jqMap = {
      $con: $con,
      $explode: $con.find('#explode-room'),
      $ban: $con.find('#ban-people-btn'),
      $changeNumber: $con.find('#change-number-btn'),
      $changeTitle: $con.find('#change-room-title')
    };
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
  }
  return {
    initModule: initModule
  };
}());
