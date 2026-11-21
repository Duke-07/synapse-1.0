'use client';

import React, { useEffect, useRef } from 'react';

export interface WaveformVisualizerProps {
  stream?: MediaStream | null;
  analyser?: AnalyserNode | null;
  isRecording: boolean;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  stream,
  analyser: externalAnalyser,
  isRecording,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const internalContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!isRecording) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (internalContextRef.current && internalContextRef.current.state !== 'closed') {
        internalContextRef.current.close().catch(() => {});
        internalContextRef.current = null;
      }
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      return;
    }

    let activeAnalyser: AnalyserNode | null = externalAnalyser || null;

    if (!activeAnalyser && stream) {
      try {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtxClass();
        internalContextRef.current = audioCtx;
        const node = audioCtx.createAnalyser();
        node.fftSize = 256;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(node);
        activeAnalyser = node;
      } catch (err) {
        console.warn('AudioContext error:', err);
      }
    }

    if (!activeAnalyser) return;

    const bufferLength = activeAnalyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      activeAnalyser!.getByteTimeDomainData(dataArray);

      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#06b6d4'; // Cyan 500
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (internalContextRef.current && internalContextRef.current.state !== 'closed') {
        internalContextRef.current.close().catch(() => {});
      }
    };
  }, [stream, externalAnalyser, isRecording]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={110}
      className="w-full h-full rounded-lg bg-slate-950 border border-slate-900"
    />
  );
};

export default WaveformVisualizer;
