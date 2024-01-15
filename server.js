const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Load user configuration
const usersConfig = JSON.parse(fs.readFileSync('usersConfig.json', 'utf8'));
const usersMap = new Map(usersConfig.users.map(user => [user.number + '@c.us', user.name]));

const client = new Client({
    authStrategy: new LocalAuth({ clientId: "dev_yt" })
});

client.initialize();

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', message => {
    if (usersMap.has(message.from)) {
        console.log(`Message from ${usersMap.get(message.from)}: ${message.body}`);

        // Prepare the data for the POST request
        const postData = {
            user_id: message.from, // Assuming the WhatsApp number is the user_id
            agent_id: "Youngtechy_AGI0", // This should be replaced with the actual agent_id if dynamic
            message: message.body,
            stream: false,
            role: "user"
        };

        // Make the POST request
        axios.post('http://localhost:3001/agents/message', postData, {
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json'
            }
        })
        .then(response => {
            console.log('Message forwarded:', response.data);
            // Check if there are messages in the response
            if (response.data.messages && response.data.messages.length > 0) {
                // Extract the internal_monologue text
                const internalMonologue = response.data.messages[0].internal_monologue.replace(/\n/g, '');
                console.log(internalMonologue)
                message.reply(internalMonologue)
            }
        })
        .catch(error => {
            console.error('Error forwarding message:', error);
        });
    } else {
        console.log(`Received message from an unknown number: ${message.from}`);
    }
});

app.use(express.json());

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
