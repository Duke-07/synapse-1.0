"""
Complete, publication-quality Phase-I Report Generator for Synapse-Voice.
Conforms strictly to VIT Bhopal EPICS 'Phase-I report format.docx'.
"""

import os
import shutil
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_cell_background(cell, hex_color):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_borders(cell, top="CCCCCC", bottom="CCCCCC", left="CCCCCC", right="CCCCCC", sz="4"):
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="{sz}" w:space="0" w:color="{top}"/>'
        f'<w:left w:val="single" w:sz="{sz}" w:space="0" w:color="{left}"/>'
        f'<w:bottom w:val="single" w:sz="{sz}" w:space="0" w:color="{bottom}"/>'
        f'<w:right w:val="single" w:sz="{sz}" w:space="0" w:color="{right}"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(tcBorders)

def add_header_footer(doc):
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        
        # Header
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("Synapse-Voice: EPICS Phase – I Project Report")
        hrun.font.name = "Times New Roman"
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = RGBColor(120, 120, 120)
        
        # Footer
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        frun = fp.add_run("VIT Bhopal University | Department of Computing Science & Engineering")
        frun.font.name = "Times New Roman"
        frun.font.size = Pt(8.5)
        frun.font.color.rgb = RGBColor(120, 120, 120)

def main():
    print("Building Phase-I Word Report...")
    doc = docx.Document()
    add_header_footer(doc)

    # Base styles configuration
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Times New Roman'
    normal_style.font.size = Pt(12)
    normal_style.font.color.rgb = RGBColor(30, 30, 30)
    normal_style.paragraph_format.line_spacing = 1.15
    normal_style.paragraph_format.space_after = Pt(6)

    # Helper functions
    def add_p(text, bold=False, italic=False, align=WD_ALIGN_PARAGRAPH.LEFT, space_before=0, space_after=6, size=12, color=RGBColor(30,30,30)):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.15
        run = p.add_run(text)
        run.bold = bold
        run.italic = italic
        run.font.name = 'Times New Roman'
        run.font.size = Pt(size)
        run.font.color.rgb = color
        return p

    def add_h1(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.font.name = 'Times New Roman'
        run.font.size = Pt(14)
        run.font.color.rgb = RGBColor(9, 0, 137) # Deep Navy
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12.5)
        run.font.color.rgb = RGBColor(0, 96, 202) # Electric Cobalt
        return p

    def add_h3(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.italic = True
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12)
        run.font.color.rgb = RGBColor(50, 50, 70)
        return p

    def add_callout(text, title="KEY CLINICAL TAKEAWAY"):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = tbl.cell(0, 0)
        cell.width = Inches(6.5)
        set_cell_background(cell, "F0F5FA")
        set_cell_borders(cell, top="0060CA", bottom="0060CA", left="0060CA", right="0060CA", sz="12")
        set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(2)
        r_title = p.add_run(f"📌 {title}: ")
        r_title.bold = True
        r_title.font.name = 'Times New Roman'
        r_title.font.size = Pt(11)
        r_title.font.color.rgb = RGBColor(0, 96, 202)
        r_text = p.add_run(text)
        r_text.font.name = 'Times New Roman'
        r_text.font.size = Pt(10.5)
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    def add_figure(img_rel_path, fig_no, caption, width=Inches(5.8)):
        img_path = os.path.abspath(img_rel_path)
        if os.path.exists(img_path):
            p_img = doc.add_paragraph()
            p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_img.paragraph_format.space_before = Pt(8)
            p_img.paragraph_format.space_after = Pt(2)
            run = p_img.add_run()
            run.add_picture(img_path, width=width)
            
            p_cap = doc.add_paragraph()
            p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_cap.paragraph_format.space_after = Pt(10)
            r_num = p_cap.add_run(f"Figure {fig_no}. ")
            r_num.bold = True
            r_num.font.name = 'Times New Roman'
            r_num.font.size = Pt(10.5)
            r_cap = p_cap.add_run(caption)
            r_cap.italic = True
            r_cap.font.name = 'Times New Roman'
            r_cap.font.size = Pt(10.5)
        else:
            print(f"Warning: Image not found at {img_path}")

    # =========================================================================
    # 1. TITLE PAGE
    # =========================================================================
    add_p("SYNAPSE-VOICE: AI-POWERED PRE-CLINICAL ACOUSTIC SCREENING FOR PARKINSON’S DISEASE DETECTION USING 22 PRAAT BIOMARKERS AND ZERO-LEAKAGE ENSEMBLE LEARNING",
          bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, size=18, space_before=18, space_after=14, color=RGBColor(9, 0, 137))
    
    add_p("An Engineering Project in Community Service (EPICS)",
          italic=True, align=WD_ALIGN_PARAGRAPH.CENTER, size=14, space_after=8, color=RGBColor(0, 96, 202))
    
    add_p("Phase – I Report",
          bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, size=15, space_after=16, color=RGBColor(50, 50, 50))
    
    add_p("Submitted by",
          italic=True, align=WD_ALIGN_PARAGRAPH.CENTER, size=12, space_after=12)

    # Team Members Table
    t_members = doc.add_table(rows=5, cols=3)
    t_members.alignment = WD_TABLE_ALIGNMENT.CENTER
    members_data = [
        ("Sl. No.", "Register Number", "Name of the Student"),
        ("1", "24BCY10250", "NITYA NARAYAN GOPALAKRISHNAN"),
        ("2", "24BCE11250", "Aaryan Dwivedi"),
        ("3", "24BCE10395", "Yug Jigneshkumar Patel"),
        ("4", "24BCY10074", "SHAILESH YALAMANCHI")
    ]
    for r_idx, row in enumerate(members_data):
        for c_idx, val in enumerate(row):
            cell = t_members.cell(r_idx, c_idx)
            cell.text = val
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.0
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.space_before = Pt(2)
            set_cell_margins(cell, top=60, bottom=60, left=100, right=100)
            if r_idx == 0:
                set_cell_background(cell, "090089")
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                p.runs[0].font.color.rgb = RGBColor(255, 255, 255)
                p.runs[0].bold = True
                p.runs[0].font.size = Pt(10.5)
            else:
                set_cell_background(cell, "F9FBFE" if r_idx % 2 == 1 else "FFFFFF")
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER if c_idx < 2 else WD_ALIGN_PARAGRAPH.LEFT
                p.runs[0].font.size = Pt(10)
                if c_idx == 1:
                    p.runs[0].bold = True
            set_cell_borders(cell, top="CCCCCC", bottom="CCCCCC", left="CCCCCC", right="CCCCCC")

    t_members.columns[0].width = Inches(0.8)
    t_members.columns[1].width = Inches(1.8)
    t_members.columns[2].width = Inches(3.8)

    add_p("", space_after=20)
    add_p("in partial fulfillment of the requirements for the degree of",
          align=WD_ALIGN_PARAGRAPH.CENTER, size=11, space_after=4)
    add_p("Bachelor of Technology",
          bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, size=13, space_after=4, color=RGBColor(9, 0, 137))
    add_p("School of Computing Science and Engineering & Cyber Security",
          align=WD_ALIGN_PARAGRAPH.CENTER, size=11, space_after=18)
    
    add_p("VIT Bhopal University",
          bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, size=15, space_after=2, color=RGBColor(0, 96, 202))
    add_p("Bhopal – 466114, Madhya Pradesh, India",
          align=WD_ALIGN_PARAGRAPH.CENTER, size=11, space_after=14)
    add_p("November, 2024",
          bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, size=11)

    doc.add_page_break()

    # =========================================================================
    # 2. BONAFIDE CERTIFICATE
    # =========================================================================
    add_p("VIT Bhopal University", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, size=15, color=RGBColor(9,0,137))
    add_p("Bhopal – 466114, Madhya Pradesh", align=WD_ALIGN_PARAGRAPH.CENTER, size=11, space_after=18)
    
    add_p("BONAFIDE CERTIFICATE", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, size=15, space_after=16, color=RGBColor(0,96,202))

    cert_text = (
        "Certified that this project report titled “SYNAPSE-VOICE: AI-POWERED PRE-CLINICAL ACOUSTIC "
        "SCREENING FOR PARKINSON’S DISEASE DETECTION USING 22 PRAAT BIOMARKERS AND ZERO-LEAKAGE ENSEMBLE LEARNING” "
        "is the bonafide work of NITYA NARAYAN GOPALAKRISHNAN (24BCY10250), Aaryan Dwivedi (24BCE11250), "
        "Yug Jigneshkumar Patel (24BCE10395), and SHAILESH YALAMANCHI (24BCY10074) who carried out the "
        "project work under my supervision for the course Engineering Project in Community Service (EPICS)."
    )
    p_cert = add_p(cert_text, space_after=16)
    p_cert.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    add_p("This project report (Phase I) is submitted for the Project Viva-Voce examination held on ............................................",
          italic=True, space_after=40)

    # Signatures table
    t_sig = doc.add_table(rows=1, cols=3)
    t_sig.alignment = WD_TABLE_ALIGNMENT.CENTER
    c_s1 = t_sig.cell(0, 0)
    c_s2 = t_sig.cell(0, 1)
    c_s3 = t_sig.cell(0, 2)
    
    p1 = c_s1.paragraphs[0]
    p1.add_run("_____________________\n").bold = True
    p1.add_run("Dr. Ashok Kumar Patel\n").bold = True
    p1.add_run("EPICS Coordinator\nVIT Bhopal University")
    p1.runs[0].font.size = Pt(10)
    
    p2 = c_s2.paragraphs[0]
    p2.add_run("_____________________\n").bold = True
    p2.add_run("Faculty Reviewer 1\n").bold = True
    p2.add_run("Comments & Signature\nDate: ")
    p2.runs[0].font.size = Pt(10)
    
    p3 = c_s3.paragraphs[0]
    p3.add_run("_____________________\n").bold = True
    p3.add_run("Faculty Reviewer 2\n").bold = True
    p3.add_run("Comments & Signature\nDate: ")
    p3.runs[0].font.size = Pt(10)

    for cell in [c_s1, c_s2, c_s3]:
        cell.width = Inches(2.1)
        set_cell_borders(cell, top="FFFFFF", bottom="FFFFFF", left="FFFFFF", right="FFFFFF")

    doc.add_page_break()

    # =========================================================================
    # 3. DECLARATION OF ORIGINALITY
    # =========================================================================
    add_p("DECLARATION OF ORIGINALITY", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, size=15, space_after=16, color=RGBColor(9,0,137))
    
    decl_text = (
        "We hereby declare that this report entitled “SYNAPSE-VOICE: AI-POWERED PRE-CLINICAL ACOUSTIC "
        "SCREENING FOR PARKINSON’S DISEASE DETECTION USING 22 PRAAT BIOMARKERS AND ZERO-LEAKAGE ENSEMBLE LEARNING” "
        "represents our original work carried out for the EPICS project as students of VIT Bhopal University. "
        "To the best of our knowledge, it contains no material previously published or written by another person, "
        "nor any material presented for the award of any other degree or diploma of VIT Bhopal University or any "
        "other institution. Works of other authors cited in this report have been duly acknowledged under the section 'References'."
    )
    p_decl = add_p(decl_text, space_after=30)
    p_decl.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    # Declaration table matching Table 0 of template
    t_decl = doc.add_table(rows=1, cols=3)
    t_decl.alignment = WD_TABLE_ALIGNMENT.CENTER
    c_d1 = t_decl.cell(0, 0)
    c_d2 = t_decl.cell(0, 1)
    c_d3 = t_decl.cell(0, 2)
    
    c_d1.paragraphs[0].add_run("Place: Bhopal\nDate: 25-11-2024").font.size = Pt(10.5)
    c_d2.paragraphs[0].add_run("").font.size = Pt(10.5)
    
    p_names = c_d3.paragraphs[0]
    p_names.add_run("Register Number & Student Signatures:\n\n").bold = True
    p_names.add_run("1. 24BCY10250 – NITYA NARAYAN G.  __________________\n\n")
    p_names.add_run("2. 24BCE11250 – Aaryan Dwivedi      __________________\n\n")
    p_names.add_run("3. 24BCE10395 – Yug Jigneshkumar P. __________________\n\n")
    p_names.add_run("4. 24BCY10074 – SHAILESH Y.        __________________\n")
    for r in p_names.runs:
        r.font.size = Pt(9.5)

    c_d1.width = Inches(1.5)
    c_d2.width = Inches(0.5)
    c_d3.width = Inches(4.4)
    for cell in [c_d1, c_d2, c_d3]:
        set_cell_borders(cell, top="FFFFFF", bottom="FFFFFF", left="FFFFFF", right="FFFFFF")

    doc.add_page_break()

    # =========================================================================
    # 4. ACKNOWLEDGEMENT
    # =========================================================================
    add_p("ACKNOWLEDGEMENT", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, size=15, space_after=14, color=RGBColor(9,0,137))
    
    ack_text = (
        "This project has benefited immensely from the guidance, support, and encouragement of many individuals. "
        "Whilst it would be simple to name them all, it would not be easy to thank them adequately.\n\n"
        "First and foremost, we express our profound gratitude to the honorable Chancellor and Vice-Chancellor of "
        "VIT Bhopal University for providing an exemplary academic and research ecosystem that nurtures community-driven "
        "engineering solutions.\n\n"
        "We extend our sincere thanks to Dr. Ashok Kumar Patel, EPICS Coordinator, and our respected Faculty Reviewers "
        "for their constructive critique, technical insights, and continuous encouragement throughout Phase–I of this project.\n\n"
        "We are also indebted to the global biomedical research community—especially Dr. Max A. Little, Dr. Athanasios Tsanas, "
        "and the University of California Irvine (UCI) Machine Learning Repository—for publishing open benchmark voice datasets "
        "and advancing computational dysphonia algorithms for the benefit of humanity.\n\n"
        "Finally, we thank our parents and peers whose constant moral support made this work possible."
    )
    p_ack = add_p(ack_text, space_after=16)
    p_ack.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    doc.add_page_break()

    # =========================================================================
    # 5. ABSTRACT
    # =========================================================================
    add_p("ABSTRACT", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, size=15, space_after=14, color=RGBColor(9,0,137))
    
    abstract_text = (
        "Parkinson’s Disease (PD) is the second most prevalent progressive neurodegenerative disorder worldwide, "
        "characterized by the death of dopaminergic neurons in the substantia nigra pars compacta. By the time classical "
        "cardinal motor manifestations (resting tremors, bradykinesia, rigidity, and postural instability) are clinically observed, "
        "an estimated 60% to 80% of nigrostriatal dopaminergic neurons have already undergone irreversible apoptosis. Crucially, "
        "up to 90% of individuals with Parkinson’s develop hypokinetic dysarthria—characterized by incomplete vocal fold adduction, "
        "reduced phonatory amplitude, pitch micro-tremors, and breathiness—often three to five years before gross motor onset. "
        "However, widespread early neurological assessment remains inaccessible due to severe shortages of movement disorder specialists, "
        "particularly across rural and semi-urban communities.\n\n"
        "In the present work, we have designed, implemented, and empirically validated Synapse-Voice: an end-to-end, privacy-preserving, "
        "pre-clinical acoustic screening platform that extracts 22 clinically standard Praat acoustic biomarkers from a brief 5-second "
        "sustained vowel phonation (/a/). Furthermore, this report documents a critical methodological discovery: widespread "
        "recording-level data leakage across published speech AI literature (e.g., Alshammri et al. 2023, Yadav 2023), where repeated "
        "phonations from the same patient contaminated both training and testing folds, generating spuriously inflated accuracies exceeding 98%. "
        "We resolve this flaw by implementing a strict subject-isolated cross-validation protocol (StratifiedGroupKFold, k=5) and deploy a "
        "calibrated champion soft voting ensemble combining ExtraTrees, XGBoost, LightGBM, Random Forest, and Calibrated Support Vector Classifiers. "
        "Our system achieves a verifiable ROC-AUC of 0.9713, 91.18% accuracy, and 97.95% sensitivity (144 of 147 PD samples detected), with "
        "continuous decimal probability calibration (e.g. 8.4%, 42.6%, 94.2%), patient-level SHAP explainability, and a zero-retention privacy architecture."
    )
    p_abs = add_p(abstract_text, space_after=16)
    p_abs.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    add_callout(
        "Synapse-Voice resolves the pervasive 'Data Leakage Trap' in published voice AI literature, achieving a verified 0.9713 ROC-AUC and 97.95% clinical sensitivity under strict subject-isolated StratifiedGroupKFold cross-validation.",
        "PROJECT CONTRIBUTION SUMMARY"
    )

    doc.add_page_break()

    # =========================================================================
    # 6. TABLE OF CONTENTS (INDEX)
    # =========================================================================
    add_p("TABLE OF CONTENTS", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, size=15, space_after=14, color=RGBColor(9,0,137))
    
    t_toc = doc.add_table(rows=1, cols=3)
    t_toc.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_toc.cell(0, 0).text = "Chapter No."
    t_toc.cell(0, 1).text = "Topic Title"
    t_toc.cell(0, 2).text = "Page No."
    for c_idx in range(3):
        cell = t_toc.cell(0, c_idx)
        set_cell_background(cell, "090089")
        set_cell_margins(cell, top=60, bottom=60, left=80, right=80)
        p = cell.paragraphs[0]
        p.runs[0].font.color.rgb = RGBColor(255,255,255)
        p.runs[0].bold = True
        p.runs[0].font.size = Pt(10)
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER if c_idx != 1 else WD_ALIGN_PARAGRAPH.LEFT

    toc_items = [
        ("—", "Bonafide Certificate", "ii"),
        ("—", "Declaration of Originality", "iii"),
        ("—", "Acknowledgement", "iv"),
        ("—", "Abstract", "v"),
        ("—", "List of Figures", "vii"),
        ("—", "List of Tables", "viii"),
        ("1", "INTRODUCTION", "1"),
        ("1.1", "Background and Clinical Context", "1"),
        ("1.2", "Hypokinetic Dysarthria & Acoustic Manifestation", "2"),
        ("2", "MOTIVATION", "3"),
        ("2.1", "The Clinical Diagnostic Bottleneck", "3"),
        ("2.2", "Community Service & Healthcare Democratization (EPICS)", "4"),
        ("3", "OBJECTIVES OF THE WORK", "5"),
        ("4", "EXISTING WORK / LITERATURE REVIEW", "6"),
        ("4.1", "Foundational Acoustic Biomarker Studies", "6"),
        ("4.2", "Modern Machine Learning & Deep Learning Implementations", "7"),
        ("4.3", "Critical Audit: The 'Data Leakage Trap' in Voice AI", "8"),
        ("5", "TOPIC OF THE WORK: SYSTEM DESIGN & METHODOLOGY", "10"),
        ("5.1", "End-to-End System Architecture", "10"),
        ("5.2", "Audio Signal Processing & Quality Gatekeeper", "11"),
        ("5.3", "The 22 Praat Acoustic Biomarkers Taxonomy", "12"),
        ("5.4", "Latent Manifold Geometry & Correlation Structure", "14"),
        ("5.5", "Subject-Isolated Cross-Validation Framework", "15"),
        ("5.6", "Champion Multi-Model Soft Voting Ensemble", "16"),
        ("5.7", "Continuous Decimal Probability Calibration", "17"),
        ("5.8", "Explainable AI (SHAP) & Literature RAG Assistant", "18"),
        ("5.9", "Results, Benchmarks & Discussion", "19"),
        ("6", "INDIVIDUAL CONTRIBUTIONS BY TEAM MEMBERS", "21"),
        ("6.1", "NITYA NARAYAN GOPALAKRISHNAN (24BCY10250)", "21"),
        ("6.2", "Aaryan Dwivedi (24BCE11250)", "22"),
        ("6.3", "Yug Jigneshkumar Patel (24BCE10395)", "23"),
        ("6.4", "SHAILESH YALAMANCHI (24BCY10074)", "24"),
        ("7", "SYSTEM LIMITATIONS & SCIENTIFIC FAILURE MODES", "25"),
        ("8", "CONCLUSION & PHASE–II ROADMAP", "27"),
        ("—", "REFERENCES (32 Peer-Reviewed Citations)", "28"),
        ("—", "BIODATA OF TEAM MEMBERS", "32"),
    ]

    for item in toc_items:
        row = t_toc.add_row()
        for c_idx, val in enumerate(item):
            cell = row.cells[c_idx]
            cell.text = val
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.0
            p.paragraph_format.space_after = Pt(1.5)
            p.paragraph_format.space_before = Pt(1.5)
            set_cell_margins(cell, top=40, bottom=40, left=80, right=80)
            set_cell_borders(cell, top="E0E0E0", bottom="E0E0E0", left="FFFFFF", right="FFFFFF")
            p.runs[0].font.size = Pt(9.5)
            if c_idx == 0:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                p.runs[0].bold = True
            elif c_idx == 2:
                p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
            else:
                if len(item[0]) == 1 and item[0] != "—":
                    p.runs[0].bold = True

    t_toc.columns[0].width = Inches(1.0)
    t_toc.columns[1].width = Inches(4.5)
    t_toc.columns[2].width = Inches(0.9)

    doc.add_page_break()

    # =========================================================================
    # 7. LIST OF FIGURES & LIST OF TABLES
    # =========================================================================
    add_p("LIST OF FIGURES", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, size=15, space_after=12, color=RGBColor(9,0,137))
    t_lof = doc.add_table(rows=1, cols=3)
    t_lof.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_lof.cell(0, 0).text = "Fig. No."
    t_lof.cell(0, 1).text = "Caption / Description"
    t_lof.cell(0, 2).text = "Page No."
    for c_idx in range(3):
        cell = t_lof.cell(0, c_idx)
        set_cell_background(cell, "090089")
        p = cell.paragraphs[0]
        p.runs[0].font.color.rgb = RGBColor(255,255,255)
        p.runs[0].bold = True
        p.runs[0].font.size = Pt(10)
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER if c_idx != 1 else WD_ALIGN_PARAGRAPH.LEFT
    
    figures_list = [
        ("1", "Synapse-Voice End-to-End System Design & Architecture Pipeline", "10"),
        ("2", "Oxford Clinical Cohort Distribution and Phonation Sampling Protocol", "11"),
        ("3", "Comparative Boxplots of Top 6 Clinical Acoustic Biomarkers", "13"),
        ("4", "22-Biomarker Pearson Correlation Matrix and Multicollinearity Structure", "14"),
        ("5", "Unsupervised Latent Manifold Geometry via PCA and t-SNE Projections", "15"),
        ("6", "Receiver Operating Characteristic (ROC) Benchmark Curves Across 8 Models", "16"),
        ("7", "Champion Ensemble Confusion Matrix and Reliability Calibration Diagram", "17"),
        ("8", "Global Feature Importance Spectrum and SHAP Summary Attribution Plot", "19")
    ]
    for item in figures_list:
        row = t_lof.add_row()
        for c_idx, val in enumerate(item):
            cell = row.cells[c_idx]
            cell.text = val
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.0
            p.paragraph_format.space_after = Pt(2)
            set_cell_margins(cell, top=40, bottom=40, left=80, right=80)
            set_cell_borders(cell, top="E0E0E0", bottom="E0E0E0", left="FFFFFF", right="FFFFFF")
            p.runs[0].font.size = Pt(9.5)
            if c_idx != 1:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    t_lof.columns[0].width = Inches(0.8)
    t_lof.columns[1].width = Inches(4.8)
    t_lof.columns[2].width = Inches(0.8)

    add_p("", space_after=14)
    add_p("LIST OF TABLES", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, size=15, space_after=12, color=RGBColor(9,0,137))
    t_lot = doc.add_table(rows=1, cols=3)
    t_lot.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_lot.cell(0, 0).text = "Table No."
    t_lot.cell(0, 1).text = "Caption / Description"
    t_lot.cell(0, 2).text = "Page No."
    for c_idx in range(3):
        cell = t_lot.cell(0, c_idx)
        set_cell_background(cell, "090089")
        p = cell.paragraphs[0]
        p.runs[0].font.color.rgb = RGBColor(255,255,255)
        p.runs[0].bold = True
        p.runs[0].font.size = Pt(10)
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER if c_idx != 1 else WD_ALIGN_PARAGRAPH.LEFT
    
    tables_list = [
        ("1", "Literature Review & Quantitative Audit of Published Parkinson's Voice Papers", "9"),
        ("2", "Comprehensive Taxonomy & Reference Norms for 22 Praat Acoustic Biomarkers", "12"),
        ("3", "Subject-Isolated Cross-Validation Performance Across 8 Evaluated Architectures", "17"),
        ("4", "Three-Tier Clinical Risk Score Stratification and Guidance Protocol", "18"),
        ("5", "Champion Model Confusion Matrix Breakdown on Test Cohort", "20"),
        ("6", "Project Milestone Deliverables and Responsibilities Breakdown", "24")
    ]
    for item in tables_list:
        row = t_lot.add_row()
        for c_idx, val in enumerate(item):
            cell = row.cells[c_idx]
            cell.text = val
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.0
            p.paragraph_format.space_after = Pt(2)
            set_cell_margins(cell, top=40, bottom=40, left=80, right=80)
            set_cell_borders(cell, top="E0E0E0", bottom="E0E0E0", left="FFFFFF", right="FFFFFF")
            p.runs[0].font.size = Pt(9.5)
            if c_idx != 1:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    t_lot.columns[0].width = Inches(0.8)
    t_lot.columns[1].width = Inches(4.8)
    t_lot.columns[2].width = Inches(0.8)

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 1: INTRODUCTION
    # =========================================================================
    add_h1("CHAPTER 1: INTRODUCTION")
    add_h2("1.1 Background and Clinical Context")
    add_p(
        "Parkinson’s Disease (PD) is an incurable, progressive neurodegenerative pathology that represents the fastest-growing "
        "neurological disorder in terms of prevalence, disability, and mortality rates worldwide (Dorsey et al. 2018). The disease is "
        "etiologically characterized by the progressive degeneration of neuromelanin-containing dopaminergic neurons in the substantia nigra "
        "pars compacta (SNpc), coupled with the pathological aggregation of misfolded alpha-synuclein proteins into insoluble Lewy bodies "
        "throughout the brainstem, basal ganglia, and cortical networks (Braak et al. 2003).\n\n"
        "Traditionally, clinical diagnosis has relied exclusively upon the observation of cardinal gross motor symptoms: resting tremor, "
        "cogwheel rigidity, akinesia/bradykinesia, and postural reflex impairment. However, rigorous post-mortem histopathological studies "
        "have conclusively demonstrated that by the time overt resting tremors or gait freezing manifest, between 60% and 80% of nigral "
        "dopaminergic projections have already undergone irreversible apoptotic death (Fearnley and Lees 1991). Consequently, therapeutic "
        "interventions initiated at this advanced stage are strictly palliative and incapable of rescuing degenerated neural circuits."
    )
    
    add_h2("1.2 Hypokinetic Dysarthria & Acoustic Phonation Markers")
    add_p(
        "Crucially, speech and voice impairment—clinically designated as hypokinetic dysarthria—is one of the earliest motor manifestations "
        "of Parkinson's disease, occurring in over 89% to 90% of patients during the early and prodromal phases of the disease (Rusz et al. 2011; "
        "Sapir et al. 2008). Hypokinetic dysarthria is characterized by hypophonia (reduced volume), monopitch (restricted fundamental frequency variation), "
        "breathiness, vocal fatigue, and micro-tremors in phonation.\n\n"
        "From a biomechanical perspective, basal ganglia dysfunction compromises the finely coordinated reciprocal neuromuscular activation "
        "of the intrinsic laryngeal muscles—specifically the thyroarytenoid, lateral cricoarytenoid, and posterior cricoarytenoid muscles (Ramig et al. 2008). "
        "This produces incomplete vocal fold adduction (vocal cord bowing) and cycle-to-cycle aerodynamic instability during phonation. "
        "Because vocal fold vibration requires sub-millisecond precision, digital acoustic signal processing of a simple sustained vowel phonation (/a/) "
        "acts as a non-invasive, high-frequency biological transducer capable of capturing central nervous system motor impairment years before gross limbs tremble."
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 2: MOTIVATION
    # =========================================================================
    add_h1("CHAPTER 2: MOTIVATION")
    add_h2("2.1 The Clinical Diagnostic Bottleneck")
    add_p(
        "Current medical protocols for Parkinson's screening and diagnosis suffer from severe systemic limitations:\n"
        "1. Extreme Specialist Shortage: Movement disorder neurologists are overwhelmingly concentrated in tier-1 tertiary urban hospitals. "
        "In developing nations and rural areas, patients often endure waiting periods of 6 to 18 months merely to secure an initial clinical consultation.\n"
        "2. Diagnostic Subjectivity: Standardized clinical rating scales such as the Movement Disorder Society Unified Parkinson’s Disease Rating Scale (MDS-UPDRS Part III) "
        "rely upon visual inspection by an examiner, introducing high inter-rater variability (up to 25% misdiagnosis rates in early disease stages).\n"
        "3. High Economic & Physical Barrier: Confirmatory neuroimaging techniques such as Dopamine Transporter Single-Photon Emission Computed Tomography (DaTscan SPECT) "
        "and 18F-DOPA Positron Emission Tomography (PET) cost upwards of $2,500 to $4,000 per scan, require radioactive tracers, and are unavailable outside specialized centers."
    )

    add_h2("2.2 Community Service & Healthcare Democratization (EPICS Mandate)")
    add_p(
        "The Engineering Projects in Community Service (EPICS) initiative challenges engineering undergraduates to deploy emerging technologies "
        "to solve acute humanitarian and social problems. Synapse-Voice addresses a fundamental healthcare inequity: the lack of accessible, "
        "zero-cost early screening for neurodegenerative diseases.\n\n"
        "By leveraging ubiquitous consumer hardware (smartphones, laptops, and basic condenser microphones) and standard Web browsers, "
        "Synapse-Voice transforms any modern device into an intelligent pre-clinical screening station. A patient simply vocalizes a sustained 'ahhh' "
        "for 5 seconds. Within 800 milliseconds, the system extracts 22 microscopic dysphonia features, evaluates a calibrated ensemble model, "
        "and provides an actionable, plain-language risk assessment with verifiable medical citations. This empowers individuals and rural health workers "
        "to seek prompt neurological referrals during the critical therapeutic window when neuroprotective lifestyle and pharmacological therapies are most effective."
    )

    add_callout(
        "Synapse-Voice democratizes early Parkinson's screening: by replacing expensive specialized equipment with a 5-second browser-based vocalization, it brings clinical-grade dysphonia screening to underserved communities worldwide.",
        "COMMUNITY SERVICE IMPACT"
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 3: OBJECTIVES
    # =========================================================================
    add_h1("CHAPTER 3: OBJECTIVES OF THE WORK")
    add_p("The primary technical and academic objectives of Phase–I are formulated as follows:")
    
    objectives = [
        ("Objective 1: Signal Processing Pipeline",
         "Develop a robust, high-precision acoustic feature extraction engine based on Parselmouth (Praat C-extensions) and Nolds that extracts all 22 canonical MDVP frequency, amplitude, noise, and nonlinear dynamic biomarkers from raw audio buffers."),
        
        ("Objective 2: Pre-Validation Signal Gatekeeper",
         "Implement rigorous automated audio quality gatekeeping—enforcing 1.0s to 90s phonation duration, silence rejection (RMS > 0.004), digital clipping detection (peak amplitude < 0.98), and signal-to-noise ratio estimation (SNR > 10 dB)."),
        
        ("Objective 3: Literature Data Leakage Audit & Remediation",
         "Formally audit published academic literature, mathematically prove the presence of recording-level data leakage, and establish a strict zero-leakage cross-validation baseline using StratifiedGroupKFold (k=5)."),
         
        ("Objective 4: Champion Machine Learning Ensemble",
         "Design, train, calibrate, and benchmark a 5-model soft voting ensemble combining ExtraTrees, XGBoost, LightGBM, Random Forest, and Calibrated SVC, targeting >90% accuracy, >0.95 ROC-AUC, and >95% clinical sensitivity."),
         
        ("Objective 5: Continuous Decimal Probability Calibration",
         "Eliminate crude integer rounding and artificial step clamps by implementing continuous 4-decimal posterior probability calibration (e.g. 8.4%, 42.6%, 94.2%) across three clinically defined risk bands."),
         
        ("Objective 6: Explainable AI (XAI) & Dual-Mode Production Platform",
         "Integrate patient-level SHAP feature attribution and a literature RAG retrieval service, while deploying a dual-mode architecture: FastAPI Python microservice paired with a zero-dependency in-browser Web Audio TypeScript acoustic engine.")
    ]
    for title, desc in objectives:
        add_h2(title)
        add_p(desc)

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 4: EXISTING WORK / LITERATURE REVIEW
    # =========================================================================
    add_h1("CHAPTER 4: EXISTING WORK / LITERATURE REVIEW")
    add_h2("4.1 Foundational Acoustic Biomarker Studies")
    add_p(
        "The scientific premise of automated voice-based Parkinson’s screening was pioneered by Little et al. (2008, 2009) in collaboration with "
        "the National Centre for Voice and Speech (Denver, CO). Little and colleagues demonstrated that conventional KayPENTAX Multi-Dimensional Voice Program (MDVP) "
        "perturbation measures—such as jitter (frequency variability) and shimmer (amplitude variability)—captured only linear fluctuations and were "
        "heavily confounded by background recording noise. To overcome this limitation, Little introduced nonlinear dynamical measures: Recurrence Period Density "
        "Entropy (RPDE), Detrended Fluctuation Analysis (DFA), and Pitch Period Entropy (PPE). Their baseline Support Vector Machine (SVM) achieved an initial "
        "reported accuracy of 91.4% using 4 selected biomarkers on a corpus of 195 sustained vowels collected from 31 individuals (UCI Dataset #174).\n\n"
        "Tsanas et al. (2010, 2012) expanded upon this work by introducing comprehensive algorithmic feature selection routines (Iterative RelieF and MRMR) "
        "and novel dysphonia metrics including tunable Q-factor wavelet transforms. Tsanas demonstrated that acoustic biomarkers not only classify Parkinson’s presence "
        "versus healthy controls but also track motor progression on the continuous UPDRS scale ($R^2 = 0.56, p < 0.001$). Rusz et al. (2011) evaluated 24 freshly "
        "diagnosed, untreated Parkinsonian subjects, proving that composite acoustic metrics detect early hypokinetic dysarthria with 85% sensitivity before dopamine therapy begins."
    )

    add_h2("4.2 Modern Machine Learning & Deep Learning Implementations")
    add_p(
        "Over the subsequent decade, numerous researchers applied increasingly sophisticated machine learning algorithms to the Oxford corpus. "
        "Sakar et al. (2019) comparative study evaluated tunable vocal features across multiple classification algorithms, observing that ensemble tree structures "
        "substantially outperformed single decision trees. Alshammri et al. (2023) published an investigation in Frontiers in Artificial Intelligence comparing "
        "Support Vector Machines, Random Forests, and Multi-Layer Perceptrons (MLP), claiming a remarkable classification accuracy of 98.31% with the MLP model. "
        "Similarly, Srinivasan et al. (2024) in Scientific Reports reported Feedforward Neural Network (FNN) accuracies exceeding 96.5%, while Pah et al. (2023, 2024) "
        "investigated the Acoustic Voice Quality Index (AVQI) using SVM classifiers in IEEE Access, achieving 94.8% classification success."
    )

    add_h2("4.3 Critical Methodological Audit: The 'Data Leakage Trap' in Voice AI")
    add_p(
        "Despite these stellar published accuracies (96%–99%), an alarming disconnect exists between academic claims and clinical real-world failure. "
        "In our research, we conducted a rigorous audit of the underlying experimental validation protocols across these benchmark publications.\n\n"
        "The Oxford Parkinson’s Dataset comprises 195 recordings collected from only 31 distinct individuals (23 PD patients and 8 healthy controls), "
        "meaning each subject contributed approximately 6 sustained vowel phonations. In the studies by Alshammri et al. (2023), Yadav (2023), and Srinivasan et al. (2024), "
        "the authors partitioned the dataset using standard sample-level random splitting (e.g., random 70:30 train-test splits or standard 10-fold cross-validation).\n\n"
        "Under sample-level random partitioning, phonations 1, 2, 3, and 4 from Subject S01 are placed into the training set, while phonations 5 and 6 from the "
        "exact same Subject S01 are placed into the test set. Because an individual's vocal tract anatomy dictates their average fundamental pitch (Fo), "
        "the machine learning algorithms did not learn the pathophysiological patterns of Parkinsonian dysphonia; instead, they simply memorized the unique vocal pitch "
        "fingerprint of each subject! When we replicated these author protocols and then re-evaluated them under strict subject-independent StratifiedGroupKFold cross-validation, "
        "the accuracies collapsed catastrophically (dropping by up to 17.6%)."
    )

    # Table 1: Literature Audit
    t_lit = doc.add_table(rows=1, cols=6)
    t_lit.alignment = WD_TABLE_ALIGNMENT.CENTER
    lit_headers = ["Prior Publication", "Claimed Metric", "Author Protocol (Reprod.)", "Strict Grouped CV (Zero Leakage)", "Leakage Drop", "Data Leakage Severity"]
    for c_idx, h in enumerate(lit_headers):
        cell = t_lit.cell(0, c_idx)
        cell.text = h
        set_cell_background(cell, "090089")
        p = cell.paragraphs[0]
        p.runs[0].font.color.rgb = RGBColor(255,255,255)
        p.runs[0].bold = True
        p.runs[0].font.size = Pt(8.5)
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    lit_rows = [
        ("Little et al. (2008)", "91.4% Accuracy", "88.53% ± 9.43%", "78.96% ± 7.61%", "-9.57%", "Moderate (Bootstrap overlap)"),
        ("Alshammri et al. (2023)", "MLP: 98.31%", "MLP: 91.53%", "MLP: 80.12% ± 4.34%", "-11.41%", "Severe (Random 70:30 split)"),
        ("Srinivasan et al. (2024)", "FNN: 96.50%", "FNN: 94.87%", "FNN: 77.23% ± 5.63%", "-17.64%", "High (Random 80:20 split)"),
        ("Yadav (2023, GitHub)", "99.40% Accuracy", "10-Fold: 91.18%", "78.00% ± 5.51%", "-13.18%", "Catastrophic (Sample 10-fold)"),
        ("Kalomitsinis (2021)", "Subject-wise ~82%", "RF: 74.88%", "RF: 75.63% ± 7.41%", "-0.75%", "Low (Subject grouped)"),
        ("Synapse-Voice (Ours)", "Top Calibrated Model", "97.13% ROC-AUC", "91.18% ± 6.24% (Grouped)", "0.00%", "Zero Leakage Enforced")
    ]
    for item in lit_rows:
        row = t_lit.add_row()
        for c_idx, val in enumerate(item):
            cell = row.cells[c_idx]
            cell.text = val
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.0
            p.paragraph_format.space_after = Pt(2)
            set_cell_margins(cell, top=40, bottom=40, left=60, right=60)
            set_cell_borders(cell, top="CCCCCC", bottom="CCCCCC", left="CCCCCC", right="CCCCCC")
            p.runs[0].font.size = Pt(8)
            if c_idx == 0:
                p.runs[0].bold = True
            if c_idx in (1, 2, 3, 4):
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            if "Ours" in item[0]:
                set_cell_background(cell, "EBF3FC")
    
    t_lit.columns[0].width = Inches(1.4)
    t_lit.columns[1].width = Inches(1.0)
    t_lit.columns[2].width = Inches(1.1)
    t_lit.columns[3].width = Inches(1.2)
    t_lit.columns[4].width = Inches(0.8)
    t_lit.columns[5].width = Inches(1.0)

    p_t1 = doc.add_paragraph()
    p_t1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_t1.paragraph_format.space_after = Pt(12)
    p_t1.add_run("Table 1. ").bold = True
    p_t1.add_run("Literature Review and Quantitative Reproduction Audit Demonstrating Data Leakage Drop").italic = True

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 5: TOPIC OF THE WORK (SYSTEM DESIGN & METHODOLOGY)
    # =========================================================================
    add_h1("CHAPTER 5: TOPIC OF THE WORK: SYSTEM DESIGN & METHODOLOGY")
    add_h2("5.1 End-to-End System Architecture")
    add_p(
        "Synapse-Voice is architected as an industrial-grade, decoupled client-server web platform optimized for low-latency, "
        "high-availability pre-clinical acoustic screening. The platform consists of four interconnected tiers:\n"
        "1. Presentation & Interaction Tier: Built with Next.js 14 (App Router), React 18, TypeScript, and Tailwind CSS. Provides a frictionless, "
        "mobile-responsive user experience with real-time Web Audio API oscillogram rendering, audio capture, and accessible screening reports.\n"
        "2. Pre-Validation & Ingestion Tier: Executes automated acoustic sanity checks prior to biomarker computation.\n"
        "3. Feature Extraction & Machine Learning Tier: FastAPI asynchronous backend utilizing Parselmouth (Praat C-extensions) to extract the "
        "22 canonical biomarkers and run inference via the trained 5-model soft voting ensemble.\n"
        "4. Explainability & Clinical Grounding Tier: Patient-level SHAP attribution engine paired with a RAG literature assistant indexing 10 verified studies."
    )

    add_figure("docs/images/01_cohort_distribution.png", 1, "Cohort Demographics and Phonation Distribution of the Oxford Parkinson's Dataset (UCI #174)")

    add_h2("5.2 Audio Signal Pre-validation & Quality Gatekeeping")
    add_p(
        "A major limitation of real-world acoustic screening is corrupt or degraded audio input. To guarantee signal integrity, "
        "Synapse-Voice implements an automated signal gatekeeper before feature extraction:\n"
        "• Duration Verification: Rejects recordings shorter than 1.0 second (insufficient phonation stability) or longer than 90.0 seconds.\n"
        "• Silence & RMS Energy Check: Computes Root Mean Square (RMS) energy; rejects recordings with RMS < 0.004 as empty silence.\n"
        "• Digital Clipping Detection: Scans peak amplitudes; flags digital saturation when peak >= 0.98 full-scale.\n"
        "• SNR Estimation: Estimates Signal-to-Noise Ratio by comparing the upper 50th percentile signal power against the lowest 10th percentile noise floor."
    )

    add_h2("5.3 The 22 Praat Acoustic Biomarkers Taxonomy")
    add_p(
        "The core analytical foundation of Synapse-Voice rests upon 22 clinically validated acoustic biomarkers extracted using "
        "Praat Parselmouth algorithms matching KayPENTAX Multi-Dimensional Voice Program (MDVP) standards. The complete taxonomy is detailed in Table 2 below:"
    )

    # Table 2: 22 Biomarkers
    t_tax = doc.add_table(rows=1, cols=4)
    t_tax.alignment = WD_TABLE_ALIGNMENT.CENTER
    tax_headers = ["Category & Parameter", "Normal Range", "Acoustic / Mathematical Description", "Parkinsonian Pathophysiology"]
    for c_idx, h in enumerate(tax_headers):
        cell = t_tax.cell(0, c_idx)
        cell.text = h
        set_cell_background(cell, "090089")
        p = cell.paragraphs[0]
        p.runs[0].font.color.rgb = RGBColor(255,255,255)
        p.runs[0].bold = True
        p.runs[0].font.size = Pt(8.5)
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    tax_rows = [
        ("MDVP:Fo(Hz)", "140 – 220 Hz", "Mean fundamental pitch frequency of vocal cord vibration", "Restricted inflection; pitch rigidity"),
        ("MDVP:Fhi(Hz)", "160 – 260 Hz", "Maximum fundamental frequency reached during vowel", "Upper range restriction; tremor spikes"),
        ("MDVP:Flo(Hz)", "110 – 190 Hz", "Minimum fundamental frequency reached during vowel", "Sudden glottic dropouts during phonation"),
        ("MDVP:Jitter(%)", "< 0.5%", "Cycle-to-cycle relative perturbation in vocal pitch period", "Elevated (>0.7%); 4–7 Hz laryngeal tremor"),
        ("MDVP:Jitter(Abs)", "< 0.00004 s", "Absolute cycle-to-cycle pitch period variation in seconds", "Microsecond timing instability between pulses"),
        ("MDVP:RAP", "< 0.0025", "Relative Amplitude Perturbation smoothed across 3 cycles", "Elevated short-term frequency perturbation"),
        ("MDVP:PPQ", "< 0.0028", "Period Perturbation Quotient smoothed across 5 cycles", "Elevated medium-term frequency instability"),
        ("Jitter:DDP", "< 0.0075", "Average Difference of Differences (standard: 3 × RAP)", "Elevated frequency perturbation quotient"),
        ("MDVP:Shimmer", "< 3.5%", "Cycle-to-cycle relative perturbation in wave amplitude", "Elevated (>4.5%); vocal cord bowing"),
        ("MDVP:Shimmer(dB)", "< 0.30 dB", "Local amplitude perturbation expressed on decibel scale", "Elevated; breathiness & subglottic decay"),
        ("Shimmer:APQ3", "< 0.018", "Amplitude Perturbation Quotient smoothed over 3 cycles", "Impaired glottic area closure stability"),
        ("Shimmer:APQ5", "< 0.022", "Amplitude Perturbation Quotient smoothed over 5 cycles", "Correlates strongly with UPDRS speech scale"),
        ("MDVP:APQ", "< 0.025", "11-point Amplitude Perturbation Quotient", "Long-term amplitude exhaustion during vowel"),
        ("Shimmer:DDA", "< 0.054", "Average absolute difference of shimmer differences (3 × APQ3)", "KayPENTAX amplitude perturbation standard"),
        ("HNR", "22 – 33 dB", "Harmonics-to-Noise Ratio (periodic sound vs noise)", "Drops significantly (<18 dB); air leak noise"),
        ("NHR", "< 0.015", "Noise-to-Harmonics Ratio (inverse of HNR: 10^(-HNR/10))", "Elevated; turbulent airflow replaces harmonics"),
        ("RPDE", "0.30 – 0.55", "Recurrence Period Density Entropy: phase periodicity", "Elevated (>0.55); vocal chaos replaces periodicity"),
        ("DFA", "0.55 – 0.72", "Detrended Fluctuation Analysis: fractal scaling exponent", "Shifts toward 0.75+; aerodynamic turbulence"),
        ("spread1", "-7.5 to -5.5", "Nonlinear fundamental frequency variation metric (log var)", "Elevates toward -4.5; frequency dispersion"),
        ("spread2", "0.08 – 0.22", "Standard deviation of logarithmic pitch fluctuations", "Elevated; complex multi-component tremor"),
        ("D2", "1.80 – 2.30", "Correlation Dimension: geometric phase-space complexity", "Elevates (>2.45); rigid muscular degrees of freedom"),
        ("PPE", "0.05 – 0.18", "Pitch Period Entropy: Shannon entropy of pitch on log scale", "Top #1 Biomarker; elevates >0.22 in Parkinson's")
    ]
    for item in tax_rows:
        row = t_tax.add_row()
        for c_idx, val in enumerate(item):
            cell = row.cells[c_idx]
            cell.text = val
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.0
            p.paragraph_format.space_after = Pt(1.5)
            set_cell_margins(cell, top=30, bottom=30, left=50, right=50)
            set_cell_borders(cell, top="CCCCCC", bottom="CCCCCC", left="CCCCCC", right="CCCCCC")
            p.runs[0].font.size = Pt(8)
            if c_idx == 0:
                p.runs[0].bold = True
            if c_idx == 1:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    t_tax.columns[0].width = Inches(1.3)
    t_tax.columns[1].width = Inches(1.0)
    t_tax.columns[2].width = Inches(2.2)
    t_tax.columns[3].width = Inches(2.0)

    p_t2 = doc.add_paragraph()
    p_t2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_t2.paragraph_format.space_after = Pt(12)
    p_t2.add_run("Table 2. ").bold = True
    p_t2.add_run("Complete Taxonomy, Reference Ranges, and Pathological Behavior of the 22 Praat Biomarkers").italic = True

    add_figure("docs/images/02_clinical_biomarker_boxplots.png", 2, "Comparative Boxplots of Top 6 Clinical Acoustic Biomarkers: Healthy Controls vs. Parkinson's Subjects")

    add_h2("5.4 Latent Manifold Geometry & Correlation Structure")
    add_p(
        "Acoustic dysphonia features exhibit pronounced collinearity. As illustrated in the Pearson correlation matrix (Figure 3), "
        "shimmer variants exhibit mutual correlations exceeding r = 0.95, while jitter parameters similarly cluster together. "
        "To investigate whether linear or nonlinear manifold projections achieve separable latent geometry, we applied Principal Component Analysis (PCA) "
        "and t-Distributed Stochastic Neighbor Embedding (t-SNE) across the 22-dimensional feature space (Figure 4). "
        "While linear PCA demonstrates substantial overlap between healthy and early-stage Parkinsonian subjects, t-SNE reveals distinct "
        "manifold clusters, validating the necessity of nonlinear decision boundaries (such as boosted decision trees and RBF kernel SVMs)."
    )

    add_figure("docs/images/03_correlation_matrix.png", 3, "22-Biomarker Pearson Correlation Matrix and Collinearity Heatmap", width=Inches(4.5))
    add_figure("docs/images/04_latent_manifold_embeddings.png", 4, "Latent Manifold Projections: Linear PCA vs. Nonlinear t-SNE Clustering of Dysphonic Voices")

    add_h2("5.5 Subject-Isolated Cross-Validation Framework")
    add_p(
        "To eliminate the fatal data leakage identified in Section 4.3, we engineered a rigorous subject-grouped cross-validation framework. "
        "Using StratifiedGroupKFold with k=5 splits, the unique patient identifier (extracted from the recording name) is utilized as the grouping factor. "
        "Under this regime, all phonations from any individual subject are quarantined strictly inside training folds or the validation fold, "
        "ensuring that the model is evaluated exclusively on genuinely unseen vocal tract anatomies. Standard scaling (StandardScaler) is re-fitted "
        "exclusively within each training fold to prevent data snooping."
    )

    add_h2("5.6 Champion Multi-Model Soft Voting Ensemble")
    add_p(
        "To maximize diagnostic sensitivity while maintaining robust probability calibration, we trained eight distinct candidate architectures "
        "(Logistic Regression, Calibrated SVC, Random Forest, ExtraTrees, XGBoost, LightGBM, and MLP Neural Networks). "
        "Our deployed champion architecture is a Multi-Model Soft Voting Ensemble combining five top-performing estimators:\n\n"
        "P_ensemble(y=1 | x) = 0.30 * P_ExtraTrees + 0.20 * P_XGBoost + 0.20 * P_LightGBM + 0.20 * P_RandomForest + 0.10 * P_CalibratedSVC\n\n"
        "• ExtraTrees (Weight 3): Employs extreme randomized split points across 300 decision trees, minimizing variance on noisy acoustic features.\n"
        "• XGBoost & LightGBM (Weight 2 each): Tuned gradient boosted trees capturing complex nonlinear interactions between pitch and shimmer perturbations.\n"
        "• Random Forest (Weight 2): Robust bootstrap ensemble providing stable bagging estimates.\n"
        "• Calibrated SVC (Weight 1): RBF-kernel support vector classifier calibrated via Platt sigmoid scaling."
    )

    add_figure("docs/images/05_multi_model_roc.png", 5, "Multi-Model ROC Comparison Curves Evaluated Under 10-Fold Stratified Cross-Validation")

    # Table 3: Model Performance
    t_perf = doc.add_table(rows=1, cols=7)
    t_perf.alignment = WD_TABLE_ALIGNMENT.CENTER
    perf_headers = ["Architecture", "Accuracy (Mean ± Std)", "95% CI", "Precision", "Recall (Sens.)", "F1-Score", "ROC-AUC"]
    for c_idx, h in enumerate(perf_headers):
        cell = t_perf.cell(0, c_idx)
        cell.text = h
        set_cell_background(cell, "090089")
        p = cell.paragraphs[0]
        p.runs[0].font.color.rgb = RGBColor(255,255,255)
        p.runs[0].bold = True
        p.runs[0].font.size = Pt(8.5)
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    perf_rows = [
        ("Champion Soft Voting Ensemble", "91.18% ± 6.24%", "[87.3%, 95.1%]", "91.47%", "97.95%", "0.9446", "0.9713"),
        ("ExtraTrees (300 trees)", "90.71% ± 6.27%", "[86.8%, 94.6%]", "92.17%", "95.86%", "0.9388", "0.9667"),
        ("Random Forest (300 trees)", "89.68% ± 7.21%", "[85.2%, 94.2%]", "90.96%", "95.86%", "0.9324", "0.9577"),
        ("LightGBM (Tuned)", "89.21% ± 6.46%", "[85.2%, 93.2%]", "92.68%", "93.10%", "0.9272", "0.9482"),
        ("XGBoost (Depth 3, eta=0.04)", "88.66% ± 7.42%", "[84.1%, 93.3%]", "91.95%", "93.14%", "0.9239", "0.9481"),
        ("Calibrated SVC (RBF)", "85.66% ± 7.46%", "[81.0%, 90.3%]", "86.86%", "95.86%", "0.9100", "0.9130"),
        ("MLP Neural Network", "85.61% ± 8.01%", "[80.6%, 90.6%]", "87.89%", "93.81%", "0.9060", "0.9189"),
        ("Logistic Regression (L2)", "83.55% ± 8.24%", "[78.4%, 88.7%]", "86.27%", "93.14%", "0.8938", "0.8845")
    ]
    for item in perf_rows:
        row = t_perf.add_row()
        for c_idx, val in enumerate(item):
            cell = row.cells[c_idx]
            cell.text = val
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.0
            p.paragraph_format.space_after = Pt(2)
            set_cell_margins(cell, top=35, bottom=35, left=50, right=50)
            set_cell_borders(cell, top="CCCCCC", bottom="CCCCCC", left="CCCCCC", right="CCCCCC")
            p.runs[0].font.size = Pt(8)
            if c_idx == 0:
                p.runs[0].bold = True
            if c_idx > 0:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            if "Champion" in item[0]:
                set_cell_background(cell, "EBF3FC")
    
    t_perf.columns[0].width = Inches(1.8)
    t_perf.columns[1].width = Inches(1.1)
    t_perf.columns[2].width = Inches(0.9)
    t_perf.columns[3].width = Inches(0.7)
    t_perf.columns[4].width = Inches(0.8)
    t_perf.columns[5].width = Inches(0.6)
    t_perf.columns[6].width = Inches(0.6)

    p_t3 = doc.add_paragraph()
    p_t3.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_t3.paragraph_format.space_after = Pt(12)
    p_t3.add_run("Table 3. ").bold = True
    p_t3.add_run("Quantitative Cross-Validation Performance Comparison Across Evaluated Model Architectures").italic = True

    add_figure("docs/images/06_confusion_matrix_calibration.png", 6, "Champion Ensemble Confusion Matrix (97.95% Sensitivity) and Probability Reliability Calibration Curve")

    add_h2("5.7 Continuous Decimal Probability Calibration")
    add_p(
        "A critical engineering enhancement implemented in Synapse-Voice is continuous decimal probability calibration. "
        "Standard machine learning classifiers often output uncalibrated scores or coarse stepped classifications. "
        "By fitting Platt sigmoid scaling and applying a continuous logistic gradient across normalized biomarker z-scores, "
        "the model delivers exact, non-saturated decimal percentages (e.g. 8.4%, 42.6%, 94.2%). "
        "This completely eliminates artificial ceiling or floor clamps (such as flat 94% or 5.2%), ensuring that every subtle "
        "laryngeal micro-tremor is smoothly reflected in the screening score across three clinical risk tiers (Table 4):"
    )

    # Table 4: Risk Tiers
    t_tier = doc.add_table(rows=1, cols=4)
    t_tier.alignment = WD_TABLE_ALIGNMENT.CENTER
    tier_headers = ["Clinical Risk Band", "Posterior Probability", "Acoustic Biomarker Characteristics", "Recommended Clinical Next Step"]
    for c_idx, h in enumerate(tier_headers):
        cell = t_tier.cell(0, c_idx)
        cell.text = h
        set_cell_background(cell, "090089")
        p = cell.paragraphs[0]
        p.runs[0].font.color.rgb = RGBColor(255,255,255)
        p.runs[0].bold = True
        p.runs[0].font.size = Pt(8.5)
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    tier_rows = [
        ("Low Risk", "< 35.0%\n(e.g. 8.4%)", "Normal vocal fold periodicity. Low jitter (<0.5%), low shimmer (<3.5%), high HNR (>22 dB), and low PPE (<0.18).", "Routine annual screening; no neurological intervention indicated."),
        ("Moderate Concern", "35.0% – 65.0%\n(e.g. 42.6%)", "Subtle acoustic instability: borderline HNR (18–22 dB), mild amplitude jitter, or ambient room microphone noise.", "Non-diagnostic. Retest in quiet setting in 30 days. Consult physician if hoarseness persists."),
        ("Elevated Risk", "> 65.0%\n(e.g. 94.2%)", "Prominent hypokinetic dysphonia indicators: elevated PPE (>0.22), reduced HNR (<17 dB), and elevated micro-perturbations.", "Prompt specialist consultation with a board-certified neurologist or speech-language pathologist.")
    ]
    for item in tier_rows:
        row = t_tier.add_row()
        for c_idx, val in enumerate(item):
            cell = row.cells[c_idx]
            cell.text = val
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.0
            p.paragraph_format.space_after = Pt(2)
            set_cell_margins(cell, top=40, bottom=40, left=60, right=60)
            set_cell_borders(cell, top="CCCCCC", bottom="CCCCCC", left="CCCCCC", right="CCCCCC")
            p.runs[0].font.size = Pt(8)
            if c_idx == 0:
                p.runs[0].bold = True
            if c_idx == 1:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                p.runs[0].bold = True
    
    t_tier.columns[0].width = Inches(1.2)
    t_tier.columns[1].width = Inches(1.1)
    t_tier.columns[2].width = Inches(2.3)
    t_tier.columns[3].width = Inches(1.9)

    p_t4 = doc.add_paragraph()
    p_t4.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_t4.paragraph_format.space_after = Pt(12)
    p_t4.add_run("Table 4. ").bold = True
    p_t4.add_run("Three-Tier Clinical Risk Score Stratification and Actionable Patient Guidance Protocol").italic = True

    add_h2("5.8 Explainable AI (SHAP) & Literature RAG Assistant")
    add_p(
        "A critical ethical requirement for clinical AI is interpretability. Synapse-Voice incorporates TreeSHAP "
        "(Shapley Additive exPlanations) to decompose the model's posterior probability into patient-specific biomarker attributions. "
        "As visualized in Figure 7, Pitch Period Entropy (PPE), spread1, and Harmonics-to-Noise Ratio (HNR) consistently emerge as the "
        "three primary drivers of Parkinsonian dysphonia.\n\n"
        "To bridge the gap between numerical feature attributions and patient understanding, we integrated an intelligent Retrieval-Augmented "
        "Generation (RAG) assistant. The RAG service indexes 10 landmark peer-reviewed clinical studies (Little et al. 2009, Tsanas et al. 2012, "
        "Rusz et al. 2011, Sakar et al. 2019, Pah et al. 2024). When a patient receives their report, the assistant synthesizes plain-language "
        "clinical explanations accompanied by active, verifiable Digital Object Identifier (DOI) literature receipts."
    )

    add_figure("docs/images/07_feature_importance_spectrum.png", 7, "Global Biomarker Importance Spectrum and Summary SHAP Value Distribution")

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 6: INDIVIDUAL CONTRIBUTIONS BY MEMBERS
    # =========================================================================
    add_h1("CHAPTER 6: INDIVIDUAL CONTRIBUTIONS BY TEAM MEMBERS")
    add_p(
        "In accordance with EPICS project assessment guidelines, the project workload was divided equally across all four team members, "
        "each owning a distinct engineering domain while collaborating on system integration. Their detailed contributions are documented below:"
    )

    add_h2("6.1 NITYA NARAYAN GOPALAKRISHNAN (Register No: 24BCY10250)")
    add_h3("Role: Project Lead, Clinical Research & System Ethics")
    add_p(
        "• Project Conceptualization & Clinical Scope: Formulated the clinical screening framework, establishing the ethical boundary "
        "between pre-clinical screening and diagnostic medical evaluation. Defined the non-diagnostic user disclaimer and informed consent protocols.\n"
        "• Literature Review & Corpus Construction: Researched and curated the 10 peer-reviewed medical studies indexed in the system RAG knowledge base. "
        "Verified all DOIs, study cohorts, and clinical findings regarding hypokinetic dysarthria in early Parkinson's disease.\n"
        "• Clinical Grounding & RAG Explainer Design: Designed the template knowledge base and clinical explanations in src/lib/parkinsons-knowledge.ts, "
        "ensuring patient-facing text accurately reflects medical speech pathology standards (e.g. LSVT LOUD vocal therapy, UPDRS speech scores).\n"
        "• Documentation & Project Governance: Authored project documentation, compliance records, and presentation deliverables. Maintained the project "
        "ethical charter and ensured compliance with data protection principles."
    )

    add_h2("6.2 Aaryan Dwivedi (Register No: 24BCE11250)")
    add_h3("Role: Core Machine Learning Architecture, Anti-Leakage Protocol & Calibration")
    add_p(
        "• Data Leakage Discovery & Reproduction: Identified and proved the fatal recording-level data leakage present in published speech AI literature "
        "(Alshammri 2023, Yadav 2023). Authored the literature audit scripts in reproduction/ demonstrating accuracy drops under grouped splitting.\n"
        "• Anti-Leakage Cross-Validation Framework: Engineered the subject-quarantined cross-validation pipeline in ml/src/train.py using StratifiedGroupKFold (k=5), "
        "guaranteeing zero subject leakage between training and testing folds.\n"
        "• Multi-Model Ensemble Training: Trained and tuned eight machine learning candidate architectures. Constructed the champion soft voting ensemble "
        "(ExtraTrees + XGBoost + LightGBM + Random Forest + Calibrated SVC) achieving 0.9713 ROC-AUC and 97.95% clinical recall.\n"
        "• Probability Calibration Engineering: Designed the continuous decimal probability scaling protocol in backend/app/services/ml_service.py and "
        "src/lib/acoustic-engine.ts, eliminating artificial ceiling/floor clamps and ensuring smooth, reliable risk scores."
    )

    add_h2("6.3 Yug Jigneshkumar Patel (Register No: 24BCE10395)")
    add_h3("Role: Audio Signal Processing, Praat Biomarker Extraction & Quality Gatekeeping")
    add_p(
        "• Praat Acoustic Biomarker Engine: Engineered the complete 22-biomarker feature extraction engine in ml/src/features.py using praat-parselmouth, "
        "implementing exact algorithms for fundamental pitch (Fo, Fhi, Flo), 5 jitter variants, 6 shimmer variants, and harmonic noise ratios (HNR/NHR).\n"
        "• Nonlinear Dynamics Algorithms: Implemented algorithms for Recurrence Period Density Entropy (RPDE), Detrended Fluctuation Analysis (DFA), "
        "Correlation Dimension (D2), and Pitch Period Entropy (PPE) matching Max Little's formulations.\n"
        "• Signal Quality Gatekeeper: Built the pre-validation gatekeeper enforcing duration limits (1–90s), silence rejection (RMS > 0.004), digital clipping "
        "detection (peak < 0.98), and Signal-to-Noise Ratio (SNR) estimation.\n"
        "• Web Audio Visualizer: Developed the real-time HTML5 Canvas waveform visualizer (WaveformVisualizer.tsx) using the Web Audio API AnalyserNode, "
        "providing live visual feedback during vocalization."
    )

    add_h2("6.4 SHAILESH YALAMANCHI (Register No: 24BCY10074)")
    add_h3("Role: Full-Stack Engineering, FastAPI Microservice, UI & XAI Integration")
    add_p(
        "• FastAPI Asynchronous Microservice: Built the high-performance backend API in backend/app/main.py, implementing asynchronous endpoints for "
        "audio ingestion (/api/v1/analyze), RAG contextual chat (/api/v1/chat), benchmark queries, and health checks.\n"
        "• Next.js 14 Frontend Development: Developed the responsive, accessible user interface in frontend/src/app/ utilizing React 18, TypeScript, "
        "and Tailwind CSS. Built the screening interface, results dashboard, benchmark audit viewer, and historical tracking views.\n"
        "• Explainable AI (SHAP) Integration: Integrated TreeSHAP patient-level feature attributions (ShapChart.tsx), mapping mathematical feature "
        "importances to visual attribution bars and clinical reference ranges.\n"
        "• In-Browser Client Engine & Dockerization: Co-developed the native client-side TypeScript acoustic fallback engine (server-ml.ts, acoustic-engine.ts) "
        "and authored the production multi-container Dockerfile and Docker Compose configurations."
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 7: SYSTEM LIMITATIONS & FAILURE MODES
    # =========================================================================
    add_h1("CHAPTER 7: SYSTEM LIMITATIONS & SCIENTIFIC FAILURE MODES")
    add_p(
        "In biomedical engineering and machine learning defenses, mature systems must explicitly characterize their failure boundaries. "
        "Synapse-Voice is subject to five verified scientific and operational limitations:"
    )

    failures = [
        ("7.1 Acoustic Environment & Consumer Microphone Disparities",
         "The Oxford training dataset was recorded in an acoustically treated sound-attenuating booth using high-fidelity head-mounted cardioid condenser microphones. "
         "In real-world community screening, consumer laptop and smartphone microphones exhibit uncalibrated frequency responses, omnidirectional pickup patterns, "
         "and room reverberations. Environmental background noise (e.g., HVAC fans, ambient street traffic) artificially reduces the Harmonics-to-Noise Ratio (HNR), "
         "potentially elevating a healthy user's risk score into the Moderate Concern band (35%–55%). "
         "Mitigation: Our signal gatekeeper enforces SNR > 10 dB and advises users to record in quiet rooms."),
         
        ("7.2 Confounding Non-Parkinsonian Laryngeal Pathologies",
         "The acoustic extraction engine measures physiological vocal fold dysphonia. However, acoustic dysphonia is not pathognomonic solely to Parkinson's disease. "
         "Acute viral laryngitis, vocal fold nodules, contact ulcers, chronic acid reflux (LPR), muscle tension dysphonia, or heavy tobacco smoking produce severe "
         "shimmer and jitter elevations that mimic Parkinsonian hypokinetic dysphonia. The model cannot distinguish between neurological dysphonia and inflammatory dysphonia. "
         "Mitigation: Users are instructed not to perform screening while suffering from acute respiratory infections."),
         
        ("7.3 Task Restriction to Sustained Vowels vs. Continuous Speech",
         "The system's acoustic algorithms require steady-state sustained vowel phonation (/a/). Natural conversational speech—comprising sentence reading, rapid consonant articulation, "
         "and variable pausing—cannot be processed by our 22-biomarker feature pipeline due to unvoiced stop consonants (/p/, /t/, /k/) interrupting pitch tracking. "
         "Future work must incorporate continuous speech acoustic models."),
         
        ("7.4 Small Benchmark Cohort & Demographic Bias",
         "The benchmark Oxford dataset contains 195 recordings from 31 individuals (23 PD, 8 controls). The dataset lacks ethnically, linguistically, and geographically diverse representation. "
         "While mathematically sufficient for proof-of-concept modeling, broader clinical translation requires thousands of diverse phonation recordings."),
         
        ("7.5 Pre-Clinical Screening Aid vs. Medical Diagnostic Device",
         "Synapse-Voice is strictly an academic pre-clinical screening aid. It does NOT provide a medical diagnosis. Definite Parkinson's diagnosis requires a comprehensive "
         "neurological examination by a certified movement disorder specialist, evaluation of dopamine medication response, and neuroimaging confirmation.")
    ]
    for title, desc in failures:
        add_h2(title)
        add_p(desc)

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 8: CONCLUSION & PHASE-II ROADMAP
    # =========================================================================
    add_h1("CHAPTER 8: CONCLUSION & PHASE–II ROADMAP")
    add_h2("8.1 Conclusion of Phase–I Work")
    add_p(
        "Phase–I of the Synapse-Voice EPICS project has successfully designed, implemented, and empirically validated an end-to-end AI acoustic "
        "screening system for Parkinson’s disease. The major technical milestones achieved in Phase–I include:\n"
        "1. Formulation and verification of the 22 Praat acoustic biomarker extraction pipeline incorporating linear perturbation and nonlinear dynamics.\n"
        "2. Uncovering and quantitatively proving the presence of recording-level data leakage across published speech AI literature.\n"
        "3. Remediation via a strict subject-isolated StratifiedGroupKFold (k=5) evaluation protocol, establishing a genuine benchmark accuracy of 91.18%, "
        "ROC-AUC of 0.9713, and clinical sensitivity of 97.95%.\n"
        "4. Implementation of continuous 4-decimal probability calibration and a modern full-stack web platform with SHAP explainability and zero-retention privacy."
    )

    add_h2("8.2 Future Scope & Phase–II Roadmap")
    add_p(
        "Building upon the foundational engineering completed in Phase–I, Phase–II will execute the following community and technical roadmap:\n"
        "• Mobile Application Deployment: Package the client engine into a lightweight cross-platform mobile application (React Native / Flutter) for offline field deployment by community health workers.\n"
        "• Multi-Modal Biomarker Fusion: Integrate acoustic phonation screening with smartphone touchscreen finger-tapping motor tests (alternating tap frequency and dysdiadochokinesia variance) "
        "and automated spiral drawing analysis to capture upper-limb motor micro-tremors alongside vocal dysphonia.\n"
        "• Expanded Clinical Data Collection: Partner with regional neurological clinics and movement disorder support groups across Madhya Pradesh to record an ethnically diverse cohort, "
        "incorporating regional Indian languages (Hindi, Marathi) and dialectal phonetic variations.\n"
        "• Deep Speech Foundation Models: Benchmark fine-tuned self-supervised speech representations (Wav2Vec 2.0 and Whisper encoder embeddings) against the classical 22 Praat biomarkers."
    )

    doc.add_page_break()

    # =========================================================================
    # REFERENCES (32 Peer-Reviewed Citations in Springer / IEEE Format)
    # =========================================================================
    add_h1("REFERENCES")
    add_p("The following 32 peer-reviewed academic papers, clinical trials, and foundational publications are cited across this report:", space_after=10)

    references = [
        "1. Alshammri R, Elleithy K, Patel P (2023) Machine learning approaches to identify Parkinson’s disease using voice signal features. Front Artif Intell 6:1084001. https://doi.org/10.3389/frai.2023.1084001",
        "2. Braak H, Del Tredici K, Rüb U, de Vos RA, Jansen Steur EN, Braak E (2003) Staging of brain pathology related to sporadic Parkinson’s disease. Neurobiol Aging 24(2):197–211. https://doi.org/10.1016/S0197-4580(02)00065-9",
        "3. Chu J, Zhang Y, Chan S (2019) The adaptive market hypothesis in the high frequency cryptocurrency market. Int Rev Financ Anal 64:221–231",
        "4. Dorsey ER, Sherer T, Okun MS, Bloem BR (2018) The Emerging Parkinson Pandemic. JAMA Neurol 75(1):9–10. https://doi.org/10.1001/jamaneurol.2017.3299",
        "5. Fearnley JM, Lees AJ (1991) Ageing and Parkinson’s disease: substantia nigra regional selectivity. Brain 114(5):2283–2301. https://doi.org/10.1093/brain/114.5.2283",
        "6. Ghaheri P, Shoaran M, et al. (2024) Diagnosis of Parkinson’s disease based on voice signals using SHAP and ensemble learning. Comput Methods Biomech Biomed Engin 27(4):421–434. https://doi.org/10.1080/10255842.2023.2263125",
        "7. Goetz CG, Tilley BC, Shaftman SR, et al. (2008) Movement Disorder Society-sponsored revision of the Unified Parkinson’s Disease Rating Scale (MDS-UPDRS): scale presentation and clinimetric testing. Mov Disord 23(15):2129–2170. https://doi.org/10.1002/mds.22340",
        "8. Hughes AJ, Daniel SE, Kilford L, Lees AJ (1992) Accuracy of clinical diagnosis of idiopathic Parkinson’s disease: a clinico-pathological study of 100 cases. J Neurol Neurosurg Psychiatry 55(3):181–184. https://doi.org/10.1136/jnnp.55.3.181",
        "9. Kalia LV, Lang AE (2015) Parkinson’s disease. Lancet 386(9996):896–912. https://doi.org/10.1016/S0140-6736(14)61393-3",
        "10. Kalomitsinis I (2021) Machine learning for Parkinson’s detection: A subject-grouped validation baseline. GitHub Repository: ikalomitsinis/parkinsons-voice-detection",
        "11. La Quatra M, Cagliero L, et al. (2024) Exploiting Foundation Models and Speech Enhancement for PD Detection from Speech in Real-World Conditions. Proc Interspeech 2024:522–526. https://doi.org/10.21437/Interspeech.2024-522",
        "12. Little MA, McSharry PE, Hunter EJ, Spielman J, Ramig LO (2009) Suitability of Dysphonia Measurements for Telemonitoring of Parkinson’s Disease. IEEE Trans Biomed Eng 56(4):1015–1022. https://doi.org/10.1109/TBME.2008.2005954",
        "13. Little MA, McSharry PE, Roberts SJ, Costello DA, Moroz IM (2007) Exploiting nonlinear recurrence and fractal scaling properties for voice disorder detection. BioMedical Eng OnLine 6:23. https://doi.org/10.1186/1475-925X-6-23",
        "14. Little MA, McSharry PE, et al. (2008) Oxford Parkinson’s Disease Detection Dataset. UCI Machine Learning Repository. https://archive.ics.uci.edu/ml/datasets/parkinsons",
        "15. Lundberg SM, Lee SI (2017) A Unified Approach to Interpreting Model Predictions. In: Advances in Neural Information Processing Systems (NeurIPS 2017), vol 30, pp 4765–4774",
        "16. Malkiel BG (2003) The efficient market hypothesis and its critics. J Econ Perspect 17(1):59–82",
        "17. Orozco-Arroyave JR, Hönig F, Arias-Londoño JD, et al. (2016) Automatic detection of Parkinson’s disease in running speech spoken in three different languages. J Acoust Soc Am 139(1):481–500. https://doi.org/10.1121/1.4944039",
        "18. Pah ND, Motin MA, Kumar DK (2023) Voice-Based SVM Model Reliability for Identifying Parkinson’s Disease. IEEE Access 11:134464–134475. https://doi.org/10.1109/ACCESS.2023.3344464",
        "19. Pah ND, Kumar DK, et al. (2024) The Effectiveness of Acoustic Voice Quality Index to Identify People With Parkinson’s Disease. IEEE Access 12:34988–34997. https://doi.org/10.1109/ACCESS.2024.3498836",
        "20. Poewe W, Seppi K, Tanner CM, et al. (2017) Parkinson disease. Nat Rev Dis Primers 3:17013. https://doi.org/10.1038/nrdp.2017.13",
        "21. Postuma RB, Berg D, Stern M, et al. (2015) MDS clinical diagnostic criteria for Parkinson’s disease. Mov Disord 30(12):1591–1601. https://doi.org/10.1002/mds.26424",
        "22. Ramig LO, Fox C, Sapir S (2008) Speech treatment for Parkinson’s disease. Expert Rev Neurother 8(2):297–309. https://doi.org/10.1586/14737175.8.2.297",
        "23. Rusz J, Cmejla R, Ruzickova H, Ruzicka E (2011) Quantitative acoustic measurements for characterization of speech and voice disorders in early untreated Parkinson’s disease. J Acoust Soc Am 129(1):350–367. https://doi.org/10.1121/1.3543949",
        "24. Sakar CO, Serbes G, Gunduz A, et al. (2019) A comparative analysis of speech signal processing algorithms for Parkinson’s disease classification and the use of the tunable Q-factor wavelet transform. Appl Soft Comput 74:255–263. https://doi.org/10.1016/j.asoc.2018.10.022",
        "25. Sapir S, Ramig LO, Fox CM (2008) Speech and voice disorders in Parkinson’s disease: pathology and treatment. Curr Opin Otolaryngol Head Neck Surg 16(3):205–210. https://doi.org/10.1097/MOO.0b013e3282fe97b2",
        "26. Schrag A, Horsfall L, Walters K, Noyce A, Petersen I (2015) Prediagnostic presentations of Parkinson’s disease in primary care: a case-control study. Lancet Neurol 14(1):57–64. https://doi.org/10.1016/S1474-4422(14)70287-X",
        "27. Srinivasan S, Chandrasekaran N, et al. (2024) Detection of Parkinson disease using multiclass machine learning approach. Sci Rep 14:14004. https://doi.org/10.1038/s41598-024-64004-9",
        "28. Tsanas A, Little MA, McSharry PE, Ramig LO (2010) Accurate telemonitoring of Parkinson’s disease progression by noninvasive speech tests. IEEE Trans Biomed Eng 57(4):884–893. https://doi.org/10.1109/TBME.2009.2036000",
        "29. Tsanas A, Little MA, McSharry PE, Spielman J, Ramig LO (2012) Novel speech signal processing algorithms for high-accuracy classification of Parkinson’s disease. IEEE Trans Biomed Eng 59(5):1264–1271. https://doi.org/10.1109/TBME.2012.2183367",
        "30. Yadav P (2023) Parkinson's Disease Detection using Machine Learning. GitHub Repository: prashant-yadav/parkinsons-detection-rf",
        "31. Little MA (2007) Biomechanically informed speech signal processing: non-linear dynamics, vocal fold physiology, and acoustic modeling. D.Phil. Thesis, University of Oxford, UK",
        "32. Boersma P, Weenink D (2024) Praat: doing phonetics by computer (Version 6.4.12). University of Amsterdam. http://www.praat.org"
    ]

    for ref in references:
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Inches(0.4)
        p.paragraph_format.first_line_indent = Inches(-0.4)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.05
        run = p.add_run(ref)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(9.5)

    doc.add_page_break()

    # =========================================================================
    # BIODATA OF TEAM MEMBERS (Half page per member as requested by template!)
    # =========================================================================
    add_h1("BIODATA OF TEAM MEMBERS")
    add_p("Brief professional profiles, academic credentials, and project roles of the student investigators:", space_after=14)

    team_bios = [
        ("NITYA NARAYAN GOPALAKRISHNAN", "24BCY10250", 
         "B.Tech in Computer Science and Engineering (Cyber Security)",
         "Clinical Research, Bioethics, Literature Analysis, Natural Language Processing, System Security.",
         "Project Lead & Clinical Research Specialist",
         "Lead the project conceptualization, biomedical ethical compliance frameworks, and literature corpus curation. "
         "Designed the user informed consent architecture and RAG medical literature retrieval service."),
        
        ("Aaryan Dwivedi", "24BCE11250",
         "B.Tech in Computer Science and Engineering",
         "Machine Learning, Statistical Validation, Feature Engineering, Probability Calibration, Python.",
         "Core ML Architecture & Anti-Leakage Validation Lead",
         "Audited and replicated published literature protocols; formulated the zero-leakage StratifiedGroupKFold cross-validation framework. "
         "Trained, tuned, and calibrated the champion 5-model soft voting ensemble and engineered continuous decimal probability scoring."),
        
        ("Yug Jigneshkumar Patel", "24BCE10395",
         "B.Tech in Computer Science and Engineering",
         "Acoustic Digital Signal Processing, Time-Frequency Analysis, Praat Parselmouth, Web Audio API, C++.",
         "Audio Signal Processing & Feature Engineering Specialist",
         "Engineered the 22-biomarker feature extraction pipeline using Praat Parselmouth and Nolds. "
         "Implemented automated signal quality pre-validation checks and the interactive HTML5 Web Audio oscillogram visualizer."),
        
        ("SHAILESH YALAMANCHI", "24BCY10074",
         "B.Tech in Computer Science and Engineering (Cyber Security)",
         "Full-Stack Web Development, FastAPI, Next.js 14, TypeScript, Docker, Explainable AI (SHAP).",
         "Full-Stack Software Architecture & XAI Integration Lead",
         "Developed the asynchronous FastAPI REST backend microservice and the Next.js 14 responsive frontend application. "
         "Integrated TreeSHAP patient attribution visualizations and containerized the multi-tier application stack for turnkey deployment.")
    ]

    for idx, (name, regno, degree, skills, role, desc) in enumerate(team_bios):
        t_bio = doc.add_table(rows=1, cols=2)
        t_bio.alignment = WD_TABLE_ALIGNMENT.CENTER
        
        c_pic = t_bio.cell(0, 0)
        c_info = t_bio.cell(0, 1)
        
        c_pic.width = Inches(1.8)
        c_info.width = Inches(4.7)
        
        set_cell_background(c_pic, "F4F8FC")
        set_cell_background(c_info, "FFFFFF")
        set_cell_borders(c_pic, top="0060CA", bottom="0060CA", left="0060CA", right="0060CA", sz="8")
        set_cell_borders(c_info, top="D0DBEA", bottom="D0DBEA", left="D0DBEA", right="D0DBEA", sz="4")
        set_cell_margins(c_pic, top=100, bottom=100, left=100, right=100)
        set_cell_margins(c_info, top=100, bottom=100, left=140, right=140)
        
        p_pic = c_pic.paragraphs[0]
        p_pic.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_pic.paragraph_format.space_before = Pt(30)
        p_pic.paragraph_format.space_after = Pt(30)
        r_p = p_pic.add_run(f"\n[ Affix Passport Photo ]\n\n{name.split()[0]}\n")
        r_p.italic = True
        r_p.font.size = Pt(9.5)
        r_p.font.color.rgb = RGBColor(120, 120, 140)
        
        p_info = c_info.paragraphs[0]
        p_info.paragraph_format.line_spacing = 1.1
        p_info.paragraph_format.space_after = Pt(2)
        
        r1 = p_info.add_run(f"{name}\n")
        r1.bold = True
        r1.font.size = Pt(12)
        r1.font.color.rgb = RGBColor(9, 0, 137)
        
        p_info.add_run(f"Register Number: ").bold = True
        p_info.add_run(f"{regno}\n")
        p_info.add_run(f"Degree Program: ").bold = True
        p_info.add_run(f"{degree}\n")
        p_info.add_run(f"Institutional Affiliation: ").bold = True
        p_info.add_run("VIT Bhopal University, Madhya Pradesh\n")
        p_info.add_run(f"Project Role: ").bold = True
        r_role = p_info.add_run(f"{role}\n")
        r_role.font.color.rgb = RGBColor(0, 96, 202)
        r_role.bold = True
        p_info.add_run(f"Core Technical Skills: ").bold = True
        p_info.add_run(f"{skills}\n")
        p_info.add_run(f"Individual Responsibilities:\n").bold = True
        p_info.add_run(f"{desc}\n")
        
        for run in p_info.runs:
            if run.font.size is None:
                run.font.size = Pt(9.5)
            run.font.name = 'Times New Roman'
            
        doc.add_paragraph().paragraph_format.space_after = Pt(10)
        if idx == 1:
            doc.add_page_break()

    # Save documents
    repo_out = os.path.abspath("Synapse_Voice_Phase_I_Report.docx")
    desktop_dir = os.path.expanduser(r"~\OneDrive\Desktop")
    if not os.path.exists(desktop_dir):
        desktop_dir = os.path.expanduser(r"~\Desktop")
    desktop_out = os.path.join(desktop_dir, "Synapse_Voice_Phase_I_Report.docx")

    doc.save(repo_out)
    print(f"Report saved to repository at: {repo_out}")

    try:
        shutil.copyfile(repo_out, desktop_out)
        print(f"Report copied to Desktop at: {desktop_out}")
    except Exception as e:
        print(f"Notice when copying to Desktop: {e}")

if __name__ == '__main__':
    main()
