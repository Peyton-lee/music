"use strict";

(function() {
	var signUpBtn = $('#signUpBtn'),
		upUser = $('#upUser'),
		upPsw = $('#upPsw'),
		signUpTip = $('#signUpTip'),
		signInBtn = $('#signInBtn'),
		inUser = $('#inUser'),
		inPsw = $('#inPsw'),
		signInTip = $('#signInTip'),
		uploadBtn = $('#uploadBtn'),
		uploadForm = $('#uploadForm'),
		uploadTip = $('#uploadTip'),
		songName = $('#songName'),
		mp3 = $('#file'),
		fileImg = $('#fileImg'),
		fileText = $('#fileText'),
		searchBtn = $('.search-btn'),
		keyText = $('#keyText'),
		Tip = $('.tipBox')

	//存放搜索key
	var keyBox = "";

	//获取音乐列表并渲染，默认翻唱类型第一页，搜索为空
	GetMusicList("Cover", 1, "");
	//类型
	$(document).on('click', '.typeSelect', function() {
		$(this).addClass('active').siblings().removeClass('active');
		var type = $(this).text();
		GetMusicList(type, 1, "")
	});
	//翻页
	$(document).on('click', '.branch-btn', function() {
		var index = $(this).text();
		var type = $('.typeSelect.active').text();
		GetMusicList(type, index, keyBox);
	})
	$(document).on('click', '.turn-left', function() {
		var index = parseInt($('#page').text()) - 1;
		var type = $('.typeSelect.active').text();
		GetMusicList(type, index, keyBox);
	})
	$(document).on('click', '.turn-right', function() {
		var index = parseInt($('#page').text()) + 1
		var type = $('.typeSelect.active').text();
		GetMusicList(type, index, keyBox);
	});
	//搜索
	searchBtn.click(function() {
		var value = keyText.val()
		keyBox = value;
		var type = $('.typeSelect.active').text();
		GetMusicList(type, 1, value)
		keyText.val("")
	});

	//注册
	signUpBtn.click(function() {
		if(!$.trim(upUser.val())) {
			signUpTip.text('帐号名不能为空，建议填写英文名！');
			return;
		} else if(!$.trim(upPsw.val())) {
			signUpTip.text('密码不能为空！');
			return;
		}
		signUpForm.submit();
	});

	//登录
	signInBtn.click(function() {
		if(!$.trim(inUser.val())) {
			signInTip.text('帐号名不能为空！');
			return;
		} else if(!$.trim(inPsw.val())) {
			signInTip.text('密码不能为空！');
			return;
		}

		$.ajax({
			type: "post",
			url: "/sign_in",
			data: {
				username: inUser.val(),
				password: inPsw.val()
			},
			async: true,
			dataType: 'json',
			success: function(data) {
				switch(data.code) {
					case 0:
						location.reload();
						break;
					default:
						signInTip.text(data.errorMsg);
				}
			}
		});
	});

	//上传作品
	uploadBtn.click(function() {
		if(!$.trim(songName.val())) {
			uploadTip.text('歌曲名不能为空！');
			return;
		} else if(!mp3.val()) {
			uploadTip.text('歌曲文件不能为空！');
			return;
		} else if(!fileImg.val()) {
			uploadTip.text('歌曲封面图片不能为空！');
			return;
		} else if(!$.trim(fileText.val())) {
			uploadTip.text('歌曲描述不能为空！');
			return;
		}

		uploadForm.submit();
	});

	//music详细页
	$(document).on('click', '.song_name', function() {
		var id = $(this).parents('.song_li').find("audio").attr("id").split("music_")[1];
		$.post("/getMusicInfo", {
			id: id
		}, function(data) {
			var html = new EJS({
				url: '../ejs/musicInfo.ejs'
			}).render(data);
			$('#musicInfo').html(html)
		});
		$('#mask').show();
		setTimeout(function() {
			$('.Info').show()
			$('html,body').animate({
				scrollTop: '800px'
			}, 400);
		}, 200)
		setTimeout(function() {
			$("#commentAll").mCustomScrollbar({
				theme: "dark"
			});
		}, 100)
	});
	$(document).on('click', '.comClose', function() {
		$('.Info,#mask').hide();
	});

	//点赞
	$(document).on('click', '.zan', function() {
		if($(this).hasClass('disabled')) {
			return false
		}
		var id = $('#musicTrue').attr("name");
		$.post("/musicZan", {
			id: id
		}, function(data) {
			if(data.status == 0) {
				$('.addOne').addClass('fadeOutUp showNow')
				$('.workZan').each(function() {
					$(this).text(parseInt($(this).text()) + 1)
				})
			} else if(data.status == 1) {
				showTip("您已经点过此作品赞了！")
			} else {
				alert("未登录")
			}
		})
	});

	//评论
	$(document).on('click', '#commentBtn', function() {
		if(!$.trim($('#comment').val())) {
			showTip("评论内容不能为空！")
			return false
		}
		AddComment($('#comment').val())
	});

	//获取列表函数
	function GetMusicList(type, page, searchKey) {
		$.post("/get_music_list", {
			"type": type,
			"page": page,
			"searchKey": searchKey
		}, function(data) {
			var html = new EJS({
				url: '../ejs/module.ejs'
			}).render(data);
			$('#musicList').html(html)
			var page = new EJS({
				url: '../ejs/page.ejs'
			}).render(data.page_info);
			$('#pageInfo').html(page)
			$('.song_li>a').each(function() {
				$(this).height($('.song_li').width())
			})

		})
	}

	//评论函数
	function AddComment(value) {
		$.post('/addComment', {
			value: value,
			id: $('#musicTrue').attr('name')
		}, function(data) {
			if(data.status.code != 0) {
				alert("未登录")
				return
			}
			$('#comment').val("")
			$('.CommentNum').text(parseInt($('#CommentNum').text()) + 1)
			$('.CommentNum').each(function() {
				$(this).text(parseInt($(this).text()) + 1)
			})
			var html = new EJS({
				url: '../ejs/comment.ejs'
			}).render(data);
			$('#commentAll .mCSB_container').html(html)
		})
	}
	
	$('.blog').click(function(){
		showTip("peyton 赶工中...")
	})
	
	function showTip(value){
		Tip.removeClass('fadeOutDown').show()
		Tip.text(value)
		setTimeout(function(){
			Tip.addClass('fadeOutDown')
		},1500)
	}

})(window);