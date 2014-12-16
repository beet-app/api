var q = require("q");
var validator = require('validator');
module.exports = {
    sendMail: function(mail){

        var emailController = require("../controllers/email_controller");


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
        if (!this.isArray(obj)){
            obj = [obj];
        }
        return obj;
    },
    isObject:function(obj){
        return validator.isObject(obj);
    },
    isArray:function(obj){
        if (typeof(obj)=="object"){
            if (obj.length!=undefined){
                return true;
            }
        }
        return false;
    },
    isEmpty:function(obj){
        return (obj==undefined || obj==null || obj=="");
    },
    getFile:function(file){
        if (require(file)){
            return require(file);
        }else{
            return null;
        }
    },
    getSchema:function(file){
        return this.getFile("../schemas/"+file+"_schema");
    },
    getController:function(file){
        return this.getFile("../controllers/"+file+"_controller");
    },
    getRepository:function(file){
        return this.getFile("../repositories/"+file+"_repository");
    },
    getConfig:function(file){
        return this.getFile("../configs/"+file+"_config");
    },
    getLib:function(file){
        return this.getFile("../libs/"+file);
    },
    logError:function(error, obj){
        console.log("-------------------------------");
        console.log("-------------error-------------");
        console.log(error);
        if (obj){
            console.log("---------rel object----------");
            console.log(obj);
        }
        console.log("-------------------------------");
    }
};

