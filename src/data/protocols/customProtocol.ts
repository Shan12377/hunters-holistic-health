import type { ProtocolData } from './types'

export const CUSTOM_PROTOCOL_TEMPLATE: ProtocolData = {
  type: 'custom',
  pillars: [
    {
      id: 'R',
      letter: 'R',
      title: 'Review',
      subtitle: 'Labs, history, and baseline assessment',
      sections: [
        {
          id: 'r-labs',
          title: 'Baseline Labs',
          description: 'Key markers for this client',
          phase: 0,
          shared: false,
          items: [
            { id: 'r-l1', text: 'Lab marker 1', checked: false, shared: false },
            { id: 'r-l2', text: 'Lab marker 2', checked: false, shared: false },
            { id: 'r-l3', text: 'Lab marker 3', checked: false, shared: false },
            { id: 'r-l4', text: 'Lab marker 4', checked: false, shared: false },
            { id: 'r-l5', text: 'Lab marker 5', checked: false, shared: false },
          ],
        },
        {
          id: 'r-tracking',
          title: 'Tracking',
          description: 'Daily or weekly metrics to monitor',
          phase: 0,
          shared: false,
          items: [
            { id: 'r-t1', text: 'Metric 1', timing: 'Daily', checked: false, shared: false },
            { id: 'r-t2', text: 'Metric 2', timing: 'Daily', checked: false, shared: false },
            { id: 'r-t3', text: 'Metric 3', timing: 'Weekly', checked: false, shared: false },
          ],
        },
      ],
    },
    {
      id: 'O1',
      letter: 'O',
      title: 'Nutrition',
      subtitle: 'Personalized nutrition protocol',
      sections: [
        {
          id: 'o1-phase0',
          title: 'Foundation Phase',
          description: 'Nutritional foundations for this protocol',
          phase: 0,
          shared: false,
          items: [
            { id: 'o1-f1', text: 'Nutrition item 1', timing: 'Daily', checked: false, shared: false },
            { id: 'o1-f2', text: 'Nutrition item 2', timing: 'Daily', checked: false, shared: false },
            { id: 'o1-f3', text: 'Nutrition item 3', timing: 'Daily', checked: false, shared: false },
            { id: 'o1-f4', text: 'Nutrition item 4', timing: 'Daily', checked: false, shared: false },
            { id: 'o1-f5', text: 'Nutrition item 5', timing: 'Daily', checked: false, shared: false },
          ],
        },
        {
          id: 'o1-phase1',
          title: 'Phase 1',
          description: 'Phase 1 nutrition strategy',
          phase: 1,
          shared: false,
          items: [
            { id: 'o1-p1-1', text: 'Phase 1 nutrition item 1', timing: 'Daily', checked: false, shared: false },
            { id: 'o1-p1-2', text: 'Phase 1 nutrition item 2', timing: 'Daily', checked: false, shared: false },
            { id: 'o1-p1-3', text: 'Phase 1 nutrition item 3', timing: 'Daily', checked: false, shared: false },
          ],
        },
        {
          id: 'o1-phase2',
          title: 'Phase 2',
          description: 'Phase 2 nutrition strategy',
          phase: 2,
          shared: false,
          items: [
            { id: 'o1-p2-1', text: 'Phase 2 nutrition item 1', timing: 'Daily', checked: false, shared: false },
            { id: 'o1-p2-2', text: 'Phase 2 nutrition item 2', timing: 'Daily', checked: false, shared: false },
            { id: 'o1-p2-3', text: 'Phase 2 nutrition item 3', timing: 'Daily', checked: false, shared: false },
          ],
        },
        {
          id: 'o1-phase3',
          title: 'Phase 3',
          description: 'Phase 3 maintenance nutrition',
          phase: 3,
          shared: false,
          items: [
            { id: 'o1-p3-1', text: 'Phase 3 nutrition item 1', timing: 'Ongoing', checked: false, shared: false },
            { id: 'o1-p3-2', text: 'Phase 3 nutrition item 2', timing: 'Ongoing', checked: false, shared: false },
          ],
        },
      ],
    },
    {
      id: 'O2',
      letter: 'O',
      title: 'Supplements',
      subtitle: 'Personalized supplement protocol',
      sections: [
        {
          id: 'o2-phase1',
          title: 'Phase 1 Supplements',
          description: 'Phase 1 supplement protocol',
          phase: 1,
          shared: false,
          items: [
            { id: 'o2-p1-1', text: 'Supplement 1', dose: 'Dose', timing: 'Timing', checked: false, shared: false },
            { id: 'o2-p1-2', text: 'Supplement 2', dose: 'Dose', timing: 'Timing', checked: false, shared: false },
            { id: 'o2-p1-3', text: 'Supplement 3', dose: 'Dose', timing: 'Timing', checked: false, shared: false },
            { id: 'o2-p1-4', text: 'Supplement 4', dose: 'Dose', timing: 'Timing', checked: false, shared: false },
          ],
        },
        {
          id: 'o2-phase2',
          title: 'Phase 2 Supplements',
          description: 'Phase 2 supplement protocol',
          phase: 2,
          shared: false,
          items: [
            { id: 'o2-p2-1', text: 'Supplement 1', dose: 'Dose', timing: 'Timing', checked: false, shared: false },
            { id: 'o2-p2-2', text: 'Supplement 2', dose: 'Dose', timing: 'Timing', checked: false, shared: false },
            { id: 'o2-p2-3', text: 'Supplement 3', dose: 'Dose', timing: 'Timing', checked: false, shared: false },
          ],
        },
        {
          id: 'o2-phase3',
          title: 'Phase 3 / Maintenance Supplements',
          description: 'Long-term supplement maintenance',
          phase: 3,
          shared: false,
          items: [
            { id: 'o2-p3-1', text: 'Supplement 1', dose: 'Dose', timing: 'Timing', checked: false, shared: false },
            { id: 'o2-p3-2', text: 'Supplement 2', dose: 'Dose', timing: 'Timing', checked: false, shared: false },
          ],
        },
      ],
    },
    {
      id: 'T',
      letter: 'T',
      title: 'Lifestyle',
      subtitle: 'Personalized lifestyle protocol',
      sections: [
        {
          id: 't-movement',
          title: 'Movement',
          description: 'Exercise protocol',
          phase: 0,
          shared: false,
          items: [
            { id: 't-m1', text: 'Movement item 1', timing: 'Daily', checked: false, shared: false },
            { id: 't-m2', text: 'Movement item 2', timing: '3-4x weekly', checked: false, shared: false },
            { id: 't-m3', text: 'Movement item 3', timing: 'Weekly', checked: false, shared: false },
          ],
        },
        {
          id: 't-sleep',
          title: 'Sleep',
          description: 'Sleep protocol',
          phase: 0,
          shared: false,
          items: [
            { id: 't-sl1', text: 'Sleep item 1', timing: 'Nightly', checked: false, shared: false },
            { id: 't-sl2', text: 'Sleep item 2', timing: 'Nightly', checked: false, shared: false },
          ],
        },
        {
          id: 't-stress',
          title: 'Stress Management',
          description: 'Stress reduction protocol',
          phase: 0,
          shared: false,
          items: [
            { id: 't-s1', text: 'Stress item 1', timing: 'Daily', checked: false, shared: false },
            { id: 't-s2', text: 'Stress item 2', timing: 'Daily', checked: false, shared: false },
          ],
        },
      ],
    },
    {
      id: 'S',
      letter: 'S',
      title: 'Sustain',
      subtitle: 'Long-term maintenance and monitoring',
      sections: [
        {
          id: 's-monitor',
          title: 'Monitoring',
          description: 'Ongoing check-ins and lab retesting',
          phase: 3,
          shared: false,
          items: [
            { id: 's-m1', text: 'Retest labs at 90 days', timing: '90 days', checked: false, shared: false },
            { id: 's-m2', text: 'Monthly check-in with educator', timing: 'Monthly', checked: false, shared: false },
            { id: 's-m3', text: 'Annual comprehensive review', timing: 'Annually', checked: false, shared: false },
          ],
        },
        {
          id: 's-maintenance',
          title: 'Maintenance Protocol',
          description: 'Minimum effective dose for long-term results',
          phase: 3,
          shared: false,
          items: [
            { id: 's-mn1', text: 'Maintenance item 1', timing: 'Ongoing', checked: false, shared: false },
            { id: 's-mn2', text: 'Maintenance item 2', timing: 'Ongoing', checked: false, shared: false },
            { id: 's-mn3', text: 'Maintenance item 3', timing: 'Ongoing', checked: false, shared: false },
          ],
        },
      ],
    },
  ],
}
