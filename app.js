/*******************入口文件********************/
var express = require('express'), //主框架
    routes = require('./routes/route'), //路由
    session = require('express-session'), //session
    common = require('./common/common'), //配置参数
    ejs = require('ejs'), //模板
    log = require('log-util'), //日志
    bodyParser = require('body-parser'), //解析请求
    cookieParser = require('cookie-parser'); //解析cookie

var app = express(); //主程序

/*-----------------------------------------------------------*/

//设置端口
app.set('port', process.env.PORT || 3000);

//session开启
app.use(session({
    secret: 'This is my blog',
    cookie: {
        maxAge: 10000000
    },
    //store: new MySQlSessionStore(),
    resave: false,
    saveUninitialized: true
}))


//解析参数
app.use(bodyParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

/*-----------------------------------------------------------*/

//路由
routes(app)

/*-----------------------------------------------------------*/

//设置静态模板
app.use(express.static('views'))
app.use('/upload',express.static(__dirname+'/upload'))
app.use('/static', express.static(__dirname + '/upload'));  //上传文件目录


//设置模板文件后缀为.html
app.engine('.html', ejs.__express);
app.set('view engine', 'html');



//服务监听端口及回调
app.listen(app.get('port'), function () {
    log.info('server listening on port:', app.get('port'));
})