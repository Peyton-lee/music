/***************公共文件****************/

var dateFormat = require('dateformat'),
	uuid = require('node-uuid'),
	unixTime = require('unix-time');

module.exports = {
	AVATAR_UPLOAD_FOLDER: 'upload/', //上次目录
	AVATAR_UPLOAD_FOLDER_IMG: 'upload/img/', //上传图片目录
	AVATAR_UPLOAD_FOLDER_FILE: 'upload/file/', //上传文件gen目录
	DefaultHeadImg: 'img/head-default.png', //默认头像
	ImgPath: 'static/img/',
	FilePath: 'static/img/',
	PageNum: 6,

	GetUUID: uuid.v4(), //获取唯一id
	GetTimeX: function() { //获取时间戳 格式为: 2016-06-06 12:12:12
		var now = new Date();
		var time = dateFormat(now, "yyyy-mm-dd h:MM:ss");
		return time;
	},
	GetDate: function(time) {
		return dateFormat(time, "yyyy-mm-dd")
	},
	IsEmpty: function(value) {
		return Object.keys(value).length === 0;
	},
	GetMsgId: function(id) {
		var timex = unixTime(new Date()) //時間戳
		return id + "_" + timex + "_" + uuid.v4()
	},
	GetPageFromToObj: function(page, count) { //page为页数,count为总数
		var obj = new Object;
		obj.from = this.PageNum * (page - 1)
		obj.to = count < (this.PageNum * page) ? count : this.PageNum * page
		obj.size=this.PageNum
		return obj
	}
}