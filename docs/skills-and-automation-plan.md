# The Skills and Automation Plan
## What to add, what to automate, what to never automate
### Prepared July 2026. Based on your current skill library, your live n8n setup (Railway), your Stripe/Supabase stack, and the four strategy docs already in this folder.

---

## Part 1: Where You Stand (so we only add what's missing)

**Skills you already have (strong):** voice (copywriter), compliance (legal-compliance, clinical-accuracy-audit), content per platform (blog publisher, LinkedIn x4, carousel, email, Pinterest, image prompts, hooks, humanizer), research (health-research), business thinking (hormozi-business-engine), GEO (installed today).

**Automations you already have:** intake forms → n8n, Daily Business Briefing (5 Gmail accounts, 4 Sheets tabs, 3 Supabase tables → Haiku summary → Telegram → calendar/Airtable tasks), Stripe checkout webhooks.

**One housekeeping note before adding anything:** you have four overlapping LinkedIn skills (post-writer, linkedin-skill, linkedin-domination, guide-dm). They partially compete for triggering. Worth consolidating into two (strategy + writing, keep guide-dm separate) next time you are in skill maintenance mode. Fewer, sharper skills trigger more reliably.

---

## Part 2: The Five Skills to Add (each one kills a recurring time sink)

Ordered by hours saved per week. I can build any of these as installable .skill files on request; you have skill-creator for refining them later.

**1. Content Repurposer (biggest saver).** You have per-platform skills but no orchestrator. This skill takes ONE core idea or blog post and produces the full week's slice set in one pass: LinkedIn text post, carousel outline, Instagram caption, Pinterest pin copy, email section, and the first-comment links, each routed through your voice and compliance rules. Your marketing blueprint's "write Sunday, slice all week" becomes one prompt. Saves: 3 to 5 hours weekly.

**2. Weekly Business Review.** Your briefing automation collects data; nothing analyzes it. This skill reads the week's numbers (Kit opt-ins, membership starts/cancels, community contribution ratio, content saves, GEO scoreboard when run) and returns a Hormozi-style diagnosis: which of the four levers (traffic, conversion, price, churn) is the constraint this week and the single highest-leverage action. Stops you from working on the wrong lever. Saves: the hours lost to misdirected effort, the most expensive hours there are.

**3. Proof Harvester.** Testimonials are the weakest asset across your whole funnel (flagged in the landing page brief). This skill turns raw member wins (feed posts, emails, session notes) into compliant proof: drafts the permission request, formats the testimonial with the required disclaimer, writes the landing page version, the carousel version, and the interview talking point. Proof compounds; right now it evaporates. Saves: 1 to 2 hours per testimonial, and testimonials stop being skipped.

**4. Media Pitch Machine.** Move 3 of the authority playbook is 10 podcast pitches a week, forever. This skill holds your media kit content, angles per show category, the 4-sentence pitch structure, follow-up cadence, and interview prep (your stories, stats with citations, the pivot sentence for medical-advice questions). Saves: 2 hours weekly and keeps the circuit running when you are busy.

**5. Client Session Prep.** Before each VIP clarity call: pulls what you know (their protocol, adherence patterns, last session's notes), drafts a session agenda, flags what they skipped (skipped items are the agenda), and preps the education points. Educator-scope language throughout. Saves: 30 to 45 minutes per session, and sessions get sharper.

---

## Part 3: Business Automations (n8n, in build order)

These come straight from dependencies your strategy docs already created:

| # | Automation | Trigger → Action | Serves |
|---|---|---|---|
| 1 | 7-Day "Understand Your Numbers" course | Kit opt-in → day 0 to 7 email sequence → day 3 and 7 ascension emails | The free tier core (offer doc P0) |
| 2 | Tier onboarding sequences | Stripe checkout.session.completed → welcome sequence per tier + community intro nudge + day-7 check email | Week-1 activation (community doc) |
| 3 | Churn-save loop | Supabase query: no daily_log or feed activity 7 days → personal-tone email; 14 days → fresh-start invite | Retention (community doc Part 3) |
| 4 | Weekly community digest | Sunday: pull member's likes received, rank movement, top post → personalized digest email | The Skool retention workhorse |
| 5 | Streak-save alert | Streak at risk at 8pm member time → one push/email | The single highest-emotion retention trigger |
| 6 | Testimonial harvest | Member hits 30-day streak or grade A → auto-ask with permission form → approved quotes to Airtable | Feeds Proof Harvester skill |
| 7 | Dunning | Stripe invoice.payment_failed → 3-email recovery sequence | Silent revenue leak, every subscription business has it |
| 8 | Weekly metrics snapshot | Friday: compile the five-number dashboard + Kit opt-ins → Telegram (extends your existing briefing) | Feeds Weekly Business Review skill |

Numbers 1 and 2 are prerequisites for the offer launch. Number 7 is 30 minutes of work and pays for itself with the first saved subscription.

**Never automate:** anything clinical, anything entering the Google Workspace clinical lane, intro replies in the community for the first 100 members (founder replies are the product), and churn-save emails should READ personal even though sending is automated: plain text, your name, no template smell.

---

## Part 4: Social Media Automation (what to automate, what it costs, where the line is)

### The stack recommendation

**Metricool (start on the free plan, ~$22/mo when you outgrow it).** One tool schedules LinkedIn, Instagram, Facebook, Pinterest, and YouTube, with the strongest free plan and analytics in the category. Buffer is the simpler alternative; Publer is the budget power option with content recycling. You do not need more than one of these.

### The pipeline (mostly buildable with what you have)

1. **Create:** Sunday batch using the Content Repurposer skill (Part 2) → week's content in one sitting.
2. **Approve:** drafts land in an Airtable "content queue" (statuses: draft, approved, scheduled, posted). You approve on your phone in minutes.
3. **Schedule:** approved items auto-push to Metricool via n8n at your set times (8 to 9 AM Eastern per the blueprint). Instagram feed and carousels auto-publish via the Meta API; Pinterest is fully automatable and the most set-and-forget channel you have.
4. **Recycle:** evergreen winners (glossary posts, tool promos) re-enter the queue every 60 to 90 days with refreshed hooks. Pinterest pins are evergreen by design; a good pin drives clicks for years.
5. **Monitor:** n8n watches for comment keywords (GUIDE, CERTIFY) → Telegram alert → you respond using the guide-dm skill. For Instagram specifically, ManyChat's comment-to-DM automation is platform-approved and pairs with your lead magnets.
6. **Measure:** Metricool analytics → weekly snapshot automation (Part 3, #8) → saves and comments decide next week's topics.

### The hard line (protect your accounts and your brand)

- **Never automate LinkedIn engagement:** auto-comments, auto-DMs, auto-connection tools violate LinkedIn's terms and get accounts restricted. The 20/20/20 routine stays human. Automation prepares; you press send.
- **Never auto-reply in the community or to health questions anywhere.** One automated reply to a clinical question is a compliance event.
- **Schedule posts, not presence.** The first 60 minutes after posting still need YOU in the comments; that window decides reach and no tool can fake it.
- Stories and live sessions stay manual. They are the proof of a real human, which is your entire differentiation.

### What this buys you

Manual path: 10 to 14 hours weekly across platforms. Automated path: Sunday batch (90 min) + daily engagement windows (30 to 45 min) = roughly 5 hours weekly for MORE output. The saved hours go to the things automation cannot do: live sessions, interviews, and the founder replies that make the community yours.

---

## Part 5: Build Order (everything above, one sequence)

| Week | Build |
|---|---|
| 1 | n8n #1 (7-day course) + #2 (onboarding) + Metricool account connected to all platforms |
| 2 | Content Repurposer skill + Airtable content queue + first Sunday batch |
| 3 | n8n #7 (dunning) + #5 (streak save) + comment keyword alerts |
| 4 | Weekly Business Review skill + n8n #8 (metrics snapshot) |
| 5 | Churn-save loop + weekly digest (needs the community P0 fixes shipped first) |
| 6 | Proof Harvester + testimonial harvest automation |
| 7+ | Media Pitch Machine, Client Session Prep, recycling rules |

Sources: [Buffer scheduling tools guide](https://buffer.com/resources/social-media-scheduling-tools/), [Later 2026 tool rankings](https://later.com/blog/social-media-scheduling-tools/), [2026 scheduling tools comparison](https://demandconvert.com/learn/blog/19-best-social-media-scheduling-tools-comparison-2026/), [social media automation tools 2026](https://www.blotato.com/blog/social-media-automation-tools)
