"""Common utilities and dataset loader for reproducing prior works."""

import os
import re
import pandas as pd
import numpy as np
from typing import Tuple

def get_dataset_path() -> str:
    possible_paths = [
        os.path.join(os.path.dirname(__file__), "..", "ml", "data", "parkinsons_standardized.csv"),
        os.path.join(os.path.dirname(__file__), "..", "ml", "data", "parkinsons.data"),
        os.path.join(os.path.dirname(__file__), "..", "ml", "data", "parkinsons.csv"),
    ]
    for p in possible_paths:
        if os.path.exists(p):
            return os.path.abspath(p)
    raise FileNotFoundError("Parkinson's dataset not found in ml/data/")

def parse_subject_id(name: str) -> str:
    """
    Extract subject identifier from phonation name.
    Examples:
      'phon_R01_S01_1' -> 'R01_S01'
      'phon_R01_S02_3' -> 'R01_S02'
      'phon_R01_S50_6' -> 'R01_S50'
    """
    match = re.search(r'(R\d+_S\d+)', str(name))
    if match:
        return match.group(1)
    # Fallback to prefix before last underscore
    parts = str(name).rsplit('_', 1)
    return parts[0] if len(parts) > 1 else str(name)

def load_data() -> Tuple[pd.DataFrame, pd.Series, pd.Series, list]:
    """
    Loads dataset, extracts feature matrix X, target y (status), and subject grouping array.
    Returns: (X, y, groups, feature_names)
    """
    path = get_dataset_path()
    df = pd.read_csv(path)
    
    # Identify target and metadata columns
    target_col = 'status'
    id_col = 'name'
    
    y = df[target_col].astype(int)
    groups = df[id_col].apply(parse_subject_id)
    
    feature_cols = [c for c in df.columns if c not in (target_col, id_col)]
    X = df[feature_cols].copy()
    
    # Clean column names
    X.columns = [c.strip() for c in X.columns]
    
    return X, y, groups, list(X.columns)

if __name__ == '__main__':
    X, y, groups, feats = load_data()
    print(f"Loaded dataset: {X.shape[0]} samples, {X.shape[1]} features.")
    print(f"Target distribution: {y.value_counts().to_dict()} (1=PD, 0=Healthy)")
    print(f"Unique subjects: {groups.nunique()}")
