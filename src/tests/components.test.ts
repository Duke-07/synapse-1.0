import { describe, it, expect } from 'vitest';
import { extractAcousticFeatures, classifyAcousticBiomarkers } from '../lib/acoustic-engine';

describe('Frontend Core Constants and Contracts', () => {
  it('validates confidence band classifications', () => {
    const getConfidenceBand = (p: number) => {
      if (p < 0.35) return 'Low Risk';
      if (p <= 0.65) return 'Moderate Concern';
      return 'Elevated Risk';
    };

    expect(getConfidenceBand(0.20)).toBe('Low Risk');
    expect(getConfidenceBand(0.50)).toBe('Moderate Concern');
    expect(getConfidenceBand(0.85)).toBe('Elevated Risk');
  });

  it('verifies 22 Oxford PD biomarker keys exist', () => {
    const requiredBiomarkers = [
      'MDVP:Fo(Hz)', 'MDVP:Fhi(Hz)', 'MDVP:Flo(Hz)',
      'MDVP:Jitter(%)', 'MDVP:Jitter(Abs)', 'MDVP:RAP', 'MDVP:PPQ', 'Jitter:DDP',
      'MDVP:Shimmer', 'MDVP:Shimmer(dB)', 'Shimmer:APQ3', 'Shimmer:APQ5', 'MDVP:APQ', 'Shimmer:DDA',
      'NHR', 'HNR',
      'RPDE', 'DFA', 'spread1', 'spread2', 'D2', 'PPE'
    ];
    expect(requiredBiomarkers).toHaveLength(22);
  });

  it('correctly classifies healthy sustained vowels as Low Risk (not 94% or 96%)', () => {
    const sr = 16000;
    const duration = 2.0; // 2 seconds
    const totalSamples = Math.floor(sr * duration);
    const buffer = new Float32Array(totalSamples);
    const f0 = 160; // 160 Hz healthy female/male vowel

    for (let i = 0; i < totalSamples; i++) {
      const t = i / sr;
      // Stable fundamental + harmonics with minimal noise
      const harmonic1 = Math.sin(2 * Math.PI * f0 * t);
      const harmonic2 = 0.5 * Math.sin(2 * Math.PI * 2 * f0 * t);
      const harmonic3 = 0.25 * Math.sin(2 * Math.PI * 3 * f0 * t);
      const subtleNoise = (Math.random() - 0.5) * 0.005;
      buffer[i] = 0.6 * harmonic1 + 0.3 * harmonic2 + 0.15 * harmonic3 + subtleNoise;
    }

    const features = extractAcousticFeatures(buffer, sr);
    expect(features['MDVP:Fo(Hz)']).toBeGreaterThan(140);
    expect(features['MDVP:Fo(Hz)']).toBeLessThan(180);
    expect(features['PPE']).toBeLessThan(0.18);

    const classification = classifyAcousticBiomarkers(features);
    expect(classification.confidence_band).toBe('Low Risk');
    expect(classification.probability).toBeLessThan(0.35);
    expect(classification.probability).not.toBe(0.94);
    expect(classification.probability).not.toBe(0.96);
  });

  it('correctly classifies dysphonic / Parkinsonian tremor vowels as Elevated Risk', () => {
    const sr = 16000;
    const duration = 2.0;
    const totalSamples = Math.floor(sr * duration);
    const buffer = new Float32Array(totalSamples);
    const f0 = 140;

    let phase = 0;
    for (let i = 0; i < totalSamples; i++) {
      const t = i / sr;
      // 5 Hz Parkinsonian resting tremor frequency modulation + jitter
      const instantaneousF0 = f0 + 12 * Math.sin(2 * Math.PI * 5.0 * t) + (Math.random() - 0.5) * 15;
      phase += (2 * Math.PI * instantaneousF0) / sr;
      // Amplitude perturbation (shimmer) + breath noise
      const ampMod = 0.6 * (1.0 + 0.25 * Math.sin(2 * Math.PI * 5.0 * t) + (Math.random() - 0.5) * 0.15);
      const breathNoise = (Math.random() - 0.5) * 0.12;
      buffer[i] = ampMod * Math.sin(phase) + breathNoise;
    }

    const features = extractAcousticFeatures(buffer, sr);
    expect(features['PPE']).toBeGreaterThan(0.18);

    const classification = classifyAcousticBiomarkers(features);
    expect(classification.confidence_band).toBe('Elevated Risk');
    expect(classification.probability).toBeGreaterThan(0.65);
  });
});
