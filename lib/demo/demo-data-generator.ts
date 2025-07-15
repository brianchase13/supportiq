interface DemoCompany {
  name: string;
  industry: string;
  size: 'startup' | 'sme' | 'enterprise';
  monthly_tickets: number;
  current_deflection: number;
  target_deflection: number;
  agent_count: number;
  avg_ticket_cost: number;
}

export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  company: DemoCompany;
  metrics: {
    tickets_processed: number;
    deflection_rate: number;
    monthly_savings: number;
    annual_savings: number;
    roi_percentage: number;
    payback_months: number;
    customer_satisfaction: number;
    response_time_improvement: number;
  };
  milestones: {
    achieved: string[];
    next: string;
    progress: number;
  };
  testimonial?: {
    quote: string;
    author: string;
    title: string;
    company: string;
  };
}

export class DemoDataGenerator {
  private scenarios: DemoScenario[] = [];

  constructor() {
    this.initializeScenarios();
  }

  private initializeScenarios() {
    this.scenarios = [
      {
        id: 'high-growth-startup',
        name: 'High-Growth Startup',
        description: 'Fast-growing SaaS startup with scaling support challenges',
        company: {
          name: 'TechFlow Solutions',
          industry: 'SaaS',
          size: 'startup',
          monthly_tickets: 380,
          current_deflection: 15,
          target_deflection: 68,
          agent_count: 3,
          avg_ticket_cost: 28
        },
        metrics: {
          tickets_processed: 1247,
          deflection_rate: 68,
          monthly_savings: 5630,
          annual_savings: 67560,
          roi_percentage: 5594,
          payback_months: 0.2,
          customer_satisfaction: 4.3,
          response_time_improvement: 73
        },
        milestones: {
          achieved: ['First $1K Saved', '100 Tickets Deflected', '50% Deflection Rate'],
          next: '10,000% ROI',
          progress: 85
        },
        testimonial: {
          quote: "SupportIQ helped us scale from 3 to 50 customers without hiring more support staff. The AI deflection saved us $67K in the first year alone.",
          author: "Sarah Chen",
          title: "Head of Customer Success",
          company: "TechFlow Solutions"
        }
      },
      {
        id: 'enterprise-scale',
        name: 'Enterprise Scale',
        description: 'Large enterprise with complex support operations',
        company: {
          name: 'GlobalCorp Industries',
          industry: 'Manufacturing',
          size: 'enterprise',
          monthly_tickets: 2400,
          current_deflection: 22,
          target_deflection: 75,
          agent_count: 18,
          avg_ticket_cost: 35
        },
        metrics: {
          tickets_processed: 8965,
          deflection_rate: 75,
          monthly_savings: 44520,
          annual_savings: 534240,
          roi_percentage: 5570,
          payback_months: 0.2,
          customer_satisfaction: 4.1,
          response_time_improvement: 68
        },
        milestones: {
          achieved: ['First $1K Saved', '100 Tickets Deflected', '50% Deflection Rate', '10,000% ROI'],
          next: '4.5+ Satisfaction',
          progress: 92
        },
        testimonial: {
          quote: "The ROI was immediate. We're saving over $500K annually while improving customer satisfaction. Our agents can now focus on complex issues that truly need human expertise.",
          author: "Michael Rodriguez",
          title: "VP of Customer Operations",
          company: "GlobalCorp Industries"
        }
      },
      {
        id: 'growing-business',
        name: 'Growing Business',
        description: 'Mid-market company optimizing support efficiency',
        company: {
          name: 'MarketEdge Analytics',
          industry: 'Analytics',
          size: 'sme',
          monthly_tickets: 850,
          current_deflection: 18,
          target_deflection: 72,
          agent_count: 7,
          avg_ticket_cost: 32
        },
        metrics: {
          tickets_processed: 3247,
          deflection_rate: 72,
          monthly_savings: 14688,
          annual_savings: 176256,
          roi_percentage: 4872,
          payback_months: 0.2,
          customer_satisfaction: 4.4,
          response_time_improvement: 81
        },
        milestones: {
          achieved: ['First $1K Saved', '100 Tickets Deflected', '50% Deflection Rate', '10,000% ROI'],
          next: '4.5+ Satisfaction',
          progress: 96
        },
        testimonial: {
          quote: "We achieved 72% deflection rate in just 3 months. The AI handles routine questions perfectly, and our team satisfaction has never been higher.",
          author: "Jennifer Park",
          title: "Customer Success Manager",
          company: "MarketEdge Analytics"
        }
      },
      {
        id: 'early-adopter',
        name: 'Early Adopter',
        description: 'Small team getting started with AI support automation',
        company: {
          name: 'DevTools Pro',
          industry: 'Developer Tools',
          size: 'startup',
          monthly_tickets: 180,
          current_deflection: 12,
          target_deflection: 65,
          agent_count: 2,
          avg_ticket_cost: 25
        },
        metrics: {
          tickets_processed: 542,
          deflection_rate: 58,
          monthly_savings: 2070,
          annual_savings: 24840,
          roi_percentage: 2053,
          payback_months: 0.6,
          customer_satisfaction: 4.2,
          response_time_improvement: 65
        },
        milestones: {
          achieved: ['First $1K Saved', '100 Tickets Deflected'],
          next: '50% Deflection Rate',
          progress: 87
        },
        testimonial: {
          quote: "As a small team, every hour saved matters. SupportIQ's automation lets us focus on building features instead of answering the same questions repeatedly.",
          author: "Alex Thompson",
          title: "Co-founder & CTO",
          company: "DevTools Pro"
        }
      }
    ];
  }

  getScenario(scenarioId: string): DemoScenario | null {
    return this.scenarios.find(s => s.id === scenarioId) || null;
  }

  getAllScenarios(): DemoScenario[] {
    return this.scenarios;
  }

  getRandomScenario(): DemoScenario {
    const randomIndex = Math.floor(Math.random() * this.scenarios.length);
    return this.scenarios[randomIndex];
  }

  getScenarioByCompanySize(size: 'startup' | 'sme' | 'enterprise'): DemoScenario[] {
    return this.scenarios.filter(s => s.company.size === size);
  }

  generateCustomScenario(params: {
    monthlyTickets: number;
    agentCount: number;
    industry: string;
    companyName: string;
  }): DemoScenario {
    const { monthlyTickets, agentCount, industry, companyName } = params;
    
    // Determine company size based on metrics
    let size: 'startup' | 'sme' | 'enterprise' = 'startup';
    if (monthlyTickets > 1000 || agentCount > 10) {
      size = 'enterprise';
    } else if (monthlyTickets > 400 || agentCount > 5) {
      size = 'sme';
    }

    const avgTicketCost = 25 + (size === 'enterprise' ? 10 : size === 'sme' ? 5 : 0);
    const currentDeflection = 12 + Math.random() * 10; // 12-22%
    const targetDeflection = 65 + Math.random() * 10; // 65-75%
    
    const deflectionImprovement = targetDeflection - currentDeflection;
    const ticketsDeflected = (monthlyTickets * deflectionImprovement) / 100;
    const monthlySavings = ticketsDeflected * avgTicketCost;
    const annualSavings = monthlySavings * 12;
    const roiPercentage = ((monthlySavings - 299) / 299) * 100; // Assuming $299/month plan
    
    return {
      id: 'custom-scenario',
      name: 'Custom Business',
      description: `${industry} company with ${agentCount} agents handling ${monthlyTickets} tickets/month`,
      company: {
        name: companyName,
        industry,
        size,
        monthly_tickets: monthlyTickets,
        current_deflection: Math.round(currentDeflection),
        target_deflection: Math.round(targetDeflection),
        agent_count: agentCount,
        avg_ticket_cost: avgTicketCost
      },
      metrics: {
        tickets_processed: Math.round(monthlyTickets * 3.2), // ~3 months of data
        deflection_rate: Math.round(targetDeflection),
        monthly_savings: Math.round(monthlySavings),
        annual_savings: Math.round(annualSavings),
        roi_percentage: Math.round(roiPercentage),
        payback_months: roiPercentage > 1000 ? 0.2 : 1.2,
        customer_satisfaction: 4.0 + Math.random() * 0.5,
        response_time_improvement: 50 + Math.random() * 30
      },
      milestones: {
        achieved: monthlySavings > 5000 ? 
          ['First $1K Saved', '100 Tickets Deflected', '50% Deflection Rate'] :
          monthlySavings > 1000 ?
          ['First $1K Saved', '100 Tickets Deflected'] :
          ['100 Tickets Deflected'],
        next: monthlySavings > 5000 ? '10,000% ROI' : 
              monthlySavings > 1000 ? '50% Deflection Rate' : 'First $1K Saved',
        progress: Math.min(95, 60 + (monthlySavings / 100))
      }
    };
  }

  generateSavingsHistory(scenario: DemoScenario, months: number = 6): Array<{
    month: string;
    savings: number;
    tickets_deflected: number;
    deflection_rate: number;
    cumulative_savings: number;
  }> {
    const history = [];
    let cumulativeSavings = 0;
    const baseSavings = scenario.metrics.monthly_savings;
    
    // Generate historical progression showing improvement over time
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      // Simulate gradual improvement over time
      const progressFactor = (months - i) / months;
      const monthlySavings = Math.round(baseSavings * (0.3 + 0.7 * progressFactor));
      const ticketsDeflected = Math.round(monthlySavings / scenario.company.avg_ticket_cost);
      const deflectionRate = Math.round(scenario.company.current_deflection + 
        (scenario.metrics.deflection_rate - scenario.company.current_deflection) * progressFactor);
      
      cumulativeSavings += monthlySavings;
      
      history.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        savings: monthlySavings,
        tickets_deflected: ticketsDeflected,
        deflection_rate: deflectionRate,
        cumulative_savings: cumulativeSavings
      });
    }
    
    return history;
  }

  generateTicketCategories(scenario: DemoScenario): Array<{
    category: string;
    count: number;
    deflection_rate: number;
    avg_resolution_time: string;
  }> {
    const categories = [
      { name: 'Password Reset', baseCount: 0.25, deflectionRate: 0.95 },
      { name: 'Billing Questions', baseCount: 0.20, deflectionRate: 0.85 },
      { name: 'Feature Questions', baseCount: 0.18, deflectionRate: 0.75 },
      { name: 'Technical Issues', baseCount: 0.15, deflectionRate: 0.45 },
      { name: 'Account Setup', baseCount: 0.12, deflectionRate: 0.80 },
      { name: 'Integration Help', baseCount: 0.10, deflectionRate: 0.55 }
    ];

    return categories.map(cat => ({
      category: cat.name,
      count: Math.round(scenario.metrics.tickets_processed * cat.baseCount),
      deflection_rate: Math.round(cat.deflectionRate * 100),
      avg_resolution_time: cat.deflectionRate > 0.8 ? '< 1 min' : 
                          cat.deflectionRate > 0.6 ? '15 min' : '2.5 hours'
    }));
  }

  getIndustryBenchmarks(industry: string): {
    avg_deflection_rate: number;
    avg_response_time: string;
    avg_satisfaction: number;
    common_challenges: string[];
  } {
    const benchmarks: { [key: string]: any } = {
      'SaaS': {
        avg_deflection_rate: 42,
        avg_response_time: '4.2 hours',
        avg_satisfaction: 4.1,
        common_challenges: [
          'High volume of repetitive questions',
          'Complex product features requiring explanation',
          'Integration and API documentation queries',
          'Billing and subscription management'
        ]
      },
      'E-commerce': {
        avg_deflection_rate: 38,
        avg_response_time: '6.1 hours',
        avg_satisfaction: 3.9,
        common_challenges: [
          'Order status and tracking inquiries',
          'Return and refund processes',
          'Product information requests',
          'Payment and shipping issues'
        ]
      },
      'Manufacturing': {
        avg_deflection_rate: 28,
        avg_response_time: '8.5 hours',
        avg_satisfaction: 3.8,
        common_challenges: [
          'Technical product specifications',
          'Warranty and service requests',
          'Installation and setup guidance',
          'Compliance and regulatory questions'
        ]
      },
      'Default': {
        avg_deflection_rate: 35,
        avg_response_time: '5.5 hours',
        avg_satisfaction: 4.0,
        common_challenges: [
          'Frequently asked questions',
          'Account and profile management',
          'Technical troubleshooting',
          'General product inquiries'
        ]
      }
    };

    return benchmarks[industry] || benchmarks['Default'];
  }
}