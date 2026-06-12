# n8n Workflow Roadmap for Hunter's Holistic Health

This document maps all 12 workflows from the n8n Healthcare Workflows Master Course (Dr. Shallanda Hunter, PharmD) to the HHH platform. It defines build priority, compliance tier, intended use (internal HHH vs. client-facing service), and test data for each.

**Source:** n8n_Healthcare_Workflows_Course.md (Dr. Shallanda Hunter, PharmD, MBA, RPh, CFNMP)

---

## The Two-Lane Rule (Always Apply This First)

Before building any workflow, classify it:

| Lane | What Belongs Here | PHI Allowed? |
|---|---|---|
| **Lane 1: App + n8n** | Intake forms, admin routing, follow-up emails, supplement protocols for educator review, triage routing, session prep briefs using non-PHI app data | No |
| **Lane 2: Google Workspace Clinical** | Labs, diagnoses, clinical records, detailed health history, anything linked to a real patient's identity | Yes, after BAA is signed and active |

**Development rule:** Use fabricated test data only until the Google Workspace BAA is signed and active. The BAA requirement activates the moment real patient PHI enters any workflow.

---

## Build Priority: Near-Term (Build Now, No BAA Required)

These four workflows operate entirely in Lane 1. They can be built and tested immediately with fabricated data and can go live with real users as long as no PHI enters the email body or Google Sheet.

---

### Workflow 10: Appointment Follow-Up Automation

**Build this first.** Easiest ROI, directly improves client retention.

- **Setting:** All settings
- **What it does:** After a Doxy.me session, n8n sends a warm follow-up email to the client with educational next steps from the session.
- **HHH use:** Automated post-session follow-up for every Doxy.me call.
- **PHI risk:** Low. Email body contains no clinical findings, no diagnoses, no medication details. References the appointment only.
- **Charge to other clients:** $2,000 to $4,000 one-time build fee.
- **n8n trigger:** Schedule trigger, daily at 4pm, reads completed appointments from Google Sheet.
- **Google Sheet tab to add:** `Session Follow-Ups` (Columns: Client Code, Session Date, Session Type, Follow-Up Instructions, Follow-Up Sent, Sent Date)
- **Email rule:** Name + session date + action steps only. No clinical content.

**Test data:**
```
Client Code: TEST-001
Session Type: Functional Medicine Education
Session Date: Today
Follow-Up Instructions: Review supplement timing handout, log BP twice daily this week, complete daily log each morning
Expected output: Warm follow-up email with the three action steps, no clinical language, practice phone number at the end.
```

---

### Workflow 12: Urgent Patient Triage and Escalation

**Build second.** Upgrades the existing `/support` form with AI urgency routing.

- **Setting:** All settings
- **What it does:** Incoming messages from the `/support` form are classified as EMERGENCY, URGENT, or ROUTINE. EMERGENCY and URGENT trigger immediate alerts to Dr. Hunter. ROUTINE messages are queued for next-business-day response with an acknowledgment sent to the user.
- **HHH use:** Replaces manual review of support inbox. Ensures nothing urgent is missed.
- **PHI risk:** Low by design. The `/support` form already has a PHI disclaimer and redirects clinical questions to `/clinical-inquiry`. The triage AI assesses message urgency only, not clinical content.
- **HIPAA note:** If a support message contains health details despite the disclaimer, the triage AI must route it to URGENT for human review. It must not process or store health details in the compliance log.
- **Charge to other clients:** $2,000 to $4,000 one-time build fee.
- **n8n trigger:** Webhook (existing `VITE_N8N_WEBHOOK_URL` already handles `submissionType: support`).
- **Google Sheet tab:** Already exists as `Support Requests`. Add a `Triage Level` column (EMERGENCY / URGENT / ROUTINE) and a `Resolved` column.

**Email alert rules:**
- EMERGENCY: Immediate SMS + email to Dr. Hunter. Subject: `EMERGENCY ALERT - Support Request [timestamp]`. Body: name, email, triage reason only.
- URGENT: Email to Dr. Hunter within 1 hour. Subject: `Urgent Support Request - Review Within 1 Hour`.
- ROUTINE: Acknowledgment email to user only. No alert to Dr. Hunter.

**Test data:**
```
Test 1 (ROUTINE): "Hi, I can't log into my account. Can you help?"
Expected: ROUTINE. Acknowledgment sent to user. No alert.

Test 2 (URGENT): "I've been having chest tightness since I started the new supplement protocol."
Expected: URGENT. Alert to Dr. Hunter. User receives: "We received your message and will respond shortly. If this is a medical emergency, call 911 immediately."

Test 3 (EMERGENCY): "I'm having chest pain and can't breathe."
Expected: EMERGENCY. Immediate alert. User receives 911 instruction.
```

---

### Workflow 5: Supplement Protocol Builder

**Build third.** Extends the existing Supplement Log page and Fullscript integration.

- **Setting:** Functional Medicine
- **What it does:** Dr. Hunter submits a client's symptom picture, relevant labs (functional ranges), current medications, and health goals. Claude generates a ranked supplement protocol with drug-supplement interaction checks and FTC-compliant structure/function language. Protocol goes to Dr. Hunter for review before the client ever sees it.
- **HHH use:** Pre-session protocol prep. Replaces 30 to 60 minutes of manual protocol building per client.
- **PHI risk:** Medium. The form uses an internal client code, not the client's name. Age range (not exact age) is sufficient context. Medication names alone without identity attached are not PHI under HIPAA Safe Harbor.
- **FTC rule (critical):** All supplement language must use structure/function claims only. No disease claims. The Claude prompt already enforces this. Example: "supports healthy iron metabolism" is allowed. "Treats iron deficiency anemia" is not.
- **Charge to other clients:** $2,500 to $5,000 one-time build fee.
- **n8n trigger:** On Form Submission (new internal educator form, not a public-facing page).
- **Google Sheet tab to add:** `Protocol Requests` (Columns: Protocol ID, Client Code, Age Range, Practitioner, Submission Date, Protocol Status, Review Date)

**De-identification rule:** Assign SP-XXXXX identifier. Strip client name and exact DOB. Pass: symptoms, labs, medications, goals, dietary restrictions. Age range is sufficient.

**Test data:**
```
Client Code: TEST-SP-001
Age Range: 40s
Sex: Female
Key Symptoms: Fatigue, brain fog, weight gain despite diet and exercise, cold hands and feet
Relevant Labs: TSH 2.8, Ferritin 18, Vitamin D 28, HbA1c 5.5%, Homocysteine 9.2
Current Medications: None
Health Goals: Improve energy, support thyroid function, reduce inflammation
Dietary Restrictions: Gluten-free
Expected output: Ranked protocol with iron support, Vitamin D3/K2, thyroid support blend, methylated B-complex. Each with dose range, rationale, drug interactions (none in this case), and FTC-compliant structure/function language.
```

---

### Workflow 8: Virtual Telehealth Intake (Pre-Session Brief)

**Build fourth.** Automated prep tool for every Doxy.me session.

- **Setting:** Telehealth
- **What it does:** 24 hours before a scheduled Doxy.me session, n8n sends the client a short intake form. When the client submits, Claude generates a structured pre-session brief for Dr. Hunter, delivered 2 hours before the call.
- **HHH use:** Dr. Hunter walks into every session already knowing the client's current concerns, recent app data, and questions they want answered. No manual chart review.
- **PHI risk:** Low for the basic version. The intake form collects: session reason, current symptoms (general, not clinical), questions for today, and any changes since last session. No labs, no diagnoses, no medication details in this version.
- **n8n trigger:** Schedule trigger, checks every hour for appointments 24 hours out. Reads from a scheduling export sheet.
- **Google Sheet tab to add:** `Session Intakes` (Columns: Session ID, Client Code, Session Date, Intake Submitted, Brief Generated, Brief Sent)

**Email rule for client intake reminder:** Subject: "Your session tomorrow, please take 5 minutes." Body: form link, HIPAA notice, no clinical details.

**Email rule for educator brief:** Subject: `Pre-Session Brief - [Session ID] - [appointment time]`. Body: brief content with SESSION-XXXXX reference. No client name in email body.

**Test data:**
```
Client Code: TEST-TH-001
Session Type: Follow-up
Visit Reason: Check in on supplement protocol and review BP log
Current Concerns: Still feeling tired in the afternoons, BP readings have been higher this week
Questions for Today: Should I adjust my supplement timing? Is the afternoon fatigue related to my fasting window?
Changes Since Last Session: Started a new job, more stress, less sleep
Expected output: Structured brief with chief concern, summary of reported changes, client questions to address, suggested session priorities.
```

---

## Build Priority: Phase 3 (After Google Workspace BAA Is Active)

These workflows require the covered Google Workspace clinical lane to be set up, the BAA signed in the Admin Console, MFA enabled, and Drive sharing locked down before any real client data enters them.

---

### Workflow 4: Lab Interpretation Agent

- **Setting:** Functional Medicine
- **What it does:** A client's lab results are submitted through a secure form in the Google Workspace environment. Claude generates a structured functional medicine interpretation using functional reference ranges (not conventional ranges). Dr. Hunter receives the interpretation before the session.
- **HHH use:** Pre-session lab review. Replaces 20 to 40 minutes of manual interpretation per client.
- **PHI risk:** HIGH. Lab results linked to a client are PHI. This workflow must run entirely within the covered Google Workspace clinical lane. It must not pass through the app or the standard n8n intake webhook.
- **Charge to other clients:** $3,000 to $6,000 one-time build fee.
- **Functional reference ranges to use (from course):**
  - Ferritin optimal: 50 to 150 ng/mL (flag below 50 even if conventionally normal)
  - TSH optimal: 0.5 to 2.0 mIU/L (flag above 2.0 even if conventionally normal)
  - Fasting glucose optimal: 70 to 85 mg/dL (flag 86 to 99 as functionally suboptimal)
  - HbA1c optimal: below 5.3% (flag 5.4 to 5.6 as functionally suboptimal)
  - Vitamin D optimal: 50 to 80 ng/mL (flag 30 to 49 as insufficient)
  - Homocysteine optimal: below 7 umol/L (flag 8 to 10 as elevated functional risk)

**Test data (fabricated, use during development only):**
```
Patient Code: TEST-FM-001
Age Range: 40s
Sex: Female
Practitioner: Dr. Hunter
Chief Complaint: Fatigue, brain fog, weight gain despite diet and exercise
Lab Results:
  TSH 2.8 mIU/L
  Free T4 1.1 ng/dL
  Free T3 2.8 pg/mL
  Ferritin 18 ng/mL
  Iron 65 ug/dL
  TIBC 380 ug/dL
  Vitamin D 28 ng/mL
  B12 310 pg/mL
  Fasting glucose 91 mg/dL
  HbA1c 5.5%
  Homocysteine 9.2 umol/L
Expected output: Multiple functional flags despite mostly conventional normal values. TSH functionally elevated. Ferritin critically low. Vitamin D insufficient. HbA1c functionally suboptimal. Homocysteine elevated. Classic functional medicine presentation.
```

---

### Workflow 6: Root Cause Analysis Agent

- **Setting:** Functional Medicine
- **What it does:** Client completes a detailed intake form 48 hours before their first session. Claude maps symptoms to body systems and generates top 3 root cause hypotheses with supporting evidence, priority labs to order, and areas to probe in the first visit.
- **HHH use:** First-visit prep. Dr. Hunter walks in with a clinical hypothesis map instead of spending the first 30 minutes gathering history.
- **PHI risk:** HIGH. Detailed symptom history, family history, environmental exposures, and medication history are PHI when linked to a client. This workflow must run in the covered Google Workspace clinical lane.
- **Charge to other clients:** $3,500 to $7,000 one-time build fee.
- **Body system mapping framework (from course):**
  - Gut and digestive
  - Hormonal and endocrine
  - Immune and inflammatory
  - Neurological and cognitive
  - Detoxification and liver
  - Energy and mitochondrial

---

## Service Offerings for Other Healthcare Businesses

These workflows are best positioned as paid services Dr. Hunter builds for other healthcare clients, leveraging her PharmD credential as the clinical differentiator.

| Workflow | Target Client | Your Charge Range | Clinical Differentiator |
|---|---|---|---|
| Workflow 1: Drug Interaction Checker | Independent pharmacies | $2,500 to $5,000 | PharmD knowledge of CYP450 interactions, clinical significance thresholds |
| Workflow 2: Patient Adherence Tracker | Pharmacies with star rating pressure | $2,500 to $5,000 | Understanding of DIR fees, CMS star rating therapy classes |
| Workflow 11: MTM Documentation Assistant | Pharmacies doing MTM billing | $2,500 to $5,000 | Cipolle/Strand/Morley DTP framework, CMS documentation requirements |
| Workflow 3: Mental Health Intake Bot | Behavioral health practices | $3,500 to $7,000 | 42 CFR Part 2 awareness, PHQ-9/GAD-7 scoring accuracy |
| Workflow 9: Clinical Note Scribe | Any provider spending 2 to 3 hrs/day on notes | $3,500 to $7,000 | SOAP note clinical accuracy, Whisper medical vocabulary setup |
| Workflow 7: After-Hours Voice AI | Pharmacies, telehealth practices | $3,000 to $6,000 | Clinical escalation logic, Vapi + Twilio + n8n integration |

**Engagement pricing model (from course):**
- Phase 1 (Discovery, architecture, BAA execution, compliance docs): $1,500 to $2,500
- Phase 2 (Build and pilot): $2,000 to $4,000 per workflow
- Phase 3 (Deployment and handover): $1,000 to $2,000
- Monthly retainer (monitoring, reporting, support): $300 to $800

---

## Workflows Not Recommended for HHH Internal Use

| Workflow | Reason |
|---|---|
| Workflow 3: Mental Health Intake Bot | 42 CFR Part 2 complexity. Offer as a service to behavioral health clients, not for internal HHH use. |
| Workflow 9: Clinical Note Scribe | Requires session recording. State-specific consent law review required before building. Consult a healthcare attorney first. |

---

## Google Sheet Master Structure

When you set up the n8n Google Sheet, create these tabs in order:

**Existing (from current n8n blueprint):**
1. `Early Access`
2. `Support Requests`
3. `Feature Requests`
4. `Clinical Interest`

**Add for near-term workflows:**
5. `Session Follow-Ups` (Workflow 10)
6. `Protocol Requests` (Workflow 5)
7. `Session Intakes` (Workflow 8)

**Add for Phase 3 (Google Workspace clinical lane only, separate from the main intake sheet):**
8. `Lab Interpretations` (Workflow 4, covered environment only)
9. `Root Cause Intakes` (Workflow 6, covered environment only)

---

*Last updated: June 2026. Source: n8n Healthcare Workflows Master Course, Dr. Shallanda Hunter, PharmD.*
