wwm.room = (function(){
  var jqMap;
  var userInfo;
  function setJqMap($con) {
    jqMap = {
      $con: $con,
      $explode: $con.find('#explode-room'),
      $changeTitle: $con.find('#change-title)
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
