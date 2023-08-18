let amqp = require('amqplib/callback_api');

amqp.connect('amqp://guest:guest@rabbitmq:5672/', function(error, connection) {
    if (error) {
        throw error;
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }

        let queue = "ToM2";

        channel.assertQueue(queue, {
            durable: false
        });

        console.log("M2 is waiting for messages in %s. To exit press CTRL+C", queue);

        channel.consume(queue, function(msg) {
            console.log("Received message from M1: %s", msg.content.toString());
        }, {
            noAck: true
        });

        queue = "ToM1";

        channel.assertQueue(queue, {
            durable: false
        });

        newMsg = msg.content.toString().toUpperCase(); // work here is just make message uppercase

        channel.sendToQueue(queue, newMsg);

        console.log(`Message "${newMsg}" to M1 sent`);
    });
});