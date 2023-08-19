const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const router = express.Router();
let amqp = require('amqplib');

const PORT = 8050;
const HOST = "0.0.0.0";

const app = express();

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.render("index");
});

app.post('/', async (req, res) => {
    let name = JSON.stringify(req.body.Name);
    let message = JSON.stringify(req.body.Message);

    console.log(name + " " + message);

    const connection = await amqp.connect('amqp://guest:guest@rabbitmq:5672/');
    const channel = await connection.createChannel();
    console.log('M1 is connected to RabbitMQ');

    const queue = "ToM2";
    let msg = message;

    await channel.assertQueue(queue, {
           durable: true
    });

    channel.sendToQueue(queue, Buffer.from(msg));
    console.log(`Message by ${name} sent in "${queue}"`);
});

(async() => {
    const connection = await amqp.connect('amqp://guest:guest@rabbitmq:5672/');

    const channel = await connection.createChannel();

    let queue = "toM1";
    await channel.assertQueue(queue, {
           durable: true
    });

    await channel.consume(queue, function(msg) {
        console.log("Received message from M2: %s", msg.content.toString());
    }, {
        noAck: true
    });
})();

app.listen(PORT, HOST, async () => {
    console.log(`Service running on http://${HOST}:${PORT}`);
});