const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS taaki frontend se requests block na ho
app.use(cors());

// Multer memory storage (file ko RAM me handle karega bina disk space ke)
const upload = multer({ storage: multer.memoryStorage() });

// Telegram Bot Details
const BOT_TOKEN = "9195320330:AAEdEHnCfDy1uZR8XtBEx6e1tRcwN9qFctY";
const ADMIN_CHAT_ID = "6166430036";

// Screenshot Upload Endpoint
app.post('/upload-screenshot', upload.single('screenshot'), async (req, res) => {
    try {
        const file = req.file;
        const { uid, email, timestamp } = req.body;

        if (!file) {
            return res.status(400).json({ success: false, message: "Screenshot file is missing!" });
        }

        if (!uid) {
            return res.status(400).json({ success: false, message: "User UID is missing!" });
        }

        console.log(`📥 Screenshot received from UID: ${uid} at ${timestamp}`);

        // Telegram Bot API URL for sendPhoto
        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;

        // Prepare multipart form data for Telegram
        const telegramFormData = new FormData();
        telegramFormData.append('chat_id', ADMIN_CHAT_ID);
        telegramFormData.append('photo', file.buffer, { filename: file.originalname || 'screenshot.png' });
        
        // Caption with metadata for 1GO panel cross-checking
        const caption = `📸 **NEW SMS TASK SCREENSHOT**\n\n🆔 **UID:** \`${uid}\`\n📧 **Email:** ${email || 'N/A'}\n⏰ **Upload Time:** ${timestamp}`;
        telegramFormData.append('caption', caption);
        telegramFormData.append('parse_mode', 'Markdown');

        // Send photo to Telegram
        await axios.post(telegramUrl, telegramFormData, {
            headers: {
                ...telegramFormData.getHeaders()
            }
        });

        console.log(`✅ Screenshot successfully forwarded to Telegram for UID: ${uid}`);
        return res.status(200).json({ success: true, message: "Screenshot uploaded and forwarded successfully!" });

    } codeCatch(err) {
        // Fallback error catch
        console.error("❌ Error forwarding screenshot to Telegram:", err.response?.data || err.message);
        return res.status(500).json({ success: false, message: "Internal server error while forwarding to Telegram." });
    }
});

// Basic health check route
app.get('/', (req, res) => {
    res.send('Task Ultra Backend is running live successfully!');
});

// Server Listen
app.listen(PORT, () => {
    console.log(`🚀 Task Ultra Backend Server is running on port ${PORT}`);
});
