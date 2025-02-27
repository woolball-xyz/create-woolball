import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

const BASE_URL = "https://api.woolball.xyz/v1";
const API_KEY = "";
const HEADERS = { 'Authorization': `Bearer ${API_KEY}` };

// Middleware for parsing JSON and raw body
app.use(express.json());
// Accept various audio/video formats
app.use(express.raw({
    type: [
        'audio/*',    // All audio formats (mp3, wav, ogg, etc)
        'video/*',    // All video formats (mp4, webm, etc)
        'application/octet-stream' // Binary data
    ],
    limit: '450mb'
}));

// Routes
app.post('/speech-to-text', async (req, res) => {
    try {
        const { language = 'pt', returnTimestamps = false, webvtt = false, model = 'onnx-community/whisper-large-v3-turbo_timestamped', url } = 
            req.is('application/json') ? req.body : {};
            
        const requestUrl = `${BASE_URL}/speech-to-text?model=${encodeURIComponent(model)}&language=${language}&returnTimestamps=${returnTimestamps}&webvtt=${webvtt}`;

        let response;
        if (url) {
            response = await fetch(requestUrl, {
                method: 'POST',
                headers: { ...HEADERS, 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });
        } else if (req.is(['audio/*', 'video/*', 'application/octet-stream'])) {
            // Use the original content type from the request, or fallback to audio/mpeg
            const contentType = req.get('content-type') || 'audio/mpeg';
            response = await fetch(requestUrl, {
                method: 'POST',
                headers: { ...HEADERS, 'Content-Type': contentType },
                body: req.body
            });
        } else {
            return res.status(400).json({ error: 'No audio/video file or URL provided' });
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/speech-to-text-models', async (req, res) => {
    try {
        const response = await fetch(`${BASE_URL}/speech-to-text-models`, {
            headers: HEADERS
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
