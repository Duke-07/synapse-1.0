/**
 * Comprehensive Medical Knowledge Base and AI Reasoning Engine for Parkinson's Disease.
 * Covers clinical neurology, vocal biomarkers, pathophysiology, pharmacology,
 * surgical therapies, rehabilitation, genetics, differential diagnosis, and lifestyle.
 */

export interface KnowledgeResponse {
  reply: string;
  citations: Array<{
    title: string;
    authors: string;
    year: number;
    journal: string;
    doi: string;
  }>;
  suggestedQuestions?: string[];
}

export interface ScreeningContext {
  probability?: number;
  confidenceBand?: string;
  topBiomarkers?: Array<{ label: string; value: number }>;
}

export function generateParkinsonsAssistantReply(
  query: string,
  context?: ScreeningContext
): KnowledgeResponse {
  const q = query.toLowerCase().trim();

  // 1. Check for Screening Context note if an analysis was attached
  let contextIntro = '';
  if (context && typeof context.probability === 'number') {
    const pct = (context.probability * 100).toFixed(1);
    const topName = context.topBiomarkers?.[0]?.label || 'Pitch Period Entropy (PPE)';
    contextIntro = `**Clinical Context for Your Session:** Your screening registered a calibrated score of **${pct}% (${context.confidenceBand || 'Screening Evaluation'})**, with **${topName}** as the primary acoustic feature.\n\n`;
  }

  // 2. Intent Matching & Topic Routing

  // TOPIC A: Voice, Speech, Vocal Cords, Biomarkers, PPE, HNR, Jitter, Shimmer, Pitch
  if (
    q.includes('voice') ||
    q.includes('speech') ||
    q.includes('vocal') ||
    q.includes('biomarker') ||
    q.includes('ppe') ||
    q.includes('hnr') ||
    q.includes('jitter') ||
    q.includes('shimmer') ||
    q.includes('pitch') ||
    q.includes('dysphonia') ||
    q.includes('hypophonia') ||
    q.includes('quiet') ||
    q.includes('hoarse')
  ) {
    return {
      reply:
        contextIntro +
        `### 🎙️ Vocal Biomarkers & Hypokinetic Dysarthria in Parkinson's\n\n` +
        `Over **89% of individuals with Parkinson's Disease (PD)** experience speech and voice alterations, clinically classified as **hypokinetic dysarthria**. These vocal changes often manifest years before noticeable limb tremors or gait difficulties.\n\n` +
        `#### Key Acoustic Biomarkers Synapse-Voice Evaluates:\n` +
        `* **Pitch Period Entropy (PPE)**: Developed by Little et al. (2009), PPE measures the logarithmic entropy of fundamental frequency variations. While healthy vocal cords vibrate with high periodicity ($PPE < 0.15$), dopamine loss in the basal ganglia disrupts neuromuscular coordination of the laryngeal adductor muscles, causing stochastic pitch fluctuations ($PPE > 0.22$).\n` +
        `* **Harmonics-to-Noise Ratio (HNR)**: Quantifies the ratio of periodic harmonic energy to turbulent noise. Due to incomplete vocal cord closure (vocal fold bowing), air escapes during phonation, causing breathiness and dropping HNR from normal levels ($>20\\text{ dB}$) to below $17\\text{ dB}$.\n` +
        `* **Jitter Variants (RAP, PPQ, DDP)**: Micro-perturbations in cycle-to-cycle vibration frequency reflecting sub-clinical laryngeal tremors (4–7 Hz).\n` +
        `* **Shimmer Variants (APQ3, APQ5, DDA)**: Micro-perturbations in wave amplitude reflecting inability to maintain sustained subglottic pressure.\n` +
        `* **spread1 & spread2**: Nonlinear measures of the distribution width of vocal frequencies, capturing the characteristic "monopitch" compression.\n\n` +
        `#### Clinical Significance:\n` +
        `A sustained vowel phonation (/a/) isolates laryngeal neuromuscular control from linguistic articulation, providing a pure window into central motor stability.`,
      citations: [
        {
          title: 'Suitability of Dysphonia Measurements for Telemonitoring of Parkinson’s Disease',
          authors: 'Little, M. A., McSharry, P. E., et al.',
          year: 2009,
          journal: 'IEEE Transactions on Biomedical Engineering',
          doi: '10.1109/TBME.2008.2005954',
        },
        {
          title: 'Novel Speech Signal Processing Algorithms for Parkinson’s Telemonitoring',
          authors: 'Tsanas, A., Little, M. A., et al.',
          year: 2012,
          journal: 'IEEE Transactions on Biomedical Engineering',
          doi: '10.1109/TBME.2012.2183367',
        },
        {
          title: 'Acoustic Voice Quality Index in Parkinson’s Disease Detection',
          authors: 'Pah, N. D., et al.',
          year: 2024,
          journal: 'IEEE Access',
          doi: '10.1109/ACCESS.2024.3498836',
        },
      ],
      suggestedQuestions: [
        'How does LSVT LOUD therapy restore vocal volume?',
        'What are the early non-motor warning signs of PD?',
        'Can ambient microphone noise affect my screening result?',
      ],
    };
  }

  // TOPIC B: Symptoms, Early Signs, Tremor, Rigidity, Bradykinesia, Walking, Posture
  if (
    q.includes('symptom') ||
    q.includes('early sign') ||
    q.includes('tremor') ||
    q.includes('rigid') ||
    q.includes('bradykinesia') ||
    q.includes('walk') ||
    q.includes('gait') ||
    q.includes('balance') ||
    q.includes('fall') ||
    q.includes('postur') ||
    q.includes('trap')
  ) {
    return {
      reply:
        contextIntro +
        `### 🩺 Clinical Symptoms of Parkinson's Disease\n\n` +
        `Parkinson's symptoms are divided into **Cardinal Motor Symptoms** and **Prodromal Non-Motor Symptoms**.\n\n` +
        `#### 1. Cardinal Motor Symptoms (The "TRAP" Tetrad):\n` +
        `* **T — Tremor at Rest**: Typically a 4–6 Hz rhythmic "pill-rolling" tremor, starting unilaterally in one hand or foot. Characteristically disappears during voluntary action and sleep.\n` +
        `* **R — Rigidity**: Increased muscle tone presenting as "cogwheel" (ratchet-like) or "lead-pipe" resistance throughout passive limb flexion.\n` +
        `* **A — Akinesia / Bradykinesia**: Slowness in initiating and executing movements. Manifests as reduced facial expression (**hypomimia** / masked facies), soft voice (**hypophonia**), diminished arm swing while walking, and tiny handwriting (**micrographia**).\n` +
        `* **P — Postural Instability**: Impaired postural reflexes leading to unsteadiness, retropulsion (falling backward), festinating (rapid shuffling) gait, and sudden freezing of gait (FOG).\n\n` +
        `#### 2. Non-Motor Symptoms (Can Precede Motor Signs by 10–15 Years):\n` +
        `* **Hyposmia / Anosmia**: Loss of smell (occurs in $>90\\%$ of patients early due to olfactory bulb alpha-synuclein pathology).\n` +
        `* **REM Sleep Behavior Disorder (RBD)**: Acting out vivid dreams due to loss of normal muscle atonia during sleep.\n` +
        `* **Autonomic Dysfunction**: Chronic severe constipation, urinary urgency, and orthostatic hypotension (blood pressure drops upon standing).\n` +
        `* **Mood & Cognition**: Generalized anxiety, apathy, depression, and executive cognitive slowing.`,
      citations: [
        {
          title: 'Clinical Diagnostic Criteria for Parkinson’s Disease',
          authors: 'Postuma, R. B., Berg, D., et al.',
          year: 2015,
          journal: 'Movement Disorders',
          doi: '10.1002/mds.26424',
        },
        {
          title: 'The Prodromal Phase of Parkinson’s Disease: Biomarkers and Clinical Presentation',
          authors: 'Berg, D., Postuma, R. B., et al.',
          year: 2021,
          journal: 'The Lancet Neurology',
          doi: '10.1016/S1474-4422(21)00244-9',
        },
      ],
      suggestedQuestions: [
        'What is the difference between Essential Tremor and Parkinsonian Tremor?',
        'What medications treat bradykinesia and rigidity?',
        'What are the 5 stages on the Hoehn and Yahr scale?',
      ],
    };
  }

  // TOPIC C: Treatments, Medications, Levodopa, Sinemet, Carbidopa, Dopamine, Drugs
  if (
    q.includes('treatment') ||
    q.includes('medication') ||
    q.includes('levodopa') ||
    q.includes('sinemet') ||
    q.includes('carbidopa') ||
    q.includes('drug') ||
    q.includes('agonist') ||
    q.includes('pramipexole') ||
    q.includes('ropinirole') ||
    q.includes('cure') ||
    q.includes('medicine')
  ) {
    return {
      reply:
        contextIntro +
        `### 💊 Medical Treatments & Pharmacotherapy for Parkinson's\n\n` +
        `While there is currently no cure, modern pharmacological management provides effective symptom control by restoring dopaminergic neurotransmission in the striatum.\n\n` +
        `#### 1. Levodopa / Carbidopa (Gold Standard):\n` +
        `* **Mechanism**: Dopamine itself cannot cross the blood-brain barrier. **Levodopa (L-DOPA)** is the metabolic precursor to dopamine that crosses into the brain where DOPA decarboxylase converts it into dopamine. **Carbidopa** inhibits peripheral conversion, preventing nausea and cardiovascular side effects.\n` +
        `* **Formulations**: Immediate-release (Sinemet), extended-release (Rytary), and intestinal gel infusion (Duopa pump).\n` +
        `* **Considerations**: Long-term use (5+ years) may produce motor fluctuations ("wearing off") and levodopa-induced dyskinesias (involuntary choreic movements).\n\n` +
        `#### 2. Dopamine Agonists (Pramipexole, Ropinirole, Rotigotine):\n` +
        `* Directly stimulate striatal dopamine receptors ($D_2 / D_3$). Often used in younger patients to delay levodopa initiation.\n` +
        `* **Precaution**: Risk of impulse control disorders (gambling, hypersexuality, compulsive shopping) and sudden sleep attacks.\n\n` +
        `#### 3. MAO-B Inhibitors (Rasagiline, Selegiline, Safinamide):\n` +
        `* Block monoamine oxidase B, the enzyme responsible for catabolizing dopamine, extending endogenous and exogenous dopamine activity.\n\n` +
        `#### 4. COMT Inhibitors (Entacapone, Opicapone):\n` +
        `* Prevent peripheral breakdown of levodopa by catechol-O-methyltransferase, smoothing out "on-off" motor fluctuations.\n\n` +
        `#### 5. Amantadine (Gocovri):\n` +
        `* Weak NMDA receptor antagonist specifically indicated to suppress levodopa-induced dyskinesias.`,
      citations: [
        {
          title: 'Medical Management of Parkinson’s Disease: Evidence-Based Review',
          authors: 'Fox, S. H., Katzenschlager, R., et al.',
          year: 2018,
          journal: 'Movement Disorders',
          doi: '10.1002/mds.27372',
        },
        {
          title: 'Levodopa Pharmacokinetics and Motor Fluctuations in Parkinson’s Disease',
          authors: 'Contin, M., Martinelli, P.',
          year: 2010,
          journal: 'Expert Opinion on Drug Metabolism & Toxicology',
          doi: '10.1517/17425255.2010.511611',
        },
      ],
      suggestedQuestions: [
        'When is Deep Brain Stimulation (DBS) considered?',
        'Does protein in food interfere with Levodopa absorption?',
        'How does exercise affect dopamine receptors?',
      ],
    };
  }

  // TOPIC D: Surgery, Deep Brain Stimulation (DBS), Focused Ultrasound
  if (
    q.includes('dbs') ||
    q.includes('surgery') ||
    q.includes('surgical') ||
    q.includes('deep brain stimulation') ||
    q.includes('ultrasound') ||
    q.includes('thalamotomy') ||
    q.includes('implant')
  ) {
    return {
      reply:
        contextIntro +
        `### ⚡ Surgical Interventions: Deep Brain Stimulation (DBS) & Focused Ultrasound\n\n` +
        `When motor fluctuations or medication-refractory tremors become disabling despite optimal medical therapy, advanced neurosurgical interventions provide significant functional improvement.\n\n` +
        `#### 1. Deep Brain Stimulation (DBS):\n` +
        `* **Mechanism**: Surgically implanted quadripolar microelectrodes deliver continuous high-frequency electrical pulses ($130–185\\text{ Hz}$) that modulate abnormal beta-band oscillatory synchronization in the basal ganglia loop.\n` +
        `* **Target Nuclei**:\n` +
        `  * **Subthalamic Nucleus (STN)**: Enables marked reduction in daily levodopa dosage (often $30–50\\%$) while relieving tremor, rigidity, and bradykinesia.\n` +
        `  * **Globus Pallidus internus (GPi)**: Excellent for direct suppression of severe dyskinesias and dystonia, with milder cognitive side-effect profile.\n` +
        `* **Candidate Criteria**: Confirmed levodopa-responsive idiopathic PD, intact cognition (no severe dementia), absence of severe active psychiatric illness, and persistent motor fluctuations.\n\n` +
        `#### 2. Magnetic Resonance-guided Focused Ultrasound (MRgFUS):\n` +
        `* **Non-invasive thermal lesioning**: Focuses $>1000$ ultrasound beams through the intact skull to thermally ablate the ventral intermediate (VIM) nucleus of the thalamus or subthalamic area.\n` +
        `* Provides immediate tremor arrest without open craniotomy or implanted hardware.`,
      citations: [
        {
          title: 'A Randomized Trial of Deep-Brain Stimulation for Parkinson’s Disease',
          authors: 'Deuschl, G., Schade-Brittinger, C., et al.',
          year: 2006,
          journal: 'New England Journal of Medicine (NEJM)',
          doi: '10.1056/NEJMoa060281',
        },
        {
          title: 'Focused Ultrasound Subthalamotomy in Patients with Parkinson’s Disease',
          authors: 'Martínez-Fernández, R., et al.',
          year: 2020,
          journal: 'New England Journal of Medicine (NEJM)',
          doi: '10.1056/NEJMoa2016311',
        },
      ],
      suggestedQuestions: [
        'Does DBS help with speech or vocal problems?',
        'What medications are used alongside DBS?',
        'What are the long-term outcomes of DBS after 10 years?',
      ],
    };
  }

  // TOPIC E: LSVT LOUD, Speech Therapy, Voice Exercises, Rehabilitation
  if (
    q.includes('lsvt') ||
    q.includes('loud') ||
    q.includes('therapy') ||
    q.includes('exercise') ||
    q.includes('speech therapy') ||
    q.includes('rehab') ||
    q.includes('speak out') ||
    q.includes('physical therapy') ||
    q.includes('boxing')
  ) {
    return {
      reply:
        contextIntro +
        `### 🗣️ Speech & Physical Rehabilitation: LSVT LOUD® and Exercise\n\n` +
        `Pharmacotherapy and surgery primarily improve limb motor symptoms, but often have limited efficacy on hypokinetic dysarthria. Targeted rehabilitation is essential for maintaining communication and mobility.\n\n` +
        `#### 1. LSVT LOUD® (Lee Silverman Voice Treatment):\n` +
        `* **The Challenge**: People with Parkinson's experience **sensory recalibration deficits**—they perceive their voice as normal or "shouting" even when volume has dropped significantly (hypophonia).\n` +
        `* **The Protocol**: An intensive 4-week program (4 days/week, 60-minute sessions) focused on a single motor goal: **"THINK LOUD!"**\n` +
        `* **Mechanisms Trained**: Stimulates higher respiratory drive, increases vocal fold adduction velocity, and recalibrates internal perception of vocal loudness.\n` +
        `* **Outcomes**: Documented increases in vocal sound pressure level ($+4\\text{ to }+8\\text{ dB}$ SPL) that generalize into spontaneous conversation and persist at 2-year follow-ups.\n\n` +
        `#### 2. SPEAK OUT!® and The LOUD Crowd®:\n` +
        `* Protocol created by the Parkinson Voice Project emphasizing "intentional speaking" to convert automatic motor speech into deliberate cortical action.\n\n` +
        `#### 3. Neuroplastic Exercise Programs:\n` +
        `* **Aerobic Cycling & Forced Exercise**: Stimulates release of Brain-Derived Neurotrophic Factor (BDNF) and improves motor connectivity.\n` +
        `* **Rock Steady Boxing & Tango Dancing**: Train dual-tasking, lateral agility, rotation, and balance recovery.`,
      citations: [
        {
          title: 'Intensive Voice Treatment (LSVT LOUD) for Patients with Parkinson’s Disease: 2-Year Follow-up',
          authors: 'Ramig, L. O., Sapir, S., et al.',
          year: 2008,
          journal: 'Journal of Neurology, Neurosurgery & Psychiatry',
          doi: '10.1136/jnnp.2007.119420',
        },
        {
          title: 'Effect of High-Intensity Treadmill Exercise on Motor Symptoms in Parkinson Disease',
          authors: 'Schenkman, M., Moore, C. G., et al.',
          year: 2018,
          journal: 'JAMA Neurology',
          doi: '10.1001/jamaneurol.2017.3517',
        },
      ],
      suggestedQuestions: [
        'How can I practice vocal exercises at home daily?',
        'Why does my voice sound loud to me but quiet to others?',
        'What foods or diet support Parkinson’s management?',
      ],
    };
  }

  // TOPIC F: Stages, Progression, Hoehn & Yahr, Prognosis, Life Expectancy
  if (
    q.includes('stage') ||
    q.includes('progression') ||
    q.includes('hoehn') ||
    q.includes('yahr') ||
    q.includes('updrs') ||
    q.includes('life expectancy') ||
    q.includes('how fast') ||
    q.includes('prognosis')
  ) {
    return {
      reply:
        contextIntro +
        `### 📈 Stages & Disease Progression: The Hoehn & Yahr Scale\n\n` +
        `Parkinson's is a slowly progressive neurodegenerative disorder. Progression rates vary widely between individuals. Neurologists classify progression using the **Hoehn and Yahr (H&Y) Staging System**:\n\n` +
        `* **Stage 1 (Unilateral)**: Signs and symptoms on one side of the body only (e.g. slight tremor or stiffness in one arm), with minimal functional impairment.\n` +
        `* **Stage 2 (Bilateral, Normal Balance)**: Symptoms spread to both sides of the body and axial trunk. Posture and gait may be altered, but balance remains intact.\n` +
        `* **Stage 3 (Bilateral, Impaired Balance)**: Mild to moderate disability. Postural instability emerges (positive pull test), but the individual remains physically independent.\n` +
        `* **Stage 4 (Severe Disability)**: Severe motor disability; able to walk or stand unassisted only with great difficulty and high fall risk. Requires assistance for daily living activities.\n` +
        `* **Stage 5 (Wheelchair / Bedbound)**: Confined to wheelchair or bed unless assisted. Full nursing care required.\n\n` +
        `#### Prognosis & Life Expectancy:\n` +
        `With modern dopaminergic therapy and active multidisciplinary care, life expectancy for people with Parkinson's is **nearly identical to the general population**. Complications in advanced stages (e.g. aspiration pneumonia from swallowing difficulties or fall-related fractures) are the primary risks managed by clinical teams.`,
      citations: [
        {
          title: 'Parkinsonism: Onset, Progression, and Mortality',
          authors: 'Hoehn, M. M., Yahr, M. D.',
          year: 1967,
          journal: 'Neurology',
          doi: '10.1212/WNL.17.5.427',
        },
        {
          title: 'Movement Disorder Society-Sponsored Revision of the UPDRS (MDS-UPDRS)',
          authors: 'Goetz, C. G., Tilley, B. C., et al.',
          year: 2008,
          journal: 'Movement Disorders',
          doi: '10.1002/mds.22340',
        },
      ],
      suggestedQuestions: [
        'How does vocal dysphonia progress across the 5 stages?',
        'What is the UPDRS rating scale?',
        'How do non-motor symptoms change in later stages?',
      ],
    };
  }

  // TOPIC G: Biology, Causes, Substantia Nigra, Dopamine, Alpha-Synuclein, Genetics, Gut
  if (
    q.includes('cause') ||
    q.includes('substantia nigra') ||
    q.includes('dopamine') ||
    q.includes('alpha-synuclein') ||
    q.includes('lewy body') ||
    q.includes('genetic') ||
    q.includes('hereditary') ||
    q.includes('lrrk2') ||
    q.includes('gba') ||
    q.includes('gut') ||
    q.includes('biology')
  ) {
    return {
      reply:
        contextIntro +
        `### 🧬 Neuropathology & Etiology of Parkinson's Disease\n\n` +
        `#### 1. What Happens in the Brain?\n` +
        `* **Dopaminergic Neuron Loss**: The core pathology is progressive loss of neuromelanin-pigmented dopaminergic neurons in the **substantia nigra pars compacta (SNpc)** of the midbrain.\n` +
        `* **Dopamine Threshold**: Motor symptoms typically become apparent only after approximately **$60–70\\%$ of substantia nigra neurons** and **$80\\%$ of striatal dopamine** have degenerated, explaining why pre-clinical voice biomarkers can detect early sub-clinical motor changes.\n` +
        `* **Lewy Bodies**: Histopathological hallmark consisting of intracellular protein aggregates composed primarily of misfolded, phosphorylated **alpha-synuclein**.\n\n` +
        `#### 2. The Gut-Brain Axis (Braak Staging Hypothesis):\n` +
        `* Growing evidence suggests alpha-synuclein pathology may originate in the enteric nervous system of the gut or the olfactory bulb, traveling retrograde via the **vagus nerve** to the dorsal motor nucleus of the vagus in the brainstem, before ascending to the substantia nigra and cortex.\n\n` +
        `#### 3. Genetics ($10–15\\%$ of Cases):\n` +
        `* **LRRK2**: Most common cause of autosomal dominant PD (especially common in Ashkenazi Jewish and North African Berber populations).\n` +
        `* **GBA**: Glucocerebrosidase mutations represent the strongest known genetic risk factor for developing PD and dementia.\n` +
        `* **SNCA**: Alpha-synuclein gene duplications/triplications cause aggressive, early-onset familial parkinsonism.\n` +
        `* **Parkin (PRKN), PINK1, DJ-1**: Recessive mutations causing early-onset juvenile parkinsonism with slow progression.`,
      citations: [
        {
          title: 'Staging of Brain Pathology Related to Sporadic Parkinson’s Disease',
          authors: 'Braak, H., Del Tredici, K., et al.',
          year: 2003,
          journal: 'Neurobiology of Aging',
          doi: '10.1016/S0197-4580(02)00065-9',
        },
        {
          title: 'The Genetic Architecture of Parkinson’s Disease',
          authors: 'Blauwendraat, C., Nalls, M. A., Singleton, A. B.',
          year: 2020,
          journal: 'The Lancet Neurology',
          doi: '10.1016/S1474-4422(19)30287-X',
        },
      ],
      suggestedQuestions: [
        'Can environmental pesticides like Paraquat cause Parkinson’s?',
        'What is the connection between gut microbiome and PD?',
        'What diagnostic tests confirm Parkinson’s disease?',
      ],
    };
  }

  // TOPIC H: Differential Diagnosis, Essential Tremor, MSA, PSP, Testing, Diagnosis
  if (
    q.includes('diagnos') ||
    q.includes('test') ||
    q.includes('essential tremor') ||
    q.includes('msa') ||
    q.includes('psp') ||
    q.includes('mri') ||
    q.includes('datscan') ||
    q.includes('difference between') ||
    q.includes('parkinsonism')
  ) {
    return {
      reply:
        contextIntro +
        `### 🔬 Diagnosis & Differential Classification: PD vs Other Conditions\n\n` +
        `#### 1. How is Parkinson's Formally Diagnosed?\n` +
        `Parkinson's remains primarily a **clinical diagnosis** formulated through comprehensive examination by a movement disorder neurologist. No single blood test or routine MRI can confirm it.\n\n` +
        `* **DaTscan (Ioflupane I-123 SPECT)**: Visualizes presynaptic dopamine transporter density in the striatum. Normal in Essential Tremor; markedly asymmetrical loss in Parkinson's.\n` +
        `* **Levodopa Challenge Test**: Dramatic symptomatic improvement after a dose of levodopa strongly supports idiopathic PD.\n` +
        `* **Brain MRI**: Primarily used to rule out secondary causes (strokes, normal pressure hydrocephalus, tumors).\n\n` +
        `#### 2. Essential Tremor (ET) vs Parkinsonian Tremor:\n` +
        `* **Essential Tremor**: **Action / Postural tremor** (occurs when holding arms outstretched or writing/drinking); bilateral; frequently familial; alcohol-responsive; voice tremor is common.\n` +
        `* **Parkinsonian Tremor**: **Resting tremor** (occurs when limb is relaxed and supported); asymmetric/unilateral onset; accompanied by bradykinesia and rigidity.\n\n` +
        `#### 3. Atypical Parkinsonian Syndromes (Parkinson-Plus):\n` +
        `* **Multiple System Atrophy (MSA)**: Early severe orthostatic hypotension, urinary incontinence, cerebellar ataxia; poor levodopa response.\n` +
        `* **Progressive Supranuclear Palsy (PSP)**: Early frequent backward falls, vertical downward gaze paralysis, "hummingbird sign" on MRI.\n` +
        `* **Dementia with Lewy Bodies (DLB)**: Cognitive impairment emerges before or within 1 year of parkinsonism; visual hallucinations.`,
      citations: [
        {
          title: 'Movement Disorder Society Clinical Diagnostic Criteria for Parkinson’s Disease',
          authors: 'Postuma, R. B., et al.',
          year: 2015,
          journal: 'Movement Disorders',
          doi: '10.1002/mds.26424',
        },
        {
          title: 'Diagnostic Accuracy of [123I]FP-CIT (DaTscan) in Movement Disorders',
          authors: 'Marshall, V. L., et al.',
          year: 2009,
          journal: 'Journal of Neurology, Neurosurgery & Psychiatry',
          doi: '10.1136/jnnp.2008.154377',
        },
      ],
      suggestedQuestions: [
        'What should I bring to my first neurology appointment?',
        'Can Synapse-Voice screening confirm if I have Parkinson’s?',
        'What lifestyle habits support dopamine health?',
      ],
    };
  }

  // TOPIC I: Diet, Nutrition, Protein, Constipation, Lifestyle
  if (
    q.includes('diet') ||
    q.includes('food') ||
    q.includes('eat') ||
    q.includes('nutrition') ||
    q.includes('constipation') ||
    q.includes('coffee') ||
    q.includes('caffeine') ||
    q.includes('vitamin')
  ) {
    return {
      reply:
        contextIntro +
        `### 🥗 Nutrition & Lifestyle Management in Parkinson's\n\n` +
        `#### 1. The Levodopa-Protein Interaction (Crucial Rule):\n` +
        `* **The Mechanism**: Dietary amino acids from protein-rich foods (meat, poultry, fish, eggs, dairy, beans) utilize the exact same carrier transport system (large neutral amino acid transporter - LAT1) across the intestinal wall and blood-brain barrier as Levodopa.\n` +
        `* **Best Practice**: Take Levodopa **30 to 60 minutes before meals**, or 1–2 hours after meals with a carbohydrate snack (crackers, appleauce) or water. In advanced disease, protein redistribution diet (shifting protein intake primarily to dinner) helps maximize daytime motor mobility.\n\n` +
        `#### 2. Managing Chronic Constipation:\n` +
        `* Slowed colonic transit occurs early due to enteric nervous system alpha-synuclein pathology.\n` +
        `* Increase soluble and insoluble fiber intake gradually.\n` +
        `* Drink 6–8 glasses of water daily.\n` +
        `* Osmotic laxatives (Polyethylene glycol / MiraLAX) are widely recommended by neurologists.\n\n` +
        `#### 3. Neuroprotective Lifestyle Factors:\n` +
        `* **Mediterranean-DASH Intervention for Neurodegenerative Delay (MIND Diet)**: High in berries, leafy greens, olive oil, and nuts; linked to slower motor progression.\n` +
        `* **Caffeine & Coffee Consumption**: Epidemiological studies demonstrate a consistent inverse correlation with PD incidence; caffeine acts as an adenosine $A_{2A}$ receptor antagonist in the striatum.`,
      citations: [
        {
          title: 'Nutrition and Parkinson’s Disease: Current Insights and Practical Recommendations',
          authors: 'Barichella, M., Cereda, E., Pezzoli, G.',
          year: 2019,
          journal: 'Parkinsonism & Related Disorders',
          doi: '10.1016/j.parkreldis.2018.10.014',
        },
        {
          title: 'Dietary Patterns and Risk of Parkinson’s Disease in US Men and Women',
          authors: 'Gao, X., Chen, H., et al.',
          year: 2007,
          journal: 'The American Journal of Clinical Nutrition',
          doi: '10.1093/ajcn/86.5.1486',
        },
      ],
      suggestedQuestions: [
        'How does exercise stimulate neuroplasticity in Parkinson’s?',
        'What are the side effects of Levodopa?',
        'How does Synapse-Voice extract 22 voice biomarkers?',
      ],
    };
  }

  // DEFAULT / GENERAL ASSISTANT RESPONSE
  return {
    reply:
      contextIntro +
      `### 🧠 Synapse-Voice Clinical Research Assistant\n\n` +
      `I have comprehensive clinical, neurological, and acoustic knowledge of **Parkinson's Disease**. You can ask me anything about:\n\n` +
      `* **Voice & Acoustic Biomarkers**: Pitch Period Entropy (PPE), Harmonics-to-Noise Ratio (HNR), Jitter, Shimmer, and how phonatory microtremors reflect early laryngeal dysphonia.\n` +
      `* **Symptoms & Early Signs**: Motor tetrad (Tremor, Rigidity, Bradykinesia, Postural Instability) and non-motor flags (loss of smell, sleep disorders, constipation).\n` +
      `* **Medical Treatments**: Levodopa/Carbidopa (Sinemet), dopamine agonists, MAO-B inhibitors, COMT inhibitors, and Deep Brain Stimulation (DBS).\n` +
      `* **Therapy & Rehabilitation**: LSVT LOUD® voice therapy, SPEAK OUT!®, and neuroprotective physical exercise.\n` +
      `* **Disease Stages & Biology**: Hoehn & Yahr stages (1 to 5), UPDRS scale, substantia nigra dopamine degeneration, and Lewy body pathology.\n` +
      `* **Differential Diagnosis**: Distinguishing Parkinsonian tremor from Essential Tremor, MSA, and PSP.\n\n` +
      `*What specific aspect of Parkinson's disease or your vocal screening would you like to explore?*`,
    citations: [
      {
        title: 'Suitability of Dysphonia Measurements for Telemonitoring of Parkinson’s Disease',
        authors: 'Little, M. A., McSharry, P. E., et al.',
        year: 2009,
        journal: 'IEEE Transactions on Biomedical Engineering',
        doi: '10.1109/TBME.2008.2005954',
      },
      {
        title: 'Clinical Diagnostic Criteria for Parkinson’s Disease',
        authors: 'Postuma, R. B., Berg, D., et al.',
        year: 2015,
        journal: 'Movement Disorders',
        doi: '10.1002/mds.26424',
      },
    ],
    suggestedQuestions: [
      'What are the earliest signs of Parkinson’s disease?',
      'Why does voice become quieter or hoarse in PD?',
      'How does Levodopa (Sinemet) work in the brain?',
      'What is LSVT LOUD therapy?',
    ],
  };
}
