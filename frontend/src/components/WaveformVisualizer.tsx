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
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!isRecording) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (internalContextRef.current && internalContextRef.current.state !== 'closed') {
        internalContextRef.current.close().catch(() => {});
        internalContextRef.current = null;
      }

      // Draw idle baseline in blue on yellow
      ctx.fillStyle = '#fcdc74';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(29, 99, 255, 0.4)';
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      ctx.setLineDash([]);
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

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      activeAnalyser!.getByteTimeDomainData(dataArray);

      // Yellow canvas background
      ctx.fillStyle = '#fcdc74';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Blue live waveform
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#0060ca';
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
      width={700}
      height={120}
      className="w-full h-full rounded-2xl bg-[#fcdc74] border border-[#141414]/10"
    />
  );
};

export default WaveformVisualizer;
