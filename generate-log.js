var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var log4js = require('log4js');
var fs = require('fs');
var path = require('path');
var archiver = require('archiver');
var events = require('events');
var eventEmitter = new events.EventEmitter();

app.get('/', (req, res) => {
  res.send('Hello, API is ready!')
})


var userFilePath = path.join(__dirname, '\\Logs');
var ZipFolder = path.join(__dirname, "\\Zipped-Logs\\")
var zipPath;
var output;

eventEmitter.setMaxListeners(0);
app.get('/', function (req, res) {
    res.json("Hello")
})
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(bodyParser.json());

app.post('/log-info', function (req, res) {
    try {
        if(req.body.user === undefined || req.body.source === undefined || req.body.type === undefined){
            throw "reqest params missing";
        } else if (req.body.type !== "normal" && req.body.type !== "error") {
            throw "log type not supported"
        } else {
            var logFileDirectory = userFilePath + "\\" + req.body.user + "\\logs";
            var dateTime = new Date();
            var date = dateTime.toISOString().slice(0, 10);
            var logFileName = date + "_" + req.body.source + ".log";
            var logFileFullPath = logFileDirectory + "\\" + logFileName;
            var logType = req.body.type;
            if (!fs.existsSync(logFileDirectory)) {
                fs.mkdirSync(logFileDirectory);
            }
            log4js.configure({
                appenders: {
                    normal: {
                        type: 'file',
                        filename: logFileFullPath
                    },
                    error: { type: 'file', filename: logFileFullPath }
                },
                categories: {
                    default: {
                        appenders: [logType],
                        level: "info"
                    },
                    error: { appenders: [logType], level: "error" }
                }
            });
            var logger = log4js.getLogger(logType);
            if(logType === "normal"){
                logger.info(req.body.message);
            } else {
                logger.error(req.body.message);
            }
            res.json({
                "result": "success"
            });
        }
    } catch (err) {
        res.json({
            "result": err
        });
    }
});

app.post('/create-report', function (req, res) {
    var userName = req.body.user;
    var report = req.body.report;
    var contentHtml = req.body.content;
    var reportDirectory = userFilePath + "\\" + userName;
    var reportFullPath = reportDirectory + "\\" + report + ".html";
    if (!fs.existsSync(reportDirectory)) {
        fs.mkdirSync(reportDirectory);
    }
    fs.writeFile(reportFullPath, contentHtml, (err) => {
        if (err) throw err;
    });
    res.json({
        "result": "Report generation Successful"
    })
});

app.post('/read-report', function (req, res) {
    var userName = req.body.user;
    var report = req.body.report;
    var filePath = userFilePath + "\\" + userName + "\\" + report + '.html';
    fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data) {
        if (!err) {
            console.log('received data: ' + data);
            res.json(data);
        } else {
            console.log(err);
        }
    });
});

app.post('/zip-log', function (req, res) {

    var username = req.body.user;
    var userLogLocation = userFilePath + "//"+ username +"//logs";
    zipPath = ZipFolder + username + '.zip';
    output = fs.createWriteStream(zipPath);
    var archive = archiver('zip', {
        zlib: { level: 9 }
    });

    output.on('close', function () {
        res.sendFile(zipPath, function (err) {
            if (err) {
                console.log(err);
                res.status(err.status).end();
            }
            else {
                console.log('Sent:', zipPath);
            }
        });
    });

    output.on('end', function () {
        console.log('Data has been drained');
    });

    archive.on('warning', function (err) {
        if (err.code === 'ENOENT') {
            console.warn(err)
        } else {
            throw err;
        }
    });
    archive.on('error', function (err) {
        throw err;
    });
    archive.pipe(output);
    archive.directory(userLogLocation , username);
    archive.finalize();
});

app.get('/zip-log', function (req, res) {
    console.log(zipPath)
    res.download(zipPath, function (err) {
        if (err) {
            console.log(err)
        } else {
            console.log("download successful")
        }
    });
});


var server = app.listen(8000, function () {
    var port = server.address().port;
    console.log("Node js server listening to %s port", port);
});