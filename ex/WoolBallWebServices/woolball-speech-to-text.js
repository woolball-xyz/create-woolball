class TranscriptionOptions {
    constructor() {
        this.model = "onnx-community/whisper-large-v3-turbo_timestamped";
        this.language = "pt";
        this.returnTimestamps = false;
        this.webvtt = false;
    }
}

class WoolBallSpeechToTextService {
    constructor() {
        this.baseUrl = "https://api.woolball.xyz/v1";
        this.headers = { 'Authorization': `Bearer sf` };
    }

    async transcribeFromUrl(audioUrl, options = new TranscriptionOptions()) {
        const params = new URLSearchParams({
            url: audioUrl,
            model: options.model,
            language: options.language,
            returnTimestamps: options.returnTimestamps.toString(),
            webvtt: options.webvtt.toString()
        });
        const requestUrl = `${this.baseUrl}/speech-to-text?${params}`;
        
        const response = await fetch(requestUrl, {
            headers: this.headers
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    }

    async transcribeFromUrlWithTimestamps(audioUrl, language = "pt") {
        return this.transcribeFromUrl(audioUrl, {
            ...new TranscriptionOptions(),
            language,
            returnTimestamps: true
        });
    }

    async transcribeFromUrlWithWebVtt(audioUrl, language = "pt") {
        return this.transcribeFromUrl(audioUrl, {
            ...new TranscriptionOptions(),
            language,
            returnTimestamps: true,
            webvtt: true
        });
    }

    async transcribeFromFile(audioData, options = new TranscriptionOptions()) {
        const params = new URLSearchParams({
            model: options.model,
            language: options.language,
            returnTimestamps: options.returnTimestamps.toString(),
            webvtt: options.webvtt.toString()
        });
        const requestUrl = `${this.baseUrl}/speech-to-text?${params}`;
        
        const response = await fetch(requestUrl, {
            method: 'POST',
            headers: { ...this.headers, 'Content-Type': 'audio/mpeg' },
            body: audioData
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    }

    async transcribeFromFileWithTimestamps(audioData, language = "pt") {
        return this.transcribeFromFile(audioData, {
            ...new TranscriptionOptions(),
            language,
            returnTimestamps: true
        });
    }

    async transcribeFromFileWithWebVtt(audioData, language = "pt") {
        return this.transcribeFromFile(audioData, {
            ...new TranscriptionOptions(),
            language,
            returnTimestamps: true,
            webvtt: true
        });
    }

    async getAvailableModels() {
        const response = await fetch(`${this.baseUrl}/speech-to-text-models`, {
            headers: this.headers
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    }
}

export { TranscriptionOptions, WoolBallSpeechToTextService };
