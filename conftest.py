"""
Root conftest.py — ensures repo root is first in sys.path for pytest collection.

Without this, Ubuntu CI can pick up backend/ml/ as the 'ml' package instead of
the root ml/ directory, causing collection errors (exit code 2).
"""

import os
import sys

# Insert repo root (the directory containing this file) at the front of sys.path.
# This guarantees that `import ml.src.features` resolves to <root>/ml/src/features.py
# and NOT to <root>/backend/ml/src/features.py on GitHub Actions.
_REPO_ROOT = os.path.abspath(os.path.dirname(__file__))

# Remove any stale entry first so we can re-insert at position 0.
if _REPO_ROOT in sys.path:
    sys.path.remove(_REPO_ROOT)
sys.path.insert(0, _REPO_ROOT)
