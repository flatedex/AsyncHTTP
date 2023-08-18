const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const router = express.Router();
let amqp = require('amqplib/callback_api');

const PORT = 8050;
const HOST = "0.0.0.0";

const app = express();

app.post('/', (req, res) => {
    let name = req.body.Name;
    let message = req.body.Message;

    amqp.connect('amqp://guest:guest@rabbitmq:5672/', function(error, connection) {
        if(error) {
            throw error;
        }
        connection.createChannel(function(error1, channel){
            if(error1){
                throw error;
            }
            let queue = "toM2";
            let msg = message;

            channel.assertQueue(queue, {
                durable: false
            });

            channel.sendToQueue(queue, Buffer.from(msg));
            console.log(`Message by ${name} sent to M1`);
        });
    });
});

(async() =>{
    amqp.connect('amqp://guest:guest@rabbitmq:5672/', await function(error, connection) {
        if(error) {
            throw error;
        }
        connection.createChannel(function(error1, channel){
            if(error1){
                throw error;
            }
            let queue = "toM1";

            channel.assertQueue(queue, {
                durable: false
            });

            channel.consume(queue, function(msg) {
                console.log("Received message from M2: %s", msg.content.toString());
            }, {
                noAck: true
            });
        });
    });
});

app.listen(PORT, HOST, () => {
    console.log(`Service running on http://${HOST}:${PORT}`);
});