const express = require('express');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const fs = require('fs');

const app = express();
const client = new Client();

// Load user configuration
const usersConfig = JSON.parse(fs.readFileSync('usersConfig.json', 'utf8'));
const usersMap = new Map(usersConfig.users.map(user => [user.number + '@c.us', user.name]));

app.use(express.json());

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', message => {
    if (usersMap.has(message.from)) {
        console.log(`Message from ${usersMap.get(message.from)}: ${message.body}`);
        // Replace 'https://your-service-endpoint.com/api/messages' with your actual service endpoint
        axios.post('https://your-service-endpoint.com/api/messages', {
            name: usersMap.get(message.from),
            from: message.from,
            body: message.body
        })
        .then(response => {
            console.log('Message forwarded:', response.data);
        })
        .catch(error => {
            console.error('Error forwarding message:', error);
        });
    } else {
        console.log(`Received message from an unknown number: ${message.from}`);
    }
});

client.initialize();

app.post('/send-message', (req, res) => {
    const number = req.body.number;
    const message = req.body.message;

    client.sendMessage(number + '@c.us', message)
        .then(response => {
            res.status(200).json({status: 'success', response: response});
        })
        .catch(err => {
            res.status(500).json({status: 'error', message: err.toString()});
        });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
