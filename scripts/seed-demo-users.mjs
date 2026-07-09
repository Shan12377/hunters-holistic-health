/**
 * Phase 1: Seed 9 demo personas for the HHH platform walkthrough video.
 * Run: node scripts/seed-demo-users.mjs
 * Requires: dev dependencies satisfied, .env.local present with SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 */

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

// ── env loader (no dotenv dep required) ──────────────────────────────────────
function loadEnv() {
  const raw = readFileSync('.env.local', 'utf-8')
  const env = {}
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq < 0) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    env[key] = val
  }
  return env
}

const env = loadEnv()
const SUPABASE_URL = env['SUPABASE_URL'] || env['VITE_SUPABASE_URL']
const SERVICE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── persona definitions ───────────────────────────────────────────────────────
const PERSONAS = [
  {
    email: 'keisha.demo@hhh-demo.com',
    firstName: 'Keisha',
    lastName: 'Washington',
    age: 44,
    plan: 'foundation',
    displayHandle: 'KeishaW',
  },
  {
    email: 'marcus.demo@hhh-demo.com',
    firstName: 'Marcus',
    lastName: 'James',
    age: 38,
    plan: 'foundation',
    displayHandle: 'MarcusJ',
  },
  {
    email: 'sandra.demo@hhh-demo.com',
    firstName: 'Sandra',
    lastName: 'Mitchell',
    age: 52,
    plan: 'program',
    displayHandle: 'SandraM',
  },
  {
    email: 'tanya.demo@hhh-demo.com',
    firstName: 'Tanya',
    lastName: 'Brooks',
    age: 36,
    plan: 'foundation',
    displayHandle: 'TanyaB',
  },
  {
    email: 'david.demo@hhh-demo.com',
    firstName: 'David',
    lastName: 'Thompson',
    age: 48,
    plan: 'program',
    displayHandle: 'DavidT',
  },
  {
    email: 'michelle.demo@hhh-demo.com',
    firstName: 'Michelle',
    lastName: 'Carter',
    age: 41,
    plan: 'foundation',
    displayHandle: 'MichelleC',
  },
  {
    email: 'james.demo@hhh-demo.com',
    firstName: 'James',
    lastName: 'Robinson',
    age: 55,
    plan: 'vip',
    displayHandle: 'JamesR',
  },
  {
    email: 'alicia.demo@hhh-demo.com',
    firstName: 'Alicia',
    lastName: 'Rivera',
    age: 29,
    plan: 'free',
    displayHandle: 'AliciaR',
  },
  {
    email: 'patricia.demo@hhh-demo.com',
    firstName: 'Patricia',
    lastName: 'Williams',
    age: 63,
    plan: 'vip',
    displayHandle: 'PatriciaW',
  },
]

const PASSWORD = 'DemoPass2026!'

// ── helpers ───────────────────────────────────────────────────────────────────
function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

// ── step 1: create auth users ─────────────────────────────────────────────────
async function createUsers() {
  console.log('\n── Step 1: Creating auth users ──')
  const userMap = {}

  for (const p of PERSONAS) {
    // Check if already exists
    const { data: existing } = await admin.auth.admin.listUsers()
    const found = existing?.users?.find(u => u.email === p.email)

    if (found) {
      console.log(`  SKIP ${p.email} (already exists, id: ${found.id})`)
      userMap[p.email] = found.id
      continue
    }

    const { data, error } = await admin.auth.admin.createUser({
      email: p.email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: {
        first_name: p.firstName,
        last_name: p.lastName,
        age: p.age,
        display_handle: p.displayHandle,
      },
    })

    if (error) {
      console.error(`  ERROR creating ${p.email}:`, error.message)
      continue
    }

    console.log(`  OK   ${p.email} -> ${data.user.id}`)
    userMap[p.email] = data.user.id
  }

  return userMap
}

// ── step 2: update profiles with plan + age + display_handle ──────────────────
async function updateProfiles(userMap) {
  console.log('\n── Step 2: Updating profiles ──')

  for (const p of PERSONAS) {
    const uid = userMap[p.email]
    if (!uid) continue

    const { error } = await admin
      .from('profiles')
      .update({ plan: p.plan, age: p.age, display_handle: p.displayHandle })
      .eq('id', uid)

    if (error) {
      console.error(`  ERROR updating profile for ${p.email}:`, error.message)
    } else {
      console.log(`  OK   ${p.firstName} -> plan=${p.plan}`)
    }
  }
}

// ── step 3: seed feed posts ───────────────────────────────────────────────────
async function seedPosts(userMap) {
  console.log('\n── Step 3: Seeding feed posts ──')

  const posts = [
    {
      email: 'keisha.demo@hhh-demo.com',
      content:
        "Hi everyone, I'm Keisha. My doctor told me my BP was 142/88 and handed me a prescription. I asked why it was high - she said she didn't know. I'm here to actually figure that out.",
      post_type: 'check_in',
      room: 'wins',
      created_at: daysAgo(14),
    },
    {
      email: 'marcus.demo@hhh-demo.com',
      content:
        "Day 14 water goal complete. Not sure if it's making a difference yet but I'm paying attention. Logged 128/82 this morning vs 138/90 two weeks ago.",
      post_type: 'check_in',
      room: 'wins',
      created_at: daysAgo(11),
    },
    {
      email: 'sandra.demo@hhh-demo.com',
      content:
        "Does anyone else feel like their numbers are all connected? BP, blood sugar, energy crashes - I feel like I need someone to explain how they fit together.",
      post_type: 'check_in',
      room: 'general',
      created_at: daysAgo(10),
    },
    {
      email: 'tanya.demo@hhh-demo.com',
      content:
        "I run 4 days a week, eat mostly whole foods, don't smoke. My cardiologist says my BP is 'borderline.' What am I missing?",
      post_type: 'check_in',
      room: 'questions',
      created_at: daysAgo(9),
    },
    {
      email: 'david.demo@hhh-demo.com',
      content:
        "First week of cutting processed sodium. Went from averaging 148/92 to 139/88. Small but I'll take it. The supplement timing tip in the protocol actually helped.",
      post_type: 'check_in',
      room: 'wins',
      created_at: daysAgo(8),
    },
    {
      email: 'michelle.demo@hhh-demo.com',
      content:
        "Day 21 check-in. Morning reading: 124/79. Down from 156/94 when I started. This community is the only reason I didn't quit after week 2.",
      post_type: 'check_in',
      room: 'wins',
      created_at: daysAgo(5),
    },
    {
      email: 'james.demo@hhh-demo.com',
      content:
        "On three BP meds. My goal is to understand my body well enough to have a real conversation with my cardiologist about what's driving this. Not just manage it. Understand it.",
      post_type: 'check_in',
      room: 'general',
      created_at: daysAgo(7),
    },
    {
      email: 'alicia.demo@hhh-demo.com',
      content:
        "Found out my BP is 158/96 at my last checkup. I'm 29. I thought this was an older person thing. Reading everything I can find. Just signed up.",
      post_type: 'check_in',
      room: 'wins',
      created_at: daysAgo(3),
    },
    {
      email: 'patricia.demo@hhh-demo.com',
      content:
        "5 years managing this. What I know now that I wish I knew then: the numbers are just data. What moves them is the real education. Happy to answer questions for anyone new.",
      post_type: 'check_in',
      room: 'wins',
      created_at: daysAgo(6),
    },
    {
      email: 'michelle.demo@hhh-demo.com',
      content:
        "Week 3 complete. Logging everything. Magnesium before bed has been a game changer for my morning readings. Down 8 points systolic this month.",
      post_type: 'check_in',
      room: 'wins',
      created_at: daysAgo(2),
    },
    {
      email: 'marcus.demo@hhh-demo.com',
      content:
        "Question: for those tracking BP at home, morning or evening readings? I get wildly different numbers depending on when I check.",
      post_type: 'check_in',
      room: 'questions',
      created_at: daysAgo(4),
    },
  ]

  const postIds = {}

  for (const p of posts) {
    const uid = userMap[p.email]
    if (!uid) continue

    const { data, error } = await admin
      .from('feed_posts')
      .insert({
        user_id: uid,
        content: p.content,
        post_type: p.post_type,
        room: p.room,
        created_at: p.created_at,
      })
      .select('id')
      .single()

    if (error) {
      console.error(`  ERROR inserting post for ${p.email}:`, error.message)
    } else {
      console.log(`  OK   post by ${p.email.split('.')[0]} in #${p.room}`)
      // Store first post per user for comment targeting
      if (!postIds[p.email]) postIds[p.email] = data.id
    }
  }

  return postIds
}

// ── step 4: seed comments ─────────────────────────────────────────────────────
async function seedComments(userMap, postIds) {
  console.log('\n── Step 4: Seeding comments ──')

  const comments = [
    {
      commenterEmail: 'patricia.demo@hhh-demo.com',
      postOwnerEmail: 'alicia.demo@hhh-demo.com',
      content: "You're in the right place. Ask anything.",
      created_at: daysAgo(2),
    },
    {
      commenterEmail: 'michelle.demo@hhh-demo.com',
      postOwnerEmail: 'keisha.demo@hhh-demo.com',
      content: 'Same story for me. The WHY is everything.',
      created_at: daysAgo(13),
    },
    {
      commenterEmail: 'marcus.demo@hhh-demo.com',
      postOwnerEmail: 'sandra.demo@hhh-demo.com',
      content:
        "The ROOTS framework is literally about this - how it all connects. Check the protocol page.",
      created_at: daysAgo(9),
    },
    {
      commenterEmail: 'david.demo@hhh-demo.com',
      postOwnerEmail: 'james.demo@hhh-demo.com',
      content: "That's exactly my goal too. Understand it, not just suppress it.",
      created_at: daysAgo(6),
    },
    {
      commenterEmail: 'keisha.demo@hhh-demo.com',
      postOwnerEmail: 'michelle.demo@hhh-demo.com',
      content: '156 to 124 in 3 weeks?! This is exactly what I needed to see today.',
      created_at: daysAgo(4),
    },
    {
      commenterEmail: 'patricia.demo@hhh-demo.com',
      postOwnerEmail: 'marcus.demo@hhh-demo.com',
      content:
        "Both - but morning before coffee and meds gives you the cleaner baseline. Sit quietly for 5 min first.",
      created_at: daysAgo(3),
    },
    {
      commenterEmail: 'tanya.demo@hhh-demo.com',
      postOwnerEmail: 'david.demo@hhh-demo.com',
      content:
        "Nice win! Which supplement timing are you talking about? I haven't gotten to that module yet.",
      created_at: daysAgo(7),
    },
    {
      commenterEmail: 'sandra.demo@hhh-demo.com',
      postOwnerEmail: 'patricia.demo@hhh-demo.com',
      content:
        "5 years. I hope I can get there. What was the single biggest thing that moved the needle for you?",
      created_at: daysAgo(5),
    },
  ]

  for (const c of comments) {
    const commenterId = userMap[c.commenterEmail]
    const postId = postIds[c.postOwnerEmail]
    if (!commenterId || !postId) {
      console.log(`  SKIP comment (missing user or post for ${c.commenterEmail} -> ${c.postOwnerEmail})`)
      continue
    }

    const { error } = await admin.from('feed_comments').insert({
      post_id: postId,
      user_id: commenterId,
      content: c.content,
      created_at: c.created_at,
    })

    if (error) {
      console.error(`  ERROR comment by ${c.commenterEmail}:`, error.message)
    } else {
      console.log(`  OK   ${c.commenterEmail.split('.')[0]} -> ${c.postOwnerEmail.split('.')[0]}'s post`)
    }
  }
}

// ── step 5: seed likes ────────────────────────────────────────────────────────
async function seedLikes(userMap, postIds) {
  console.log('\n── Step 5: Seeding likes ──')

  // Build cross-like grid: each user likes posts from different users
  const likeMatrix = [
    ['michelle.demo@hhh-demo.com', 'keisha.demo@hhh-demo.com'],
    ['keisha.demo@hhh-demo.com', 'michelle.demo@hhh-demo.com'],
    ['patricia.demo@hhh-demo.com', 'alicia.demo@hhh-demo.com'],
    ['marcus.demo@hhh-demo.com', 'michelle.demo@hhh-demo.com'],
    ['david.demo@hhh-demo.com', 'michelle.demo@hhh-demo.com'],
    ['tanya.demo@hhh-demo.com', 'michelle.demo@hhh-demo.com'],
    ['alicia.demo@hhh-demo.com', 'patricia.demo@hhh-demo.com'],
    ['james.demo@hhh-demo.com', 'patricia.demo@hhh-demo.com'],
    ['sandra.demo@hhh-demo.com', 'patricia.demo@hhh-demo.com'],
    ['michelle.demo@hhh-demo.com', 'marcus.demo@hhh-demo.com'],
    ['patricia.demo@hhh-demo.com', 'marcus.demo@hhh-demo.com'],
    ['keisha.demo@hhh-demo.com', 'david.demo@hhh-demo.com'],
    ['marcus.demo@hhh-demo.com', 'david.demo@hhh-demo.com'],
    ['patricia.demo@hhh-demo.com', 'keisha.demo@hhh-demo.com'],
    ['james.demo@hhh-demo.com', 'keisha.demo@hhh-demo.com'],
    ['sandra.demo@hhh-demo.com', 'keisha.demo@hhh-demo.com'],
  ]

  for (const [likerEmail, postOwnerEmail] of likeMatrix) {
    const likerId = userMap[likerEmail]
    const postId = postIds[postOwnerEmail]
    if (!likerId || !postId) continue

    const { error } = await admin.from('feed_likes').insert({
      post_id: postId,
      user_id: likerId,
    })

    if (error && !error.message.includes('duplicate')) {
      console.error(`  ERROR like by ${likerEmail}:`, error.message)
    } else if (!error) {
      console.log(`  OK   ${likerEmail.split('.')[0]} liked ${postOwnerEmail.split('.')[0]}'s post`)
    }
  }
}

// ── step 6: seed BP readings ──────────────────────────────────────────────────
async function seedBPReadings(userMap) {
  console.log('\n── Step 6: Seeding BP readings (3 personas, 3 weeks) ──')

  const bpData = [
    // Keisha: high to improving
    { email: 'keisha.demo@hhh-demo.com', readings: [
      { sys: 148, dia: 92, daysBack: 21 },
      { sys: 145, dia: 90, daysBack: 19 },
      { sys: 143, dia: 89, daysBack: 17 },
      { sys: 141, dia: 88, daysBack: 15 },
      { sys: 139, dia: 86, daysBack: 13 },
      { sys: 136, dia: 85, daysBack: 11 },
      { sys: 134, dia: 83, daysBack: 9 },
      { sys: 132, dia: 82, daysBack: 7 },
      { sys: 130, dia: 81, daysBack: 5 },
      { sys: 128, dia: 82, daysBack: 3 },
      { sys: 127, dia: 80, daysBack: 1 },
    ]},
    // Tanya: borderline, slowly improving
    { email: 'tanya.demo@hhh-demo.com', readings: [
      { sys: 138, dia: 88, daysBack: 21 },
      { sys: 136, dia: 87, daysBack: 18 },
      { sys: 135, dia: 86, daysBack: 15 },
      { sys: 133, dia: 85, daysBack: 12 },
      { sys: 131, dia: 83, daysBack: 9 },
      { sys: 129, dia: 82, daysBack: 6 },
      { sys: 127, dia: 80, daysBack: 3 },
    ]},
    // James: Stage 2, modest improvement
    { email: 'james.demo@hhh-demo.com', readings: [
      { sys: 168, dia: 100, daysBack: 21 },
      { sys: 165, dia: 98, daysBack: 18 },
      { sys: 162, dia: 97, daysBack: 15 },
      { sys: 160, dia: 96, daysBack: 12 },
      { sys: 158, dia: 95, daysBack: 9 },
      { sys: 156, dia: 93, daysBack: 6 },
      { sys: 154, dia: 92, daysBack: 3 },
    ]},
  ]

  for (const person of bpData) {
    const uid = userMap[person.email]
    if (!uid) continue

    for (const r of person.readings) {
      const { error } = await admin.from('blood_pressure_logs').insert({
        user_id: uid,
        systolic: r.sys,
        diastolic: r.dia,
        logged_at: daysAgo(r.daysBack),
      })
      if (error) {
        console.error(`  ERROR BP for ${person.email}:`, error.message)
      }
    }
    console.log(`  OK   ${person.email.split('.')[0]} - ${person.readings.length} readings seeded`)
  }
}

// ── main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Hunter\'s Holistic Health - Demo User Seed')
  console.log('==========================================')

  const userMap = await createUsers()
  await updateProfiles(userMap)
  const postIds = await seedPosts(userMap)
  await seedComments(userMap, postIds)
  await seedLikes(userMap, postIds)
  await seedBPReadings(userMap)

  console.log('\n==========================================')
  console.log('Done. Demo accounts ready:')
  for (const p of PERSONAS) {
    const uid = userMap[p.email]
    console.log(`  ${p.email} (${p.plan}) ${uid ? '[created]' : '[FAILED]'}`)
  }
  console.log('\nPassword for all accounts: DemoPass2026!')
  console.log('\nCleanup when done:')
  console.log("  DELETE FROM auth.users WHERE email LIKE '%@hhh-demo.com';")
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
