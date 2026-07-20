# Platform Demo Video Script — 60 Seconds

**Setup:** Screen recording open, platform logged in as testclient@test.com, cursor visible, quiet room.

---

**[0–3s]** Open the platform on the dashboard. Let it sit.

> "If you have ever left a doctor's appointment with a pamphlet and no real answers, this is built for you."

---

**[3–12s]** Navigate to the Client Dashboard. Show the progress ring and daily check-in items.

> "This is your Daily Command Center. Every day you log the things that actually move your health. Nutrition, fasting, supplements, movement, water, energy. Ten minutes. Done."

---

**[12–22s]** Click to AI Meal Guard. Type any food. Let the response load.

> "The AI Meal Guard is not a calorie counter. It is an educator. Type a food, understand what it actually does in your body."

---

**[22–32s]** Navigate to Blood Pressure Tracker. Show the trend chart with colored zones.

> "Your BP numbers tell a story. The tracker reads that story with AHA-zone color coding and explains what is driving your pattern."

---

**[32–44s]** Click into the ROOTS curriculum. Show one pillar opening. Let the content sit.

> "The ROOTS Framework is five phases of functional and nutritional medicine education. Built by a PharmD and CFNMP who went through this herself. The actual mechanisms, not generic advice."

---

**[44–52s]** Navigate to Weekly Report Card. Show the grade and 4-week history.

> "Every week you get a grade. Here is what you did, here is what improved, here is where to focus next."

---

**[52–60s]** Return to homepage or show the logo on a clean screen.

> "That is the platform. Try the free tools with no account, or go straight to membership and start the curriculum today. Huntersholistichealth.com."

---

## After Recording

1. Stop the Loom recording
2. Copy the embed URL (looks like `https://www.loom.com/embed/XXXXXXXXX`)
3. Open `src/pages/LandingPage.tsx`
4. Find the comment `{/* Replace src with your YouTube or Vimeo URL */}`
5. Uncomment the `<iframe>` line and paste your URL as the `src`
6. Delete the `<div className={styles.videoPlaceholder}>` block below it
7. Run `npm run build` then `git push origin main`
