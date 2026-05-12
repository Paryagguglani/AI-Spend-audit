import { GoogleGenerativeAI } from '@google/generative-ai'

export interface ToolEntry {
  id: string
  name: string
  plan: string
  seats: number
  cost: number
  useCase: string
}

export interface FormData {
  company: string
  tools: ToolEntry[]
}

export interface Optimization {
  toolId: string
  toolName: string
  currentCost: number
  optimizedCost: number
  recommendation: string
  details: string[]
}

export interface Results {
  totalCurrentSpend: number
  totalOptimizedSpend: number
  totalSavings: number
  percentage: number
  optimizations: Optimization[]
  summary: string
}

export const SUPPORTED_TOOLS = [
  'OpenAI', 'Anthropic', 'Midjourney', 'Perplexity', 'Jasper', 'Copy.ai', 'Intercom AI', 'GitHub Copilot', 'Cursor', 'Weights & Biases'
]

export const TOOL_CONFIGS: Record<string, any> = {
  'OpenAI': {
    plans: [
      { name: 'Plus', costPerSeat: 20 },
      { name: 'Team', costPerSeat: 30 },
      { name: 'Enterprise', costPerSeat: 60 }
    ],
    optimizations: [
      {
        condition: (entry: ToolEntry) => entry.plan === 'Plus' && entry.seats > 5,
        recommendation: 'Switch to Team plan',
        details: ['Better admin controls', 'Data privacy for teams', 'Shared workspace'],
        savingsFactor: 0.1
      },
      {
        condition: (entry: ToolEntry) => entry.useCase.toLowerCase().includes('api') && entry.cost > 2000,
        recommendation: 'Use GPT-4o-mini for 80% of tasks',
        details: ['90% cost reduction for high-volume tasks', 'Near GPT-4 performance'],
        savingsFactor: 0.4
      }
    ]
  },
  'Anthropic': {
    plans: [
      { name: 'Pro', costPerSeat: 20 },
      { name: 'Team', costPerSeat: 30 }
    ],
    optimizations: [
      {
        condition: (entry: ToolEntry) => entry.seats > 10,
        recommendation: 'Consolidate onto Team plan',
        details: ['Centralized billing', 'Higher usage limits'],
        savingsFactor: 0.15
      }
    ]
  },
  'GitHub Copilot': {
    plans: [
      { name: 'Individual', costPerSeat: 10 },
      { name: 'Business', costPerSeat: 19 },
      { name: 'Enterprise', costPerSeat: 39 }
    ],
    optimizations: [
      {
        condition: (entry: ToolEntry) => entry.seats > 20 && entry.plan === 'Business',
        recommendation: 'Audit seat utilization',
        details: ['Remove inactive users', 'Check for developer overlap with Cursor'],
        savingsFactor: 0.2
      }
    ]
  },
  'Midjourney': {
    plans: [
      { name: 'Basic', costPerSeat: 10 },
      { name: 'Standard', costPerSeat: 30 },
      { name: 'Pro', costPerSeat: 60 },
      { name: 'Mega', costPerSeat: 120 }
    ],
    optimizations: [
      {
        condition: (entry: ToolEntry) => entry.plan === 'Pro' || entry.plan === 'Mega',
        recommendation: 'Switch to Annual Billing',
        details: ['20% flat discount on annual plans'],
        savingsFactor: 0.2
      }
    ]
  }
}

export async function calculateSavings(formData: FormData): Promise<Results> {
  let totalCurrentSpend = 0
  let totalOptimizedSpend = 0
  const optimizations: Optimization[] = []

  formData.tools.forEach(entry => {
    totalCurrentSpend += entry.cost
    let optimizedCost = entry.cost
    let bestRecommendation = ''
    let bestDetails: string[] = []

    const config = TOOL_CONFIGS[entry.name]
    if (config) {
      config.optimizations.forEach((opt: any) => {
        if (opt.condition(entry)) {
          const potentialSavings = entry.cost * opt.savingsFactor
          const newCost = entry.cost - potentialSavings
          if (newCost < optimizedCost) {
            optimizedCost = newCost
            bestRecommendation = opt.recommendation
            bestDetails = opt.details
          }
        }
      })
    }

    if (optimizedCost === entry.cost && entry.cost > 100) {
      optimizedCost = entry.cost * 0.85
      bestRecommendation = 'Switch to Annual Billing'
      bestDetails = ['Immediate 15% cost reduction', 'Simplified accounting']
    }

    if (optimizedCost < entry.cost) {
      optimizations.push({
        toolId: entry.id,
        toolName: entry.name,
        currentCost: entry.cost,
        optimizedCost,
        recommendation: bestRecommendation,
        details: bestDetails
      })
    }

    totalOptimizedSpend += optimizedCost
  })

  const totalSavings = totalCurrentSpend - totalOptimizedSpend
  const percentage = totalCurrentSpend > 0 ? (totalSavings / totalCurrentSpend) * 100 : 0

  const summary = await generateAISummary(formData, { savings: totalSavings, percentage })

  return {
    totalCurrentSpend,
    totalOptimizedSpend,
    totalSavings,
    percentage,
    optimizations,
    summary
  }
}

export async function generateAISummary(formData: FormData, results: { savings: number; percentage: number }): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey || apiKey === 'your-gemini-api-key') {
    return `By optimizing your AI tool usage, you can save $${results.savings.toFixed(0)} per month. This represent a ${results.percentage.toFixed(1)}% reduction in your current spend.`
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `You are a financial advisor specializing in AI cost optimization. Write a compelling, professional summary for ${formData.company}.
  
Current monthly AI spend: $${(results.savings / (results.percentage / 100 || 1)).toFixed(0)}
Potential monthly savings: $${results.savings.toFixed(0)} (${results.percentage.toFixed(1)}% reduction)
Tools audited: ${formData.tools.map(t => t.name).join(', ')}

Provide a concise, executive-level summary of where the savings come from (focusing on plan optimization and model selection) and why they should act now. Keep it under 120 words.`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text() || 'AI-generated summary unavailable.'
  } catch (error) {
    console.error('Error generating AI summary:', error)
    return `By optimizing your AI tool usage, you can save $${results.savings.toFixed(0)} per month.`
  }
}