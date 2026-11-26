'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mic,
  Square,
  Upload,
  AlertCircle,
  RotateCcw,
  CheckCircle,
  Shield,
  FileAudio,
  Info,
  Sparkles,
} from 'lucide-react';
import WaveformVisualizer from '@/components/WaveformVisualizer';
import { PhonationOrb3D, TiltCard3D } from '@/components/3d';
import { analyzeVoice } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { PillButton } from '@/components/ui/PillButton';
import { encodeWAV } from '@/lib/wav-encoder';

export default function ScreenPage() {
  const router = useRouter();
  const { user, token } = useAuth();

  // Mode: 'mic' | 'upload'
  const [mode, setMode] = useState<'mic' | 'upload'>('mic');

  // Mic state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Settings
  const [consent, setConsent] = useState(true);
  const [anonymous, setAnonymous] = useState(true);

  // Submit & Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [apiError, setApiError] = useState<string | null>(null);

  // Refs for recording & audio context
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const pcmChunksRef = useRef<Float32Array[]>([]);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const isRecordingRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecordingCleanup();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const stopRecordingCleanup = () => {
    isRecordingRef.current = false;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch {}
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  const startRecording = async () => {
    setMicError(null);
    setApiError(null);
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    chunksRef.current = [];
    pcmChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // ScriptProcessorNode to capture uncompressed PCM samples
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      processor.onaudioprocess = (e) => {
        if (!isRecordingRef.current) return;
        const input = e.inputBuffer.getChannelData(0);
        pcmChunksRef.current.push(new Float32Array(input));
      };
      const muteGain = audioCtx.createGain();
      muteGain.gain.value = 0;
      source.connect(processor);
      processor.connect(muteGain);
      muteGain.connect(audioCtx.destination);

      try {
        const mimeTypes = [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/ogg;codecs=opus',
          'audio/mp4',
        ];
        let selectedMime = '';
        for (const mime of mimeTypes) {
          if (MediaRecorder.isTypeSupported(mime)) {
            selectedMime = mime;
            break;
          }
        }
        const mediaRecorder = new MediaRecorder(
          stream,
          selectedMime ? { mimeType: selectedMime } : undefined
        );
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };
        mediaRecorder.start(100);
      } catch (mrErr) {
        console.warn('MediaRecorder notice:', mrErr);
      }

      isRecordingRef.current = true;
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 89) {
            stopRecording();
            return 90;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Mic error:', err);
      setMicError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Microphone permission was denied. Please allow microphone access in your browser.'
          : `Failed to access microphone: ${err.message || 'Unknown error'}`
      );
    }
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch {}
      processorRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    setIsRecording(false);

    // Encode captured raw PCM samples directly to standard 16-bit linear PCM WAV
    const chunks = pcmChunksRef.current;
    if (chunks.length > 0 && audioContextRef.current) {
      const sampleRate = audioContextRef.current.sampleRate;
      const totalLen = chunks.reduce((acc, c) => acc + c.length, 0);
      const fullPCM = new Float32Array(totalLen);
      let offset = 0;
      for (const chunk of chunks) {
        fullPCM.set(chunk, offset);
        offset += chunk.length;
      }
      const wavBlob = encodeWAV(fullPCM, sampleRate);
      setAudioBlob(wavBlob);
      const url = URL.createObjectURL(wavBlob);
      setAudioUrl(url);
    } else if (chunksRef.current.length > 0) {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      setAudioBlob(blob);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    }
    stopRecordingCleanup();
  };

  const resetRecording = () => {
    stopRecordingCleanup();
    setIsRecording(false);
    setRecordingTime(0);
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setMicError(null);
    setApiError(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validExts = ['.wav', '.mp3', '.m4a', '.webm', '.ogg'];
    const hasValidExt = validExts.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );
    if (!hasValidExt && !file.type.startsWith('audio/')) {
      setApiError('Please select a valid audio file (.wav, .mp3, .m4a, .webm, .ogg)');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setApiError('Audio file must be under 25 MB');
      return;
    }
    setApiError(null);
    setSelectedFile(file);
  };

  const handleSubmit = async () => {
    const fileToUpload = mode === 'mic' ? audioBlob : selectedFile;
    if (!fileToUpload) {
      setApiError('Please record audio or select a file first.');
      return;
    }

    if (!consent) {
      setApiError('You must acknowledge the research screening consent before proceeding.');
      return;
    }

    setIsLoading(true);
    setApiError(null);
    setLoadingStep('Uploading audio & standardizing format...');

    try {
      setTimeout(() => setLoadingStep('Extracting 22 Praat acoustic biomarkers (Jitter, Shimmer, Pitch, HNR, RPDE, DFA, PPE)...'), 800);
      setTimeout(() => setLoadingStep('Evaluating calibrated neural classifier (StratifiedGroupKFold)...'), 1800);
      setTimeout(() => setLoadingStep('Generating SHAP feature attributions & querying RAG literature corpus...'), 2800);

      const result = await analyzeVoice(fileToUpload, anonymous, consent, token || undefined);

      try {
        const storedHistory = JSON.parse(localStorage.getItem('synapse_history') || '[]');
        const historyItem = {
          id: result.id,
          probability: result.probability,
          confidence_band: result.confidence_band,
          created_at: result.created_at,
          top_features: result.top_biomarkers?.slice(0, 3).map((b) => b.label) || [],
        };
        localStorage.setItem(
          'synapse_history',
          JSON.stringify([historyItem, ...storedHistory.slice(0, 49)])
        );
        sessionStorage.setItem(`synapse_result_${result.id}`, JSON.stringify(result));
        localStorage.setItem(`synapse_result_${result.id}`, JSON.stringify(result));
        localStorage.setItem('synapse_last_result', JSON.stringify(result));
      } catch (err) {
        console.warn('Failed to save to storage:', err);
      }

      router.push(`/results?id=${result.id}`);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setApiError(err.message || 'An error occurred during acoustic analysis. Please try again.');
      setIsLoading(false);
    }
  };

  // 5-second circular progress metrics
  const targetSeconds = 5;
  const progressRatio = Math.min(recordingTime / targetSeconds, 1);
  const ringRadius = 88;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = ringCircumference * (1 - progressRatio);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-display font-semibold uppercase tracking-wider text-[#116466]">
          Acoustic Voice Screening
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl font-normal tracking-tight text-[#2C3531] uppercase leading-[0.92]">
          Screen in 5 Seconds
        </h1>
        <p className="text-sm sm:text-base text-[#2C3531]/75 max-w-xl mx-auto font-sans font-normal leading-relaxed">
          Hold a sustained steady <strong className="text-[#116466] font-serif">&quot;ahhh&quot;</strong> vowel at a comfortable pitch. Our neural engine extracts 22 biomarkers for microtremors.
        </p>
      </div>

      {/* Protocol Instructions Box */}
      <div className="craft-card p-6 sm:p-8 space-y-3 text-sm">
        <h3 className="font-serif text-lg sm:text-xl font-normal text-[#2C3531] flex items-center gap-2">
          <Info className="w-5 h-5 text-[#116466]" />
          Quick Instructions For Accurate Screening
        </h3>
        <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm text-[#2C3531]/80 font-sans leading-relaxed">
          <li>Sit in a quiet room with minimal background noise or echo.</li>
          <li>Hold your microphone approximately 15 cm (6 inches) from your mouth.</li>
          <li>Take a breath and vocalize a steady <strong className="text-[#116466] font-serif">&quot;ahhh&quot;</strong> for at least 5 seconds.</li>
          <li>Maintain a consistent loudness without whispering or straining.</li>
        </ol>
      </div>

      {/* Mode Switcher Pills */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setMode('mic')}
          className={`px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
            mode === 'mic'
              ? 'bg-[#116466] text-white shadow-sm scale-[1.02]'
              : 'bg-white text-[#2C3531] border border-[#D9B08C]/40 hover:bg-[#D1E8E2]/30 shadow-xs'
          }`}
        >
          <span className="flex items-center gap-2">
            <Mic className="w-4 h-4" /> Live Microphone
          </span>
        </button>
        <button
          onClick={() => setMode('upload')}
          className={`px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
            mode === 'upload'
              ? 'bg-[#116466] text-white shadow-sm scale-[1.02]'
              : 'bg-white text-[#2C3531] border border-[#D9B08C]/40 hover:bg-[#D1E8E2]/30 shadow-xs'
          }`}
        >
          <span className="flex items-center gap-2">
            <Upload className="w-4 h-4" /> Drop Audio File
          </span>
        </button>
      </div>

      {/* Mic Recording Card */}
      {mode === 'mic' && (
        <div className="craft-card p-8 sm:p-12 text-center space-y-8">
          {/* 3D Interactive Phonation Receptor Orb */}
          <div className="w-full max-w-sm mx-auto h-52 sm:h-64 flex items-center justify-center">
            <PhonationOrb3D
              analyser={analyserRef.current}
              isRecording={isRecording}
              isLoading={isLoading}
              className="w-full h-full"
            />
          </div>

          {/* Live Waveform Canvas */}
          <div className="space-y-2">
            <div className="h-28 sm:h-32 flex items-center justify-center">
              <WaveformVisualizer
                analyser={analyserRef.current}
                isRecording={isRecording}
              />
            </div>
            <div className="flex justify-between items-center text-xs font-semibold tracking-wider uppercase text-[#2C3531]/60 px-1">
              <span>{isRecording ? 'Capturing Acoustic Signal...' : 'Microphone Ready'}</span>
              <span className="font-mono text-[#116466]">
                {recordingTime}s / 5s minimum
              </span>
            </div>
          </div>

          {/* Circular Mic Button with Pulsing Ring & 5s Circular Progress Ring */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative flex items-center justify-center">
              {/* Outer Pulsing Ring when recording */}
              {isRecording && (
                <div className="absolute inset-0 -m-4 rounded-full border-4 border-[#116466]/20 animate-pulse pointer-events-none" />
              )}

              {/* 5-Second Circular Progress Ring SVG */}
              <svg
                width="220"
                height="220"
                className="transform -rotate-90 pointer-events-none select-none"
              >
                <circle
                  cx="110"
                  cy="110"
                  r={ringRadius}
                  stroke="#D1E8E2"
                  strokeOpacity="0.5"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="110"
                  cy="110"
                  r={ringRadius}
                  stroke={recordingTime >= 5 ? '#116466' : '#D9B08C'}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={isRecording ? strokeDashoffset : ringCircumference}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>

              {/* Circular Mic Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                {!isRecording && !audioBlob && (
                  <button
                    onClick={startRecording}
                    disabled={isLoading}
                    className="w-40 h-40 rounded-full bg-[#116466] hover:bg-[#0c4b4d] text-white shadow-[0_10px_28px_rgba(17,100,102,0.35)] hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center cursor-pointer group"
                    aria-label="Start Voice Recording"
                  >
                    <Mic className="w-10 h-10 group-hover:scale-110 transition-transform" />
                    <span className="font-serif text-base font-normal tracking-wide uppercase mt-1">
                      RECORD
                    </span>
                  </button>
                )}

                {isRecording && (
                  <button
                    onClick={stopRecording}
                    className="w-40 h-40 rounded-full bg-[#B84A39] hover:bg-[#9e3a2c] text-white shadow-[0_10px_28px_rgba(184,74,57,0.35)] flex flex-col items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all"
                    aria-label="Stop Voice Recording"
                  >
                    <Square className="w-9 h-9 fill-current" />
                    <span className="font-serif text-base font-normal tracking-wide uppercase mt-1">
                      STOP ({recordingTime}s)
                    </span>
                  </button>
                )}

                {audioBlob && !isRecording && (
                  <button
                    onClick={resetRecording}
                    disabled={isLoading}
                    className="w-40 h-40 rounded-full bg-[#FFCB9A] hover:bg-[#f5b87e] text-[#2C3531] border border-[#D9B08C] shadow-sm hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center cursor-pointer"
                    aria-label="Re-record voice"
                  >
                    <RotateCcw className="w-9 h-9 text-[#2C3531]" />
                    <span className="font-serif text-sm font-normal tracking-wide uppercase mt-1 text-[#2C3531]">
                      RE-RECORD
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Timing feedback status */}
            <div className="mt-4 text-center">
              {isRecording ? (
                recordingTime < 5 ? (
                  <p className="text-xs sm:text-sm font-semibold text-[#116466] uppercase tracking-wider font-display">
                    Sustaining vowel... {5 - recordingTime}s remaining for full 22 biomarkers
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm font-semibold text-[#116466] uppercase tracking-wider font-display">
                    ✓ 5s threshold achieved! Tap stop or keep holding.
                  </p>
                )
              ) : audioBlob ? (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs font-semibold text-[#116466] uppercase tracking-wider font-display">
                    Vowel Recorded ({recordingTime}s)
                  </span>
                  {audioUrl && (
                    <audio
                      src={audioUrl}
                      controls
                      className="h-10 rounded-full shadow-xs"
                    />
                  )}
                </div>
              ) : (
                <p className="text-xs text-[#2C3531]/60 uppercase tracking-wider font-medium font-sans">
                  Tap the circular button to record your 5-second sustained vowel
                </p>
              )}
            </div>
          </div>

          {/* Mic Error */}
          {micError && (
            <div className="p-4 bg-red-50/80 border border-red-200 rounded-2xl text-left flex items-start gap-3 text-xs sm:text-sm text-red-800">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Microphone Access Error</p>
                <p className="mt-1">{micError}</p>
                <p className="mt-1 font-semibold text-[#116466]">
                  Tip: You can switch to the &quot;Drop Audio File&quot; tab above if permissions are restricted.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* File Upload Mode */}
      {mode === 'upload' && (
        <div className="craft-card p-8 sm:p-12 space-y-6">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-8 sm:p-14 text-center transition-all ${
              dragActive
                ? 'border-[#116466] bg-[#D1E8E2]/30 scale-[1.01]'
                : selectedFile
                ? 'border-[#116466] bg-[#D1E8E2]/20'
                : 'border-[#D9B08C]/60 hover:border-[#116466] bg-white'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              accept=".wav,.mp3,.m4a,.webm,.ogg,audio/*"
              onChange={handleFileInput}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center justify-center space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#D1E8E2] text-[#116466] flex items-center justify-center shadow-xs">
                {selectedFile ? (
                  <CheckCircle className="w-8 h-8 text-[#116466]" />
                ) : (
                  <FileAudio className="w-8 h-8 text-[#116466]" />
                )}
              </div>
              {selectedFile ? (
                <div>
                  <p className="font-serif text-2xl font-normal text-[#2C3531]">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-[#2C3531]/70 mt-1 font-sans">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &middot; Ready for acoustic screening
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-serif text-2xl sm:text-3xl font-normal text-[#2C3531] uppercase tracking-tight">
                    Drop Your Audio File Here
                  </p>
                  <p className="text-xs text-[#2C3531]/65 mt-1 font-sans">
                    Supports uncompressed WAV, MP3, M4A, WebM (Max 25 MB)
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>
      )}

      {/* Consent & Settings Card */}
      <div className="craft-card p-6 sm:p-8 space-y-4">
        <h4 className="font-serif text-lg sm:text-xl font-normal text-[#2C3531] flex items-center gap-2 uppercase tracking-tight">
          <Shield className="w-5 h-5 text-[#116466]" />
          Research Consent &amp; Privacy Protocol
        </h4>

        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-[#D9B08C] accent-[#116466]"
            />
            <span className="text-xs sm:text-sm text-[#2C3531]/80 leading-relaxed font-sans">
              <strong className="text-[#2C3531]">Required Research Consent:</strong> I acknowledge that Synapse-Voice is strictly an exploratory screening tool and research demonstration. It does <em>not</em> provide a medical diagnosis, clinical opinion, or disease confirmation.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-[#D9B08C] accent-[#116466]"
            />
            <span className="text-xs sm:text-sm text-[#2C3531]/80 leading-relaxed font-sans">
              <strong className="text-[#2C3531]">Zero-Retention Protocol:</strong> Discard raw audio immediately after extracting acoustic features. Do not retain voice recordings on cloud servers.
            </span>
          </label>
        </div>
      </div>

      {/* Error Alert */}
      {apiError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p>{apiError}</p>
        </div>
      )}

      {/* Run Screening Button */}
      <div className="text-center pt-2">
        <PillButton
          variant="primary"
          onClick={handleSubmit}
          disabled={
            isLoading ||
            (mode === 'mic' && !audioBlob) ||
            (mode === 'upload' && !selectedFile) ||
            !consent
          }
          className="w-full sm:w-auto text-base py-3.5 px-10"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-3">
              <Sparkles className="w-5 h-5 animate-spin text-[#FFCB9A]" />
              Voicefying Your Health Check...
            </span>
          ) : (
            "Run Parkinson's Voice Screening"
          )}
        </PillButton>

        {isLoading && (
          <p className="text-xs sm:text-sm font-semibold text-[#116466] mt-3 animate-pulse font-sans">
            {loadingStep}
          </p>
        )}
      </div>
    </div>
  );
}
