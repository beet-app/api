
module.exports = {
    send: function(mailData){
        var mandrill = require('mandrill-api/mandrill');

        var mailConfig = require('../../config/mail');



        // the sender email will look like 'John Doe <notification@sampleapp.com>'
        var fromEmail = 'support@beet.cc';

        // by forming this address this way, when users reply, they will see "Reply to Comment"
        // and not necessesarily the weird looking email address (that, of course, will depend
        // on the user's email client)
        var replyToEmail = "Reply to Comment <support@replies.sampleapp.com>";

        // it's always a good idea to add a tag to similar messages, that will let you filter
        // them out easily in mandrill's admin portal
        var tags = [ "sample-messages" ];



        var message = {
            "html": "<p>Estao tentando entrar na sua conta, guerreiro !</p>",
            "text": "Estao tentando entrar na sua conta, guerreiro master !",
            "subject": "Falha no Login",
            "from_email": mailConfig.sender_email,
            "from_name": mailConfig.sender_name,
            "to": recipients,

        };

        var mailSender = new mandrill.Mandrill(mailConfig.key);
        mandrill_client.messages.send({"message": message, "async": true, "ip_pool": "asdsa"}, function(result) {
            console.log('Mandrill API called.');
            console.log(result);
        }, function(e) {
            console.error('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        });
    }



};
