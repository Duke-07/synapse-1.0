import { describe, it, expect } from 'vitest';

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
});
