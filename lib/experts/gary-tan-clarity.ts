/**
 * Gary Tan's Product Clarity Framework
 * Core Test: Can you see the value in 5 minutes?
 */

// 1. The Gary Tan 5-Minute Test
export const GARY_TAN_TEST = {
  // 5-minute value demonstration breakdown
  timeline: {
    minute1: 'Understand the problem',
    minute2: 'See the solution in action', 
    minute3: 'Realize personal benefit',
    minute4: 'Understand how it works',
    minute5: 'Feel confident to try'
  },
  
  // Clarity requirements
  clarity: {
    headline: 'One clear benefit in 7 words or less',
    demo: 'Show, don\'t tell the value',
    proof: 'Concrete numbers, not vague claims',
    next: 'Obvious next step to get value'
  }
};

// 2. Instant Value Demonstration
export const INSTANT_VALUE_DEMO = {
  // Homepage value hierarchy (Gary's structure)
  hierarchy: [
    {
      level: 'Headline',
      content: 'Stop doing customer support',
      clarity: 'Immediate understanding of benefit'
    },
    {
      level: 'Subheadline', 
      content: 'AI handles 95% of tickets, you focus on growth',
      clarity: 'Specific outcome with concrete number'
    },
    {
      level: 'Proof',
      content: '500+ founders save 12 hours/week',
      clarity: 'Social proof with measurable benefit'
    },
    {
      level: 'Action',
      content: 'See your savings in 5 minutes →',
      clarity: 'Time-bound, specific next step'
    }
  ]
};

// 3. Gary's Progressive Disclosure Method
export const PROGRESSIVE_DISCLOSURE = {
  // Layer 1: Hook (10 seconds)
  hook: {
    headline: 'Stop doing customer support',
    visual: 'Dashboard showing $18K saved',
    emotion: 'Relief from support burden'
  },
  
  // Layer 2: Proof (30 seconds)
  proof: {
    stats: '95% auto-resolution, 12 hours saved/week',
    testimonial: '"I haven\'t touched a ticket in 4 months"',
    logos: 'YC companies using SupportIQ'
  },
  
  // Layer 3: How (2 minutes)
  how: {
    step1: 'Connect your support tool',
    step2: 'AI analyzes all tickets',
    step3: 'Get savings report + automation'
  },
  
  // Layer 4: Why Now (2 minutes)
  why: {
    cost: 'Support costs grow faster than revenue',
    time: 'Founders spend 40% of time on support',
    opportunity: 'Competitors are automating first'
  },
  
  // Layer 5: Get Started (30 seconds)
  action: {
    trial: 'Start free trial',
    demo: 'See live demo',
    talk: 'Book founder call'
  }
};

// 4. Clarity Testing Framework
export const CLARITY_TESTS = {
  // Gary's famous tests
  tests: [
    {
      name: 'Grandma Test',
      question: 'Can your grandma understand what you do?',
      target: 'Yes, in one sentence'
    },
    {
      name: '5-Second Test',
      question: 'What does this company do?',
      target: '100% correct answers'
    },
    {
      name: 'Elevator Test',
      question: 'Can you explain value in elevator ride?',
      target: 'Clear problem + solution + benefit'
    },
    {
      name: 'Drunk Test',
      question: 'Can you explain when drunk?',
      target: 'Still makes perfect sense'
    }
  ]
};

// 5. Visual Clarity Principles
export const VISUAL_CLARITY = {
  // Gary's visual hierarchy rules
  hierarchy: {
    headline: 'Largest, boldest text',
    benefit: 'Second largest, different color',
    proof: 'Smaller but prominent',
    action: 'Bright button, clear text'
  },
  
  // Cognitive load reduction
  cognitiveLoad: {
    maxChoices: 3, // Never more than 3 options
    maxSections: 5, // 5 sections max per page
    maxWords: 7, // 7 words max per headline
    maxSteps: 3 // 3 steps max to get value
  },
  
  // Attention direction
  attention: {
    primary: 'One clear focal point per section',
    secondary: 'Supporting elements fade into background',
    flow: 'Clear reading path from top to action'
  }
};

// 6. Gary's Messaging Framework
export const MESSAGING_FRAMEWORK = {
  // Before/After clarity
  beforeAfter: {
    before: 'Drowning in support tickets',
    after: 'Support runs itself',
    bridge: 'AI automation + expert backup'
  },
  
  // Problem/Solution fit
  problemSolution: {
    problem: 'Support costs crushing your margins',
    agitation: 'Getting worse as you grow',
    solution: 'AI handles 95% automatically',
    result: 'Save $18K/month, gain 12 hours/week'
  },
  
  // Feature/Benefit translation
  featureBenefit: {
    'AI ticket analysis': 'Knows what customers need instantly',
    'Expert human backup': 'Never drop the ball on important issues',
    'Weekly insights': 'Know exactly how to improve your product',
    'Seamless integration': 'Working in 5 minutes, not 5 days'
  }
};

// 7. Demo Script (Gary's style)
export const DEMO_SCRIPT = {
  // 5-minute demo breakdown
  script: [
    {
      time: '0:00-0:30',
      content: 'Show problem: Support ticket chaos',
      goal: 'Recognize the pain'
    },
    {
      time: '0:30-1:30', 
      content: 'Upload tickets, show instant analysis',
      goal: 'See the magic happen'
    },
    {
      time: '1:30-2:30',
      content: 'Reveal savings: $18K/month potential',
      goal: 'Understand personal value'
    },
    {
      time: '2:30-3:30',
      content: 'Show automation: AI handling tickets',
      goal: 'See how it works'
    },
    {
      time: '3:30-4:30',
      content: 'Customer testimonial: Real results',
      goal: 'Build confidence'
    },
    {
      time: '4:30-5:00',
      content: 'Next step: Start free trial',
      goal: 'Take action'
    }
  ]
};

// 8. Conversion Optimization
export const CONVERSION_OPTIMIZATION = {
  // Gary's conversion principles
  principles: {
    clarity: 'What happens when I click?',
    confidence: 'Is this safe/legit?',
    motivation: 'Why should I do this now?',
    friction: 'How hard is this to do?'
  },
  
  // Button optimization
  buttons: {
    text: ['Start Free Trial', 'See My Savings', 'Get Started'],
    color: 'High contrast, brand consistent',
    size: 'Large enough for thumb tap',
    placement: 'Above the fold, end of value prop'
  },
  
  // Form optimization
  forms: {
    fields: 'Minimum viable (email + company)',
    labels: 'Clear, benefit-focused',
    validation: 'Real-time, helpful',
    privacy: 'Obvious, trustworthy'
  }
};

// 9. Gary's User Testing Questions
export const USER_TESTING = {
  // Essential questions for clarity testing
  questions: [
    'What does this company do?',
    'Who is this for?', 
    'What would you get if you signed up?',
    'What would you do next?',
    'What concerns do you have?',
    'How much would you expect this to cost?',
    'Would you trust this company?'
  ],
  
  // Success criteria
  success: {
    comprehension: '100% understand value prop',
    target: '90% identify as target customer',
    action: '80% know what to do next',
    trust: '85% would feel comfortable trying'
  }
};