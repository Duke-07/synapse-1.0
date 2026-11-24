"""
Script to generate the comprehensive, professional Viva & Project Defense Guide PDF for Synapse-Voice.
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and display total page count 'Page X of Y'.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#555566"))
        
        # Draw header on all pages except first
        if self._pageNumber > 1:
            self.drawString(36, 756, "Synapse-Voice: Comprehensive Viva, Project Defense & Technical Guide")
            self.setStrokeColor(colors.HexColor("#D0D5DD"))
            self.setLineWidth(0.5)
            self.line(36, 750, 576, 750)
            
        # Draw footer on all pages
        self.setStrokeColor(colors.HexColor("#D0D5DD"))
        self.setLineWidth(0.5)
        self.line(36, 42, 576, 42)
        
        self.drawString(36, 30, "Academic Project Viva Guide — Pre-Clinical Screening System (EPICS Project)")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(576, 30, page_str)
        self.restoreState()


def build_pdf(filename="Synapse_Voice_Viva_and_Project_Guide.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=46,
        bottomMargin=48
    )

    styles = getSampleStyleSheet()

    # Custom Palette
    c_navy = colors.HexColor("#090089")
    c_blue = colors.HexColor("#0060CA")
    c_sky = colors.HexColor("#91CEFF")
    c_amber = colors.HexColor("#B27B00")
    c_bg_light = colors.HexColor("#F4F8FC")
    c_dark = colors.HexColor("#1A1A24")
    c_gray = colors.HexColor("#4A4A5A")
    c_border = colors.HexColor("#D0DBEA")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=c_navy,
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=c_blue,
        spaceAfter=10
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=c_navy,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=c_blue,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=c_dark,
        spaceAfter=4
    )

    body_bold = ParagraphStyle(
        'Body_Bold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=body_style,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=3
    )

    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white,
        alignment=0
    )

    table_body = ParagraphStyle(
        'TableBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=9.5,
        textColor=c_dark
    )

    table_body_bold = ParagraphStyle(
        'TableBodyBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=c_navy
    )

    callout_text = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=c_dark
    )

    q_style = ParagraphStyle(
        'QuestionStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12,
        textColor=c_navy,
        spaceBefore=6,
        spaceAfter=2,
        keepWithNext=True
    )

    ans_style = ParagraphStyle(
        'AnswerStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11.5,
        textColor=c_dark,
        leftIndent=10,
        spaceAfter=5
    )

    story = []

    # Document Header Box
    header_data = [
        [
            Paragraph("<b>🎙️ SYNAPSE-VOICE: ACADEMIC VIVA & DEFENSE GUIDE</b>", title_style),
        ],
        [
            Paragraph("<b>Complete Project Breakdown: Machine Learning Pipeline, 22 Praat Biomarkers, 4-Member Role Division, Failure Modes & Viva Q&A</b>", subtitle_style),
        ],
        [
            Paragraph("<b>Academic Project (EPICS)</b> &nbsp;|&nbsp; <b>Anti-Data-Leakage StratifiedGroupKFold</b> &nbsp;|&nbsp; <b>Continuous Calibrated Probability Scoring</b>", body_style)
        ]
    ]
    header_table = Table(header_data, colWidths=[540])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_bg_light),
        ('BOX', (0,0), (-1,-1), 1.5, c_blue),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 10))

    # SECTION 1: 30-Second Elevator Pitch
    story.append(Paragraph("1. The 30-Second Elevator Pitch (What to Say When the Examiner Says: 'Explain Your Project')", h1_style))
    story.append(Paragraph(
        "<b>Examiner:</b> <i>\"In 1 minute, what does Synapse-Voice do and why did you build it?\"</i><br/>"
        "<b>Your Exact Answer:</b><br/>"
        "<i>\"Synapse-Voice is an AI-powered acoustic screening system that detects early signs of Parkinson's Disease from a 5-second recording of a sustained vowel ('ahhh'). Over 90% of Parkinson's patients experience hypokinetic dysarthria—micro-tremors and stiffness in their vocal folds—years before hand tremors or walking issues appear. "
        "Our system extracts 22 clinically validated Praat acoustic biomarkers measuring pitch micro-tremors, amplitude variations, noise ratios, and nonlinear chaos. "
        "Unlike published research papers that made the serious mistake of mixing the same patient's recordings into both training and testing (patient data leakage), our system trains on <b>StratifiedGroupKFold</b> (zero subject leakage) and evaluates using a 5-model calibrated soft voting ensemble, delivering a realistic, reliable risk percentage with SHAP feature explanations and peer-reviewed citations.\"</i>",
        callout_text
    ))
    story.append(Spacer(1, 8))

    # SECTION 2: Architecture & Tech Stack
    story.append(Paragraph("2. Complete Tech Stack & End-to-End System Flow", h1_style))
    story.append(Paragraph("The system is engineered as a production-grade, dual-mode client/server application:", body_style))
    
    stack_data = [
        [Paragraph("Layer", table_header), Paragraph("Technologies Used", table_header), Paragraph("Role & Key Responsibilities in Project", table_header)],
        [
            Paragraph("<b>Frontend UI & Client Engine</b>", table_body_bold),
            Paragraph("Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons", table_body),
            Paragraph("Provides user interface, responsive design, 5-second recording countdown, dynamic probability gauge, 22-biomarker comparison table, SHAP charts, and PDF export. Includes client-side YIN pitch tracker fallback.", table_body)
        ],
        [
            Paragraph("<b>Audio Processing</b>", table_body_bold),
            Paragraph("HTML5 Web Audio API, MediaRecorder, Praat Parselmouth (C-extension), Nolds", table_body),
            Paragraph("Captures uncompressed PCM audio at 44.1 kHz / 16 kHz. Enforces signal validation (1.0–90s duration, silence check RMS > 0.004, clipping check peak < 0.98). Extracts 22 clinical acoustic biomarkers.", table_body)
        ],
        [
            Paragraph("<b>Backend API</b>", table_body_bold),
            Paragraph("FastAPI (Python 3.11/3.14), Uvicorn, Pydantic, HTTP Multipart", table_body),
            Paragraph("High-performance asynchronous REST API. Endpoints: <code>/api/v1/analyze</code> (audio screening), <code>/api/v1/chat</code> (AI assistant), <code>/api/v1/benchmarks</code> (reproduced research), and <code>/api/v1/health</code>.", table_body)
        ],
        [
            Paragraph("<b>Machine Learning</b>", table_body_bold),
            Paragraph("Scikit-Learn, XGBoost, LightGBM, ExtraTrees, RandomForest, CalibratedClassifierCV", table_body),
            Paragraph("Trained on Oxford Parkinson's Dataset (UCI #174). Multi-model soft voting ensemble combining 5 tuned estimators with Platt sigmoid probability calibration under StratifiedGroupKFold.", table_body)
        ],
        [
            Paragraph("<b>Explainability & Assistant</b>", table_body_bold),
            Paragraph("SHAP (Shapley Additive exPlanations), Custom RAG Literature Engine", table_body),
            Paragraph("Calculates patient-level feature attributions (which biomarkers contributed most to the risk score) and retrieves relevant passages from 10 indexed peer-reviewed studies with verified DOIs.", table_body)
        ],
    ]
    t_stack = Table(stack_data, colWidths=[110, 150, 280])
    t_stack.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_navy),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_stack)
    story.append(Spacer(1, 10))

    # SECTION 3: The 4-Person Division
    story.append(Paragraph("3. 4-Person Team Presentation Division (Choose Your Roles!)", h1_style))
    story.append(Paragraph("To ensure your team presents as a cohesive, professional unit during the viva, divide the responsibilities into these 4 specific roles:", body_style))

    roles_data = [
        [Paragraph("Member & Title", table_header), Paragraph("Assigned Sections to Explain", table_header), Paragraph("Key Talking Points to Memorize & Deliver", table_header)],
        [
            Paragraph("<b>Person 1: Project Lead & Clinical Problem</b>", table_body_bold),
            Paragraph("Introduction, Clinical Motivation, Hypokinetic Dysarthria, Clinical Impact, System Overview", table_body),
            Paragraph("• Explain <b>why voice</b>: 90% of PD patients experience vocal changes up to 5 years before motor symptoms.<br/>"
                      "• Why sustained vowel <b>/a/</b>: Isolates vocal fold physics from dialect, language, or mouth shape.<br/>"
                      "• Emphasize: Pre-clinical screening aid to prompt early neurological referral, NOT a diagnostic machine.", table_body)
        ],
        [
            Paragraph("<b>Person 2: Audio Signal Processing Specialist</b>", table_body_bold),
            Paragraph("Audio Ingestion, Signal Validation, Praat Parselmouth Engine, 22 Biomarkers Dictionary", table_body),
            Paragraph("• Explain audio pre-checks: duration (1–90s), silence rejection (RMS > 0.004), clipping detection.<br/>"
                      "• Explain <b>YIN pitch tracking & Praat PointProcess</b>: How cycle-to-cycle periods are measured.<br/>"
                      "• Explain the 4 biomarker categories: Pitch ($F_0$), Jitters (frequency shake), Shimmers (amplitude shake), HNR (noise vs voice), and PPE (entropy).", table_body)
        ],
        [
            Paragraph("<b>Person 3: Machine Learning & Anti-Leakage Engineer</b>", table_body_bold),
            Paragraph("Dataset, Data Leakage Trap, StratifiedGroupKFold, 5-Model Ensemble, Probability Calibration", table_body),
            Paragraph("• Explain the <b>Data Leakage Trap</b>: Other papers got fake 98% accuracy because recordings from the same person were in both train & test. The model memorized pitch.<br/>"
                      "• Explain <b>StratifiedGroupKFold</b>: All recordings of a person stay in train OR test, never both!<br/>"
                      "• Explain the <b>Voting Ensemble</b>: 3*ET + 2*XGB + 2*LGB + 2*RF + 1*SVC. ROC-AUC: 0.9713, Sensitivity: 97.95%.", table_body)
        ],
        [
            Paragraph("<b>Person 4: Full-Stack Architect & Failure Analysis Expert</b>", table_body_bold),
            Paragraph("FastAPI backend, Next.js UI, Continuous Decimal Probability, SHAP Explainability, Limitations & Failure Points", table_body),
            Paragraph("• Explain why probabilities are <b>decimal points (e.g. 8.4%, 42.6%, 94.2%)</b> and not fixed step clamps.<br/>"
                      "• Explain <b>SHAP</b>: Shows which exact biomarkers raised the patient's risk.<br/>"
                      "• Explain <b>where it fails</b>: Background room noise, colds/laryngitis, continuous talking, small 31-subject dataset.", table_body)
        ],
    ]
    t_roles = Table(roles_data, colWidths=[110, 140, 290])
    t_roles.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_navy),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_roles)
    story.append(Spacer(1, 10))

    # SECTION 4: Biomarker Dictionary (All 22 Parameters)
    story.append(PageBreak())
    story.append(Paragraph("4. The 22 Biomarker Dictionary: What Every Parameter Means in Plain English", h1_style))
    story.append(Paragraph("The Oxford Parkinson's Dataset (UCI #174) contains 22 acoustic parameters. Here is the exact clinical explanation for each:", body_style))

    bio_data = [
        [Paragraph("Category & Feature", table_header), Paragraph("Normal Range", table_header), Paragraph("Plain-English Meaning", table_header), Paragraph("What Happens in Parkinson's Disease?", table_header)],
        # Pitch
        [
            Paragraph("<b>MDVP:Fo(Hz)</b>", table_body_bold),
            Paragraph("140 – 220 Hz", table_body),
            Paragraph("Average Fundamental Vocal Pitch (frequency of vocal cord vibration).", table_body),
            Paragraph("Monopitch: Restrictive pitch modulation due to vocal cord laryngeal rigidity.", table_body)
        ],
        [
            Paragraph("<b>MDVP:Fhi(Hz)</b>", table_body_bold),
            Paragraph("160 – 260 Hz", table_body),
            Paragraph("Maximum Vocal Pitch reached during vowel phonation.", table_body),
            Paragraph("Restricted upper pitch ceiling; sudden involuntary high-pitch tremor spikes.", table_body)
        ],
        [
            Paragraph("<b>MDVP:Flo(Hz)</b>", table_body_bold),
            Paragraph("110 – 190 Hz", table_body),
            Paragraph("Minimum Vocal Pitch reached during vowel phonation.", table_body),
            Paragraph("Sudden pitch dropouts when vocal folds fail to sustain glottal closure.", table_body)
        ],
        # Jitters
        [
            Paragraph("<b>MDVP:Jitter(%)</b>", table_body_bold),
            Paragraph("< 0.005 (0.5%)", table_body),
            Paragraph("Cycle-to-cycle frequency variation percentage. Measures how steady the vocal timing is.", table_body),
            Paragraph("<b>Elevated (> 0.007)</b>: Vocal cords tremble involuntarily at 4–7 Hz (laryngeal micro-tremor).", table_body)
        ],
        [
            Paragraph("<b>MDVP:Jitter(Abs)</b>", table_body_bold),
            Paragraph("< 0.00004 s", table_body),
            Paragraph("Absolute cycle-to-cycle jitter measured in microseconds.", table_body),
            Paragraph("Elevated; reflects absolute time fluctuation between consecutive vocal pulses.", table_body)
        ],
        [
            Paragraph("<b>MDVP:RAP</b>", table_body_bold),
            Paragraph("< 0.0025", table_body),
            Paragraph("Relative Amplitude Perturbation: Jitter averaged across 3 consecutive cycles.", table_body),
            Paragraph("Elevated; reduces smoothing effect over short time horizons.", table_body)
        ],
        [
            Paragraph("<b>MDVP:PPQ</b>", table_body_bold),
            Paragraph("< 0.0028", table_body),
            Paragraph("5-Point Period Perturbation Quotient: Jitter averaged across 5 consecutive cycles.", table_body),
            Paragraph("Elevated; shows sustained short-term frequency perturbation.", table_body)
        ],
        [
            Paragraph("<b>Jitter:DDP</b>", table_body_bold),
            Paragraph("< 0.0075", table_body),
            Paragraph("Average Difference of Differences: Exactly 3 × RAP (standard Praat identity).", table_body),
            Paragraph("Elevated; standard clinical metric for cycle-to-cycle speed instability.", table_body)
        ],
        # Shimmers
        [
            Paragraph("<b>MDVP:Shimmer</b>", table_body_bold),
            Paragraph("< 0.035 (3.5%)", table_body),
            Paragraph("Cycle-to-cycle amplitude variation ratio. Measures how steady vocal loudness is.", table_body),
            Paragraph("<b>Elevated (> 0.045)</b>: Vocal cord bowing prevents steady subglottic air pressure, causing breathiness.", table_body)
        ],
        [
            Paragraph("<b>MDVP:Shimmer(dB)</b>", table_body_bold),
            Paragraph("< 0.30 dB", table_body),
            Paragraph("Local amplitude perturbation expressed on a logarithmic decibel scale.", table_body),
            Paragraph("Elevated (> 0.40 dB); direct acoustic reflection of laryngeal breathiness.", table_body)
        ],
        [
            Paragraph("<b>Shimmer:APQ3</b>", table_body_bold),
            Paragraph("< 0.018", table_body),
            Paragraph("3-point Amplitude Perturbation Quotient: Local shimmer smoothed across 3 cycles.", table_body),
            Paragraph("Elevated due to inability to maintain consistent glottic opening area.", table_body)
        ],
        [
            Paragraph("<b>Shimmer:APQ5</b>", table_body_bold),
            Paragraph("< 0.022", table_body),
            Paragraph("5-point Amplitude Perturbation Quotient: Shimmer smoothed across 5 cycles.", table_body),
            Paragraph("Elevated in Parkinson's; highly correlated with clinical UPDRS speech scores.", table_body)
        ],
        [
            Paragraph("<b>MDVP:APQ</b>", table_body_bold),
            Paragraph("< 0.025", table_body),
            Paragraph("11-point Amplitude Perturbation Quotient: Long-term amplitude instability.", table_body),
            Paragraph("Significant elevation reflecting continuous phonatory decay and vocal exhaustion.", table_body)
        ],
        [
            Paragraph("<b>Shimmer:DDA</b>", table_body_bold),
            Paragraph("< 0.054", table_body),
            Paragraph("Average absolute differences between consecutive amplitude differences (3 × APQ3).", table_body),
            Paragraph("Elevated; standard KayPENTAX MDVP metric for amplitude perturbation.", table_body)
        ],
        # Noise
        [
            Paragraph("<b>HNR</b>", table_body_bold),
            Paragraph("22.0 – 33.0 dB", table_body),
            Paragraph("<b>Harmonics-to-Noise Ratio</b>: Ratio of pure periodic vocal tone to turbulent noise.", table_body),
            Paragraph("<b>Drops significantly (< 18.0 dB)</b>: Air leaks through bowed vocal cords, creating breathy noise.", table_body)
        ],
        [
            Paragraph("<b>NHR</b>", table_body_bold),
            Paragraph("< 0.015", table_body),
            Paragraph("<b>Noise-to-Harmonics Ratio</b>: Inverse of HNR ($10^{-\\text{HNR}/10}$).", table_body),
            Paragraph("Increases (> 0.025) as turbulent airflow replaces pure harmonic resonance.", table_body)
        ],
        # Nonlinear
        [
            Paragraph("<b>RPDE</b>", table_body_bold),
            Paragraph("0.30 – 0.55", table_body),
            Paragraph("Recurrence Period Density Entropy: Quantifies regularity of vocal recurrence patterns.", table_body),
            Paragraph("Elevates (> 0.55); voice transitions from a periodic cycle to a chaotic dynamical system.", table_body)
        ],
        [
            Paragraph("<b>DFA</b>", table_body_bold),
            Paragraph("0.55 – 0.72", table_body),
            Paragraph("Detrended Fluctuation Analysis: Measures fractal scaling exponent of pitch variations.", table_body),
            Paragraph("Alters towards 0.75+ indicating turbulent aerodynamic noise in the glottal airway.", table_body)
        ],
        [
            Paragraph("<b>spread1</b>", table_body_bold),
            Paragraph("-7.5 to -5.5", table_body),
            Paragraph("Nonlinear F0 variation metric: Logarithmic variance of fundamental frequency.", table_body),
            Paragraph("Increases towards -4.5 or higher; indicates fundamental frequency dispersion.", table_body)
        ],
        [
            Paragraph("<b>spread2</b>", table_body_bold),
            Paragraph("0.08 – 0.22", table_body),
            Paragraph("Standard deviation of logarithmic pitch fluctuations.", table_body),
            Paragraph("Significantly elevated; captures complex multi-frequency tremor components.", table_body)
        ],
        [
            Paragraph("<b>D2</b>", table_body_bold),
            Paragraph("1.80 – 2.30", table_body),
            Paragraph("Correlation Dimension: Measures the geometric complexity of the voice phase-space.", table_body),
            Paragraph("Elevates (> 2.45) as extra physiological degrees of freedom emerge from muscle rigidity.", table_body)
        ],
        [
            Paragraph("<b>PPE</b>", table_body_bold),
            Paragraph("0.05 – 0.18", table_body),
            Paragraph("<b>Pitch Period Entropy</b>: Shannon entropy of pitch fluctuations on a log scale.", table_body),
            Paragraph("<b>Top Biomarker (#1 in SHAP)</b>: Elevates (> 0.22). Healthy voice has predictable pitch; PD voice has high entropy.", table_body)
        ],
    ]
    t_bio = Table(bio_data, colWidths=[95, 75, 185, 185])
    t_bio.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_navy),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light]),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_bio)
    story.append(Spacer(1, 10))

    # SECTION 5: How We Trained & Anti-Data-Leakage
    story.append(PageBreak())
    story.append(Paragraph("5. How We Trained the Model: The Anti-Data-Leakage Story", h1_style))
    story.append(Paragraph(
        "<b>This is the single most important academic contribution of your project.</b> When professors ask about your training pipeline, explain this clearly:",
        body_style
    ))
    
    leakage_box = [
        [Paragraph("<b>🚨 The 'Data Leakage Trap' in Voice AI Literature (What Others Did Wrong)</b>", ParagraphStyle('W', parent=table_header, textColor=colors.HexColor("#7A1A1A")))],
        [Paragraph(
            "• The Oxford Dataset has <b>195 voice recordings from only 31 people</b> (average 6 recordings per person).<br/>"
            "• Published papers (e.g. Alshammri 2023, Yadav 2023, Srinivasan 2024) used standard random splits (70:30 or random 10-fold CV).<br/>"
            "• <b>The Fatal Flaw:</b> Recordings from the <i>same individual</i> appeared in both the training set and testing set! The machine learning model simply <b>memorized that person's vocal pitch (F0)</b> like a fingerprint, instead of learning Parkinsonian dysphonia.<br/>"
            "• As a result, those papers claimed false, inflated accuracies of <b>98% to 99%</b>, but when tested on a new, unseen human being, their models collapsed to ~75%!",
            callout_text
        )]
    ]
    t_leakage = Table(leakage_box, colWidths=[540])
    t_leakage.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#FFECEC")),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor("#FFF8F8")),
        ('BOX', (0,0), (-1,-1), 1.2, colors.HexColor("#E53E3E")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_leakage)
    story.append(Spacer(1, 8))

    solution_box = [
        [Paragraph("<b>✅ Our Anti-Leakage Solution: Subject-Independent StratifiedGroupKFold</b>", ParagraphStyle('S', parent=table_header, textColor=colors.HexColor("#0D5230")))],
        [Paragraph(
            "• We extracted the unique patient ID from the file name (e.g., <code>phon_R01_S01_1</code> &rarr; Subject <code>S01</code>).<br/>"
            "• We enforced <b>StratifiedGroupKFold (k=5)</b>: <i>All recordings of a patient are strictly quarantined to the training folds OR the testing fold, never split across both!</i><br/>"
            "• Feature scaling (<code>StandardScaler</code>) is fitted strictly inside each training fold to eliminate data snooping.<br/>"
            "• Our real, leak-free performance: <b>91.18% Accuracy, 0.9713 ROC-AUC, 97.95% Sensitivity (Recall)</b>.",
            callout_text
        )]
    ]
    t_solution = Table(solution_box, colWidths=[540])
    t_solution.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#EBFBF3")),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor("#F6FEFA")),
        ('BOX', (0,0), (-1,-1), 1.2, colors.HexColor("#38A169")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_solution)
    story.append(Spacer(1, 8))

    story.append(Paragraph("The Champion Multi-Model Soft Voting Ensemble Architecture:", h2_style))
    story.append(Paragraph(
        "Rather than relying on a single model that might overfit, we combine 5 diverse architectures weighted by their validation reliability:<br/>"
        "$$\\hat{P}(y=1 \\mid \\mathbf{x}) = \\frac{1}{10} \\left[ 3 \\cdot P_{\\text{ExtraTrees}} + 2 \\cdot P_{\\text{XGBoost}} + 2 \\cdot P_{\\text{LightGBM}} + 2 \\cdot P_{\\text{RandomForest}} + 1 \\cdot P_{\\text{CalibratedSVC}} \\right]$$",
        body_style
    ))
    story.append(Paragraph(
        "• <b>ExtraTrees (Weight 3)</b>: Extreme randomized decision trees provide maximum variance reduction against noisy acoustic features.<br/>"
        "• <b>XGBoost & LightGBM (Weight 2 each)</b>: Gradient boosted decision trees capture subtle nonlinear feature interactions.<br/>"
        "• <b>Random Forest (Weight 2)</b>: Robust bootstrap bagging classifier.<br/>"
        "• <b>Calibrated SVC (Weight 1)</b>: Support Vector Classifier with RBF kernel and Platt sigmoid probability scaling.",
        bullet_style
    ))
    story.append(Spacer(1, 10))

    # SECTION 6: The 3 Clinical Risk Tiers & Decimal Points
    story.append(Paragraph("6. Scoring System: Why Exact Decimal Points & 3 Risk Tiers?", h1_style))
    story.append(Paragraph(
        "Unlike toys that output rounded integers like flat 94% or 5%, Synapse-Voice delivers <b>exact decimal probabilities</b> (e.g. <code>8.4%</code>, <code>42.6%</code>, <code>94.2%</code>) across three clinically validated tiers:",
        body_style
    ))

    tier_data = [
        [Paragraph("Clinical Tier", table_header), Paragraph("Score Range", table_header), Paragraph("Acoustic Findings", table_header), Paragraph("Recommended Clinical Next Steps", table_header)],
        [
            Paragraph("<b>Low Risk</b>", table_body_bold),
            Paragraph("<b>< 35.0%</b><br/>(e.g. 8.4%)", table_body),
            Paragraph("Normal vocal fold vibration. Low jitter (<0.5%), low shimmer (<3.5%), high HNR (>22 dB), normal PPE (<0.18).", table_body),
            Paragraph("Normal screening. Repeat screening annually or if subjective voice symptoms change.", table_body)
        ],
        [
            Paragraph("<b>Moderate Concern</b>", table_body_bold),
            Paragraph("<b>35.0% – 65.0%</b><br/>(e.g. 42.6%)", table_body),
            Paragraph("Subtle acoustic instability: borderline HNR (18–22 dB), slight amplitude jitter, or ambient room microphone noise.", table_body),
            Paragraph("Non-diagnostic. Retest in a quiet room closer to the mic; repeat in 30 days. Recommend clinical monitoring if hoarseness persists.", table_body)
        ],
        [
            Paragraph("<b>Elevated Risk</b>", table_body_bold),
            Paragraph("<b>> 65.0%</b><br/>(e.g. 94.2%)", table_body),
            Paragraph("Prominent dysphonia markers: elevated PPE (>0.22), reduced HNR (<17 dB), and elevated jitter/shimmer reflecting vocal fold micro-tremors.", table_body),
            Paragraph("Prompt specialist evaluation by a board-certified neurologist or speech-language pathologist for comprehensive motor UPDRS examination.", table_body)
        ],
    ]
    t_tier = Table(tier_data, colWidths=[90, 80, 185, 185])
    t_tier.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_navy),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_tier)
    story.append(Spacer(1, 10))

    # SECTION 7: Where Will It Fail? (Exam Question!)
    story.append(PageBreak())
    story.append(Paragraph("7. Where Will the Model Fail? (Crucial Viva Question: 'What Are Your Limitations?')", h1_style))
    story.append(Paragraph(
        "<b>Professors love asking:</b> <i>\"When will your system give an incorrect result? What are its failure modes?\"</i><br/>"
        "Be completely honest and demonstrate mature engineering by listing these 5 verified scientific failure points:",
        body_style
    ))

    fail_points = [
        ("1. Ambient Room Noise & Low-Quality Microphones", 
         "A noisy room (air conditioning, computer fans, street noise) or holding the microphone too far from the mouth introduces background noise. This artificially lowers the Harmonics-to-Noise Ratio (HNR) and can push a healthy voice into Moderate Concern (35%–55%). <i>Mitigation: We built an audio pre-validation filter that checks RMS energy and SNR, warning the user if SNR < 10 dB.</i>"),
        
        ("2. Common Cold, Laryngitis, or Smoking Dysphonia", 
         "Our model screens for acoustic vocal fold dysphonia. It cannot differentiate between hypokinetic dysphonia caused by Parkinson's versus vocal fold inflammation caused by a common cold, acute laryngitis, vocal nodules, or heavy smoking. A patient with severe laryngitis could receive a false Elevated Risk. <i>Mitigation: Clear onboarding prompts asking users not to screen while suffering from respiratory illness.</i>"),
         
        ("3. Continuous Natural Speech (Talking Sentences)", 
         "Our feature extractor relies on <b>sustained vowel phonation ('ahhh')</b>. If a user tries to speak a sentence ('Hello, my name is John'), consonant closures, unvoiced stops (/p/, /t/, /k/), and natural pauses cause pitch tracking to fail. <i>Mitigation: The YIN algorithm requires at least 8 continuous voiced pitch periods; otherwise it throws a clear validation error.</i>"),
         
        ("4. Small Benchmark Training Cohort (31 Subjects)", 
         "The Oxford dataset contains 195 recordings from 31 individuals (23 PD, 8 Healthy Controls). While mathematically sufficient for proof-of-concept research, a clinical tool requires thousands of diverse recordings across accents, genders, and age groups to account for demographic variance. <i>Mitigation: We explicitly publish this in our Literature Audit and Model Card.</i>"),
         
        ("5. Pre-Clinical Screening Aid, NOT a Diagnostic Device", 
         "Synapse-Voice provides risk probability screening to identify individuals who should see a doctor. It does NOT diagnose Parkinson's disease. A clinical diagnosis requires neurological motor examination (MDS-UPDRS), DaTscan SPECT neuroimaging, and levodopa response testing."),
    ]

    for title, desc in fail_points:
        story.append(Paragraph(f"<b>{title}</b>", h2_style))
        story.append(Paragraph(desc, body_style))
        story.append(Spacer(1, 3))

    story.append(Spacer(1, 8))

    # SECTION 8: Top 10 Viva Questions & Exact Answers
    story.append(Paragraph("8. Top 10 Most Frequently Asked Viva Questions & Model Answers", h1_style))
    story.append(Paragraph("Memorize these answers before walking into your presentation room:", body_style))

    viva_qa = [
        ("Q1: What is the input to your system and what is the output?",
         "<b>Input:</b> A 5-second audio recording (.wav, .mp3, .webm) of a sustained vowel /a/ phonation.<br/>"
         "<b>Output:</b> 22 extracted Praat acoustic biomarkers, a calibrated posterior probability score with exact decimal precision (e.g. 18.4% or 94.2%), a clinical risk tier (Low / Moderate / Elevated), patient-level SHAP feature attributions, and peer-reviewed literature citations with active DOIs."),

        ("Q2: Why did you use sustained vowel /a/ instead of having the patient read a sentence?",
         "Sustained vowel phonation isolates pure laryngeal vocal fold neuromuscular vibration from linguistic factors like language, dialect, mouth shape, and consonant articulation. It allows direct measurement of basal ganglia motor control over the vocal cords."),

        ("Q3: What was the major flaw in prior published research papers?",
         "Prior papers (e.g. Alshammri 2023, Yadav 2023) used standard random train/test splits. Because each patient recorded ~6 vowel samples, samples from the same patient ended up in both train and test. The models simply memorized patient-specific pitch (F0), reporting falsely inflated 98%+ accuracies that fail completely in real-world clinical testing."),

        ("Q4: How did your team solve this data leakage problem?",
         "We implemented <b>StratifiedGroupKFold</b> cross-validation. All recordings of any patient are strictly isolated to either the training fold or the testing fold. No patient's voice is ever seen in both! Our genuine, leak-free validation accuracy is 91.18% with 0.9713 ROC-AUC."),

        ("Q5: What are Jitter and Shimmer in simple terms?",
         "<b>Jitter</b> is the cycle-to-cycle variation in <i>pitch frequency</i> (timing shake).<br/>"
         "<b>Shimmer</b> is the cycle-to-cycle variation in <i>sound wave amplitude</i> (loudness shake). Both increase in Parkinson's due to vocal cord tremor and incomplete closure."),

        ("Q6: What is PPE (Pitch Period Entropy) and why is it important?",
         "PPE was invented by Max Little et al. (2009). It measures the Shannon entropy of pitch period fluctuations on a logarithmic semitone scale. Healthy voices maintain steady pitch (low entropy < 0.15). In Parkinson's, dopamine depletion causes chaotic pitch fluctuations, driving PPE > 0.22. PPE is our #1 most important feature in SHAP analysis."),

        ("Q7: What machine learning algorithms did you evaluate?",
         "We evaluated 7 individual models: Logistic Regression, Calibrated SVC (RBF), Random Forest, ExtraTrees, XGBoost, LightGBM, and an MLP Neural Network. Our champion is a <b>Soft Voting Ensemble</b> combining ExtraTrees, XGBoost, LightGBM, Random Forest, and Calibrated SVC."),

        ("Q8: How does your system explain its predictions to a doctor or patient?",
         "We use <b>SHAP (Shapley Additive exPlanations)</b> to show which exact biomarkers pushed the probability up or down. We also have a RAG (Retrieval-Augmented Generation) assistant that indexes 10 peer-reviewed medical studies with verified DOIs, giving evidence-backed clinical rationales."),

        ("Q9: What happens if the Python backend is offline or waking up?",
         "Our Next.js frontend has a built-in native TypeScript acoustic signal processing engine. It uses client-side YIN pitch tracking with sub-sample parabolic interpolation and a calibrated Bayesian logistic classifier, allowing screening to function offline directly in the browser!"),

        ("Q10: Is this system ready to diagnose patients in a hospital?",
         "<b>No.</b> It is strictly an academic pre-clinical screening research aid. It screens for acoustic dysphonia to flag individuals who should be referred to a board-certified neurologist. Diagnosis requires clinical neurological motor assessment (UPDRS) and DaTscan imaging.")
    ]

    for q, ans in viva_qa:
        story.append(Paragraph(q, q_style))
        story.append(Paragraph(ans, ans_style))

    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1, color=c_blue, spaceBefore=8, spaceAfter=8))
    story.append(Paragraph("<b>Good luck with your exam and project viva! Speak with confidence, explain the anti-leakage story clearly, and present your roles as a united team.</b>", ParagraphStyle('Final', parent=body_style, fontName='Helvetica-Bold', textColor=c_navy, alignment=1)))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated at: {filename}")

if __name__ == '__main__':
    build_pdf()
