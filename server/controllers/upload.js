var fs = require('fs');
var jsonResponse = require('./response');
var thumb = require('node-thumbnail').thumb;
var PATH = require('path');
function upload(req, res){
    let file = req.files.file;
    let fileName = Date().split(' ').join('') + file.name;
    let path = PATH.join(__dirname, '../database/upload/' + req.body.name + '/' + fileName);
    fs.copyFile(file.path, path, (err) => {
        if (err) {
            console.error(err);
            res.send(jsonResponse(400, 'UPLOAD FAIL: ' + err));
        }
        else{
            res.send(jsonResponse(200, 'SUCCESSFULLY', 'http://13.251.24.65:5001/' + req.body.name + '/' + fileName));
        }
    });
}
module.exports.upload = (req, res) => {
    fs.access(PATH.join(__dirname, '../database/upload/'+req.body.name), (err) => {
        if (err) {
            console.log('*******ACCESS UPLOAD FAIL*****',err);
            fs.mkdirSync(PATH.join(__dirname, '../database/upload/' + req.body.name), function(err) {
                if(err) { 
                    console.log('*******MKDIR UPLOAD FAIL******',err);
                    res.send(jsonResponse(400, 'CREATE FOLDER FAIL: ' + err));
                }else {
                    console.log('--------MKDIR UPLOAD OK--------');
                    fs.mkdirSync(PATH.join(__dirname, '../database/upload/' + req.body.name + '/thumb'), function(err) {
                        if(err) { 
                            console.log('****MKDIR THUMB FAIL*******',err);
                            res.send(jsonResponse(400, 'CREATE FOLDER FAIL: ' + err));
                        }else {
                            console.log('-------------MKDIR THUMB OK--------');
                            upload(req, res);
                        }
                    });
                }
            });
        }
        else {
            upload(req, res);
            console.log('exist');
        }
    })
};
