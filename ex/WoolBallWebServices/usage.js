import { promises as fs } from 'fs';
import { WoolBallSpeechToTextService } from './woolball-speech-to-text.js';

// Initialize the speech-to-text service
const service = new WoolBallSpeechToTextService();

try {
    // Example 1: Basic speech-to-text extraction from URL
    const result1 = await service.transcribeFromUrl(
        "https://example.com/audio-pt.mp3"
    );
    console.log(`Basic transcription: ${result1.text}`);

    // Example 2: Speech-to-text extraction from URL with timestamps (English audio)
    const result2 = await service.transcribeFromUrlWithTimestamps(
        "https://example.com/audio-en.wav",
        "en"
    );
    console.log("\nTranscription with timestamps:");
    for (const chunk of result2.chunks) {
        console.log(`${chunk.start.toFixed(2)}s -> ${chunk.end.toFixed(2)}s: ${chunk.text}`);
    }

    // Example 3: Speech-to-text extraction from URL with WebVTT subtitles (Spanish audio)
    const result3 = await service.transcribeFromUrlWithWebVtt(
        "https://example.com/audio-es.mp4",
        "es"
    );
    console.log(`\nWebVTT Subtitles:\n${result3.webvtt}`);

    // Example 4: Speech-to-text extraction from local file
    const audioData = await fs.readFile("audio.mp3");
    const result4 = await service.transcribeFromFileWithWebVtt(
        audioData,
        "pt"
    );
    
    // Save the subtitles to a .vtt file
    await fs.writeFile("subtitles.vtt", result4.webvtt);
    console.log("\nSubtitles saved to 'subtitles.vtt'");

    // Example 5: Advanced usage with custom options
    const result5 = await service.transcribeFromUrl(
        "https://example.com/audio.mp3",
        {
            model: "onnx-community/whisper-large-v3-turbo_timestamped",
            language: "pt",
            returnTimestamps: true,
            webvtt: true
        }
    );
} catch (error) {
    console.error("Error:", error.message);
}
