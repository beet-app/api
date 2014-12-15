var q = require("q");
var validator = require('validator');
module.exports = {
    sendMail: function(mail){

        var emailController = require("../controllers/email");


        emailController.getOne(mail.name).then(function(dataSet){

            if (mail.params!==undefined){
                for (var param in mail.params){
                    dataSet.html = dataSet.html.replace("["+param+"]", mail.params[param]);
                    dataSet.text = dataSet.html.replace("["+param+"]", mail.params[param]);
                }
            }

            if (typeof(mail.recipients)=="string"){
                mail.recipients = [{
                    "email": mail.recipients,
                    "name": mail.recipients,
                    "type": "to"
                }];
            }
            var mailData = {
                "html": dataSet.html,
                "text": dataSet.text,
                "subject": dataSet.subject,
                "recipients": mail.recipients
            };

            console.log(mailData);

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
    },
    getResultObj: function(obj){
      var obj = {data:obj};
      return obj;
    },
    turnToArray:function(obj){
      if (!validator.isArray(obj)){
        obj = [obj];
      }
      return obj;
    },
    isObject:function(obj){
      return validator.isObject(obj);
    }

};
