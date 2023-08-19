let amqp = require('amqplib');

(async () => {
    const connection = await amqp.connect('amqp://guest:guest@rabbitmq:5672/');
    console.log('M2 is connected to RabbitMQ');

    const channel = await connection.createChannel();

    let queue = "ToM2";

    await channel.assertQueue(queue, {
        durable: true
    });

    console.log("M2 is waiting for messages in %s. To exit press CTRL+C", queue);

    let newMsg = "";

    const callback = (msg) => {
        // work here is just make message uppercase
        console.log(msg)
        console.log("Received message from M1: %s", msg.content.toString());
        newMsg = msg.content.toString().toUpperCase();
        queue = "toM1";
        channel.assertQueue(queue, {
          durable: true
        });
        channel.sendToQueue(queue, Buffer.from(newMsg));
        console.log(`Message "${newMsg}" to M1 sent`);
    }
    await channel.consume(queue, callback, {
        noAck: true
    });
})();