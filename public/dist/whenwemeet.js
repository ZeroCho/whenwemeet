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
	function getRoomList(query) {
		var deferred = $.Deferred();
		if (query) {
			$.get('/rooms/' + query).done(function (res) {
				deferred.resolve(res);
			}).fail(function (err) {
				deferred.reject(err);
			});
		} else {
			$.get('/rooms').done(function (res) {
				deferred.resolve(res);
			}).fail(function (err) {
				deferred.reject(err);
			});
		}
		return deferred.promise();
	}
	function createRoom(data) {
		var deferred = $.Deferred();
		$.get('/member/' + data.maker).done(function(res) {
			if (res > 3) {
				var msg = '방은 최대 세 개까지 만들 수 있습니다.';
				deferred.reject(msg);
			}
		});
		$.post('/room/' + data.id, data).done(function(res) {
			deferred.resolve(res);
		});
		return deferred.promise();
	}
	function initModule() {
		if (localStorage.login) {
			window.userInfo = JSON.parse(localStorage.login);
		}
	}
	return {
		initModule: initModule,
		createRoom: createRoom,
		getRoomList: getRoomList
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
			$kakaoLogin: $con.find('#kakao-login-btn'),
			$fbLogin: $con.find('#fb-login-btn')
		};
	}

	function onError(errorMsg, url, lineNumber, column, errorObj) {
		if (typeof errorMsg === 'string' && errorMsg.indexOf('Script error.') > -1) {
			return;
		}
		console.log('Error: ', errorMsg, ' Script: ' + url + ' Line: ' + lineNumber + ' Column: ' + column + ' StackTrace: ' + errorObj);
	}

	function initModule($con) {
		$.ajaxSetup({cache: true});
		$.getScript('//connect.facebook.net/ko_KR/sdk.js', function () {
			FB.init({
				appId: '1617440885181938',
				xfbml: true,
				version: 'v2.4'
			});
		});
		Kakao.init(KAKAO_KEY);
		console.log('login', localStorage.login);
		console.log('first', localStorage.first);
		var logged = localStorage.login && JSON.parse(localStorage.login);
		var first = localStorage.first && JSON.parse(localStorage.first);
		setJqMap($con);
		//if (first) {
		//	wwm.modal.initModule($('#wwm-intro').html());
		//}
		console.log('logged', logged);
		if (logged) {
			wwm.lobby.initModule(jqMap.$view);
		} else {
			$con.find('#view').html($('#wwm-login').html());
			setJqMap($con);
			jqMap.$kakaoLogin.on({
				click: function () {
					Kakao.Auth.login({
						success: function (authObj) {
							Kakao.API.request({
								url: '/v1/user/me',
								success: function (res) {
									localStorage.login = JSON.stringify(res);
									localStorage.loginType = 'kakao';
									wwm.lobby.initModule(jqMap.$view);
								},
								fail: function (error) {
									alert(JSON.stringify(error));
								}
							});
						},
						fail: function (err) {
							alert(JSON.stringify(err));
						}
					});
				},
				mouseover: function () {
					this.src = '/kakao_account_login_btn_medium_narrow_ov.png';
				},
				mouseout: function () {
					this.src = '/kakao_account_login_btn_medium_narrow.png';
				}
			});
			jqMap.$fbLogin.on({
				click: function () {
					FB.login(function (res) {
						if (res.status === 'connected') {
							FB.api('/me', function (res) {
								localStorage.login = JSON.stringify(res);
								localStorage.loginType = 'facebook';
								wwm.lobby.initModule(jqMap.$view);
							});
						} else if (res.status === 'not_authorized') {
							// The person is logged into Facebook, but not your app.
							alert('Please log log into this app.');
						} else {
							alert('Please log into Facebook.');
						}
					});
				},
				mouseover: function () {
					this.src = '/facebook_ov.png';
				},
				mouseout: function () {
					this.src = '/facebook.png';
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
	function showCreateroom() {
		wwm.modal.initModule($('#wwm-createroom-modal').html());
	}
	function getList() {
		var spinner = new Spinner().spin();
		jqMap.$list.append(spinner.el);
		var $frag = $(document.createDocumentFragment());
		var getListPromise = wwm.model.getRoomList();
		getListPromise.done(function (res) {
			console.log(res);
			jqMap.$list.text(res);
		});
		getListPromise.fail(function (err) {
			console.log(err);
			jqMap.$list.html(err.responseText);
		});
	}
	function onSearchRoom (query) {
		var $frag = $(document.createDocumentFragment());
		var searchPromise = wwm.model.getRoomList(query);
		searchPromise.done(function (res) {
			console.log(res);
			jqMap.$list.text(res);
		});
		searchPromise.fail(function (err) {
			console.log(err);
			jqMap.$list.html(err.responseText);
		});
	}
	function logout() {
		localStorage.removeItem('login');
		localStorage.removeItem('loginType');
		wwm.lobby.initModule(jqMap.$con);
	}
	function enterRoom() {
		wwm.room.initModule(jqMap.$con, $(this));
	}
	function refreshList() {
		getList();
	}
	function setJqMap($con) {
		jqMap = {
			$con: $con,
			$showCreateroom: $con.find('#show-createroom-modal'),
			$searchroomBtn: $con.find('#searchroom-btn'),
			$list: $con.find('#rooms'),
			$logout: $con.find('#logout-btn'),
			$room: $con.find('.room'),
			$refresh: $con.find('#refresh-list')
		};
	}
	function initModule($con) {
		var src = document.getElementById('wwm-lobby').textContent;
		userInfo = JSON.parse(localStorage.login);
		console.log('lobby', localStorage.login);
		var username = userInfo.properties.nickname || userInfo.name;
		console.log('username', username);
		dust.render(dust.loadSource(dust.compile(src)), {
			name: username
		}, function(err, out) {
			if (err) {
				console.log(err);
				alert('error! �ܼ� Ȯ��');
			} else {
				$con.html(out);
				setJqMap($con);
				getList();
				jqMap.$showCreateroom.click(showCreateroom);
				jqMap.$searchroomBtn.click(onSearchRoom);
				jqMap.$logout.click(logout);
				jqMap.$room.click(enterRoom);
				jqMap.$refresh.click(refreshList);
			}
		});
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
	function setJqMap($con) {
		jqMap = {
			$con: $con,
			$close: $con.find('.modal-close'),
			$title: $con.find('#room-title'),
			$number: $con.find('#room-people-number'),
			$password: $con.find('#room-password'),
			$createRoom: $con.find('#create-room-btn')
		};
	}
	function onCloseModal() {
		stMap.$modal.hide();
	}
	function createRoom() {
		var spinner = new Spinner().spin();
		jqMap.$con.append(spinner.el);
		var data;
		var title = jqMap.$title.val();
		var number = jqMap.$number.val();
		var password = jqMap.$password.val();
		var userInfo = JSON.parse(localStorage.login);
		var maker = userInfo.id || userInfo._id;
		if (!title) {
			$(spinner.el).remove();
			alert('제목을 입력하세요.');
			return;
		}
		data = {
			id: String(new Date().getTime()) + Math.random() * 1000,
			title: title,
			maker: maker,
			number: number,
			password: password
		};
		var createRoomPromise = wwm.model.createRoom(data);
		createRoomPromise.done(function (data) {
			wwm.room.initModule(data);
		});
		createRoomPromise.fail(function (err) {
			alert(err);
		});
		createRoomPromise.always(function () {
			$(spinner.el).remove();
		});
	}
	function initModule($target) {
		stMap.$modal.html($target);
		setJqMap(stMap.$modal);
		jqMap.$close.click(onCloseModal);
		stMap.$modal.show();
		jqMap.$createRoom.click(createRoom);
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
