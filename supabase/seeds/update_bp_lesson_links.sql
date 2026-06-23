-- Update: Add "3 Simple Exercises to Lower Blood Pressure" link to Lesson 4
-- Run in Supabase SQL Editor > New Query.

DO $$
DECLARE
  v_course_id uuid;
BEGIN

  SELECT id INTO v_course_id
  FROM public.courses
  WHERE title = 'The One Thing the Medication Can''t Do for You'
  LIMIT 1;

  UPDATE public.course_modules
  SET notes =
    'WHAT THE RESEARCH ACTUALLY SAYS

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

WATCH THESE

Wall sit form: https://www.youtube.com/shorts/Nh5XijaZrm8
3 Simple Exercises to Help Lower Blood Pressure: https://www.youtube.com/watch?v=dbu2bGNZRl4
Additional technique reference: https://youtu.be/wfCo6ksUex0

A NOTE ON GLUCOSE

Dynamic squats (15 reps, 3 to 4 times daily) are most effective in the post-meal window because they act as a glucose sink. The two movements serve different purposes. Use both.

Source: BJSM 2023 Meta-Analysis on exercise training and resting blood pressure. Educational use only. Not a substitute for medical evaluation or treatment.'
  WHERE course_id = v_course_id AND sort_order = 3;

END $$;
