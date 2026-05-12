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
  teamSize?: number
  primaryUseCase?: 'coding' | 'writing' | 'data' | 'research' | 'mixed'
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

export interface OptimizationRule {
  condition: (entry: ToolEntry) => boolean
  recommendation: string
  details: string[]
  savingsFactor: number
}

export interface ToolConfig {
  optimizations: OptimizationRule[]
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
  'ChatGPT', 'Claude', 'Gemini', 'GitHub Copilot', 'Cursor', 'OpenAI API direct', 'Anthropic API direct', 'Windsurf', 'v0', 'Perplexity', 'Midjourney'
]

export const TOOL_PLANS: Record<string, string[]> = {
  'ChatGPT': ['Plus', 'Team', 'Enterprise', 'API direct'],
  'Claude': ['Free', 'Pro', 'Max', 'Team', 'Enterprise', 'API direct'],
  'Gemini': ['Pro', 'Ultra', 'API'],
  'GitHub Copilot': ['Individual', 'Business', 'Enterprise'],
  'Cursor': ['Hobby', 'Pro', 'Business', 'Enterprise'],
  'OpenAI API direct': ['Usage-based'],
  'Anthropic API direct': ['Usage-based'],
  'Windsurf': ['Individual', 'Team', 'Enterprise'],
  'v0': ['Free', 'Premium', 'Enterprise'],
  'Perplexity': ['Pro', 'Enterprise'],
  'Midjourney': ['Basic', 'Standard', 'Pro', 'Mega']
}

export const TOOL_CONFIGS: Record<string, ToolConfig> = {
  'ChatGPT': {
    optimizations: [
      {
        condition: (entry: ToolEntry) => entry.plan === 'Plus' && entry.seats > 3,
        recommendation: 'Switch to ChatGPT Team',
        details: ['Admin console for seat management', 'Data excluded from training', 'Higher message limits'],
        savingsFactor: 0.1
      }
    ]
  },
  'Claude': {
    optimizations: [
      {
        condition: (entry: ToolEntry) => entry.plan === 'Pro' && entry.seats > 5,
        recommendation: 'Switch to Claude Team',
        details: ['Centralized billing', 'Increased usage capacity', 'Admin controls'],
        savingsFactor: 0.1
      }
    ]
  },
  'GitHub Copilot': {
    optimizations: [
      {
        condition: (entry: ToolEntry) => entry.plan === 'Individual' && entry.seats > 5,
        recommendation: 'Consolidate to Copilot Business',
        details: ['Policy management', 'Proxy support', 'Industry-standard privacy'],
        savingsFactor: 0.05
      }
    ]
  },
  'Cursor': {
    optimizations: [
      {
        condition: (entry: ToolEntry) => entry.plan === 'Pro' && entry.seats > 10,
        recommendation: 'Upgrade to Cursor Business',
        details: ['SAML/SSO support', 'Centralized admin', 'Usage dashboard'],
        savingsFactor: 0.1
      }
    ]
  },
  'OpenAI API direct': {
    optimizations: [
      {
        condition: (entry: ToolEntry) => entry.cost > 1000,
        recommendation: 'Implement GPT-4o-mini Caching',
        details: ['Up to 50% reduction for repetitive queries', 'Optimize system prompts'],
        savingsFactor: 0.3
      }
    ]
  },
  'Anthropic API direct': {
    optimizations: [
      {
        condition: (entry: ToolEntry) => entry.cost > 1000,
        recommendation: 'Switch to Claude 3.5 Haiku',
        details: ['High speed at 1/10th cost of Sonnet', 'Ideal for extraction & basic coding'],
        savingsFactor: 0.4
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
      config.optimizations.forEach((opt: OptimizationRule) => {
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
    return `By optimizing your AI tool usage for ${formData.company}, you can save $${results.savings.toFixed(0)} per month (${results.percentage.toFixed(1)}% reduction).`
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `You are a financial advisor specializing in AI cost optimization. Write a compelling, professional summary for ${formData.company}.
  
Team Size: ${formData.teamSize || 'Not specified'}
Primary Use Case: ${formData.primaryUseCase || 'Mixed'}
Current monthly AI spend: $${(results.savings / (results.percentage / 100 || 1)).toFixed(0)}
Potential monthly savings: $${results.savings.toFixed(0)} (${results.percentage.toFixed(1)}% reduction)
Tools audited: ${formData.tools.map(t => `${t.name} (${t.plan})`).join(', ')}

Provide a concise, executive-level summary of where the savings come from (focusing on plan optimization and model selection) and why they should act now. Mention the team size and use case contextually. Keep it under 150 words.`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text() || 'AI-generated summary unavailable.'
  } catch (error) {
    console.error('Error generating AI summary:', error)
    return `By optimizing your AI tool usage, you can save $${results.savings.toFixed(0)} per month.`
  }
}