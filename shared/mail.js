
module.exports = {
    send: function(mailData){
        var mandrill = require('mandrill-api/mandrill');

        var mailConfig = require('../config/mail');


        var message = {
            "html": mailData.html,
            "text": mailData.text,
            "subject": mailData.subject,
            "from_email": mailConfig.sender_mail,
            "from_name": mailConfig.sender_name,
            "to": mailData.recipients

        };

        var mailSender = new mandrill.Mandrill(mailConfig.key);
        mailSender.messages.send({"message": message, "async": true, "ip_pool": "asdsa"}, function(result) {
            console.log('Mandrill API called.');
            console.log(result);
        }, function(e) {
            console.error('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        });
    }



};
