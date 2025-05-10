var http = require('http');
var fs = require('fs');
var url = require('url');
var port = process.argv[2];
const qiniu = require('qiniu');

if (!port) {
    console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？');
    process.exit(1);
}

// 生成上传凭证的函数
function generateUploadToken() {
    var config = fs.readFileSync('./qiniu-key.json');
    config = JSON.parse(config);

    let { accessKey, secretKey } = config;
    var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    var options = {
        scope: 'music985211', // 替换为你的存储空间名称
    };
    var putPolicy = new qiniu.rs.PutPolicy(options);
    return putPolicy.uploadToken(mac);
}

var server = http.createServer(function (request, response) {
    var parsedUrl = url.parse(request.url, true);
    var path = parsedUrl.pathname;

    // 设置跨域头
    response.setHeader('Access-Control-Allow-Origin', '*'); // 允许所有来源访问
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');


    if (path === '/uptoken') {
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json;charset=utf-8');

        var uploadToken = generateUploadToken();
        response.write(JSON.stringify({ uptoken: uploadToken }));
        response.end();
    } else {
        response.statusCode = 404;
        response.setHeader('Content-Type', 'text/html;charset=utf-8');
        response.end('<h1>404 Not Found</h1>');
    }
});

// 监听局域网 IP 地址
server.listen(port, '192.168.229.1', function () {
    console.log(`服务已启动，监听地址：http://192.168.229.1:${port}`);
});

