-- Seed: "The One Thing the Medication Can't Do for You"
-- Course: 5 lessons on movement, muscle preservation, GLP-1 context,
--         blood pressure, and blood sugar interruption.
--
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query).
-- After running, go to Manage Classroom and toggle the course to Unlocked.

DO $$
DECLARE
  v_course_id   uuid;
  v_educator_id uuid;
BEGIN

  -- Find the educator account to set as course owner
  SELECT id INTO v_educator_id
  FROM public.profiles
  WHERE role = 'educator'
  LIMIT 1;

  -- Create the course (locked by default; unlock from Manage Classroom)
  INSERT INTO public.courses (
    id, created_by, title, description, sort_order, is_locked
  ) VALUES (
    gen_random_uuid(),
    v_educator_id,
    'The One Thing the Medication Can''t Do for You',
    'An evidence-informed look at why movement is the missing piece in GLP-1 therapy, insulin resistance management, and blood pressure control.',
    10,
    true
  )
  RETURNING id INTO v_course_id;


  -- Lesson 1: What the Trials Actually Found
  INSERT INTO public.course_modules (
    course_id, title, youtube_url, notes, sort_order
  ) VALUES (
    v_course_id,
    'What the Trials Actually Found',
    null,
    'The STEP and SURMOUNT trials are two of the largest clinical studies on GLP-1 receptor agonists to date.

Here is a number that does not get discussed enough: 25 to 40 percent of the weight lost during GLP-1 therapy is lean soft tissue. That includes muscle, water, glycogen, and organ mass measured by DEXA.

Not pure muscle. But enough to matter clinically.

GLP-1 medications reduce appetite significantly. For most people, that also means reduced protein intake, because eating less usually means eating less of everything. Without a consistent resistance stimulus, the body has no strong reason to preserve muscle while shedding weight.

This is not an argument against GLP-1 therapy if it is appropriate for you. It is an argument for having a movement strategy alongside it.

The research is there. Most conversations just skip past it.',
    0
  );


  -- Lesson 2: Why Muscle Is Your Metabolic Engine
  INSERT INTO public.course_modules (
    course_id, title, youtube_url, notes, sort_order
  ) VALUES (
    v_course_id,
    'Why Muscle Is Your Metabolic Engine',
    null,
    'Muscle is your primary glucose disposal tissue.

Every time you contract a muscle, glucose moves from your bloodstream into the cell. This pathway operates independently of insulin. The more muscle you carry, the more efficiently your body handles glucose from every meal.

When lean tissue decreases, that disposal capacity decreases with it. If a GLP-1 medication is improving your insulin signaling at the same time, you are gaining on one side and losing ground on the other.

There is a second issue. Muscle is metabolically active at rest. A lower muscle mass means a lower resting metabolic rate, which means your body burns fewer calories around the clock. For anyone who will eventually reduce or stop GLP-1 therapy, this makes weight regain significantly more likely.

This is not a scare tactic. It is the reason building and preserving muscle is not optional when managing metabolic health.',
    1
  );


  -- Lesson 3: The Minimum Effective Dose
  INSERT INTO public.course_modules (
    course_id, title, youtube_url, notes, sort_order
  ) VALUES (
    v_course_id,
    'The Minimum Effective Dose for Muscle Preservation',
    null,
    'You do not need to spend two hours in the gym. The evidence points to a specific minimum that makes a real difference.

Resistance training 2 to 3 times per week. Weights, resistance bands, and bodyweight exercises all count as long as you are progressively increasing the challenge over time.

A 10 to 20 minute walk after your largest meal daily. Post-meal muscle contraction pulls glucose out of circulation before it can spike. This is not about burning calories. It is about timing.

Protein at or above your daily target, every day. Most people eating in a GLP-1 deficit undereat protein by default. This requires deliberate attention.

25 to 30 grams of protein within 2 hours of your workout. This is the muscle protein synthesis window. Missing it consistently reduces the return on your training.

The medication is doing significant metabolic work. But it cannot create a training stimulus. That part has always been yours.

This is an educational resource. Coordinate any new exercise program with your healthcare provider before starting.',
    2
  );


  -- Lesson 4: Blood Pressure: The Wall Sit Protocol
  INSERT INTO public.course_modules (
    course_id, title, youtube_url, notes, sort_order
  ) VALUES (
    v_course_id,
    'Blood Pressure: The Wall Sit Protocol',
    'https://www.youtube.com/shorts/Nh5XijaZrm8',
    'A 2023 meta-analysis in the British Journal of Sports Medicine compared every major exercise category for blood pressure reduction.

Isometric training, specifically the wall sit, was the top performer.

Wall sits produced an average reduction of 10.5 systolic and 5.3 diastolic mmHg. Dynamic cardio, the standard recommendation, averaged 4.6 systolic and 3.0 diastolic.

The mechanism: during a static hold, blood vessels are compressed under sustained muscle contraction. When you release, blood rushes back in and triggers a significant release of nitric oxide, a compound that relaxes the vessel wall.

The Protocol: 4 sets of 2-minute wall sits, 3 times per week. Rest 2 minutes between each set. You can spread the 4 sets across the day if your schedule requires it.

A separate note on glucose: dynamic squats (15 reps, 3 to 4 times daily) are best saved for the post-meal window because they pull glucose out of circulation. Each movement type has a different primary purpose.

Source: BJSM 2023 Meta-Analysis on exercise training and resting blood pressure. Educational use only. This is not a substitute for medical evaluation or treatment.',
    3
  );


  -- Lesson 5: Blood Sugar: The 45-Minute Rule
  INSERT INTO public.course_modules (
    course_id, title, youtube_url, notes, sort_order
  ) VALUES (
    v_course_id,
    'Blood Sugar: The 45-Minute Rule',
    'https://www.youtube.com/watch?v=CyHKGCmXW7o',
    'A study published in the Scandinavian Journal of Medicine and Science in Sports tested what happens when you interrupt long periods of sitting with brief movement.

The result: participants who did 3 minutes of walking or 10 bodyweight squats every 45 minutes had better blood sugar control than those who remained seated, and also better than those who did a single 30-minute walk.

The reason is direct. Your quadriceps and glutes are among the largest muscle groups in the body. When they contract, they pull glucose out of your bloodstream without requiring insulin. A continuous sit lets blood sugar slowly accumulate between meals. Short movement bursts blunt that accumulation in real time.

The application is simple. Set a timer for every 45 minutes. Get up and walk for 3 minutes, or do 10 squats. That is the full intervention.

This does not replace structured exercise. It fills the gaps between sessions.

Source: doi.org/10.1111/sms.14628. Educational use only. Not medical advice.',
    4
  );

END $$;
