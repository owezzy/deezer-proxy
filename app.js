const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const helmet = require("helmet");
const cors = require("cors");
const contentSecurityPolicy = require("helmet-csp");
const {createProxyMiddleware} = require("http-proxy-middleware");

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    contentSecurityPolicy({
        useDefaults: true,
        directives: {
            defaultSrc: ["'unsafe-inline'"],
            scriptSrc: ["'self'"],
        },
        reportOnly: false,
    })
);
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET , PUT , POST , DELETE" , "OPTIONS");
    res.header("Access-Control-Allow-Credentials", "true")
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Authorization, Origin, Accept, Accept-Encoding");

    next();
});
app.use(function(req, res, next) {
    res.setHeader("content-security-policy-report-only",
        "default-src 'unsafe-inline''safe'; script-src 'self' 'report-sample'; style-src 'unsafe-inline' 'report-sample'; base-uri 'self'; object-src 'none'; connect-src 'self'; font-src 'self'; img-src 'self'; manifest-src 'self';  media-src 'self'; worker-src 'none'; report-uri https://5e52f4c893efcda6a7d40460.endpoint.csper.io")
    next();
})
const corsOptions = {
    origin: "*",
    credentials: false,
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']

};
const proxyConfig =  {
    changeOrigin: true,
    target: 'https://api.deezer.com',
    pathRewrite: {
        [`^/api`]: '/'
    },
    secure: false,
};

const proxyCors = createProxyMiddleware('/',proxyConfig)

app.use(cors(corsOptions));
app.use(proxyCors);
app.use(helmet.contentSecurityPolicy.getDefaultDirectives)
// app.use('/', indexRouter);
// app.use('/users', usersRouter);

module.exports = app;
