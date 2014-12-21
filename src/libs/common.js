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
    getSuccessObj: function(){
        return "OK";
    },
    compareHash: function(uncrypted, crypted){
        var bcrypt = require('bcrypt-nodejs');
        return (bcrypt.compareSync(uncrypted, crypted));
    },
    generateHash: function(value){
        var bcrypt = require('bcrypt-nodejs');
        return bcrypt.hashSync(value, bcrypt.genSaltSync(8), null);
    },
    inArray : function(value, arr) {
        for(var i = 0; i < arr.length; i++) {
            if(arr[i] == value) return true;
        }
        return false;
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
    isError:function(obj){
        if (obj!=null){
            if (!this.isEmpty(obj.error)){
                return true;
            }
        }
        return false;
    },
    isEmpty:function(obj){
        return (obj==undefined || obj==null || obj=="");
    },
    isEmail:function(str){
        var validator = require('validator');
        return validator.isEmail(str);
    },
    getFile:function(file){
        var fs = require('fs');
        if (fs.existsSync(file.replace("..","src")+".js")) {
          return require(file);
        }else{
          return null;
        }
    },
    getSchema:function(file){
        return this.getFile("../schemas/"+file+"_schema");
    },
    getController:function(file){

        var repository = this.getRepository(file);
        var controller = this.getFile("../controllers/"+file+"_controller");
        var globalController = this.getFile("../controllers/global_controller")(file, repository);
        if (this.isEmpty(controller)){
            controller = globalController;
        }else{
            controller = this.attach(controller(repository), globalController);
        }
        return controller;

    },
    getRepository:function(file){
        var repository = this.getFile("../repositories/"+file+"_repository");
        var globalRepository = this.getFile("../repositories/global_repository")(file);

        if (this.isEmpty(repository)){
            repository = globalRepository;
        }else{
            repository = this.attach(repository, globalRepository);
        }
        return repository;
    },
    getConfig:function(file){
        return this.getFile("../configs/"+file+"_config");
    },
    getLib:function(file){
        return this.getFile("../libs/"+file);
    },
    attach:function(mainObj, secondaryObj){
        for (var key in mainObj){
            secondaryObj[key] = mainObj[key];
        }
        return secondaryObj;
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
    },
    log:function(log){
        console.log("-------------------------------");
        console.log("--------------log--------------");
        console.log(log);
        console.log("-------------------------------");
    },
    logQuery:function(query, result){
        console.log("-------------------------------");
        console.log("-------------query-------------");
        console.log(query);
        if (result){
            console.log("-----------result------------");
            console.log(result);
        }
        console.log("-------------------------------");
    }
};

