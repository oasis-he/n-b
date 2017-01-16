var path = require('path');
var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');
var config = require('config-lite');
var routes = require('./routes');
var pkg = require('./package');

var app = express();

//模版目录
app.set('views', path.join(__dirname, 'views'));
//模版引擎
app.set('view engine', 'ejs');

//设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')));
//session 中间件
app.use(session({
    name: config.session.key, //设置 cookie中id字段名称
    secret: config.session.secret, //设置secret来计算hash值并放入cookie并防止篡改
    cookie: {
        maxAge: config.session.maxAge, //过期设置
    },
    store: new MongoStore({
        url: config.mongodb
    })
}));

//flash中间层显示通知
app.use(flash());

//处理表单及文件上传
app.use(require('express-formidable')({
    uploadDir: path.join(__dirname, 'public/img'), //上传文件目录
    keepExtensions: true //保持后缀
}));

//设置模版全局变量
app.locals.blog = {
    title: pkg.name,
    description: pkg.description
};
//添加模版必须的三个变量
app.use(function (req, res, next) {
    res.locals.user = req.session.user;
    res.locals.success = req.flash('success').toString();
    res.locals.error = req.flash('error').toString();
    next();
});

//路由
routes(app);

//监听端口，启动程序
app.listen(config.port, function () {
    console.log(`${pkg.name} listening on port ${config.port}`);
})