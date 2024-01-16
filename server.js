const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();
const crypto = require('crypto');

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
        console.log(`Message from ${usersMap.get(message.from)}: ${JSON.stringify(message)}`);

        // Prepare the data for the POST request
        // const postData = {
        //     user_id: message.from, // Assuming the WhatsApp number is the user_id
        //     agent_id: "YoungtechyAGI_X", // This should be replaced with the actual agent_id if dynamic
        //     message: message.body,
        //     stream: false,
        //     role: "user"
        // };

        // Make the POST request
        
        const doneReply = sendQuickReply(message);
        if(doneReply){
            console.log('Message forwarded');
            return;
        }
        message.react('🌀')
        // client.sendMessage(message.from, '...').then((response) => {
        //     console.log(JSON.stringify(response))
        //     loaderMsg = response
        // });
        const postData = createPostData(message);
        console.log(postData)
        axios.post('https://yt-agi.ryansaleh.com/api/agents/message', postData, {
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
                // const internalMonologue = response.data.messages[0].internal_monologue.replace(/SPECIAL_EXPRESSION/g, 'WHATSAPP_FRIENDLY_REPLACEMENT');
                console.log(internalMonologue)
                message.reply(internalMonologue)
                message.react('✅')
            }
        })
        .catch(error => {
            message.react('⛔️')
            message.reply('💤');
            console.error('Error forwarding message:', error.response.data);
        });
    } else {
        console.log(`Received message from an unknown number: ${message.from}`);
    }
});

function sendQuickReply(message) {
    // Check if the message contains GIF, media, or document
    if (message.type === 'gif' || message.hasMedia || message.type === 'document') {
        // Reply with a simple message including emojis
        console.log('Message contains GIF, media, or document');
        message.react('🚫')
        const replyMessage = "🚫 Sorry, attachments aren't supported! 🙁";
        message.reply(replyMessage);
        return true;
    }else{
        return false;
    }
}

function createPostData(message) {
    let messageContent = message.body; // Default to the current message body

    // Check if the message includes a quoted message
    if (message.hasQuotedMsg) {
        // Access the quoted message body from the '_data' field
        const quotedMessageBody = message._data && message._data.quotedMsg ? message._data.quotedMsg.body : "";
        
        // Concatenate the quoted message body and the current message body, if quoted message body exists
        if (quotedMessageBody) {
            messageContent = messageContent + " " + quotedMessageBody +"!";
        }
    }
    // Construct the postData object
    const postData = {
        user_id: "null", // Assuming the WhatsApp number is the user_id
        agent_id: "YoungtechyAGI_X", // Replace with the actual agent_id if dynamic
        message: messageContent.toString(),
        stream: false,
        role: "user"
    };

    return postData;
}

function generateUniqueIdFromPhoneNumber(phoneNumber) {
    return crypto.createHash('sha256').update(phoneNumber).digest('hex');
}

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

app.get('/', (req, res) => {
    res.send('Server is running!');
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
