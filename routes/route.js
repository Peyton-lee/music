/******************路由****************/
var log = require('log-util'),
	formidable = require('formidable'),
	common = require('../common/common'),
	fs = require('fs'),
	models = require('../models/model')

module.exports = function(app) {

	//基础路由
	app.get('/', function(req, res) {
		if(req.session.user) {
			res.render('index', {
				user: req.session.user.userName,
				head: req.session.user.head
			})
		} else {
			res.render('index', {
				user: null
			});
		}
	});

	app.get('/404', function(req, res) {
		res.render('404', {
			errorMsg: req.session.errorMsg ? req.session.errorMsg : "系统错误!!"
		})
	})
	app.get('/index', function(req, res) {
		if(req.session.user) {
			res.render('index', {
				user: req.session.user.userName,
				head: req.session.user.head
			})
		} else {
			res.render('index', {
				user: null
			});
		}
	});

	//功能路由
	app.post('/sign_in', function(req, res) {
		models.SignIn(req.body.username, req.body.password, function(result, headImg) {
			switch(result) {
				case 1:
					log.warn('账号不存在');
					res.json({
						code: 1,
						errorMsg: '账号不存在'
					});
					break;
				case 2:
					log.warn('密码错误');
					res.json({
						code: 2,
						errorMsg: '密码错误'
					});
					break;
				default:
					log.info('成功登录:', req.body.username)
					req.session.user = {
						userName: req.body.username,
						head: headImg
					}
					res.json({
						code: 0,
						errorMsg: '成功登录'
					});
			}
		})
	});

	app.get('/logout', function(req, res) {
		//删除session
		delete req.session.user
		res.redirect("/index")
	});

	app.post('/sign_up', function(req, res) {
		var form = new formidable.IncomingForm() //创建上传表单
		form.encoding = 'utf-8'; //设置编辑
		form.uploadDir = common.AVATAR_UPLOAD_FOLDER_IMG; //设置上传目录
		form.keepExtensions = true; //保留后缀
		form.maxFieldsSize = 2 * 1024 * 1024; //文件大小
		form.parse(req, function(err, fields, files) { //解析
			if(err) {
				log.warn("form parse err:", err)
				res.redirect(303, '/404')
				return
			}
			models.CheckAcount(fields.user, function(result) {
				if(!result) {
					req.session.errorMsg = "帐号已存在!!"
					res.redirect("/404")
					return
				}

				if(!files.head.size) {
					//头像文件为空，用默认头像
					var path = common.DefaultHeadImg;
				} else {
					//头像文件不为空
					var extName = ''; //后缀名
					switch(files.head.type) {
						case 'image/pjpeg':
							extName = 'jpg';
							break;
						case 'image/jpeg':
							extName = 'jpg';
							break;
						case 'image/png':
							extName = 'png';
							break;
						case 'image/x-png':
							extName = 'png';
							break;
					}
					if(extName.length == 0) {
						res.locals.error = '只支持png和jpg格式图片';
						res.json({
							code: 1,
							errorMsg: '只支持png和jpg格式图片',
						});
						return;
					}
					var avatarName = Math.random() + '.' + extName; //新名字
					var newPath = form.uploadDir + avatarName; //新路径
					var path = common.ImgPath + avatarName; //入库路径

					fs.renameSync(files.head.path, newPath); //重命名
				}

				models.SignUpToDB(fields, path) //入库
				res.redirect('/index')
			})
		})
	});

	app.post('/upload_work', function(req, res) {
		if(!req.session.user) {
			res.redirect("/404")
			return
		}
		var form = new formidable.IncomingForm() //创建上传表单
		form.encoding = 'utf-8'; //设置编辑
		form.keepExtensions = true; //保留后缀
		form.uploadDir = common.AVATAR_UPLOAD_FOLDER; //设置上传目录
		form.maxFieldsSize = 2 * 1024 * 1024; //文件大小
		var user = req.session.user.userName;
		form.parse(req, function(err, fields, files) { //解析
			if(err) {
				log.warn("form parse err:", err)
				res.redirect(303, '/404')
				return
			}

			//保存到上传目录
			var filePath = saveFile(files.file, form, user)
			var imgPath = saveFileImg(files.fileImg, form, user);

			models.saveUploadToDB(fields, filePath, imgPath, user) //数据入库
			res.redirect('/index')
		})
	});

	app.post("/get_music_list", function(req, res) {
		var type = req.body.type,
			page = parseInt(req.body.page),
			key = req.body.searchKey
		models.getMusicList(type, page, key, function(ListMusic, pageInfo) {
			res.json({
				list: ListMusic,
				page_info: pageInfo
			})
		})
	})

	app.post("/getMusicInfo", function(req, res) {
		var id = parseInt(req.body.id)
		models.getMusicInfo(id, function(music) {
			models.getAuthorInfo(music.user, function(author) {
				models.getCommentList(id, function(commentList) {
					res.json({
						music: music,
						author: author,
						list: commentList,
						user: req.session.user ? req.session.user.userName : null
					})
				})
			})
		})
	})

	app.post("/musicZan", function(req, res) {
		if(!req.session.user) {
			res.json({
				status: 2
			})
			return
		}
		var id = parseInt(req.body.id)
		var user = req.session.user.userName
		models.checkMusicZan(id, user, function(result) {
			if(result) {
				//没点过此作品的赞
				models.musicZanDo(id, user)
				res.json({
					status: 0
				})
			} else {
				//已经点过赞了
				res.json({
					status: 1
				})
			}
		})
	})

	app.post('/addComment', function(req, res) {
		if(!req.session.user) {
			res.json({
				status: {
					code: 1
				}
			})
			return
		}
		var text = req.body.value
		var songID = parseInt(req.body.id)
		var time = common.GetTimeX()
		var user = req.session.user.userName
		models.addComment(text, time, user, songID, function(result) {
			//插入数据库成功
			if(result) {
				models.getCommentList(songID, function(list) {
					res.json({
						list: list,
						status: {
							code: 0
						}
					})
				})
			}
		})
	})

	//后台页面需先检查是否登录
	function checkLogin(req, res, next) {
		if(!req.session.user) {
			log.warn('session no exist, go to login')
			res.redirect('index')
		} else {
			next()
		}
	}

	//存mp3图片
	function saveFileImg(file, form, user) {
		var extName = ''; //后缀名
		switch(file.type) {
			case 'image/pjpeg':
				extName = '.jpg';
				break;
			case 'image/jpeg':
				extName = '.jpg';
				break;
			case 'image/png':
				extName = '.png';
				break;
			case 'image/x-png':
				extName = '.png';
				break;
		}
		var filePath = common.AVATAR_UPLOAD_FOLDER_IMG + user + "/"
		var avatarName = Math.random() + extName; //新名字
		var newPath = filePath + avatarName; //新路径
		//判断该帐号文件夹是否存在
		fs.exists(filePath, function(exists) {
			if(!exists) {
				fs.mkdir(filePath, function(err) {
					if(err) {
						log.warn('创建文件夹失败！', err)
						return;
					} else {
						log.info('创建文件夹成功！')
					}
				})
			} else {
				log.info('文件夹已经存在！')
			}
			//更改路径
			fs.renameSync(file.path, newPath);
		})
		return newPath
	}

	//存mp3文件
	function saveFile(file, form, user) {
		var filePath = common.AVATAR_UPLOAD_FOLDER_FILE + user + "/"
		var avatarName = Math.random() + '.mp3'; //新名字
		var newPath = filePath + avatarName; //新路径

		//判断该帐号文件夹是否存在
		fs.exists(filePath, function(exists) {
			if(!exists) {
				fs.mkdir(filePath, function(err) {
					if(err) {
						log.warn('创建文件夹失败！', err)
						return;
					} else {
						log.info('创建文件夹成功！')
					}
				})
			} else {
				log.info('文件夹已经存在！')
			}

			//更改路径
			fs.renameSync(file.path, newPath);
		});
		return newPath
	}
}