const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all requests
app.use(cors());
app.use(express.json());

const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.API_KEY;

async function runChat(userInput) {
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const generationConfig = {
            temperature: 0.9,
            topK: 1,
            topP: 1,
            maxOutputTokens: 1000,
        };

        const safetySettings = [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            // Additional safety settings can be added here.
        ];

        const chat = model.startChat({
            generationConfig,
            safetySettings,
            history: [
                {
                    role: "user",
                    parts: [{ text: "You are Clard, a friendly knowledgeable information provider..." }]
                },
                {
                    role: "model",
                    parts: [{ text: "Hey there, space explorer! 👋 Welcome to Micrate..." }]
                },
                {
                    role: "user",
                    parts: [{ text: "Hi, I wanted to know why the ISS was even sent to space..." }]
                },
                {
                    role: "model",
                    parts: [{ text: "Great question! The International Space Station (ISS)..." }]
                },
            ],
        });

        const result = await chat.sendMessage(userInput);
        return result.response.text();
    } catch (error) {
        console.error('Error during AI chat processing:', error);
        throw new Error('Error generating AI response');
    }
}

// Serve static files (HTML, etc.)
app.use(express.static(__dirname));

// API endpoint to handle chat messages
app.post('/chat', async (req, res) => {
    try {
        const userInput = req.body?.userInput;
        if (!userInput) {
            return res.status(400).json({ error: 'Invalid request: Missing user input.' });
        }

        const responseText = await runChat(userInput);
        res.status(200).json({ response: responseText });
    } catch (error) {
        console.error('Error in /chat route:', error);
        res.status(500).json({ error: 'Internal Server Error. Please try again.' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});