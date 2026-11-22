/**
 * Client-side PCM WAV Encoder for Synapse-Voice.
 * Converts raw Float32 audio samples from Web Audio API into a standard
 * 16-bit linear PCM uncompressed mono WAV Blob.
 * 
 * Ensures 100% native compatibility with Praat (parselmouth) and libsndfile
 * without requiring server-side ffmpeg or transcoding binaries.
 */

export function encodeWAV(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // 1. "RIFF" chunk descriptor
  writeString(view, 0, 'RIFF');
  // ChunkSize: 36 + SubChunk2Size
  view.setUint32(4, 36 + samples.length * 2, true);
  // Format: "WAVE"
  writeString(view, 8, 'WAVE');

  // 2. "fmt " sub-chunk
  writeString(view, 12, 'fmt ');
  // Subchunk1Size: 16 for PCM
  view.setUint32(16, 16, true);
  // AudioFormat: 1 for linear PCM
  view.setUint16(20, 1, true);
  // NumChannels: 1 for Mono
  view.setUint16(22, 1, true);
  // SampleRate
  view.setUint32(24, sampleRate, true);
  // ByteRate = SampleRate * NumChannels * BitsPerSample / 8
  view.setUint32(28, sampleRate * 2, true);
  // BlockAlign = NumChannels * BitsPerSample / 8
  view.setUint16(32, 2, true);
  // BitsPerSample: 16-bit
  view.setUint16(34, 16, true);

  // 3. "data" sub-chunk
  writeString(view, 36, 'data');
  // Subchunk2Size: samples * channels * bytesPerSample
  view.setUint32(40, samples.length * 2, true);

  // 4. Write PCM samples (convert Float32 [-1.0, 1.0] to signed 16-bit Int [-32768, 32767])
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
