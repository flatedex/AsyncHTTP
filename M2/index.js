let amqp = require('amqplib/callback_api');

(async () => {
    const connection = await amqp.connect('amqp://guest:guest@rabbitmq:5672');
    console.log('M2 is connected to RabbitMQ');

    const channel = await connection.createChannel();

    let queue = "ToM2";

    await channel.assertQueue(queue, {
        durable: false
    });

    console.log("M2 is waiting for messages in %s. To exit press CTRL+C", queue);

    let newMsg = "";

    await channel.consume(queue, function(msg) {
        console.log("Received message from M1: %s", msg.content.toString());
        newMsg = msg.content.toString().toUpperCase();
    }, {
        noAck: true
    });

    queue = "ToM1";

    await channel.assertQueue(queue, {
        durable: false
    });

     // work here is just make message uppercase

    await channel.sendToQueue(queue, newMsg);

    console.log(`Message "${newMsg}" to M1 sent`);
})();