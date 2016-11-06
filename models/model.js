/*****************model层****************/
var log = require('log-util'),
	cryptoJs = require('crypto-js'),
	md5 = require('crypto-js/md5'),

	Const = require('../const/const'),
	common = require('../common/common')

var pool = Const.pool //数据库连接池

var Model = function() {
	this.LoginResult = null;
	this.UserHead = null;
	this.PageInfo = function(page, total, count) {
		var obj = new Object;
		obj = {
			page: page,
			page_total: total,
			record: count,
			page_size: common.PageNum
		}
		return obj
	};
	var self = this;

	//登录
	this.SignIn = function(username, password, callback) {
		pool.getConnection(function(err, connection) {
			connection.query('select password,head from t_user where id=?', username, function(err, rows) {
				if(err) throw err;
				var md5_psw = cryptoJs.HmacMD5(password, 'Key').toString()
				if(rows == null || rows == '') {
					self.LoginResult = 1
				} else if(rows[0].password != md5_psw) {
					self.LoginResult = 2
				} else if(rows[0].password == md5_psw) {
					self.LoginResult = 0
					self.UserHead = rows[0].head
				}

				//释放连接池
				connection.release();

				if(typeof(callback) == 'function') {
					callback(self.LoginResult, self.UserHead);
				}
			})
		})
	};

	//注册
	this.SignUpToDB = function(fields, path) {
		//md5转密码
		var md5_psw = cryptoJs.HmacMD5(fields.password, 'Key').toString();
		var data = [fields.user, md5_psw, path, md5_psw, path];
		pool.getConnection(function(err, connection) {
			//存在该帐号即更新
			connection.query('insert into t_user set id=?,password=?,head=? on duplicate key update password=?,head=?', data, function(err, rows) {
				if(err) throw err;
				connection.release();
			})
		});
	};

	//检查帐号是否存在
	this.CheckAcount = function(user, callback) {
		pool.getConnection(function(err, connection) {
			connection.query('select count(1) as solution from t_user where id = ?', user, function(err, rows) {
				if(err) throw err;
				var result = true;
				if(rows[0].solution != 0) {
					result = false
				}
				connection.release();
				if(typeof(callback) == 'function') {
					callback(result);
				}
			})
		});

	}

	this.DeleteTech = function(id) {
		pool.getConnection(function(err, connection) {
			connection.query('delete from t_technology where id=?', id, function(err, rows) {
				if(err) throw err;
				connection.release();
			})
		})
	}

	//上传作品
	this.saveUploadToDB = function(fields, filePath, imgPath, user) {
		var timex = common.GetTimeX()
		pool.getConnection(function(err, connection) {
			var data = [fields.songName, fields.fileType, filePath, imgPath, fields.fileText, user, timex]
			connection.query('insert into t_work (songName,type,file,img,introduce,user,timex) values(?,?,?,?,?,?,?)', data, function(err, rows) {
				if(err) throw err;
				connection.release();
			})
		})
	}

	//获取列表
	this.getMusicList = function(type, page, key, callback) {
		pool.getConnection(function(err, connection) {
			self.getCount(type, key, function(count) {
				var pageObj = common.GetPageFromToObj(page, count)
				var pageTotal = Math.ceil(count / common.PageNum)
				if(key == "") {
					var query = "select id,songName,type,file,img,introduce,user,timex,zanNum from t_work where type =? order by zanNum desc limit ?,?"
				} else {
					var query = "select id,songName,type,file,img,introduce,user,timex,zanNum from t_work where type =? and (songName like '%" + key + "%' or user like '%" + key + "%') order by zanNum desc limit ?,?"
				}
				connection.query(query, [type, pageObj.from, pageObj.size], function(err, rows) {
					if(err) throw err;
					connection.release();

					if(typeof(callback) == 'function') {
						callback(rows, self.PageInfo(page, pageTotal, count));
					}
				})

			})
		})
	}

	this.getCount = function(type, key, callback) {
		pool.getConnection(function(err, connection) {
			var count, query;
			key == "" ? query = "select count(1) as solution from t_work where type=?" : query = "select count(1) as solution from t_work where type=? and (songName like '%" + key + "%' or user like '%" + key + "%') "
			connection.query(query, type, function(err, rows) {
				if(err) throw err;
				count = rows[0].solution;
				connection.release();

				if(typeof(callback) == 'function') {
					callback(count);
				}
			})
		})
	}

	this.getMusicInfo = function(id, callback) {
		pool.getConnection(function(err, connection) {
			connection.query('select id,songName,type,file,img,introduce,user,timex,zanNum from t_work where id = ?', id, function(err, rows) {
				if(err) throw err;
				connection.release();
				rows[0].timex = common.GetDate(rows[0].timex)

				if(typeof(callback) == 'function') {
					callback(rows[0]);
				}
			})
		})
	}

	this.getAuthorInfo = function(user, callback) {
		pool.getConnection(function(err, connection) {
			connection.query('select head as result from t_user where id = ? union all select count(1) from t_zan where user=? union all select count(1) from t_comment where user = ?', [user, user, user], function(err, rows) {
				if(err) throw err;
				connection.release();
				var o = {
					head: rows[0].result,
					zanNum: rows[1].result,
					commentNum: rows[2].result
				}

				if(typeof(callback) == 'function') {
					callback(o);
				}
			})
		})
	}

	this.checkMusicZan = function(id, user, callback) {
		pool.getConnection(function(err, connection) {
			connection.query('select count(1) as solution from t_zan where songID = ? and user=? ', [id, user], function(err, rows) {
				if(err) throw err;
				connection.release();
				var result;
				if(rows[0].solution == 0) {
					result = true
				} else {
					result = false
				}

				if(typeof(callback) == 'function') {
					callback(result);
				}
			})
		})
	}

	this.musicZanDo = function(id, user) {
		pool.getConnection(function(err, connection) {
			connection.query('insert into t_zan (songID,user) values(?,?)', [id, user], function(err, rows) {
				if(err) throw err;
				connection.release();
			})
		})
		pool.getConnection(function(err, connection) {
			connection.query('update t_work set zanNum=zanNum+1 where id=?', id, function(err, rows) {
				if(err) throw err;
				connection.release();
			})
		})
	}

	this.addComment = function(text, time, user, songId, callback) {
		pool.getConnection(function(err, connection) {
			var id = common.GetMsgId(songId)
			connection.query('insert into t_comment (msgID,comment,timex,user,songID) values(?,?,?,?,?)', [id, text, time, user, songId], function(err, rows) {
				if(err) throw err;
				connection.release();

				if(typeof(callback) == 'function') {
					callback(true);
				}
			})
		})
	}

	this.getCommentList = function(songID, callback) {
		pool.getConnection(function(err, connection) {
			connection.query('select t1.comment,t1.user,t1.timex,t2.head from t_comment t1 left join t_user t2 on t1.user = t2.id where t1.songID=? order by timex desc', songID, function(err, rows) {
				if(err) throw err;
				connection.release();

				for(var i = 0; i < rows.length; i++) {
					rows[i].timex = common.GetDate(rows[i].timex)
				}

				if(typeof(callback) == 'function') {
					callback(rows);
				}

			})
		})
	}

}

module.exports = new Model()