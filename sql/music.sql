/*
Navicat MySQL Data Transfer

Source Server         : localhost_3306
Source Server Version : 50540
Source Host           : localhost:3306
Source Database       : music

Target Server Type    : MYSQL
Target Server Version : 50540
File Encoding         : 65001

Date: 2016-10-28 09:14:17
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `t_comment`
-- ----------------------------
DROP TABLE IF EXISTS `t_comment`;
CREATE TABLE `t_comment` (
  `msgID` varchar(255) NOT NULL,
  `comment` varchar(255) NOT NULL,
  `user` varchar(255) NOT NULL,
  `timex` datetime NOT NULL,
  `songID` int(11) NOT NULL,
  PRIMARY KEY (`msgID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_comment
-- ----------------------------
INSERT INTO `t_comment` VALUES ('6_1477451782', '非常好听', 'peyton', '2016-10-26 11:16:22', '6');
INSERT INTO `t_comment` VALUES ('6_1477451854', '122', 'peyton', '2016-10-26 11:17:34', '6');
INSERT INTO `t_comment` VALUES ('6_1477451928', '44', 'peyton', '2016-10-26 11:18:48', '6');
INSERT INTO `t_comment` VALUES ('6_1477452037', '7', 'peyton', '2016-10-26 11:20:37', '6');
INSERT INTO `t_comment` VALUES ('6_1477453119', '不错不错，很吊很吊，牛逼牛逼，大师大师', 'peyton', '2016-10-26 11:38:39', '6');

-- ----------------------------
-- Table structure for `t_user`
-- ----------------------------
DROP TABLE IF EXISTS `t_user`;
CREATE TABLE `t_user` (
  `id` varchar(255) NOT NULL DEFAULT '',
  `password` varchar(255) NOT NULL,
  `head` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of t_user
-- ----------------------------
INSERT INTO `t_user` VALUES ('peyton', 'a68dc57018cd228e5d1d338cc438d37d', 'static/img/0.4354029526002705.jpg');

-- ----------------------------
-- Table structure for `t_work`
-- ----------------------------
DROP TABLE IF EXISTS `t_work`;
CREATE TABLE `t_work` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `songName` varchar(255) CHARACTER SET utf8 NOT NULL,
  `type` varchar(255) CHARACTER SET utf8 NOT NULL,
  `file` varchar(255) CHARACTER SET utf8 NOT NULL,
  `img` varchar(255) CHARACTER SET utf8 NOT NULL,
  `introduce` text CHARACTER SET utf8 NOT NULL,
  `user` varchar(255) CHARACTER SET utf8 NOT NULL,
  `timex` datetime NOT NULL,
  `zanNum` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of t_work
-- ----------------------------
INSERT INTO `t_work` VALUES ('6', '追梦赤子心', 'Cover', 'upload/file/peyton/0.2739679601509124.mp3', 'upload/img/peyton/0.5518551280256361.jpg', '巴拉巴拉巴拉阿巴拉拉霸爱啦啦巴拉巴拉巴拉。', 'peyton', '2016-10-25 02:51:54', '1');

-- ----------------------------
-- Table structure for `t_zan`
-- ----------------------------
DROP TABLE IF EXISTS `t_zan`;
CREATE TABLE `t_zan` (
  `songID` int(11) NOT NULL,
  `user` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_zan
-- ----------------------------
INSERT INTO `t_zan` VALUES ('6', 'peyton');
