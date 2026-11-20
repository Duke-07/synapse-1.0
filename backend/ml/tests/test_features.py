"""Unit tests for ML feature extraction and range sanity."""

import soundfile as sf

from ml.src.features import (
    CANONICAL_FEATURES,
    REFERENCE_RANGES,
    extract_features_from_audio,
    generate_synthetic_vowel,
)


def test_canonical_features_complete():
    assert len(CANONICAL_FEATURES) == 22
    assert "PPE" in CANONICAL_FEATURES
    assert "spread1" in CANONICAL_FEATURES
    assert "spread2" in CANONICAL_FEATURES
    assert "MDVP:Jitter(%)" in CANONICAL_FEATURES

def test_reference_ranges_bounds():
    for f in CANONICAL_FEATURES:
        assert f in REFERENCE_RANGES
        assert REFERENCE_RANGES[f]["min"] < REFERENCE_RANGES[f]["max"]

def test_synthetic_vowel_extraction(tmp_path):
    wav = tmp_path / "vowel.wav"
    audio = generate_synthetic_vowel(duration=2.0, sr=44100, f0=150.0)
    sf.write(str(wav), audio, 44100)
    
    feats = extract_features_from_audio(str(wav))
    assert len(feats) == 22
    for f in CANONICAL_FEATURES:
        assert f in feats
        assert isinstance(feats[f], (float, int))
        assert not (feats[f] != feats[f]) # Not NaN
