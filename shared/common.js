var q = require("q");
module.exports = {
    sendEmail: function(mail){

        var d = new q.defer();

        var emailController = require("../controllers/global")("email");


        emailController.getOne({description:mail.name}).then(function(dataSet){

            var mailData = {
                "html": dataSet.html,
                "text": dataSet.text,
                "subject": dataSet.subject,
                "recipients": mail.recipients
            };

            var mailSender = require("mail");
            mailSender.send(mailData).then(function(){
                d.resolve(null);
            });
        });

        return d.promise;

    }



};
