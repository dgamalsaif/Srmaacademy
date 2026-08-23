import { programCatalogBootstrapTable, researchProgramsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { PROGRAM_CAPACITY_LOCK_NAMESPACE, type DatabaseTransaction } from "./programCapacity";

const SNAPSHOT_KEY = "research-catalog-seats-2026-08-23";
const SNAPSHOT_LOCK_ID = 9_021_741;

export const RESEARCH_CATALOG_SEAT_SNAPSHOT = [
  { titleEn: "Robotic versus open ventral hernia repair (ROVHR): A Systematic Review and Meta-Analysis of RCT", seatsLeft: 1 },
  { titleEn: "The Clinical Efficacy and Stability of Skeletal Anchorage Devices in Managing Class II Malocclusion: A Systematic Review and Meta-Analysis", seatsLeft: 1 },
  { titleEn: "Efficacy and safety of low-dose digoxin in patients with heart failure: A Systematic Review and Meta-analysis of RCTs", seatsLeft: 2 },
  { titleEn: "Endoscopic vs Microscopic Transsphenoidal Surgery for Pituitary Adenomas", seatsLeft: 1 },
  { titleEn: "Autologous Fat Grafting for Optimization of Breast Reconstruction Outcomes: A Meta-analysis of Comparative Studies", seatsLeft: 1 },
  { titleEn: "Diagnostic Accuracy of Automated Digital Morphology and Machine Learning for Peripheral Blood Smear Analysis in Hematological Malignancies: A Systematic Review and Meta-Analysis", seatsLeft: 1 },
  { titleEn: "Remimazolam versus Conventional Sedatives for Mechanically Ventilated ICU Patients: A Network Meta-analysis", seatsLeft: 5 },
  { titleEn: "Acute Pain in the Emergency Department: A Systematic Review and Meta-analysis of RCTs", seatsLeft: 6 },
  { titleEn: "Clinical Effectiveness of Sealer-Based Single-Cone Obturation with Hydraulic Calcium Silicate Sealers versus Warm Vertical Compaction in Nonsurgical Root Canal Treatment: A Systematic Review and Meta-Analysis of Randomized Controlled Trials", seatsLeft: 8 },
  { titleEn: "Prevention of Occlusal Caries in Children and Adolescents: A Systematic Review and Meta-Analysis of Randomized Controlled Trials", seatsLeft: 10 },
  { titleEn: "Efficacy and Safety of Vedolizumab Combined With Upadacitinib in Patients With Ulcerative Colitis: A Systematic Review and Meta-analysis of RCTs", seatsLeft: 6 },
  { titleEn: "Impact of Algorithmic Bias in AI-Based Clinical Decision Support Systems on Health Equity: A Systematic Review and Meta-Analysis", seatsLeft: 1 },
  { titleEn: "CPX-351 versus Standard 7+3 Chemotherapy in High-Risk Acute Myeloid Leukemia: A Systematic Review and Meta-analysis of RCTs", seatsLeft: 7 },
  { titleEn: "T1D under automated insulin delivery (AID) control – م1", seatsLeft: 2 },
  { titleEn: "T1D under automated insulin delivery (AID) control – م2", seatsLeft: 2 },
  { titleEn: "Ocrelizumab versus Rituximab in Relapsing-Remitting Multiple Sclerosis: A Systematic Review and Meta-analysis", seatsLeft: 1 },
  { titleEn: "Comparative Efficacy and Metabolic Outcomes of Bariatric Surgery Versus Novel Incretin-Based Therapies (GLP-1/GIP) in Severe Obesity: A Systematic Review and Meta-Analysis", seatsLeft: 11 },
  { titleEn: "Low-Dose versus High-Dose Misoprostol Regimens for Induction of Labor: A Systematic Review and Meta-analysis of Randomized Controlled Trials", seatsLeft: 7 },
  { titleEn: "Conjunctival Autografts in Primary Pterygium Surgery", seatsLeft: 8 },
  { titleEn: "Custom-Made 3D-Printed PEEK versus Titanium Plates for Mandibular Fracture Fixation: A Systematic Review and Meta-Analysis of Comparative Clinical Studies", seatsLeft: 4 },
  { titleEn: "Deep Learning for Opportunistic Detection of Osteoporosis and Vertebral Fractures on Routine CT: A Systematic Review and Meta-Analysis of Diagnostic Accuracy Against DXA and Radiologist Reference Standards", seatsLeft: 5 },
  { titleEn: "Biological Augmentation Strategies in Arthroscopic Double-Row Rotator Cuff Repair: A Systematic Review and Meta-Analysis of Randomized Controlled Trials", seatsLeft: 1 },
  { titleEn: "Efficacy and Safety of SGLT2 Inhibitors versus Standard Care in Children and Adolescents with Chronic Kidney Disease: A Systematic Review and Meta-analysis", seatsLeft: 1 },
  { titleEn: "Nanosilver Fluoride versus 38% Silver Diamine Fluoride for Arresting Caries in Primary Teeth: A Systematic Review and Meta-Analysis", seatsLeft: 2 },
  { titleEn: "Platelet-Rich Fibrin (PRF) + Open Flap Debridement versus Open Flap Debridement Alone for Intrabony Defects", seatsLeft: 1 },
  { titleEn: "Safety, Tolerability, and Efficacy of Evenamide for Patients with Chronic Schizophrenia: A Systematic Review and Meta-analysis", seatsLeft: 7 },
  { titleEn: "Restorative Alternatives in Posterior Permanent Teeth", seatsLeft: 6 },
  { titleEn: "Efficacy and Safety of Upadacitinib versus Adalimumab in Patients with Moderate-to-Severe Rheumatoid Arthritis: A Systematic Review and Meta-analysis of Randomized Controlled Trials", seatsLeft: 5 },
  { titleEn: "Metastasis-Directed Therapy Versus Systemic Therapy Alone in PSMA-PET–Defined Oligometastatic Hormone-Sensitive Prostate Cancer: A Systematic Review and Meta-Analysis of Randomized Controlled Trials", seatsLeft: 8 },
  { titleEn: "Diagnostic Efficiency and Lung Nodule Misclassification Rates of Ultra-Low-Dose CT (ULDCT) with Deep Learning Reconstruction vs. Standard-Dose Low-Dose CT (LDCT) for Lung Cancer Screening: A Systematic Review", seatsLeft: 6 },
  { titleEn: "Comparative Diagnostic Performance of Multiparametric MRI (mpMRI) vs. 68Ga-PSMA PET/MRI for Local Staging and Extraprostatic Extension in Primary Prostate Cancer: A Meta-Analysis", seatsLeft: 5 },
  { titleEn: "Efficacy of Local Absorbable Antibiotic-Loaded Bio-Carriers in Preventing Fracture-Related Infections (FRI) Following Fixation of Complex Extremity Trauma: A Systematic Review and Meta-Analysis", seatsLeft: 7 },
  { titleEn: "Efficacy and Safety of Non-Steroidal Mineralocorticoid Receptor Antagonists (Finerenone) in Patients with Heart Failure and Preserved Ejection Fraction (HFpEF): A Systematic Review", seatsLeft: 6 },
  { titleEn: "Dermatologic and Sexually Transmitted Diseases During Pregnancy and Their Impact on Fetal Outcomes: A Systematic Review", seatsLeft: 5 },
  { titleEn: "Impact of Sterilization Process Quality and Instrument Reprocessing Compliance on Surgical Site Infection Rates: A Systematic Review", seatsLeft: 8 },
  { titleEn: "Differentiating Glioblastoma Progression from Treatment Effects Under RANO 2.0 Criteria: A Comparative Meta-Analysis of Multimodal Imaging Performance Across Molecular Subtypes", seatsLeft: 7 },
  { titleEn: "Value of Arterial Spin Labeling (ASL) Perfusion MRI vs. Exogenous Contrast-Based Perfusion Methods in Distinguishing Glioblastoma True Progression from Radiation Necrosis: A Systematic Review and Meta-Analysis", seatsLeft: 5 },
  { titleEn: "Dual Incretin Receptor Agonists for Pancreatic Beta-Cell Preservation and Glycemic Durability in Early Type 2 Diabetes: A Systematic Review and Meta-Analysis", seatsLeft: 6 },
  { titleEn: "The Relationship Between Environmental Endocrine Disruptors and Early Onset Thyroid Dysfunction in Women of Reproductive Age: A Systematic Review", seatsLeft: 5 },
  { titleEn: "Effect of Intervention Timing in Minimally Invasive Hematoma Evacuation Versus Open Craniotomy for Spontaneous Intracerebral Hemorrhage: A Systematic Review and Meta-Analysis", seatsLeft: 6 },
  { titleEn: "Appetite Hormone Agonists in Heart Failure with Reduced Ejection Fraction: A Meta-Analysis of Randomized Controlled Trials", seatsLeft: 5 },
  { titleEn: "Comparative Efficacy and Safety of 63 µm versus 45 µm Gelatin Microstents in Open-Angle Glaucoma: A Systematic Review and Meta-Analysis", seatsLeft: 6 },
  { titleEn: "Comparative Diagnostic Accuracy of 68Ga-PSMA vs. 18F-Fluciclovine PET/CT for Detecting Early Biochemical Recurrence of Prostate Cancer at Low PSA Levels (<0.5 ng/mL): A Head-to-Head Evidence Synthesis", seatsLeft: 6 },
  { titleEn: "Minimally Invasive versus Open Pancreaticoduodenectomy in Elderly Patients (≥70 years): A Systematic Review and Meta-Analysis of Perioperative and Oncological Outcomes", seatsLeft: 5 },
  { titleEn: "Efficacy and Safety of Topical Metformin for Melasma: A Systematic Review and Meta-Analysis", seatsLeft: 3 },
] as const;

const displayOrderByTitle = new Map<string, number>(
  RESEARCH_CATALOG_SEAT_SNAPSHOT.map((entry, index) => [entry.titleEn, index + 1]),
);

export function researchCatalogDisplayOrder(titleEn: string) {
  return displayOrderByTitle.get(titleEn);
}

export async function applyResearchCatalogSeatSnapshot(tx: DatabaseTransaction) {
  await tx.execute(sql`SELECT pg_advisory_xact_lock(${SNAPSHOT_LOCK_ID})`);
  const [applied] = await tx
    .select({ key: programCatalogBootstrapTable.key })
    .from(programCatalogBootstrapTable)
    .where(eq(programCatalogBootstrapTable.key, SNAPSHOT_KEY))
    .limit(1);
  if (applied) return;

  const programs = await tx
    .select({
      id: researchProgramsTable.id,
      titleEn: researchProgramsTable.titleEn,
      firstAuthorSeatsLeft: researchProgramsTable.firstAuthorSeatsLeft,
    })
    .from(researchProgramsTable);
  const programByTitle = new Map(programs.map((program) => [program.titleEn, program]));
  const missingTitles = RESEARCH_CATALOG_SEAT_SNAPSHOT
    .filter((entry) => !programByTitle.has(entry.titleEn))
    .map((entry) => entry.titleEn);

  if (missingTitles.length > 0) {
    throw new Error(`Seat snapshot was not applied because ${missingTitles.length} research titles were not found.`);
  }

  for (const entry of RESEARCH_CATALOG_SEAT_SNAPSHOT) {
    const program = programByTitle.get(entry.titleEn)!;
    const firstAuthorSeatsLeft = Math.min(program.firstAuthorSeatsLeft, entry.seatsLeft);
    const coAuthorSeatsLeft = Math.max(0, entry.seatsLeft - firstAuthorSeatsLeft);
    await tx.execute(sql`SELECT pg_advisory_xact_lock(${PROGRAM_CAPACITY_LOCK_NAMESPACE + program.id})`);
    await tx
      .update(researchProgramsTable)
      .set({
        seatsLeft: entry.seatsLeft,
        firstAuthorSeatsLeft,
        coAuthorSeatsLeft,
      })
      .where(eq(researchProgramsTable.id, program.id));
  }

  await tx.insert(programCatalogBootstrapTable).values({ key: SNAPSHOT_KEY });
}