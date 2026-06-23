-- Update: Enrich classroom lesson notes and add exercise videos
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query).

DO $$
DECLARE
  v_course_id uuid;
BEGIN

  SELECT id INTO v_course_id
  FROM public.courses
  WHERE title = 'The One Thing the Medication Can''t Do for You'
  LIMIT 1;

  IF v_course_id IS NULL THEN
    RAISE EXCEPTION 'Course not found. Check the course title matches exactly.';
  END IF;


  -- Lesson 1: What the Trials Actually Found
  UPDATE public.course_modules
  SET
    youtube_url = null,
    notes = 'THE NUMBERS THE HEADLINES MISSED

The STEP and SURMOUNT trials are the largest clinical studies on GLP-1 receptor agonists to date. Everyone covered the weight loss results. Almost no one covered this part:

25 to 40 percent of the weight lost on GLP-1 therapy is lean soft tissue.

That includes muscle, water, glycogen, and organ mass measured by DEXA. Not pure muscle. But enough to matter clinically.

WHY THIS MATTERS TO YOU

GLP-1 medications suppress appetite powerfully. For most people, that also means less protein by default, because eating less usually means eating less of everything. Without a deliberate resistance stimulus, the body has no strong reason to hold on to muscle while losing weight.

This is not a case against GLP-1 therapy. It is the case for pairing it with a plan.

KEY TAKEAWAY

The number on the scale goes down. What comes off that scale matters just as much as how much comes off. Your job is to protect the tissue that keeps your metabolism working after the weight is gone.'
  WHERE course_id = v_course_id AND sort_order = 0;


  -- Lesson 2: Why Muscle Is Your Metabolic Engine
  UPDATE public.course_modules
  SET
    youtube_url = null,
    notes = 'THIS IS THE BIOLOGY THAT CHANGES EVERYTHING

Muscle is your primary glucose disposal tissue.

Every time you contract a muscle, glucose moves from your bloodstream into the cell. This happens through a pathway called GLUT4 translocation. It does not require insulin. The more muscle you carry, the more efficiently your body clears glucose from every meal.

WHAT HAPPENS WHEN YOU LOSE MUSCLE

When lean tissue decreases, that clearance capacity decreases with it. If a GLP-1 medication is improving your insulin signaling at the same time, you are gaining on one side and losing ground on the other.

There is a second issue. Muscle is metabolically active at rest. Less muscle means a lower resting metabolic rate, which means your body burns fewer calories around the clock. For anyone who eventually reduces or stops GLP-1 therapy, this makes weight regain significantly more likely.

THE BOTTOM LINE

This is not a warning to scare you. It is the reason building and preserving muscle is the most important lifestyle lever you have alongside any medication.

Muscle is not aesthetic. It is metabolic infrastructure.'
  WHERE course_id = v_course_id AND sort_order = 1;


  -- Lesson 3: The Minimum Effective Dose (+ Dead Bug starter video)
  UPDATE public.course_modules
  SET
    youtube_url = 'https://youtu.be/o4GKiEoYClI',
    notes = 'YOU DO NOT NEED HOURS IN THE GYM

The research is clear on what it takes to preserve and build muscle without overcomplicating it. Here is the minimum effective dose.

THE 4-PART PROTOCOL

1. Resistance training 2 to 3 times per week.
Weights, resistance bands, and bodyweight exercises all qualify. The requirement is progressive overload: make it slightly more challenging over time. Your body only holds on to muscle it has a reason to keep.

2. A 10 to 20 minute walk after your largest meal daily.
Post-meal muscle contraction pulls glucose out of circulation before it can spike. This is not about burning calories. It is about timing.

3. Protein at or above your daily target every single day.
Most people eating in a deficit undereat protein by default. This requires deliberate planning.

4. 25 to 30 grams of protein within 2 hours of your workout.
This is the muscle protein synthesis window. Missing it consistently reduces the return on every session you do.

WHERE TO START

The video above shows the Dead Bug, one of the most effective core exercises for beginners and advanced movers alike. It builds deep core stability, protects the lower back, and requires no equipment. It is a safe starting point for almost anyone returning to movement.

The medication is doing significant metabolic work. But it cannot create a training stimulus. That part has always been yours.

This is an educational resource. Coordinate any new exercise program with your healthcare provider before starting.'
  WHERE course_id = v_course_id AND sort_order = 2;


  -- Lesson 4: Blood Pressure: The Wall Sit Protocol
  UPDATE public.course_modules
  SET
    youtube_url = 'https://www.youtube.com/shorts/Nh5XijaZrm8',
    notes = 'WHAT THE RESEARCH ACTUALLY SAYS

A 2023 meta-analysis in the British Journal of Sports Medicine compared every major exercise category for blood pressure reduction. The results surprised most clinicians.

Isometric training, specifically the wall sit, outperformed every other exercise type.

THE NUMBERS

Wall sits: average 10.5 systolic / 5.3 diastolic mmHg reduction
Dynamic cardio (standard recommendation): 4.6 systolic / 3.0 diastolic
Dynamic resistance training: similar results to cardio

No other category came close.

WHY IT WORKS

During a static hold, sustained muscle contraction compresses blood vessels throughout the body. When you release, blood rushes back in and triggers a significant release of nitric oxide, a compound that relaxes vessel walls and reduces vascular resistance. That rebound is where the benefit lives.

THE PROTOCOL

4 sets of 2-minute wall sits, 3 times per week.
Rest exactly 2 minutes between sets.
You can spread the 4 sets across the day if your schedule requires it.

Watch the video above for form guidance. Additional technique reference: https://youtu.be/wfCo6ksUex0

A NOTE ON GLUCOSE

Dynamic squats (15 reps, 3 to 4 times daily) are most effective in the post-meal window because they act as a glucose sink. The two movements serve different purposes. Use both.

Source: BJSM 2023 Meta-Analysis on exercise training and resting blood pressure. Educational use only. Not a substitute for medical evaluation or treatment.'
  WHERE course_id = v_course_id AND sort_order = 3;


  -- Lesson 5: Blood Sugar: The 45-Minute Rule
  UPDATE public.course_modules
  SET
    youtube_url = 'https://www.youtube.com/watch?v=CyHKGCmXW7o',
    notes = 'A FINDING THAT CHALLENGES THE STANDARD ADVICE

A study published in the Scandinavian Journal of Medicine and Science in Sports asked a simple question: is it more effective to take a single 30-minute walk, or to move briefly throughout the day?

The answer changed the recommendation.

WHAT THE STUDY FOUND

Participants who did 3 minutes of walking or 10 bodyweight squats every 45 minutes had better blood sugar control than those who:
- Remained seated for the full period
- Took a single 30-minute walk

One long session could not replicate what consistent small interruptions did.

THE MECHANISM

Your quadriceps and glutes are among the largest muscle groups in the body. When they contract, they pull glucose out of your bloodstream through the GLUT4 pathway without requiring insulin. A continuous sit allows blood sugar to slowly accumulate between meals. Short movement bursts blunt that accumulation in real time.

YOUR IMPLEMENTATION

Set a timer for every 45 minutes.
When it goes off: walk for 3 minutes, or do 10 squats.
That is the full intervention.

Watch the video above for squat technique.

This does not replace structured exercise. It fills the gaps between sessions and targets the hours when blood sugar tends to drift most.

Source: doi.org/10.1111/sms.14628. Educational use only. Not medical advice.'
  WHERE course_id = v_course_id AND sort_order = 4;

END $$;
