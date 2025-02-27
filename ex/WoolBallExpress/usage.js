import { promises as fs } from 'fs';

// Exemplo 1: Transcrição básica de URL
async function example1() {
    const response = await fetch('http://localhost:3000/speech-to-text?url=https://example.com/audio-pt.mp3&language=pt');
    const result = await response.json();
    console.log(`Transcrição básica: ${result.text}`);
}

// Exemplo 2: Transcrição de URL com timestamps (áudio em inglês)
async function example2() {
    const response = await fetch('http://localhost:3000/speech-to-text?url=https://example.com/audio-en.wav&language=en&returnTimestamps=true');
    const result = await response.json();
    console.log('\nTranscrição com timestamps:');
    for (const chunk of result.chunks) {
        console.log(`${chunk.start.toFixed(2)}s -> ${chunk.end.toFixed(2)}s: ${chunk.text}`);
    }
}

// Exemplo 3: Transcrição de URL com legendas WebVTT (áudio em espanhol)
async function example3() {
    const response = await fetch('http://localhost:3000/speech-to-text?url=https://example.com/audio-es.mp4&language=es&returnTimestamps=true&webvtt=true');
    const result = await response.json();
    console.log(`\nLegendas WebVTT:\n${result.webvtt}`);
}

// Exemplo 4: Transcrição de arquivo local
async function example4() {
    const audioFile = await fs.readFile('audio.mp3');
    const response = await fetch('http://localhost:3000/speech-to-text?language=pt&returnTimestamps=true&webvtt=true', {
        method: 'POST',
        headers: { 'Content-Type': 'audio/mpeg' },
        body: audioFile
    });
    const result = await response.json();
    console.log(`\nTranscrição do arquivo:\n${result.text}`);
}

// Exemplo 5: Uso avançado com opções personalizadas
async function example5() {
    const response = await fetch('http://localhost:3000/speech-to-text?url=https://example.com/audio.mp3&model=onnx-community/whisper-large-v3-turbo_timestamped&language=pt&returnTimestamps=true&webvtt=true');
    const result = await response.json();
    console.log(`\nTranscrição avançada:\n${result.text}`);
}

