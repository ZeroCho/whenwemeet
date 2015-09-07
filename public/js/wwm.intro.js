wwm.intro = (function() {
	var jqMap = {};
	var stMap = {
		phase: 0
	};
	var initModule, skipIntro, toNextPhase, createRoom, bounce, setJqMap, endIntro, checkPhase;
	setJqMap = function ($con) {
		jqMap = {
			$con: $con,
			$main: $con.find('#intro-main'),
			$skip: $con.find('#skip-intro'),
			$next: $con.find('.next-phase')
		};
	};
	bounce = function($target, horizontal) {
		if (horizontal) {
			$target.animate({right: '+=4'}, 500).animate({right: '-=4'}, 500, function() {
				bounce($target, true);
			});
		} else {
			$target.animate({bottom: '+=4'}, 500).animate({bottom: '-=4'}, 500, function() {
				bounce($target);
			});
		}
	};
	checkPhase = function () {
		var phase = stMap.phase || parseInt(jqMap.$main.find('div').attr('class').slice(6));
		switch (phase) {
			case 0:
				jqMap.$main.find('.intro-logo').showSVGLogo(100);
				break;
			case 1:
				bounce(jqMap.$main.find('#arrow-to-modal'));
				break;
			case 2:
				jqMap.$main.find('#intro-create-room, #arrow-to-create').css('left', $(window).width() * 0.5 - 50);
				bounce(jqMap.$main.find('#arrow-to-create'));
				jqMap.$con.css({height: '250px', bottom: 0});
				break;
			case 3:
				jqMap.$con.css({height: '50px', top: 0});
				bounce(jqMap.$main.find('#arrow-to-confirm'), true);
				jqMap.$main.find('.intro-wrapper').css({background: 'white', opacity: 0.9, top: '70%'});
				break;
			case 4:
				bounce(jqMap.$main.find('#arrow-to-aside'));
				jqMap.$main.find('.intro-wrapper').css({background: 'white', opacity: 0.9, top: '125%'});
				break;
			case 5:
				bounce(jqMap.$main.find('#arrow-to-result'), true);
				jqMap.$con.css({height: '50px'});
				jqMap.$main.find('.intro-wrapper').css({background: 'white', opacity: 0.9, top: '50%'});
				break;
			case 6:
				jqMap.$con.css({top: 'auto', background: 'white', textAlign: 'center'});
				jqMap.$main.find('.intro-wrapper').css({background: 'white', opacity: 0.9});
				break;
			default:
		}
	};
	toNextPhase = function () {
		var src, phase = ++stMap.phase;
		console.log('toFirstPhase', phase);
		src = $('#wwm-phase-' + phase).html();
		jqMap.$main.html(src);
		checkPhase();
	};
	skipIntro = function () {
		console.log('skipIntro');
		if ($(this).is(':checked')) {
			localStorage.first = 'false';
			wwm.shell.intro.fadeOut('slow');
			wwm.model.introDone(userInfo.id);
		}
	};
	endIntro = function () {
		localStorage.first = 'false';
		wwm.shell.intro.fadeOut('slow');
		wwm.model.introDone(userInfo.id);
	};
	createRoom = function (e) {
		var spinner = new Spinner().spin();
		var title = $('#room-title').val();
		var limit = $('#room-limit').val();
		var password = $('#room-password').val();
		var maker = userInfo.id.toString();
		var picture = userInfo.picture;
		var data = {
			rid: new Date().getTime().toString().slice(0, -4),
			title: title,
			maker: maker,
			limit: limit,
			picture: picture,
			password: password,
			members: JSON.stringify([{id: userInfo.id, name: userInfo.name, picture: userInfo.picture, confirm: false}])
		};
		var createRoomPromise;
		console.log('intro createroom', data);
		e.preventDefault();
		jqMap.$con.append(spinner.el);
		if (!title) {
			$(spinner.el).remove();
			alert('제목을 입력하세요.');
			return;
		}
		console.log('createroom data', data);
		createRoomPromise = wwm.model.createRoom(data);
		createRoomPromise.done(function (result) {
			console.log(result);
			data.current = 1;
			wwm.room.initModule(data, 'create');
			wwm.shell.modal.fadeOut('slow');
		});
		createRoomPromise.fail(function (err) {
			console.log(err);
			alert('방 생성에러! 콘솔확인');
		});
		createRoomPromise.always(function () {
			$(spinner.el).remove();
		});
		toNextPhase();
	};
	initModule = function () {
		var src = $('#wwm-intro').html();
		wwm.shell.intro.html(src).fadeIn('slow');
		setJqMap(wwm.shell.intro);
		checkPhase();
		jqMap.$skip.change(skipIntro);
		jqMap.$next.click(toNextPhase);
		jqMap.$main.on('click', '#intro-show-modal', function() {
			console.log('intro showModal');
			wwm.modal.initModule($('#wwm-create-modal').html());
			toNextPhase();
		});
		jqMap.$main.on('click', '#intro-create-room', createRoom);
		jqMap.$main.on('click', '#intro-confirm', function() {
			wwm.room.confirmTable(userInfo.id, wwm.room.info.rid);
			toNextPhase();
		});
		jqMap.$main.on('click', '#intro-aside', function() {
			wwm.room.toggleAside();
			setTimeout(wwm.room.toggleAside, 3000);
			toNextPhase();
		});
		jqMap.$main.on('click', '#intro-result', function() {
			wwm.lobby.showResult(wwm.room.info.rid);
			toNextPhase();
		});
		jqMap.$main.on('click', '#intro-end', function() {
			endIntro();
		});
	};
	return {
		initModule: initModule
	};
}());