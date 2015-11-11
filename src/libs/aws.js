var common = require('../libs/common');
var fs = require('fs'),
    S3FS = require('s3fs'),
    s3fsImpl = new S3FS(process.env.S3_BUCKET || 'beet-movies',{
        accessKeyId: process.env.AWS_ACCESS_KEY || 'AKIAIENYDQRK4BZWJLJQ',
        secretAccessKey: process.env.AWS_SECRET_KEY || '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'
    });

var q = require('q');

var amazon = {
    putObject: function (file) {
        var d = new q.defer();

        var stream = fs.createReadStream(file.path);

        s3fsImpl.writeFile(file.name, stream).then(function (result) {
            fs.unlink(file.path, function (err) {
                if (err) {
                    d.resolve(common.getErrorObj(err));
                }
                else {
                    d.resolve(common.getResultObj(result));
                }
            });
        });

        return d.promise;
    }
};

module.exports = amazon;