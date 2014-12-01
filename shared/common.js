var q = require("q");
module.exports = {
    sendMail: function(mail){

        //var emailController = require("../controllers/global")("email");


        emailController.getOne({description:mail.name}).then(function(dataSet){

            if (dataSet.params!==undefined){
                for (var param in dataSet.params){
                    dataSet.html = dataSet.html.replace("["+param+"]", dataSet.params[param]);
                    dataSet.text = dataSet.text.replace("["+param+"]", dataSet.params[param]);
                }
            }

            var mailData = {
                "html": dataSet.html,
                "text": dataSet.text,
                "subject": dataSet.subject,
                "recipients": mail.recipients
            };



            var mailSender = require("./mail");
            mailSender.send(mailData);
        });
    },
    generateUUID: function(){
        var d = new q.defer();

        var uuid = require('node-uuid');
        d.resolve(uuid.v1());

        return d.promise;
    },
    getErrorObj: function(strError, code){
        var obj = {error:{}};
        if (!strError){
            strError = "system_error";
        }
        obj.error.description = strError;
        if (!code){
            code = 401;
        }
        obj.error.code = code;
        return obj;
    }



};
