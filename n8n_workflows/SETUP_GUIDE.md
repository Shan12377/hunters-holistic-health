# n8n Workflow Setup Guide

This folder contains four importable workflows for the HHH Lane 1 (non-PHI) automation layer:

| File | Workflow | Trigger |
|---|---|---|
| `workflow_10_followup.json` | Appointment Follow-Up Automation | Schedule, daily 4pm |
| `workflow_12_triage.json` | Urgent Triage and Escalation | Webhook (replaces the existing `/support` handler) |
| `workflow_05_supplement_protocol.json` | Supplement Protocol Builder | Internal n8n form |
| `workflow_08_presession_brief.json` | Telehealth Intake and Pre-Session Brief | Schedule (hourly) plus client intake form |

Compliance reminder: all four workflows run in Lane 1. No PHI. Test with the fabricated data in `N8N_WORKFLOW_ROADMAP.md` only, and keep it that way until the Google Workspace BAA is active. Even after that, these specific workflows stay non-PHI by design.

---

## 1. Create Credentials in n8n

In your self-hosted n8n, go to Credentials > Add Credential and create these three. The workflow files reference them with `[REPLACE_WITH_YOUR_CREDENTIAL]` placeholders; after import, open each node showing a credential warning and select the real credential from the dropdown.

1. **Google Sheets (OAuth2)**: credential type "Google Sheets OAuth2 API". Requires a Google Cloud project with the Sheets API enabled and an OAuth client. Connect the Google account that owns the HHH intake spreadsheet.
2. **Gmail (OAuth2)**: credential type "Gmail OAuth2". Same Google Cloud project, Gmail API enabled. Connect the practice sending address.
3. **OpenAI**: credential type "OpenAI API". Paste your OpenAI API key. Used by Workflows 12, 5, and 8.

---

## 2. Prepare the Google Sheet

Open the existing HHH intake spreadsheet (or create one) and copy its ID from the URL (the long string between `/d/` and `/edit`). You will paste this ID into every Google Sheets node after import, replacing `[REPLACE_WITH_YOUR_GOOGLE_SHEET_ID]`.

Create or update these tabs with headers in row 1, exactly as written:

**`Session Follow-Ups`** (Workflow 10):
`Client Code | Client First Name | Client Email | Session Date | Session Type | Follow-Up Instructions | Follow-Up Sent | Sent Date`
Note: `Client First Name` and `Client Email` extend the roadmap columns. They are contact information, not PHI, and stay within the Lane 1 email rule (name, session date, action steps only).

**`Support Requests`** (Workflow 12): keep the existing columns and add two at the end:
`Timestamp | Submission Type | Name | Email | Category | Short Description | Preferred Contact Method | Consent | Triage Level | Resolved`

**`Protocol Requests`** (Workflow 5):
`Protocol ID | Client Code | Age Range | Practitioner | Submission Date | Protocol Status | Review Date`
The protocol text itself is emailed to Dr. Hunter and is not stored in the sheet.

**`Session Intakes`** (Workflow 8):
`Session ID | Client Code | Client Email | Session Date | Session Time | Session Type | Reminder Sent | Intake Submitted | Visit Reason | Current Concerns | Questions for Today | Changes Since Last Session | Brief Generated | Brief Sent`
Notes: `Session Date` must be `YYYY-MM-DD` and `Session Time` must be 24-hour `HH:MM` (server timezone). Add a row for each upcoming session (manually or from a scheduling export). `Reminder Sent`, `Client Email`, `Session Time`, and the four intake answer columns extend the roadmap columns; the intake answers are non-clinical by form design and the form says so.

---

## 3. Import Each Workflow

For each JSON file:

1. In n8n, open Workflows > Add Workflow > Import from File (or the three-dot menu > Import from File on older versions).
2. Select the JSON file.
3. Open every node with a warning icon and fix the placeholders:
   - Select your real credential on each Google Sheets, Gmail, and OpenAI node.
   - Replace `[REPLACE_WITH_YOUR_GOOGLE_SHEET_ID]` in each Google Sheets node.
   - Replace `[REPLACE_WITH_DR_HUNTER_EMAIL]` with the alert inbox.
   - Replace `[REPLACE_WITH_PRACTICE_PHONE]` in the Workflow 10 email body.
   - Replace `[REPLACE_WITH_YOUR_SHARED_SECRET]` in Workflow 12 (see step 4).
   - Replace `[REPLACE_WITH_SMS_GATEWAY_ADDRESS]` in Workflow 12 with an email-to-SMS address (for example `5551234567@vtext.com` for Verizon) or swap that node for Twilio later.
   - Replace `[REPLACE_WITH_INTAKE_FORM_URL]` in Workflow 8 with the production URL of the Pre-Session Intake Form (n8n shows it on the form trigger node after activation).
4. Save, then run one manual test execution with fabricated data before activating.
5. Toggle the workflow to Active.

---

## 4. Environment Variables and the Webhook URL

Set the base URL of your n8n instance as an environment variable wherever you reference it:

```
N8N_WEBHOOK_BASE_URL=https://your-n8n-instance.example.com
```

Workflow 12 listens at path `hhh-intake`, so the full production URL is:

```
{N8N_WEBHOOK_BASE_URL}/webhook/hhh-intake
```

(While testing with "Listen for test event", n8n uses `/webhook-test/hhh-intake` instead.)

In the app's Vercel project, set:

```
VITE_N8N_WEBHOOK_URL={N8N_WEBHOOK_BASE_URL}/webhook/hhh-intake
```

**Shared secret:** Workflow 12 rejects any request without the header `x-hhh-secret` matching your secret. Generate one (`openssl rand -hex 24`), put it in the workflow's Check Shared Secret node, and update the app's intake form fetch calls to send the header. The current form code does not send this header yet; add it to the four intake pages when you wire this up, and store the value as a `VITE_` env var.

**Migration note:** Workflow 12 is now the complete intake router. It handles all four submission types on the `hhh-intake` path: support requests get AI triage and escalation, `early_access` gets logged plus a welcome email, `feature_request` gets logged plus an acknowledgment (when an email was provided), and `clinical_inquiry` gets logged with Review Status NEW, an acknowledgment to the user, and a no-detail alert to Dr. Hunter. If you had an older intake workflow on this path, deactivate it; two active workflows cannot share a webhook path.

---

## 5. Per-Workflow Notes and Testing

### Workflow 10: Appointment Follow-Up
Runs daily at 4pm server time. Reads `Session Follow-Ups`, emails every row where `Follow-Up Sent` is not YES and an email plus instructions exist, then marks the row sent. Test: add the TEST-001 row from the roadmap with your own email, run the workflow manually, confirm the email contains the three action steps and no clinical language, and that the row updates.

### Workflow 12: Intake Router with Urgent Triage
Classifies support messages as EMERGENCY, URGENT, or ROUTINE. Any health mention is URGENT at minimum; if the AI response cannot be parsed, the workflow defaults to URGENT so a human always reviews. Alert emails contain name, email, triage reason, and timestamp only; the message body never leaves the sheet. Run the three roadmap test messages and confirm: ROUTINE gets an acknowledgment only, URGENT and EMERGENCY alert Dr. Hunter and send the user the 911 notice, EMERGENCY also fires the SMS gateway message. Then test the other three intake types: submit the /join, /feature-request, and /clinical-inquiry forms with test data and confirm each row lands in its tab, the welcome and acknowledgment emails arrive, and the clinical inquiry alert to Dr. Hunter contains name, email, service interest, and timestamp only.

### Workflow 5: Supplement Protocol Builder
The form trigger creates an internal form URL. Do not link it anywhere public. Submissions get an SP-XXXXX ID, a draft protocol generated under structure/function language rules, an email to Dr. Hunter for review, and a metadata-only row in `Protocol Requests`. Test with the TEST-SP-001 data from the roadmap and check the draft uses phrases like "supports healthy iron metabolism" and includes an interaction summary.

### Workflow 8: Pre-Session Brief
Two halves. The hourly schedule sends the intake reminder when a session is 23 to 25 hours out, and generates plus emails the brief when a session is under 2.5 hours out with a submitted intake. The form trigger records client submissions against the matching `Session ID` row. Test: add a TEST-TH-001 row with a session 24 hours out and your email, run the schedule branch manually, submit the form with the roadmap test data, then temporarily edit the row's time to 2 hours out and run again to see the brief. The brief email uses the Session ID and client code, never the client name.

---

## 6. Compliance Checklist Before Going Live

- [ ] All test rows and test executions used fabricated data only.
- [ ] Alert and reminder emails contain no free-text health details (spot check real executions).
- [ ] The shared secret is set in both n8n and the app, and requests without it get a 401.
- [ ] The Workflow 5 and Workflow 8 form URLs are not linked from any public page (Workflow 5 is internal only).
- [ ] The Google Sheet is shared with no one beyond the practice accounts.
- [ ] Any older intake workflow on the `hhh-intake` path is deactivated; Workflow 12 is the only active listener.
- [ ] The clinical inquiry alert email was spot checked: name, email, service interest, timestamp, nothing else.
