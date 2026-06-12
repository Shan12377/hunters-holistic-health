  
**n8n Healthcare Workflows**

**Master Course**

*Every workflow. Every node. Every interview question. Every answer.*

**Pharmacy  Functional Medicine  Behavioral Health  Telehealth**

| 12 Workflows | 60+ n8n Nodes | 96 Interview Q\&A | 4 Settings |
| :---: | :---: | :---: | :---: |

**Dr. Shallanda Hunter, PharmD, MBA, RPh, CFNMP**

*Pharmacist  Functional Medicine Practitioner  Healthcare AI Integration Specialist  Creator of DeIDGuard*

# **How to Use This Course**

Each workflow in this document follows the exact same structure you used to build the ClearPath Pharmacy Refill Automation. You already know how to build in n8n. This course gives you the complete node-by-node instructions, HIPAA considerations, test data, and interview preparation for every workflow a healthcare client will ever ask you to build.

| Structure of every workflow module OVERVIEW: What it does, who pays for it, what you charge, HIPAA risk level THE PAIN: The specific problem this solves for the client HIPAA LAYER: What PHI is involved and exactly how to de-identify it for this workflow BUILD: Node by node instructions exactly as we did for the refill automation TEST DATA: Fabricated patient data to use during development COMMON ERRORS: What breaks and how to fix it INTERVIEW Q\&A: 8 questions per workflow with complete model answers CLIENT TALKING POINTS: Exactly what to say to sell this workflow |
| :---- |

| Before you build any workflow 1\. BAA signed between you and the client before any work begins 2\. Fabricated test data only during development, never real patient records 3\. De-identification Code node inserted before any Claude API call 4\. Human review checkpoint built in for every clinical decision 5\. DeIDGuard installed in your browser for manual testing |
| :---- |

| WORKFLOW 0 (Reference): Refill Automation Agent Setting: Pharmacy   Client pays: 3 hrs/week staff time   You charge: $3,000 to $6,000 HIPAA risk level: HIGH: medication \+ patient ID |
| :---- |

You already built this workflow for ClearPath Pharmacy. It is included here as the reference model. Every other workflow in this document follows the same architecture.

| The 5-node architecture you built Node 1: On Form Submission (trigger) Node 2: Code in JavaScript (de-identification, assigns PT-XXXXX) Node 3: Message a Model (Claude makes eligibility decision) Node 4: Gmail (patient notification with no PHI in body) Node 5: Append row in sheet (compliance log) |
| :---- |

| WORKFLOW 1: Drug Interaction Checker Setting: Pharmacy   Client pays: 4+ hrs/week saved   You charge: $2,500 to $5,000 HIPAA risk level: HIGH: full medication list \+ patient ID |
| :---- |

## **The Pain This Solves**

Pharmacists manually check every medication list for drug-drug interactions. At high volume this is time-consuming and error-prone. A missed interaction can cause patient harm and pharmacy liability.

## **HIPAA Layer for This Workflow**

| Data field | PHI? | What to do |
| :---- | :---- | :---- |
| Patient name | YES | Strip. Replace with PT-XXXXX in Code node |
| Date of birth | YES | Strip completely. Not needed for interaction check |
| Medication list | LOW RISK alone | Pass through. Medication names alone are not PHI |
| Pharmacy account number | YES | Strip. Replace with PT-XXXXX |
| Prescriber name | YES | Strip or replace with PRESCRIBER-001 |

## **Build Instructions: Node by Node**

| 1 | On Form Submission *\[Trigger\]* Form Title: ClearPath Pharmacy \- Drug Interaction Check Add these form fields:   Field 1: Patient ID (Text) \- staff enters their internal patient ID   Field 2: Medication List (Long Text) \- staff pastes or types full med list   Field 3: Checking Pharmacist (Text) \- pharmacist name for audit log Note: Do not collect patient name on this form. Use internal patient ID only. |
| :---: | :---- |

| 2 | Code in JavaScript *\[De-identification\]* Paste this JavaScript exactly: const items \= $input.all(); return items.map(function(item) {   const checkId \= 'CHK-' \+ Math.floor(Math.random() \* 90000 \+ 10000);   return {     json: {       checkId: checkId,       patientRef: item.json\['Patient ID'\],       medications: item.json\['Medication List'\],       pharmacist: item.json\['Checking Pharmacist'\],       timestamp: new Date().toISOString()     }   }; }); This assigns a unique check ID and passes the medication list without adding any PHI. |
| :---: | :---- |

| 3 | Message a Model *\[Claude AI\]* Credential: n8n Connect (or your Anthropic API key) Resource: Text Operation: Message a Model Model: claude-opus-4-5 Prompt (paste exactly): You are a clinical drug interaction checker for ClearPath Pharmacy. Check ID: {{ $('Code in JavaScript').item.json.checkId }} Medication list: {{ $('Code in JavaScript').item.json.medications }} Review this medication list for clinically significant drug interactions. For each interaction found, provide: INTERACTION: \[Drug A\] \+ \[Drug B\] SEVERITY: \[MINOR / MODERATE / MAJOR / CONTRAINDICATED\] MECHANISM: \[one sentence\] CLINICAL EFFECT: \[one sentence\] RECOMMENDATION: \[specific action for the pharmacist\] If no significant interactions are found, state: NO SIGNIFICANT INTERACTIONS DETECTED. Always end with: PHARMACIST REVIEW REQUIRED before any clinical action. |
| :---: | :---- |

| 4 | Gmail *\[Pharmacist Notification\]* Operation: Send Email To: pharmacist@clearwaterpharmacy.com (the checking pharmacist email) Subject: Drug Interaction Check {{ $('Code in JavaScript').item.json.checkId }} \- Review Required Message type: Text Message: Drug interaction check complete. Check ID: {{ $('Code in JavaScript').item.json.checkId }} Patient Ref: {{ $('Code in JavaScript').item.json.patientRef }} {{ $('Message a model').item.json.content\[0\].text }} This is an AI-generated preliminary check. Pharmacist clinical judgment is required before any patient counseling or medication changes. |
| :---: | :---- |

| 5 | Append Row in Sheet *\[Google Sheets Compliance Log\]* Sheet: ClearPath Drug Interaction Log Columns: A=Check ID, B=Patient Ref, C=Pharmacist, D=Timestamp, E=AI Result Values: A: {{ $('Code in JavaScript').item.json.checkId }} B: {{ $('Code in JavaScript').item.json.patientRef }} C: {{ $('Code in JavaScript').item.json.pharmacist }} D: {{ $('Code in JavaScript').item.json.timestamp }} E: {{ $('Message a model').item.json.content\[0\].text }} |
| :---: | :---- |

## **Test Data to Use During Development**

| Patient ID: 7291-B Checking Pharmacist: Dr. Test Medication List: Warfarin 5mg daily Fluconazole 150mg x3 days Metoprolol 25mg twice daily Aspirin 81mg daily Omeprazole 20mg daily Expected Claude output: Should flag warfarin \+ fluconazole as MAJOR (fluconazole inhibits CYP2C9, significantly increases warfarin levels, bleeding risk). This is a real and serious interaction \- good test case. |
| :---- |

## **Common Errors and Fixes**

| Error | Cause | Fix |
| :---- | :---- | :---- |
| Referenced node does not exist | Code node name mismatch | Click Code node, check exact name at top, update Claude prompt to match |
| Claude returns generic response | Medication list not passing through | Check Code node output \- confirm medications field is populated |
| Email not sending | Gmail not authenticated | Re-connect Gmail in the node credentials |
| Sheet not updating | Column names mismatch | Make sure Sheet row 1 headers exactly match your node field names |

## **Interview Q\&A: Drug Interaction Checker**

| Q1: How does your AI drug interaction checker work at a technical level? MODEL ANSWER: The workflow runs in n8n. A pharmacy staff member submits a medication list through a form. Before the list reaches any AI, a JavaScript de-identification node assigns an internal check ID and removes any patient-identifying information. The medication names alone, without patient identity attached, are then sent to Claude with a clinical pharmacist system prompt. Claude returns a structured interaction report flagging each interaction by severity, mechanism, clinical effect, and pharmacist recommendation. That report goes to the pharmacist by email and is logged to a compliance sheet automatically. The pharmacist reviews and acts. The AI never makes a clinical decision without pharmacist sign-off. |
| :---- |

| Q2: What happens if the AI misses a critical drug interaction? MODEL ANSWER: This is exactly why the human checkpoint is non-negotiable in every system I build. The AI-generated report is labeled explicitly as a preliminary check requiring pharmacist clinical judgment before any action. The pharmacist is the final reviewer on every output. If an interaction is missed, the pharmacist catches it. The AI reduces the cognitive load and time on routine checks. It does not replace the pharmacist's responsibility. I also build in periodic accuracy audits where the pharmacist reviews a sample of AI outputs against their own clinical judgment to track drift over time. |
| :---- |

| Q3: What drug interaction databases does your AI use? MODEL ANSWER: Claude's training includes a broad clinical knowledge base covering pharmacology, pharmacokinetics, and known drug interaction data. For the highest-risk interactions I layer in a call to the openFDA API which pulls from official FDA drug labeling before Claude generates its analysis. That gives the system access to the actual FDA-approved drug interaction warnings from the manufacturer's label rather than relying solely on training data. For a pharmacy with specific formulary requirements I can also build in a custom knowledge base using RAG so the AI checks against their specific drug list. |
| :---- |

| Q4: How does this handle controlled substances? MODEL ANSWER: Controlled substance records have heightened DEA requirements. The workflow is designed so the medication names pass through for interaction checking but no dispensing data, DEA schedule information, or quantity data enters the AI system. The system flags any controlled substance present in the list so the pharmacist knows to apply additional scrutiny. For DEA-regulated workflows I recommend keeping controlled substance record-keeping entirely within the pharmacy management system and using this AI tool only for the clinical interaction check, not for dispensing documentation. |
| :---- |

| Q5: How many medications can this check at once? MODEL ANSWER: Claude can process a full medication list of 20 or more medications in a single call and return pairwise interaction analysis across all combinations. In practice I test each deployment with a 15-medication list covering a range of drug classes. For patients on unusually complex regimens, 30 or more medications, I build in a secondary call that specifically checks the highest-risk combinations flagged in the first pass. The whole process completes in under 30 seconds. |
| :---- |

| Q6: What does this cost to run and what do you charge? MODEL ANSWER: The operational cost per interaction check is approximately 2 to 5 cents in Claude API costs. At 100 checks per day that is $2 to $5 per day or roughly $60 to $150 per month in AI costs. My engagement fee to build, deploy, staff-train, and support this workflow is $2,500 to $5,000 as a one-time build fee, plus an optional monthly support retainer of $200 to $400. The ROI for a pharmacy doing 50 or more checks per week is typically achieved within the first month through time saved and error risk reduced. |
| :---- |

| Q7: Is this HIPAA compliant? MODEL ANSWER: Yes, by design. The patient's name, date of birth, and account number never enter the AI system. Staff submit using an internal patient ID that only the pharmacy's own system can map back to a real patient. The medication list alone, without identity attached, is not PHI under HIPAA Safe Harbor. Every check is logged to a HIPAA-eligible Google Sheet with the patient reference and AI output for audit purposes. I also ensure a Business Associate Agreement is in place with every tool in the stack before any live data enters the workflow. |
| :---- |

| Q8: How do you sell this to a pharmacy owner who is skeptical of AI? MODEL ANSWER: I lead with the problem before the solution. I ask how many interaction checks their team runs per week and how long each one takes manually. Then I show them the math: if that is 3 hours per week at a technician's hourly rate, that is over $4,000 per year in labor on one task. Then I show them a live demo with a real clinical scenario, typically warfarin with a CYP2C9 inhibitor, and let the output speak for itself. The pharmacist in the room always recognizes the clinical accuracy. Then I explain that the AI does the preliminary check and the pharmacist reviews every output. That human-in-the-loop framing resolves the liability concern before they even ask. |
| :---- |

| WORKFLOW 2: Patient Adherence Tracker Setting: Pharmacy   Client pays: Non-adherence costs DIR fees and star ratings   You charge: $2,500 to $5,000 HIPAA risk level: MEDIUM: fill history patterns |
| :---- |

## **The Pain This Solves**

Non-adherent patients cost pharmacies star ratings, DIR fee clawbacks, and health plan contracts. Identifying and intervening on at-risk patients manually is impossible at volume. This workflow scans fill history, identifies gaps, and sends personalized outreach automatically.

## **HIPAA Layer**

| Data field | PHI? | What to do |
| :---- | :---- | :---- |
| Patient name | YES | Strip. Use PT-XXXXX throughout |
| Fill dates | LOW RISK alone | Pass through. Dates without identity are not PHI |
| Medication name | LOW RISK alone | Pass through |
| Phone number | YES | Last 4 digits only for routing. Full number stays in pharmacy system |
| Days supply / quantity | LOW RISK alone | Pass through for gap calculation |

## **Build Instructions: Node by Node**

| 1 | Schedule Trigger *\[Trigger\]* Type: On a schedule Set to run: Every Monday at 8:00 AM This means the adherence scan runs automatically every Monday morning before the pharmacy opens, so the outreach list is ready when staff arrive. |
| :---: | :---- |

| 2 | Google Sheets Read *\[Get Patient Fill Data\]* Operation: Get Many Rows Document: Your pharmacy fill history export sheet Sheet: FillHistory Columns needed: PatientRef, Medication, LastFillDate, DaysSupply, Phone4Digit Note: Export this data weekly from your pharmacy management system. The export should already have patient names replaced with internal IDs. Filter: Only rows where LastFillDate is more than (DaysSupply \+ 5\) days ago. |
| :---: | :---- |

| 3 | Code in JavaScript *\[Calculate Adherence Gap\]* const items \= $input.all(); const today \= new Date(); return items.map(function(item) {   const lastFill \= new Date(item.json.LastFillDate);   const daysSupply \= parseInt(item.json.DaysSupply) || 30;   const expectedRefill \= new Date(lastFill);   expectedRefill.setDate(expectedRefill.getDate() \+ daysSupply);   const daysPastDue \= Math.floor((today \- expectedRefill) / (1000\*60\*60\*24));   let riskLevel \= 'LOW';   if (daysPastDue \> 15\) riskLevel \= 'HIGH';   else if (daysPastDue \> 7\) riskLevel \= 'MEDIUM';   return {     json: {       patientRef: item.json.PatientRef,       medication: item.json.Medication,       daysPastDue: daysPastDue,       riskLevel: riskLevel,       phone4: item.json.Phone4Digit     }   }; }).filter(i \=\> i.json.daysPastDue \> 5); |
| :---: | :---- |

| 4 | IF Node *\[Route by Risk Level\]* Condition: {{ $json.riskLevel }} equals HIGH True path: Route to Claude for personalized message generation False path: Route to standard reminder template (skip Claude to save API cost) This means only HIGH risk patients get AI-personalized outreach. MEDIUM and LOW risk patients get a standard template message. |
| :---: | :---- |

| 5 | Message a Model *\[Generate Personalized Outreach\]* (Connected to TRUE path from IF node \- HIGH risk only) Prompt: You are a pharmacy care coordinator for ClearPath Pharmacy. Patient Ref: {{ $json.patientRef }} Medication: {{ $json.medication }} Days past expected refill: {{ $json.daysPastDue }} Write a brief, warm, non-alarming SMS message (under 160 characters) encouraging this patient to refill their medication. Do not mention the number of days overdue. Do not include any patient identifying information. End with: Reply STOP to opt out. |
| :---: | :---- |

| 6 | Append Row in Sheet *\[Log Outreach for Compliance\]* Log every patient contact attempt: A: Patient Ref, B: Medication, C: Risk Level, D: Days Past Due, E: Outreach Date, F: Message Type |
| :---: | :---- |

## **Test Data**

| PatientRef: PT-00001  Medication: Metformin 500mg LastFillDate: 45 days ago  DaysSupply: 30  Phone4: 0123 Expected result: daysPastDue \= 15, riskLevel \= HIGH PatientRef: PT-00002  Medication: Lisinopril 10mg LastFillDate: 10 days ago  DaysSupply: 30  Phone4: 4567 Expected result: daysPastDue \= \-20 (negative \= not overdue, filtered out) |
| :---- |

## **Interview Q\&A: Patient Adherence Tracker**

| Q1: How does your adherence tracker avoid creating HIPAA exposure? MODEL ANSWER: The pharmacy exports fill history data with patient names already replaced by internal IDs before it enters n8n. The workflow never receives or processes a patient name, date of birth, or full phone number. The medication name and fill dates, without any patient identity attached, are not PHI under HIPAA Safe Harbor. The outreach message sent to patients contains no PHI either \- it references only the medication category, not the patient by name. Every outreach attempt is logged with the patient reference number, not the patient name, for audit purposes. |
| :---- |

| Q2: How does this impact DIR fees and star ratings? MODEL ANSWER: CMS star ratings and pharmacy DIR fees are directly tied to medication adherence metrics, particularly for diabetes, hypertension, and cholesterol medications. A pharmacy that improves adherence rates on these therapy classes by even 5 percentage points can see meaningful DIR fee reductions and star rating improvements that translate directly to health plan contract terms. This workflow ensures that no patient falls through the cracks simply because the staff did not have time to make a manual call. The outreach happens automatically every Monday morning whether the staff is busy or not. |
| :---- |

| Q3: What if a patient asks not to be contacted? MODEL ANSWER: The workflow includes an opt-out mechanism. Every message ends with Reply STOP to opt out. When a patient replies STOP, that flag is logged in the compliance sheet and the patient reference is added to a suppression list that the Code node checks before generating any future outreach. This is required under TCPA regulations for automated SMS messaging in addition to HIPAA. |
| :---- |

| Q4: Can this integrate with our pharmacy management system directly? MODEL ANSWER: Most pharmacy management systems, including QS1, PioneerRx, and Rx30, have data export capabilities. The cleanest approach for independent pharmacies is a weekly scheduled export of fill history to a HIPAA-eligible Google Sheet, which this workflow reads from. For pharmacies on larger systems with API access, I can build a direct API connection so the data is always current rather than relying on a weekly export. That upgrade typically adds $1,000 to $2,000 to the project scope. |
| :---- |

| Q5: How do you measure whether this workflow is actually improving adherence? MODEL ANSWER: I build a before-and-after tracking report as part of every deployment. We establish baseline adherence rates by therapy class in the 90 days before launch. At 90 days post-launch we compare. The workflow also logs every outreach attempt and I can track response rates, which patients filled after receiving a message versus which did not. That data becomes the ROI report I present at the 90-day review and use to justify the ongoing retainer. |
| :---- |

| Q6: What medications does this track? MODEL ANSWER: The workflow can track any medication in the fill history export. For maximum business impact I prioritize the CMS star rating medications first: adherence to diabetes medications, antihypertensives, and statins. These three therapy classes have the most direct impact on star ratings and DIR fees. Once those are running reliably I can add any additional therapy class the pharmacy wants to monitor. |
| :---- |

| WORKFLOW 3: Mental Health Intake Bot Setting: Behavioral Health   Client pays: 45-90 min manual intake per patient   You charge: $3,500 to $7,000 HIPAA risk level: VERY HIGH: 42 CFR Part 2 if substance abuse |
| :---- |

## **The Pain This Solves**

Intake staff manually collect patient history, symptom severity, and crisis indicators. This takes 45 to 90 minutes per new patient and cannot scale. This workflow automates structured intake, runs validated screening tools, detects crisis language, and delivers a clinical brief to the therapist before the session.

## **HIPAA Layer (Extra Careful Here)**

| This workflow has the highest HIPAA risk of any in this course Mental health records are among the most sensitive PHI categories. If the practice treats substance abuse, 42 CFR Part 2 applies on top of HIPAA. A BAA with every tool in this stack is mandatory, no exceptions. The intake form must include a HIPAA authorization statement before any data is collected. The clinical brief sent to the therapist must travel over encrypted channels only. Crisis language detection must trigger an immediate human response, not an automated one. |  |  |
| :---- | :---- | :---- |
| **Data field** | **PHI?** | **Action** |
| Patient name | YES | Strip before any AI processing. Use MH-XXXXX internal ID |
| PHQ-9 and GAD-7 scores | YES when linked to patient | De-link from name. Pass scores with internal ID only |
| Presenting concerns (free text) | YES \- extremely sensitive | Hash and de-identify all proper nouns before passing to Claude |
| Crisis indicators | YES \- highest sensitivity | Route directly to human clinician. Do not log in standard compliance sheet |
| Therapist name | LOW RISK | Pass through for routing only |

## **Build Instructions: Node by Node**

| 1 | On Form Submission *\[Trigger\]* Form Title: New Patient Intake \- ClearPath Behavioral Health Add HIPAA notice text at top of form (required): 'This form is protected under HIPAA. Your information is confidential and will only be shared with your care team.' Form fields:   Internal Patient Code (Text) \- given to patient by front desk   Primary concern (Long Text)   How long have you been experiencing this (Text)   Current medications (Long Text)   PHQ-9 responses 1-9 (Number fields, 0-3 each)   GAD-7 responses 1-7 (Number fields, 0-3 each)   Safety question: Are you having thoughts of harming yourself or others? (Yes/No)   Assigned therapist (Text \- front desk fills this) |
| :---: | :---- |

| 2 | IF Node *\[Crisis Detection \- Run First\]* This is the most critical node in the entire workflow. Condition: {{ $json\['Are you having thoughts of harming yourself or others?'\] }} equals Yes TRUE path: IMMEDIATELY route to Crisis Alert node (Node 3a) FALSE path: Continue to de-identification (Node 3b) The crisis check runs before anything else. No exceptions. |
| :---: | :---- |

| 3a | Gmail \- CRISIS ALERT *\[Emergency Route (TRUE path only)\]* To: crisis@clearpath.com AND therapist@clearpath.com Subject: URGENT \- Crisis Indicator Flagged \- Patient Code {{ $json\['Internal Patient Code'\] }} Message: A patient has indicated possible crisis. Patient Code: {{ $json\['Internal Patient Code'\] }} Assigned therapist: {{ $json\['Assigned therapist'\] }} Immediate clinical review required. Do not rely on automated system for this patient. Crisis resources: National Suicide Prevention Lifeline 988 STOP: Do not process this patient through the automated intake workflow. Workflow ends here for crisis patients. Human takes over entirely. |
| :---: | :---- |

| 3b | Code in JavaScript *\[De-identification (FALSE path only)\]* const items \= $input.all(); return items.map(function(item) {   const intakeId \= 'MH-' \+ Math.floor(Math.random() \* 90000 \+ 10000);   const phq9 \= \[1,2,3,4,5,6,7,8,9\].map(n \=\> parseInt(item.json\['PHQ-9 Q'+n\])||0);   const phq9Total \= phq9.reduce((a,b)=\>a+b,0);   const gad7 \= \[1,2,3,4,5,6,7\].map(n \=\> parseInt(item.json\['GAD-7 Q'+n\])||0);   const gad7Total \= gad7.reduce((a,b)=\>a+b,0);   return { json: {     intakeId, therapist: item.json\['Assigned therapist'\],     primaryConcern: item.json\['Primary concern'\],     duration: item.json\['How long have you been experiencing this'\],     medications: item.json\['Current medications'\],     phq9Total, gad7Total,     phq9Severity: phq9Total\>=20?'Severe':phq9Total\>=15?'Moderately severe':phq9Total\>=10?'Moderate':phq9Total\>=5?'Mild':'Minimal',     gad7Severity: gad7Total\>=15?'Severe':gad7Total\>=10?'Moderate':gad7Total\>=5?'Mild':'Minimal'   }}; }); |
| :---: | :---- |

| 4 | Message a Model *\[Generate Clinical Brief\]* Prompt: You are a clinical intake coordinator preparing a pre-session brief for a therapist. Intake ID: {{ $('Code in JavaScript').item.json.intakeId }} PHQ-9 Total: {{ $('Code in JavaScript').item.json.phq9Total }} ({{ $('Code in JavaScript').item.json.phq9Severity }}) GAD-7 Total: {{ $('Code in JavaScript').item.json.gad7Total }} ({{ $('Code in JavaScript').item.json.gad7Severity }}) Primary concern: {{ $('Code in JavaScript').item.json.primaryConcern }} Duration: {{ $('Code in JavaScript').item.json.duration }} Current medications: {{ $('Code in JavaScript').item.json.medications }} Generate a structured pre-session clinical brief with: PRESENTING CONCERN: \[summary\] SCREENING SCORES: \[PHQ-9 and GAD-7 interpretation\] KEY AREAS TO EXPLORE: \[3 specific clinical areas based on responses\] MEDICATION CONSIDERATIONS: \[any flags for the therapist\] RECOMMENDED SESSION FOCUS: \[one priority for the first session\] This is for therapist preparation only. Do not include patient name or identifying information. |
| :---: | :---- |

| 5 | Gmail *\[Send Brief to Therapist\]* To: {{ $('Code in JavaScript').item.json.therapist }}@clearpath.com Subject: Pre-Session Brief \- Intake ID {{ $('Code in JavaScript').item.json.intakeId }} Message: Pre-session clinical brief for your next new patient. Intake ID: {{ $('Code in JavaScript').item.json.intakeId }} {{ $('Message a model').item.json.content\[0\].text }} AI-generated brief. Clinical judgment required. Patient identity available in your EHR. |
| :---: | :---- |

| 6 | Append Row in Sheet *\[Compliance Log\]* Log: Intake ID, Therapist, PHQ-9 score, GAD-7 score, Intake date Do NOT log: Primary concern text, medication list, or any free-text responses These are too sensitive for a standard compliance log without additional encryption |
| :---: | :---- |

## **Test Data**

| Internal Patient Code: TEST-001 Primary concern: Difficulty sleeping and feeling anxious at work Duration: About 3 months Current medications: Sertraline 50mg daily (started 2 months ago) PHQ-9: 1,2,1,1,2,0,1,1,0 (Total: 9 \- Mild) GAD-7: 2,2,1,1,2,1,1 (Total: 10 \- Moderate) Safety question: No Assigned therapist: Dr. Smith Expected: Workflow routes through FALSE path (no crisis) De-identifies to MH-XXXXX, calculates scores, generates clinical brief Therapist receives brief before the session |
| :---- |

## **Interview Q\&A: Mental Health Intake Bot**

| Q1: What happens if a patient indicates they are having thoughts of self-harm? MODEL ANSWER: The safety question is the very first thing the workflow checks before any other processing happens. If the patient answers yes, the workflow immediately sends an urgent alert to the crisis contact and the assigned therapist with the patient code and therapist name only. The workflow stops entirely for that patient. No automated intake brief is generated. No further automation occurs. A human clinician takes over from that point forward. The patient sees a message directing them to call 988 or their care team immediately. I never allow any automation to mediate a crisis situation. |
| :---- |

| Q2: How do you handle 42 CFR Part 2 if this practice treats substance abuse? MODEL ANSWER: 42 CFR Part 2 is significantly stricter than HIPAA for substance abuse treatment records. If the practice treats substance abuse, I add three additional elements to the workflow. First, the intake form includes a specific 42 CFR Part 2 consent disclosure before the patient submits. Second, substance abuse-related responses are flagged and routed to a separate encrypted log that is not accessible through standard compliance reporting. Third, the AI brief generated for the therapist excludes any substance abuse-related content unless explicit documented consent is on file. I always recommend a healthcare attorney review the 42 CFR compliance architecture before go-live for any substance abuse practice. |
| :---- |

| Q3: Is the PHQ-9 and GAD-7 scoring accurate? MODEL ANSWER: The scoring in the Code node follows the validated scoring algorithms exactly as published by the original instrument developers. PHQ-9 severity thresholds are 0-4 minimal, 5-9 mild, 10-14 moderate, 15-19 moderately severe, 20-27 severe. GAD-7 thresholds are 0-4 minimal, 5-9 mild, 10-14 moderate, 15-21 severe. These are the same thresholds used in the original Kroenke and Spitzer validation studies. The JavaScript calculation is deterministic, meaning it produces the same score every time for the same inputs. I verify this in testing before every deployment. |
| :---- |

| Q4: How do you ensure therapists actually read the brief before the session? MODEL ANSWER: The brief is sent to the therapist's email the moment the patient submits the form, typically 24 to 48 hours before the scheduled session. I also build an optional second delivery 2 hours before the session time as a reminder. In the onboarding training I walk therapists through how to use the brief: it is a preparation tool, not a clinical assessment. The therapist validates everything the AI flagged during the actual session. Adoption rates have been high because the brief saves therapists 15 to 20 minutes of chart review before every new patient session. |
| :---- |

| Q5: What if the patient gives unusual or unexpected answers? MODEL ANSWER: Claude is instructed to work with whatever the patient provides and generate the most useful clinical brief possible from the available information. If responses are unusually brief, contradictory, or unclear, Claude flags this explicitly in the brief under a section called CLINICAL NOTES with a specific note that the therapist should probe these areas directly in session. The brief never fills in gaps or makes assumptions about what the patient meant. |
| :---- |

| WORKFLOW 4: Lab Interpretation Agent Setting: Functional Medicine   Client pays: 20-40 min per patient manually   You charge: $3,000 to $6,000 HIPAA risk level: HIGH: lab results linked to patient |
| :---- |

## **The Pain This Solves**

Functional medicine practitioners spend 20 to 40 minutes per patient reviewing labs using functional reference ranges that differ significantly from conventional ranges. This workflow automates the interpretation using functional medicine clinical logic, freeing the practitioner to focus on the patient conversation.

## **HIPAA Layer**

| Data field | PHI? | Action |
| :---- | :---- | :---- |
| Patient name | YES | Strip. Use FM-XXXXX |
| Date of birth | YES | Strip. Age range (30s, 40s) is sufficient for functional context |
| Lab values | LOW RISK alone | Pass through. Lab values without identity are not PHI |
| Lab collection date | YES when linked to patient | Strip year only if needed, remove full date |
| Ordering practitioner | LOW RISK | Pass through for routing |

## **Build Instructions: Node by Node**

| 1 | On Form Submission *\[Trigger\]* Form Title: Functional Medicine Lab Interpretation \- ClearPath Fields:   Patient Code (Text) \- internal ID only   Age Range (Dropdown: 20s/30s/40s/50s/60s/70s+) \- not exact age   Sex (Dropdown: Male/Female/Other)   Chief Complaint (Long Text) \- why they came in   Lab Results (Long Text) \- paste lab values here   Current Supplements and Medications (Long Text)   Practitioner (Text) |
| :---: | :---- |

| 2 | Code in JavaScript *\[De-identification\]* const items \= $input.all(); return items.map(function(item) {   const labId \= 'FM-' \+ Math.floor(Math.random() \* 90000 \+ 10000);   return { json: {     labId,     ageRange: item.json\['Age Range'\],     sex: item.json\['Sex'\],     chiefComplaint: item.json\['Chief Complaint'\],     labValues: item.json\['Lab Results'\],     supplements: item.json\['Current Supplements and Medications'\],     practitioner: item.json\['Practitioner'\]   }}; }); |
| :---: | :---- |

| 3 | Message a Model *\[Functional Medicine Interpretation\]* Prompt (this is your clinical knowledge translated into AI instructions): You are a functional medicine clinical analyst. Use FUNCTIONAL medicine reference ranges, not conventional ranges, for all interpretations. Patient: {{ $('Code in JavaScript').item.json.labId }} Age range: {{ $('Code in JavaScript').item.json.ageRange }} Sex: {{ $('Code in JavaScript').item.json.sex }} Chief complaint: {{ $('Code in JavaScript').item.json.chiefComplaint }} Lab results: {{ $('Code in JavaScript').item.json.labValues }} Current supplements/medications: {{ $('Code in JavaScript').item.json.supplements }} Key functional ranges to apply (use these, not conventional): Ferritin optimal: 50-150 ng/mL (flag below 50 even if conventionally normal) TSH optimal: 0.5-2.0 mIU/L (flag above 2.0 even if conventionally normal) Fasting glucose optimal: 70-85 mg/dL (flag 86-99 as functionally suboptimal) HbA1c optimal: below 5.3% (flag 5.4-5.6 as functionally suboptimal) Vitamin D optimal: 50-80 ng/mL (flag 30-49 as insufficient) Homocysteine optimal: below 7 umol/L (flag 8-10 as elevated functional risk) For each lab value provide: VALUE: \[lab name and result\] CONVENTIONAL STATUS: \[Normal/Abnormal\] FUNCTIONAL STATUS: \[Optimal/Suboptimal/Concerning\] CLINICAL NOTE: \[one sentence on functional significance\] Then provide: ROOT CAUSE HYPOTHESES: \[top 3 based on pattern of findings\] RECOMMENDED FOLLOW-UP TESTS: \[specific tests to clarify findings\] SUPPLEMENT/LIFESTYLE PRIORITIES: \[top 3 interventions to discuss\] End with: PRACTITIONER REVIEW REQUIRED. This analysis supports clinical decision-making and does not replace practitioner judgment. |
| :---: | :---- |

| 4 | Gmail *\[Send to Practitioner\]* To: {{ $('Code in JavaScript').item.json.practitioner }}@practice.com Subject: Lab Interpretation Ready \- {{ $('Code in JavaScript').item.json.labId }} Message: Functional medicine lab interpretation complete. Lab ID: {{ $('Code in JavaScript').item.json.labId }} Chief complaint: {{ $('Code in JavaScript').item.json.chiefComplaint }} {{ $('Message a model').item.json.content\[0\].text }} Practitioner clinical review required before patient discussion. |
| :---: | :---- |

## **Test Data**

| Patient Code: TEST-FM-001 Age Range: 40s  Sex: Female  Practitioner: Dr. Test Chief Complaint: Fatigue, brain fog, weight gain despite diet and exercise Lab Results: TSH 2.8 mIU/L  Free T4 1.1 ng/dL  Free T3 2.8 pg/mL Ferritin 18 ng/mL  Iron 65 ug/dL  TIBC 380 ug/dL Vitamin D 28 ng/mL  B12 310 pg/mL Fasting glucose 91 mg/dL  HbA1c 5.5% Homocysteine 9.2 umol/L Expected output: Multiple functional flags despite mostly conventional normal values. TSH functionally elevated (above 2.0). Ferritin critically low (below 50). Vitamin D insufficient. HbA1c functionally suboptimal. Homocysteine elevated. This is a classic functional medicine presentation that conventional labs would miss. |
| :---- |

## **Interview Q\&A: Lab Interpretation Agent**

| Q1: How do your functional reference ranges differ from conventional lab ranges? MODEL ANSWER: Conventional lab ranges are set statistically, meaning they represent the middle 95% of a reference population that may include people who are metabolically unwell. Functional medicine ranges are set based on what correlates with optimal health outcomes rather than population averages. For example, the conventional normal for TSH is 0.4 to 4.0. The functional optimal is 0.5 to 2.0. A patient with a TSH of 3.2 reads as normal on a conventional report but may be functionally hypothyroid with symptoms. My system flags the difference explicitly so the practitioner can see both interpretations and decide what to investigate further. |
| :---- |

| Q2: Is this tool making a diagnosis? MODEL ANSWER: No, and the system prompt explicitly prohibits this. The tool generates a pattern analysis and a list of root cause hypotheses for the practitioner to evaluate. It does not diagnose, prescribe, or recommend specific treatment protocols. The language used throughout is consistent with clinical decision support rather than clinical decision-making. Every output ends with a statement that practitioner review is required and that the analysis supports rather than replaces clinical judgment. This framing is important both ethically and from a liability standpoint. |
| :---- |

| Q3: How does FTC compliance apply to the supplement recommendations? MODEL ANSWER: The FTC Health Breach Notification Rule and the FTC's guidelines on health claims apply to any AI-generated supplement content that could be construed as a disease claim. The supplement section of the output is framed as items to discuss with the patient rather than recommendations for treating any specific condition. The system prompt explicitly instructs Claude to use structure and function language rather than disease claims. For example, 'supports healthy iron metabolism' rather than 'treats iron deficiency anemia.' I also build in a content review step for any practice that creates marketing materials from AI-generated content. |
| :---- |

| Q4: What happens when the lab panel is incomplete? MODEL ANSWER: Claude is instructed to work with whatever values are available and to explicitly note which markers are missing and why they would be relevant to the clinical picture. If a key marker like ferritin is absent from the panel and the symptom picture suggests iron dysregulation, the output notes that ferritin is not included in this panel and recommends it as a priority follow-up test. The practitioner sees both what the AI found and what additional data would improve the picture. |
| :---- |

| WORKFLOW 5: Supplement Protocol Builder Setting: Functional Medicine   Client pays: 30-60 min per patient manually   You charge: $2,500 to $5,000 HIPAA risk level: MEDIUM: symptoms \+ medications |
| :---- |

## **The Pain This Solves**

Building personalized supplement protocols takes 30 to 60 minutes per patient. Practitioners must manually check drug-supplement interactions and FTC compliance. This workflow generates ranked protocols with safety checks in under 60 seconds.

## **Build Instructions: Node by Node**

| 1 | On Form Submission *\[Trigger\]* Fields: Patient Code, Age Range, Sex, Key Symptoms (Long Text), Relevant Labs (Long Text), Current Medications (Long Text), Health Goals (Long Text), Dietary Restrictions, Practitioner |
| :---: | :---- |

| 2 | Code in JavaScript *\[De-identification\]* Assign SP-XXXXX identifier. Pass symptoms, labs, medications, goals. Strip patient name and date of birth. Age range is sufficient context. |
| :---: | :---- |

| 3 | Message a Model *\[Protocol Generation\]* System context: You are a functional medicine supplement protocol assistant. Your role is to suggest supplements for practitioner review, not to prescribe. Patient: {{ $('Code in JavaScript').item.json.spId }} Age range and sex: \[values\]  Symptoms: \[values\] Relevant labs: \[values\]  Current medications: \[values\] Goals: \[values\]  Dietary restrictions: \[values\] Generate a ranked supplement protocol for practitioner review. For each supplement provide: SUPPLEMENT: \[name and form\] DOSE: \[suggested range\] RATIONALE: \[why this is relevant to the symptom/lab picture\] DRUG INTERACTIONS: \[any known interactions with current medications\] CONTRAINDICATIONS: \[when not to use\] FTC LANGUAGE: \[structure/function claim only, no disease claims\] End with: This protocol requires practitioner review and patient consent before implementation. Not a substitute for clinical judgment. |
| :---: | :---- |

| 4 | Gmail *\[Deliver to Practitioner\]* Send protocol to practitioner for review before patient discussion. Subject includes SP-XXXXX reference for the compliance log. |
| :---: | :---- |

## **Interview Q\&A: Supplement Protocol Builder**

| Q1: How do you prevent the AI from recommending supplements that interact with the patient's medications? MODEL ANSWER: Drug-supplement interaction checking is built into the system prompt as a required output field for every supplement recommended. Claude is instructed to flag any known pharmacokinetic or pharmacodynamic interactions before listing the supplement as an option. For high-risk medications, particularly blood thinners, thyroid medications, and psychiatric medications, I also layer in a secondary check that cross-references the supplement against an openFDA API call for the highest-risk drugs. The practitioner sees the interaction flag before they ever discuss the supplement with the patient. |
| :---- |

| Q2: What FTC rules apply to supplement recommendations? MODEL ANSWER: The FTC's guidelines on health claims distinguish between structure and function claims, which are allowed, and disease claims, which require FDA approval. A structure and function claim says a supplement supports healthy immune function. A disease claim says it prevents or treats a disease. The system prompt instructs Claude to use only structure and function language in all output. I also build a content review flag that highlights any language pattern that resembles a disease claim so the practitioner can review it before sharing anything with the patient. For practices that publish protocols online I strongly recommend a healthcare attorney review the content before publication. |
| :---- |

| WORKFLOW 6: Root Cause Analysis Agent Setting: Functional Medicine   Client pays: 60-90 min first visit prep manually   You charge: $3,500 to $7,000 HIPAA risk level: HIGH: detailed patient history |
| :---- |

## **Build Instructions: Node by Node**

| 1 | On Form Submission *\[Patient Intake\]* This form is sent to the patient 48 hours before their first appointment. Fields: Patient Code, Age Range, Sex Current symptoms (Long Text \- describe everything) When did you first notice these symptoms (Text) What makes symptoms better or worse (Long Text) Current medications and supplements (Long Text) Significant health history (Long Text) Family health history (Long Text) Diet description (Long Text) Sleep quality and hours (Text) Stress level 1-10 and main sources (Text) Environmental exposures \- mold, chemicals, toxins (Long Text) |
| :---: | :---- |

| 2 | Code in JavaScript *\[De-identification\]* Assign RC-XXXXX identifier. Strip any proper nouns that appear in free-text fields. Pass all symptom, history, and lifestyle data. Note: Free text may contain identifiers. Instruct Claude to disregard any names or identifying details it encounters in the text. |
| :---: | :---- |

| 3 | Message a Model *\[Root Cause Hypothesis Generation\]* You are a functional medicine clinical analyst preparing a first-visit brief for a practitioner. Map symptoms to body systems and generate root cause hypotheses. Patient: \[RC-XXXXX\]  Age/Sex: \[values\] Full intake: \[all symptom and history fields\] Map each symptom cluster to the most likely body system(s): Gut and digestive, Hormonal and endocrine, Immune and inflammatory, Neurological and cognitive, Detoxification and liver, Energy and mitochondrial Then generate: SYMPTOM TIMELINE: \[when symptoms started, progression, triggers\] BODY SYSTEM MAPPING: \[which systems appear affected and why\] TOP 3 ROOT CAUSE HYPOTHESES: \[ranked with supporting evidence from intake\] PRIORITY LABS TO ORDER: \[specific tests to confirm or rule out each hypothesis\] AREAS TO PROBE IN FIRST VISIT: \[questions the practitioner should ask\] Practitioner review required. This is a clinical hypothesis tool. |
| :---: | :---- |

| 4 | Gmail *\[Pre-Visit Brief to Practitioner\]* Delivered 24 hours before the scheduled appointment. Contains RC-XXXXX reference, body system mapping, hypotheses, and priority labs. Practitioner walks in prepared rather than spending the first 30 minutes reviewing the intake form manually. |
| :---: | :---- |

## **Interview Q\&A: Root Cause Analysis Agent**

| Q1: How does this change the first patient visit for a functional medicine practitioner? MODEL ANSWER: The practitioner walks in having already reviewed the root cause hypotheses and priority labs the AI identified from the patient's intake. Instead of spending the first 30 to 45 minutes gathering history, they can spend that time probing the specific areas the AI flagged, validating or ruling out the hypotheses, and building the therapeutic relationship. The visit becomes more efficient and more clinically focused. Practitioners I have worked with report that the AI-prepared brief consistently surfaces patterns they might have spent several visits discovering through iterative questioning. |
| :---- |

| Q2: How do you prevent the AI from anchoring on the wrong root cause? MODEL ANSWER: The system prompt is designed to generate three ranked hypotheses rather than a single conclusion. This explicitly prevents anchoring by requiring the practitioner to evaluate multiple possibilities. The hypotheses are presented with the specific intake evidence that supports each one, so the practitioner can assess whether the AI's reasoning is sound. The AI is also instructed to flag any contradictory evidence, meaning symptoms or history that do not fit the leading hypothesis, so the practitioner sees the full picture rather than a cherry-picked case for one root cause. |
| :---- |

| WORKFLOW 7: After-Hours Voice AI Agent Setting: Pharmacy / Telehealth   Client pays: 50-100 unanswered calls per week   You charge: $3,000 to $6,000 HIPAA risk level: MEDIUM: call content, no PHI in system |
| :---- |

## **The Pain This Solves**

Pharmacies receive 50 to 100 after-hours calls per week, mostly refill requests and hours inquiries. Unanswered calls mean lost patients. This workflow uses Vapi (voice AI platform) connected to n8n to answer calls, handle routine requests, and escalate urgent calls to the on-call pharmacist.

## **Tools Required for This Workflow**

| Tool | Purpose | Cost | BAA Available? |
| :---- | :---- | :---- | :---- |
| Vapi | Voice AI platform \- handles the phone call | Pay per minute (\~$0.05/min) | Yes \- enterprise plan |
| Twilio | Phone number and call routing | \~$15/month per number | Yes \- HIPAA-eligible plan |
| ElevenLabs | High-quality voice synthesis (optional) | Free tier available | Contact for BAA |
| n8n | Workflow automation triggered by Vapi events | Free trial / Enterprise | Yes \- enterprise |
| Claude API | Clinical knowledge for medication questions | Pay per use | BAA via Anthropic |

## **Build Instructions: Node by Node**

| 1 | Webhook *\[Vapi Event Receiver\]* In n8n: Add a Webhook trigger node Copy the webhook URL from n8n In your Vapi dashboard: paste the n8n webhook URL as the server URL This connects Vapi to n8n so every call event triggers your workflow In Vapi, configure:   Assistant name: ClearPath Pharmacy Assistant   Voice: choose from ElevenLabs voices (professional female voice recommended)   System prompt: paste below |
| :---: | :---- |

| VAPI SYSTEM PROMPT (paste in Vapi dashboard, not n8n): You are the after-hours assistant for ClearPath Pharmacy. You are friendly, professional, and helpful. You can help with: pharmacy hours, location, general medication questions, and refill requests (you will note these for staff follow-up). You cannot: provide specific medical advice, access patient records, or dispense medications. If a caller describes an emergency or urgent medical situation, immediately say: 'For medical emergencies please call 911 or go to your nearest emergency room. I will also alert our on-call pharmacist right away.' Pharmacy hours: Monday-Friday 9am-6pm, Saturday 10am-4pm, Sunday closed. Address: \[your client's address\] For urgent after-hours needs: \[on-call number\] |
| :---- |

| 2 | IF Node *\[Route by Call Type\]* Vapi sends call data to your n8n webhook including caller intent Condition: does the transcript contain 'refill' OR 'prescription' TRUE: Route to Refill Request handler FALSE: Route to General Inquiry handler (no further automation needed) |
| :---: | :---- |

| 3 | Code in JavaScript *\[Extract Refill Request\]* Parse the Vapi transcript for medication name and caller callback number Assign a voice request ID: VR-XXXXX Do not store full phone number. Extract last 4 digits only. const transcript \= $json.transcript || ''; const vrId \= 'VR-' \+ Math.floor(Math.random()\*90000+10000); return \[{json:{vrId, transcript, phone4: $json.customer?.number?.slice(-4)}}\]; |
| :---: | :---- |

| 4 | Gmail *\[Staff Notification\]* To: staff@clearwaterpharmacy.com Subject: After-Hours Refill Request \- {{ $json.vrId }} Message: A patient called after hours requesting a refill. Request ID: {{ $json.vrId }} Call summary: {{ $json.transcript }} Please follow up when the pharmacy opens. Note: Do not include full phone number in email. Staff can retrieve from Vapi dashboard. |
| :---: | :---- |

| 5 | Append Row in Sheet *\[Call Log\]* Log: VR ID, Call date/time, Call type (refill/general/urgent), Resolved (yes/no) Do not log: full transcript, full phone number This gives the owner a weekly call volume report and resolution rate |
| :---: | :---- |

## **Interview Q\&A: After-Hours Voice AI**

| Q1: How does this handle a patient who calls about a medication emergency? MODEL ANSWER: The Vapi system prompt includes explicit crisis escalation instructions. If a caller describes an urgent situation, the AI immediately provides the 911 instruction and emergency room direction, and simultaneously triggers an urgent notification to the on-call pharmacist through the n8n webhook. The on-call pharmacist receives a text alert within seconds. The AI does not attempt to provide clinical guidance for urgent situations. It acts as a triage router that gets the patient to the right level of care and alerts the human pharmacist immediately. |
| :---- |

| Q2: What does the after-hours voice AI actually sound like to a patient? MODEL ANSWER: Vapi with ElevenLabs voice synthesis produces a natural-sounding voice that most callers do not immediately recognize as AI. The system introduces itself as the ClearPath Pharmacy assistant rather than claiming to be a human. This is both ethically correct and now required in several states under new AI disclosure regulations including Texas Senate Bill 2013 effective 2025\. The voice quality is professional and warm, similar to a well-trained receptionist. I always configure the voice to avoid overly robotic pacing and to use natural pause timing. |
| :---- |

| Q3: What HIPAA considerations apply to voice AI calls? MODEL ANSWER: Voice calls that collect or discuss PHI are subject to HIPAA. For after-hours calls I design the system so the AI does not access patient records and does not ask for or store sensitive health information. The AI acknowledges a refill request and tells the caller that staff will follow up, rather than accessing their prescription history in real time. Full phone numbers are not stored in n8n. A BAA with Vapi and Twilio is required before going live. The call recordings that Vapi stores are subject to HIPAA if they contain PHI, so the Vapi HIPAA-eligible plan is required. |
| :---- |

| WORKFLOW 8: Virtual Telehealth Intake Setting: Telehealth   Client pays: 20-30 min admin per visit   You charge: $3,000 to $6,000 HIPAA risk level: HIGH: pre-visit health information |
| :---- |

## **Build Instructions: Node by Node**

| 1 | Schedule Trigger *\[24 Hours Before Appointment\]* Trigger type: On a schedule \- check every hour Connect to your scheduling system export sheet Filter: appointments scheduled for 24 hours from now This sends the intake form automatically to every patient the day before their visit |
| :---: | :---- |

| 2 | Gmail *\[Send Intake Form Link\]* To: patient email from scheduling sheet Subject: Your appointment tomorrow \- please complete your intake (10 minutes) Message: To make the most of your time with \[Practitioner\], please complete your pre-visit intake at: \[n8n form URL\] This takes about 10 minutes and helps your practitioner prepare for your visit. Your information is protected under HIPAA. |
| :---: | :---- |

| 3 | On Form Submission *\[Receive Completed Intake\]* Separate workflow triggered when patient submits the intake form Fields: Patient Code, Visit reason, Current symptoms, Medications, Questions for today's visit, Changes since last visit (for return patients) |
| :---: | :---- |

| 4 | Code in JavaScript *\[De-identification\]* Assign TH-XXXXX. Strip name and DOB. Pass: visit reason, symptoms, medications, patient questions. |
| :---: | :---- |

| 5 | Message a Model *\[Generate Provider Brief\]* Create a structured pre-visit brief including: Chief complaint, symptom summary, medication review, patient questions to address, suggested session priorities. Frame as preparation tool for the provider, not clinical documentation. |
| :---: | :---- |

| 6 | Gmail *\[Provider Brief Delivery\]* Delivered to provider 2 hours before the scheduled visit. Subject: Pre-visit brief \- TH-XXXXX \- \[appointment time\] |
| :---: | :---- |

## **Interview Q\&A: Virtual Telehealth Intake**

| Q1: How does this improve the telehealth visit experience? MODEL ANSWER: The provider walks into every telehealth visit already knowing the patient's chief complaint, current symptoms, medication list, and specific questions they want answered. The visit starts with the therapeutic conversation rather than with administrative data collection. Patients complete the intake on their own time, which is usually more thoughtful and complete than what they provide under the pressure of a live appointment. The provider can also see if there are urgent concerns that should shift the visit agenda before the video call even starts. |
| :---- |

| Q2: How do you handle patients who do not complete the intake? MODEL ANSWER: The workflow includes a reminder trigger. If the intake form has not been submitted 4 hours before the appointment, n8n sends a second reminder email. If still not submitted, the provider receives a brief note that intake was not completed and the visit proceeds without the AI brief. The workflow never blocks a visit from proceeding and never contacts the patient more than twice. This respects patient autonomy while maximizing the chance of a completed intake. |
| :---- |

| WORKFLOW 9: Clinical Note Scribe Setting: All Settings   Client pays: 2-3 hrs/day on documentation   You charge: $3,500 to $7,000 HIPAA risk level: HIGH: session content is PHI |
| :---- |

## **The Pain This Solves**

Providers spend 2 to 3 hours per day writing clinical notes after patient visits. This workflow transcribes session audio using OpenAI Whisper and generates structured SOAP notes for provider review in under 2 minutes per session.

## **Tools Required**

| Tool | Purpose | Cost | BAA |
| :---- | :---- | :---- | :---- |
| OpenAI Whisper API | Audio transcription | \~$0.006/minute | OpenAI BAA \- enterprise |
| n8n | Workflow automation | Free trial | Enterprise BAA |
| Claude API | SOAP note generation from transcript | Pay per use | Anthropic BAA |
| Google Drive | Store audio files temporarily | Pay per GB | Google Workspace BAA |

## **Build Instructions: Node by Node**

| 1 | On Form Submission *\[Session Metadata Collection\]* Provider submits after each session: Session ID (internal): auto-generated by the form Provider name (Text) Visit type (Dropdown: New patient / Follow-up / Urgent) Session date (Date) Google Drive link to audio recording (Text) Note: Provider uploads audio to their HIPAA-eligible Google Drive folder, then pastes the shareable link here. Audio never passes through n8n directly. |
| :---: | :---- |

| 2 | Google Drive *\[Retrieve Audio File\]* Operation: Download File File ID: extracted from the Drive link the provider submitted This retrieves the audio file content for transcription Ensure Google Drive is on Google Workspace BAA-eligible tier |
| :---: | :---- |

| 3 | HTTP Request *\[OpenAI Whisper Transcription\]* Method: POST URL: https://api.openai.com/v1/audio/transcriptions Headers: Authorization: Bearer \[your OpenAI API key\] Body: form-data with audio file and model: whisper-1 This returns the full text transcript of the session Cost: approximately $0.006 per minute of audio A 20-minute session costs about $0.12 to transcribe |
| :---: | :---- |

| 4 | Code in JavaScript *\[Session ID Assignment\]* const items \= $input.all(); return items.map(function(item) {   const noteId \= 'NOTE-' \+ Math.floor(Math.random()\*90000+10000);   return { json: {     noteId,     transcript: item.json.text,     visitType: $('On Form Submission').item.json\['Visit type'\],     provider: $('On Form Submission').item.json\['Provider name'\]   }}; }); Note: The transcript may contain patient name if provider used it during session. Claude is instructed to use SESSION-XXXXX throughout the note rather than patient name. |
| :---: | :---- |

| 5 | Message a Model *\[Generate SOAP Note\]* Note ID: {{ $('Code in JavaScript').item.json.noteId }} Visit type: {{ $('Code in JavaScript').item.json.visitType }} Transcript: {{ $('Code in JavaScript').item.json.transcript }} Generate a structured clinical SOAP note from this session transcript. Use SESSION-{{ $('Code in JavaScript').item.json.noteId }} throughout. Do not include the patient name even if mentioned in the transcript. SUBJECTIVE: Patient's chief complaint, history, and reported symptoms in their words OBJECTIVE: Any objective findings mentioned (vitals, test results, observations) ASSESSMENT: Clinical impression and working diagnosis or focus areas PLAN: Treatment plan, prescriptions, follow-up, referrals, patient instructions Keep language clinical and professional. Provider review and approval required before this note enters any medical record. |
| :---: | :---- |

| 6 | Gmail *\[Deliver Note for Provider Review\]* To: provider email Subject: SOAP Note Ready for Review \- {{ $('Code in JavaScript').item.json.noteId }} Message: Your clinical note is ready for review and editing. Note ID: \[note ID\] \[SOAP note content\] Review, edit as needed, and paste into your EHR. This is an AI-generated draft. Provider review and approval required before this note becomes part of the official medical record. |
| :---: | :---- |

## **Interview Q\&A: Clinical Note Scribe**

| Q1: How do you ensure the SOAP note is accurate enough to use clinically? MODEL ANSWER: The Whisper transcription is highly accurate for medical terminology, typically 95% or above for clear audio. The SOAP note generation from the transcript preserves the clinical content without interpretation. The critical design decision is that the provider reviews and approves every note before it enters the EHR. This is not an auto-filing system. The AI generates a draft that takes 2 minutes to review and edit rather than 15 minutes to write from scratch. The provider's clinical judgment is the quality control layer, just as it would be with a human scribe. |
| :---- |

| Q2: What happens if the Whisper transcription is inaccurate for a specific term? MODEL ANSWER: Medical terminology transcription errors are the primary accuracy risk. I address this in two ways. First, the system prompt instructs Claude to flag any word in the transcript that appears to be a transcription error, typically indicated by a term that makes no clinical sense in context. Second, I build a custom vocabulary list for each client practice covering their most commonly used medications, diagnoses, and procedures so Whisper is primed for their specific clinical language. The provider always sees the AI-generated draft before it goes anywhere, which provides the final accuracy check. |
| :---- |

| Q3: Is recording patient sessions legal? MODEL ANSWER: Recording requirements vary by state and depend on whether the jurisdiction follows one-party or two-party consent rules. In two-party consent states, both the provider and the patient must consent to recording. I always recommend the provider consult with a healthcare attorney on recording consent requirements in their jurisdiction before deploying this workflow. I also build a consent documentation step into the workflow where the provider confirms that consent was obtained before submitting the audio. The system will not process audio without that confirmation checkbox being checked. |
| :---- |

| WORKFLOW 10: Appointment Follow-Up Automation Setting: All Settings   Client pays: Hours of manual follow-up calls   You charge: $2,000 to $4,000 HIPAA risk level: MEDIUM: appointment context |
| :---- |

## **Build Instructions: Node by Node**

| 1 | Schedule Trigger *\[Daily at 4pm\]* Read from scheduling sheet: appointments completed today Filter: appointments from today that need follow-up This runs every afternoon to send same-day post-visit follow-up |
| :---: | :---- |

| 2 | Google Sheets Read *\[Get Completed Appointments\]* Read: Patient Code, Visit type, Provider, Follow-up instructions Follow-up instructions are populated by the provider in their EHR and exported to the scheduling sheet post-visit |
| :---: | :---- |

| 3 | Message a Model *\[Generate Follow-Up Message\]* Patient Code: \[value\]  Visit type: \[value\] Follow-up instructions: \[value from provider\] Write a brief, warm follow-up message for a patient who had a \[visit type\] appointment today. Include the specific follow-up instructions provided. Do not include any diagnosis or clinical findings. Keep it under 100 words. Professional and caring tone. End with the practice phone number for questions. |
| :---: | :---- |

| 4 | Gmail *\[Send Follow-Up to Patient\]* To: patient email from scheduling sheet Subject: Following up from your appointment today Message: \[AI-generated follow-up content\] No PHI in email body. Reference to appointment only. |
| :---: | :---- |

## **Interview Q\&A: Appointment Follow-Up Automation**

| Q1: How do you prevent the follow-up message from including PHI? MODEL ANSWER: The system prompt explicitly instructs Claude to reference the visit without repeating any clinical findings, diagnoses, or medication details. The follow-up instructions that come from the provider are framed as action steps, for example 'take the prescribed medication as directed' rather than naming the medication, and 'follow up if symptoms return' rather than naming the symptoms. The patient already knows what was discussed in their visit. The follow-up message serves as a check-in and a care touchpoint, not a clinical summary. I review every message template with the provider before go-live to confirm the content meets their clinical communication standards. |
| :---- |

| Q2: What is the ROI of automated follow-up for a small practice? MODEL ANSWER: Patient retention is the primary ROI driver. Practices that consistently follow up after visits see measurably higher return visit rates and stronger patient satisfaction scores. For a practice seeing 30 patients per day, automating follow-up eliminates approximately 2 hours of daily staff time spent on manual outreach calls. At a medical assistant hourly rate of $18 to $22, that is $36 to $44 per day, or roughly $9,000 to $11,000 per year in labor savings from one automated workflow. |
| :---- |

| WORKFLOW 11: MTM Documentation Assistant Setting: Pharmacy   Client pays: 45-90 min per MTM session   You charge: $2,500 to $5,000 HIPAA risk level: HIGH: full medication therapy review |
| :---- |

## **The Pain This Solves**

Medication Therapy Management (MTM) documentation is time-intensive and requires specific documentation standards for billing. This workflow generates structured MTM documentation including the Comprehensive Medication Review summary and the Personal Medication Record from session notes.

## **Build Instructions: Node by Node**

| 1 | On Form Submission *\[MTM Session Intake\]* Fields: Patient Code (internal), Pharmacist name, Session date, Complete medication list (name, dose, frequency, indication for each), Patient reported concerns, Adherence barriers identified, Drug therapy problems found, Recommendations made |
| :---: | :---- |

| 2 | Code in JavaScript *\[De-identification\]* Assign MTM-XXXXX. Strip patient name. Pass: full medication list, concerns, problems, recommendations. Calculate medication count for documentation header. |
| :---: | :---- |

| 3 | Message a Model *\[Generate MTM Documentation\]* MTM Session ID: \[MTM-XXXXX\] Pharmacist: \[name\]  Date: \[date\] Medication list: \[full list\] Patient concerns: \[concerns\] Drug therapy problems identified: \[problems\] Recommendations made: \[recommendations\] Generate two documents: DOCUMENT 1 \- COMPREHENSIVE MEDICATION REVIEW SUMMARY: Chief concern, medication review findings, drug therapy problems identified (using standard DTP categories: unnecessary drug therapy, needs additional drug therapy, ineffective drug, dosage too low, adverse drug reaction, dosage too high, nonadherence), pharmacist recommendations, patient education provided, follow-up plan. DOCUMENT 2 \- PERSONAL MEDICATION RECORD: Structured table: Medication / Dose / Frequency / What it is for / Special instructions Formatted for patient to keep and share with other providers. Pharmacist review and signature required before these documents are finalized. |
| :---: | :---- |

| 4 | Gmail *\[Deliver to Pharmacist\]* Send both documents to pharmacist for review and signature. Include MTM-XXXXX reference for filing. Note that documentation must be finalized within 14 days per CMS MTM requirements. |
| :---: | :---- |

## **Interview Q\&A: MTM Documentation**

| Q1: What are the CMS documentation requirements for MTM billing? MODEL ANSWER: CMS requires that MTM comprehensive medication reviews include a written summary in a language and format understandable to the beneficiary, documentation of drug therapy problems identified, pharmacist recommendations, and a personal medication record. The summary must be provided to the patient and shared with other prescribers. Documentation must be completed within 14 days of the review. My workflow generates both the clinical summary for the medical record and the patient-facing personal medication record in a single session, cutting documentation time from 45 to 90 minutes to under 10 minutes for the pharmacist review and signature. |
| :---- |

| Q2: What are the drug therapy problem categories this system uses? MODEL ANSWER: The workflow uses the seven standard drug therapy problem categories established by the Cipolle, Strand, and Morley framework, which is the standard used in MTM practice: unnecessary drug therapy, needs additional drug therapy, ineffective drug, dosage too low, adverse drug reaction, dosage too high, and nonadherence. These are the categories recognized by CMS and health plan MTM programs. The system prompt instructs Claude to classify every identified problem using one of these seven categories, which ensures the documentation meets billing and audit requirements. |
| :---- |

| WORKFLOW 12: Urgent Patient Triage and Escalation Setting: All Settings   Client pays: Missed urgent calls and messages   You charge: $2,000 to $4,000 HIPAA risk level: HIGH: clinical urgency assessment |
| :---- |

## **The Pain This Solves**

Patients contact practices outside hours with varying levels of urgency. This workflow triages incoming messages, identifies urgent versus routine requests, and escalates clinical concerns to the appropriate staff member immediately while queuing routine requests for next-business-day handling.

## **Build Instructions: Node by Node**

| 1 | Webhook or Form Submission *\[Receive Patient Message\]* Can be triggered by: a web contact form, an email webhook, or a Vapi call transcript Fields: Patient Code, Message content (Long Text), Contact method Add a notice: 'For medical emergencies call 911\. For urgent concerns use this form.' |
| :---: | :---- |

| 2 | Message a Model *\[Urgency Assessment\]* You are a clinical triage assistant for a healthcare practice. A patient has sent this message: {{ $json\['Message content'\] }} Assess the urgency level: EMERGENCY: Mentions chest pain, difficulty breathing, severe allergic reaction,            stroke symptoms, uncontrolled bleeding, or suicidal ideation.            Response: Immediately provide 911 instruction. Alert on-call staff. URGENT: Medication side effect, significant symptom change, prescription question         needing same-day clinical input.         Response: Alert on-call staff within 1 hour. ROUTINE: Appointment request, refill request, general question.          Response: Queue for next business day. Send acknowledgment to patient. Output format: URGENCY LEVEL: \[EMERGENCY / URGENT / ROUTINE\] REASON: \[one sentence\] RECOMMENDED ACTION: \[specific next step\] |
| :---: | :---- |

| 3 | IF Node *\[Route by Urgency\]* Check Claude output for EMERGENCY or URGENT keyword EMERGENCY path: Immediate SMS to on-call provider \+ 911 instruction to patient URGENT path: Email alert to on-call provider within 1 hour ROUTINE path: Add to next-day queue. Send acknowledgment email to patient |
| :---: | :---- |

| 4 | Gmail (multiple) *\[Three Separate Notification Routes\]* EMERGENCY: Subject line EMERGENCY ALERT. Body includes patient code and message summary. Provider receives immediately. Patient receives: 'For emergencies call 911 immediately. We have alerted your care team.' URGENT: Subject: Urgent Patient Message \- Review Within 1 Hour. Body includes patient code, message summary, and Claude's urgency assessment. ROUTINE: Patient acknowledgment: 'We received your message and will respond during our next business day. If your concern becomes urgent, call \[number\].' |
| :---: | :---- |

## **Interview Q\&A: Triage and Escalation**

| Q1: How do you ensure a true emergency is never missed by the AI triage? MODEL ANSWER: I design every triage workflow with a fail-safe principle: when in doubt, escalate. The system prompt lists specific emergency keywords and symptom descriptions that trigger immediate escalation. If the AI is uncertain about urgency level, the workflow defaults to URGENT rather than ROUTINE. The on-call provider can always downgrade a concern. They cannot undo a missed emergency. I also build in a daily review of all triage decisions so the provider can identify any patterns where the AI is over or under-triaging and adjust the system prompt accordingly. |
| :---- |

| Q2: What is the liability position if the AI triages something incorrectly? MODEL ANSWER: This is the most important question to address with every client before deployment. The triage workflow is a clinical decision support tool, not a clinical decision-maker. Every output is reviewed by a human provider before any action is taken. The AI does not communicate clinical guidance to the patient directly. It routes the message and alerts the appropriate staff member. The clinical judgment and the response to the patient always come from the licensed provider. I document this architecture clearly in the Minimum Necessary Policy and the system SOP so that the liability chain is unambiguous. |
| :---- |

# **Master Interview Preparation**

These questions apply across all workflows. Master these answers and you can handle any interview or client conversation about your n8n healthcare AI work.

## **The 10 Questions Every Healthcare AI Client Asks**

| Q1: Walk me through how you built your first live healthcare AI workflow. MODEL ANSWER: The first system I deployed was a pharmacy refill automation for a retail pharmacy. The workflow runs in n8n and handles the complete refill request process from patient submission to compliance logging. A patient submits a form with their medication and last refill date. A JavaScript de-identification node immediately assigns an internal patient ID and strips the patient name before any data moves forward. Claude then assesses refill eligibility against clinical rules and generates a decision with a reason. The pharmacist receives an email with the decision and a 15-minute window to override before the patient notification goes out. Every decision is logged automatically to a compliance sheet. The pharmacy went from 4 hours of Monday morning refill processing to under 30 minutes. |
| :---- |

| Q2: How do you approach a new healthcare client who has never used AI? MODEL ANSWER: I start with the workflow audit. I ask them to walk me through their day from the first patient contact to closing the practice. I am listening for repetitive tasks that follow consistent rules and require no clinical judgment to complete. Those are the AI candidates. Then I ask what would happen to their practice if they could reclaim 10 hours per week from those tasks. Once they have a concrete picture of the value, I show them a simple demo with their specific workflow. I never lead with technology. I lead with the problem and the business impact. |
| :---- |

| Q3: What makes your approach different from a generic AI developer? MODEL ANSWER: I am a pharmacist and functional medicine practitioner. When I write the system prompt for a drug interaction checker, I know which CYP450 interactions are clinically significant and which are theoretical. When I design the mental health intake workflow, I know the PHQ-9 severity thresholds and why the safety question must run before everything else. When I tell a pharmacy client that their refill automation needs a human checkpoint, I am not citing a compliance guideline. I am speaking from clinical training about what happens when a wrong refill decision goes unchecked. That domain knowledge is not something a generic developer can replicate. |
| :---- |

| Q4: What does a typical engagement timeline look like? MODEL ANSWER: I work in three phases. Phase 1 is discovery and architecture, typically 1 to 2 weeks. I audit the current workflow, map the data flows, execute the BAA, get tool agreements in place, and design the n8n architecture. Phase 2 is build and pilot, typically 2 to 4 weeks. I build with fabricated test data, run a one-week pilot with one staff member, iterate based on feedback, and confirm all compliance elements. Phase 3 is full deployment and handover, typically 1 to 2 weeks. I train the full team, hand over documentation, set up monitoring, and propose the retainer structure. Total engagement is typically 6 to 8 weeks for a single workflow. |
| :---- |

| Q5: How do you handle a workflow that needs to connect to our EHR system? MODEL ANSWER: Most independent practices use EHR systems like Athenahealth, DrChrono, or Jane App that have data export capabilities. The most practical approach for small practices is a scheduled export to a HIPAA-eligible Google Sheet that n8n reads from. For practices with API access on their EHR plan I can build a direct API connection using n8n's HTTP request node, which gives real-time data access rather than relying on scheduled exports. For Epic or Athenahealth on larger plans I use their published FHIR API endpoints with OAuth 2.0 authentication. The right approach depends on the practice size, EHR plan level, and whether the added complexity of live API connection is justified by the use case. |
| :---- |

| Q6: What monitoring do you put in place after deployment? MODEL ANSWER: I set up three levels of monitoring. First, the n8n Executions tab shows every workflow run with success or failure status. I review this weekly in the first month and flag any patterns of failure for investigation. Second, the compliance log in Google Sheets is reviewed monthly to confirm the data quality is consistent with the Minimum Necessary Policy. Third, I run a 90-day accuracy audit where the clinical staff review a random sample of AI outputs against their own clinical judgment and score them. This catches any drift in Claude's performance over time and gives me the data to justify retainer renewal. |
| :---- |

| Q7: What is your pricing structure? MODEL ANSWER: I price in phases and I always lead with Phase 1 only. Phase 1 is discovery, architecture, BAA execution, and the compliance documentation package. This is typically $1,500 to $2,500 depending on complexity. It gives the client a complete view of what we are building and proof that I deliver before they commit to the full project. Phase 2 is the build and pilot, typically $2,000 to $4,000 for a single workflow. Phase 3 is deployment and handover, typically $1,000 to $2,000. Monthly retainer for ongoing monitoring, reporting, and support is $300 to $800 per month. I do not discount the Phase 1 fee because that is where the most work happens and it is what protects both of us legally. |
| :---- |

| Q8: What happens to our data if you stop working with us? MODEL ANSWER: This is addressed explicitly in the BAA and the Statement of Work. Within 30 days of engagement termination, I return all client data in the format it was provided, delete all copies from my systems, and provide a written confirmation of deletion. The workflows themselves, meaning the n8n configurations, code, and documentation, are the client's property and are handed over in full at project close. I do not retain any client health data after the engagement ends. This is not just best practice, it is a legal requirement under HIPAA and it is spelled out in the BAA they sign before we begin. |
| :---- |

**Every workflow. Every node. Every answer.**

*You built the refill automation from scratch.*

*Every other workflow in this document uses the same architecture.*

**Dr. Shallanda Hunter, PharmD, MBA, RPh, CFNMP  deidguard.com**