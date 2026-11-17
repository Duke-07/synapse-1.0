'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mic,
  Square,
  Upload,
  AlertCircle,
  Play,
  RotateCcw,
  CheckCircle,
  Shield,
  Activity,
  FileAudio,
  Info,
} from 'lucide-react';
import WaveformVisualizer from '@/components/WaveformVisualizer';
import { analyzeVoice } from '@/lib/api';

export default function ScreenPage() {
  const router = useRouter();

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
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
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

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      streamRef.current = stream;

      // Initialize Web Audio API Analyser
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Determine supported mimeType
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/wav',
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

      mediaRecorder.onstop = () => {
        const mime = selectedMime || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mime });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stopRecordingCleanup();
      };

      mediaRecorder.start(100);
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
          ? 'Microphone permission was denied. Please allow microphone access in your browser address bar.'
          : `Failed to access microphone: ${err.message || 'Unknown error'}`
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
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
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
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

      const result = await analyzeVoice(fileToUpload, anonymous, consent);

      // Save to localStorage for history
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

        // Also stash full result in sessionStorage as quick fallback
        sessionStorage.setItem(`synapse_result_${result.id}`, JSON.stringify(result));
      } catch (err) {
        console.warn('Failed to save to local/session storage:', err);
      }

      router.push(`/results?id=${result.id}`);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setApiError(err.message || 'An error occurred during acoustic analysis. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-900/40 border border-cyan-700/60 text-cyan-300 text-xs font-medium mb-3">
          <Activity className="w-3.5 h-3.5" />
          Acoustic Voice Screening Protocol
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Vocal Biomarker Analysis
        </h1>
        <p className="mt-2 text-slate-400 text-sm max-w-2xl mx-auto">
          Screen for phonatory anomalies using validated acoustic parameters.
          Produce a continuous sustained <span className="font-semibold text-cyan-400">“a-a-a-h”</span> vowel sound at a comfortable pitch and volume for at least 3 to 5 seconds.
        </p>
      </div>

      {/* Protocol Guide Box */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 mb-8 text-sm">
        <h3 className="font-semibold text-white flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-cyan-400" />
          Recording Instructions for Clinical Relevance
        </h3>
        <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-xs sm:text-sm">
          <li>Sit in a quiet room with minimal background noise, fans, or echo.</li>
          <li>Hold the microphone roughly 15 cm (6 inches) from your mouth.</li>
          <li>Take a deep breath and vocalize a continuous, steady <strong className="text-cyan-300">“a-a-a-h”</strong> (like in <em>father</em>).</li>
          <li>Hold the tone steady without whispering, shouting, or wavering for 3 to 10 seconds.</li>
        </ol>
      </div>

      {/* Method Switcher Tabs */}
      <div className="flex border-b border-slate-800 mb-6">
        <button
          onClick={() => setMode('mic')}
          className={`flex items-center gap-2 py-3 px-6 text-sm font-medium border-b-2 transition-all ${
            mode === 'mic'
              ? 'border-cyan-500 text-cyan-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Mic className="w-4 h-4" />
          Live Microphone Recording
        </button>
        <button
          onClick={() => setMode('upload')}
          className={`flex items-center gap-2 py-3 px-6 text-sm font-medium border-b-2 transition-all ${
            mode === 'upload'
              ? 'border-cyan-500 text-cyan-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload Audio File
        </button>
      </div>

      {/* Mic Mode */}
      {mode === 'mic' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 text-center space-y-6">
          {/* Waveform Visualization */}
          <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/80">
            <div className="h-28 flex items-center justify-center">
              <WaveformVisualizer
                analyser={analyserRef.current}
                isRecording={isRecording}
              />
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 mt-2 px-1">
              <span>{isRecording ? 'Capturing live audio signal...' : 'Ready to capture'}</span>
              <span className="font-mono font-semibold text-slate-400">
                {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')} / 01:30
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {!isRecording && !audioBlob && (
              <button
                onClick={startRecording}
                disabled={isLoading}
                className="flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-950/50 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                <Mic className="w-5 h-5 text-white animate-pulse" />
                Start Voice Recording
              </button>
            )}

            {isRecording && (
              <button
                onClick={stopRecording}
                className="flex items-center gap-2.5 px-6 py-3.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl shadow-lg shadow-red-950/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Square className="w-5 h-5 fill-current text-white" />
                Stop Recording ({recordingTime}s)
              </button>
            )}

            {audioBlob && !isRecording && (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={resetRecording}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Re-record
                </button>
                {audioUrl && (
                  <audio
                    src={audioUrl}
                    controls
                    className="h-10 rounded-lg max-w-xs bg-slate-950"
                  />
                )}
              </div>
            )}
          </div>

          {/* Mic Error */}
          {micError && (
            <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-left flex items-start gap-3 text-red-300 text-sm">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-200">Microphone Access Error</p>
                <p className="mt-1 text-xs text-red-300/90">{micError}</p>
                <p className="mt-2 text-xs text-red-400">
                  Tip: If browser permissions are blocked, try the “Upload Audio File” tab instead.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* File Upload Mode */}
      {mode === 'upload' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              dragActive
                ? 'border-cyan-500 bg-cyan-950/20'
                : selectedFile
                ? 'border-green-600/60 bg-green-950/10'
                : 'border-slate-700 hover:border-slate-600 bg-slate-950/40'
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
              className="cursor-pointer flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400">
                {selectedFile ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <FileAudio className="w-6 h-6" />
                )}
              </div>
              {selectedFile ? (
                <div>
                  <p className="text-sm font-semibold text-green-400">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for analysis
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    Click to browse or drag and drop your voice recording
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports WAV, MP3, M4A, WebM, OGG (Max 25 MB)
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>
      )}

      {/* Configuration & Consent Section */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 mt-6 space-y-4">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          Screening Consent & Zero-Retention Configuration
        </h4>

        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-slate-700 text-cyan-600 focus:ring-cyan-500 bg-slate-800"
            />
            <span className="text-xs sm:text-sm text-slate-300">
              <strong className="text-white">Required Consent:</strong> I acknowledge that Synapse-Voice is strictly an investigative screening tool and research demonstration. It does <em>not</em> provide a medical diagnosis, clinical opinion, or disease confirmation.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-slate-700 text-cyan-600 focus:ring-cyan-500 bg-slate-800"
            />
            <span className="text-xs sm:text-sm text-slate-300">
              <strong className="text-white">Zero-Retention Mode:</strong> Discard raw audio immediately after extracting acoustic features. Do not store voice recordings on cloud servers.
            </span>
          </label>
        </div>
      </div>

      {/* Error alert */}
      {apiError && (
        <div className="mt-6 p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p>{apiError}</p>
        </div>
      )}

      {/* Submit Button & Progress */}
      <div className="mt-8 text-center">
        <button
          onClick={handleSubmit}
          disabled={
            isLoading ||
            (mode === 'mic' && !audioBlob) ||
            (mode === 'upload' && !selectedFile) ||
            !consent
          }
          className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-950/60 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-3">
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
              Analyzing Acoustic Biomarkers...
            </span>
          ) : (
            'Run Vocal Biomarker Screening'
          )}
        </button>

        {isLoading && (
          <p className="text-xs text-cyan-400 font-medium mt-3 animate-pulse">
            {loadingStep}
          </p>
        )}
      </div>
    </div>
  );
}
