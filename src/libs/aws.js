// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');

module.exports = {
    createBucket: function(data){
        /**
         * Don't hard-code your credentials!
         * Export the following environment variables instead:
         *
         * export AWS_ACCESS_KEY_ID='AKID'
         * export AWS_SECRET_ACCESS_KEY='SECRET'
         */

        // Set your region for future requests.
        AWS.config.region = 'us-west-2';

        // Create a bucket using bound parameters and put something in it.
        // Make sure to change the bucket name from "myBucket" to something unique.
        var s3bucket = new AWS.S3({params: {Bucket: 'myBucket'}});
        s3bucket.createBucket(function() {
            var params = {Key: 'myKey', Body: 'Hello!'};
            s3bucket.upload(params, function(err, data) {
                if (err) {
                    console.log("Error uploading data: ", err);
                } else {
                    console.log("Successfully uploaded data to myBucket/myKey");
                }
            });
        });
    },
    listAllBuckets: function(){
        var s3 = new AWS.S3();
        s3.listBuckets(function(err, data) {
            if (err) { console.log("Error:", err); }
            else {
                for (var index in data.Buckets) {
                    var bucket = data.Buckets[index];
                    console.log("Bucket: ", bucket.Name, ' : ', bucket.CreationDate);
                }
            }
        });
    },
    putObject: function(bucketName){

    },
    getObject: function(bucketName){

    }

};

