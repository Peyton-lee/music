"use strict";

(function() {
	var top = $('.index_top'),
		$Body = $('body'),
		music = $('#music')[0],
		musicBtn = $('.musicBtn'),
		run = $('.run'),
		mask = $('#mask'),
		signIn = $('#sign_in'),
		signUp = $('#sign_up'),
		close = $('.close'),
		backTop = $('.backTop'),
		musicBoxclose = $('.musicBoxclose'),
		upload = $('#upload');

	var pageH = $(window).height();

	/*---------------------banner---------------------*/
	top.height(pageH);
	$(window).resize(function() {
		pageH = $(window).height();
		top.height(pageH);
		$('.song_li>a').each(function() {
			$(this).height($('.song_li').width())
		})
	});

	//scroll top
	$(window).scroll(function() {
		var h = $('.singBox').offset().top;
		if($(window).scrollTop() > h) {
			backTop.show().removeClass('rotate');
		} else {
			backTop.show().addClass('rotate');
		}
	});
	backTop.click(function() {
		$('html,body').animate({
			scrollTop: '0px'
		}, 800)
	});

	//music
	musicBtn.click(function() {
		var active = musicBtn.hasClass('active');
		active ? $(this).removeClass('active') : $(this).addClass('active');
		changeMusic(!active);
	});
	musicBoxclose.click(function() {
		$('.musicBox').addClass('slideOutDown');
		$('#musicGo')[0].pause()
	})

	//banner moving
	run.each(function() {
		var time = parseFloat($(this).attr('time'));
		$(this).css({
			'animation-delay': time + 's',
			'-moz-animation-delay': time + 's',
			'-webkit-animation-delay': time + 's',
			'-o-animation-delay': time + 's'
		});
	});

	//sign in
	signIn.click(function() {
		showSignIn();
	});
	close.click(function() {
		$('#mask,.tapBox').hide();
	});

	//sign up
	signUp.click(function() {
		showSignUp();
	});

	//music play
	$(document).on('click', '.playBtn', function() {
		changeMusic(false) //停止默认背景音乐

		var $li = $(this).parents('.song_li')
		var $audio = $li.find('audio')
		var info = {
			pic: $li.find('img').attr('src'),
			src: $audio.attr('src'),
			name: $li.find('.song_name').find('b').text(),
			author: $li.find('.man').text(),
			time: formatSeconds($audio[0].duration)
		}
		setTimeout(function() {
			showMusic(info) //播放且显示信息
		}, 1000)

		$('.musicBox').show().removeClass('slideOutDown').addClass('slideInUp');
	});

	//music info play
	$(document).on('click', '.playOn', function() {
		changeMusic(false) //停止默认背景音乐

		var info = {
			pic: $('.Info-sm img').attr('src'),
			src: $('#musicTrue').attr('src'),
			name: $('.songInfo h3').text(),
			author: $('.songInfo p').text(),
			time: formatSeconds($('#musicTrue')[0].duration)
		}
		setTimeout(function() {
			showMusic(info) //播放且显示信息
		}, 1000)

		$('.musicBox').show().removeClass('slideOutDown').addClass('slideInUp');
	})

	function showMusic(info) {
		$('.musicPic img').attr("src", info.pic)
		$('.musicInfo .musicName').text(info.name)
		$('.musicInfo .manName').text(info.author)
		$('.musicInfo .musicTime').text(info.time)
		$('#musicGo').attr('src', info.src)
		$('#musicGo')[0].play()
	}

	//upload
	upload.click(function() {
		showUpload()
	})

	function changeMusic(act) {
		if(act) {
			musicBtn.find('i')[0].innerHTML = '<i class="icon iconfont white">&#xe605;</i>';
			music.play();
		} else {
			musicBtn.find('i')[0].innerHTML = '<i class="icon iconfont white">&#xe608;</i>';
			music.pause();
		}
	}

	function showSignIn() {
		mask.show();
		$('.signInBox').show().addClass('bounceInDown');
	}

	function showSignUp() {
		mask.show();
		$('.signUpBox').show().addClass('bounceInDown');
	}

	function showUpload() {
		mask.show();
		$('.loadBox').show().addClass('bounceInDown');
	}

	function formatSeconds(value) {
		var theTime = parseInt(value); // 秒
		var theTime1 = 0; // 分
		var theTime2 = 0; // 小时
		if(theTime > 60) {
			theTime1 = parseInt(theTime / 60);
			theTime = parseInt(theTime % 60);
			if(theTime1 > 60) {
				theTime2 = parseInt(theTime1 / 60);
				theTime1 = parseInt(theTime1 % 60);
			}
		}
		var result = "" + parseInt(theTime) + "秒";
		if(theTime1 > 0) {
			result = "" + parseInt(theTime1) + "分" + result;
		}
		if(theTime2 > 0) {
			result = "" + parseInt(theTime2) + "小时" + result;
		}
		return result;
	}

})(window);