/**
 * Created by Zero on 2015-07-25.
 */
var wwm = (function () {
	function initModule($container) {
		wwm.model.initModule();
		wwm.shell.initModule($container);
	}
	return {
		initModule: initModule
	};
}());
$(function () {
	wwm.initModule($('#whenwemeet'));
});
/**
 * Created by Zero on 2015-07-25.
 */
wwm.model = (function () {
	function initModule() {

	}
	return {
		initModule: initModule
	};
}());
wwm.shell = (function () {
	var jqMap;
	var KAKAO_KEY = 'a35623411563ec424430d3bd5dc7a93e';
	function setJqMap($con) {
		jqMap = {
			$con: $con,
			$view: $con.find('#view'),
			$modal: $con.find('#modal'),
			$kakaoLogin: $con.find('#kakao-login-btn')
		};
	}
	function onError (errorMsg, url, lineNumber, column, errorObj) {
		if (typeof errorMsg === 'string' && errorMsg.indexOf('Script error.') > -1) { return; }
		console.log('Error: ', errorMsg, ' Script: ' + url + ' Line: ' + lineNumber + ' Column: ' + column + ' StackTrace: ' + errorObj);
	}
	function initModule($con) {
		console.log('login: ' + localStorage.login);
		console.log('first: ' + localStorage.first)
		var logged = localStorage.login && JSON.parse(localStorage.login);
		var first = localStorage.first && JSON.parse(localStorage.first);
		setJqMap($con);
		Kakao.init(KAKAO_KEY);
		//if (first) {
		//	wwm.modal.initModule($('#wwm-intro').html());
		//}
		console.log('logged: ', logged);
		if (logged) {
			wwm.lobby.initModule(jqMap.$view);
		} else {
			$con.find('#view').html($('#wwm-login').html());
			setJqMap($con);
			jqMap.$kakaoLogin.on({
				click: function() {
					Kakao.Auth.login({
					 success: function(authObj) {
					  Kakao.API.request({
    					url: '/v1/user/me',
       		success: function(res) {
       			localStorage.login = JSON.stringify(res);
								wwm.lobby.initModule(jqMap.$view);
    				 },
     				fail: function(error) {
    						 alert(JSON.stringify(error))
    						}
							});			     
						},
						fail: function(err) {
					  alert(JSON.stringify(err))
					 }
					});
				},
				mouseover: function() {
					this.src = '/kakao_account_login_btn_medium_narrow_ov.png';
				},
				mouseout: function() {
					this.src = '/kakao_account_login_btn_medium_narrow.png';
				}
			});
		}
		$(window).on('error', onError);
	}
	return {
		initModule: initModule
	};
}());

wwm.lobby = (function (){
	var jqMap;
	var userInfo;
	function setJqMap($con) {
		jqMap = {
			$con: $con,
			$showCreateroom: $con.find('#show-createroom-modal'),
			$searchroomBtn: $con.find('#searchroom-btn'),
			$list: $con.find('#room-list'),
			$logout: $con.find('#logout-btn'),
			$room: $con.find('.room')
		};
	}
	function initModule($con) {
		userInfo = JSON.parse(localStorage.login);
		console.log('lobby', localStorage.login);
		var src = document.getElementById('wwm-lobby').textContent;
		console.log(src);
		console.log(userInfo.properties.nickname);
		dust.renderSource(src, {
			name: userInfo.properties.nickname
		}, function(err, out) {
			console.log(out);
			$con.html(out);
			setJqMap($con);
			getList();
			jqMap.$showCreateroom.click(showCreateroom);
			jqMap.$searchroomBtn.click(onSearchRoom);
			jqMap.$logout.click(logout);
			jqMap.$room.click(enterRoom);
		});
	}
	function showCreateroom() {
		wwm.modal.initModule($('#wwm-createroom'));
	}
	function getList() {
		$.get('/roomlist').done(function(res){
			jqMap.$list.html();
		});
	}
	function changeList(data) {
		var $frag = $(document.createDocumentFragment());
		jqMap.$list.html();
	}
	function onSearchRoom (query) {
		$.get('/search/' + query, function(res) {
			changeList(res);
		});
	}
	function logout() {
		localStorage.removeItem('login');
		location.href = '/logout';
	}
	function enterRoom() {
		wwm.room.initModule(jqMap.$con);
	}
	return {
		initModule: initModule
	};
}());

wwm.modal = (function (){
	var stMap = {
		$modal: $('#modal')
	};
	var jqMap;
	function initModule($target) {
		stMap.$modal.html($target);
		setJqMap($target);
		jqMap.$close.click(onCloseModal);
		stMap.$modal.show();
		jqMap.$createRoom.click(createRoom);
	}
	function setJqMap($con) {
		jqMap = {
			$con: $con,
			$close: $con.find('.modal-close'),
			$title: $con.find('#room-title'),
			$number: $con.find('#room-number'),
			$password: $con.find('#room-password'),
			$createRoom: $con.find('#create-room-btn')
		};
	}
	function onCloseModal() {
		stMap.$modal.hide();
	}
	function createRoom() {
		var data;
		var title = jqMap.$title.val();
		var number = jqMap.$number.val();
		var password = jqMap.$password.val();
		if (!title) {
			alert('제목을 입력하세요.');
			return;
		}
		if (!number) {
			alert('인원수를 선택하세요!');
			return;
		}
		data = {
			title: jqMap.$title.val(),
			number: jqMap.$number.val(),
			password: jqMap.$password.val()
		}
		wwm.model.createRoom(data);
	}
	return {
		initModule: initModule
	};
}());

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
  function onClickCell() {
    if ($(this).hasClass('busy')) {
      socket.emit('not-busy', tableToArr(this));
      $(this).removeClass('busy');
    } else {
      socket.emit('busy', tableToArr(this));
      $(this).addClass('busy');
    }
  }
  function tableToArr(cell) {
    var arr = [cell.cellIndex, cell.parentNode.rowIndex];
    console.log('tableToArr', arr);
    return arr;
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
