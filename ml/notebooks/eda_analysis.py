"""
Exploratory Data Analysis (EDA) for Synapse-Voice.
Analyzes UCI 174 dataset: class balance, feature distributions,
per-subject recording counts, PCA, and t-SNE projections.
"""

import json
import os
import sys

import matplotlib
import numpy as np

matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
from sklearn.preprocessing import StandardScaler

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from reproduction.common import load_data


def run_eda():
    print("=" * 60)
    print("RUNNING EXPLORATORY DATA ANALYSIS (EDA)")
    print("=" * 60)
    
    X, y, groups, feats = load_data()
    
    fig_dir = os.path.join(os.path.dirname(__file__), "..", "models", "eda_figures")
    os.makedirs(fig_dir, exist_ok=True)
    
    # 1. Subject and Class Distribution
    total = len(y)
    n_pd = int((y == 1).sum())
    n_hc = int((y == 0).sum())
    print(f"Total Recordings: {total}")
    print(f"Parkinson's (PD, status=1): {n_pd} ({n_pd/total*100:.1f}%)")
    print(f"Healthy Controls (HC, status=0): {n_hc} ({n_hc/total*100:.1f}%)")
    print(f"Distinct Subjects: {groups.nunique()}")
    
    # Recordings per subject
    recs_per_sub = groups.value_counts()
    print(f"Recordings per Subject: Min={recs_per_sub.min()}, Max={recs_per_sub.max()}, Mean={recs_per_sub.mean():.1f}")
    
    # 2. Correlation Matrix
    plt.figure(figsize=(14, 12))
    corr = X.corr()
    mask = np.triu(np.ones_like(corr, dtype=bool))
    sns.heatmap(corr, mask=mask, cmap='vlag', vmin=-1, vmax=1, annot=False, linewidths=0.5)
    plt.title("Correlation Matrix of 22 Vocal Biomarkers (UCI 174)", fontsize=14, fontweight='bold', pad=12)
    plt.tight_layout()
    corr_path = os.path.join(fig_dir, "correlation_matrix.png")
    plt.savefig(corr_path, dpi=300)
    plt.close()
    print(f"Saved correlation matrix to: {corr_path}")
    
    # 3. PCA Projection (2D)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    pca = PCA(n_components=2, random_state=42)
    X_pca = pca.fit_transform(X_scaled)
    var_exp = pca.explained_variance_ratio_
    
    plt.figure(figsize=(8, 6))
    scatter = plt.scatter(
        X_pca[:, 0], X_pca[:, 1],
        c=y, cmap='coolwarm', alpha=0.8, edgecolors='k', s=55
    )
    plt.xlabel(f"PC1 ({var_exp[0]*100:.1f}% variance)", fontsize=11)
    plt.ylabel(f"PC2 ({var_exp[1]*100:.1f}% variance)", fontsize=11)
    plt.title("2D PCA Projection of Voice Biomarkers", fontsize=13, fontweight='bold', pad=10)
    plt.legend(handles=scatter.legend_elements()[0], labels=['Healthy Control', 'Parkinson\'s'], loc='upper right')
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    pca_path = os.path.join(fig_dir, "pca_projection.png")
    plt.savefig(pca_path, dpi=300)
    plt.close()
    print(f"Saved PCA plot to: {pca_path}")
    
    # 4. t-SNE Projection (2D)
    tsne = TSNE(n_components=2, perplexity=25, random_state=42, n_iter_without_progress=300)
    X_tsne = tsne.fit_transform(X_scaled)
    
    plt.figure(figsize=(8, 6))
    scatter = plt.scatter(
        X_tsne[:, 0], X_tsne[:, 1],
        c=y, cmap='coolwarm', alpha=0.8, edgecolors='k', s=55
    )
    plt.xlabel("t-SNE Dimension 1", fontsize=11)
    plt.ylabel("t-SNE Dimension 2", fontsize=11)
    plt.title("2D t-SNE Projection of Voice Biomarkers", fontsize=13, fontweight='bold', pad=10)
    plt.legend(handles=scatter.legend_elements()[0], labels=['Healthy Control', 'Parkinson\'s'], loc='upper right')
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    tsne_path = os.path.join(fig_dir, "tsne_projection.png")
    plt.savefig(tsne_path, dpi=300)
    plt.close()
    print(f"Saved t-SNE plot to: {tsne_path}")
    
    # 5. Export Jupyter Notebook JSON format
    nb_content = {
        "cells": [
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "# Synapse-Voice: Exploratory Data Analysis\n",
                    "## Oxford Parkinson's Disease Detection Dataset (UCI ID 174)\n",
                    "This notebook analyzes the 22 acoustic biomarkers, patient balance, feature collinearity, and 2D manifold embeddings."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": 1,
                "metadata": {},
                "outputs": [],
                "source": [
                    "import pandas as pd\n",
                    "import numpy as np\n",
                    "import matplotlib.pyplot as plt\n",
                    "import seaborn as sns\n",
                    "from reproduction.common import load_data\n",
                    "X, y, groups, feats = load_data()\n",
                    "print(f'Shape: {X.shape}, PD Cases: {(y==1).sum()}, Controls: {(y==0).sum()}, Subjects: {groups.nunique()}')"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": 2,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# Summary Statistics\n",
                    "X.describe().T[['mean', 'std', 'min', '50%', 'max']]"
                ]
            }
        ],
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python",
                "name": "python3"
            },
            "language_info": {
                "name": "python",
                "version": "3.11"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 4
    }
    nb_path = os.path.join(os.path.dirname(__file__), "01_exploratory_data_analysis.ipynb")
    with open(nb_path, "w", encoding="utf-8") as f:
        json.dump(nb_content, f, indent=2)
    print(f"Generated Jupyter Notebook at: {nb_path}")
    print("EDA completed successfully!")

if __name__ == '__main__':
    run_eda()
