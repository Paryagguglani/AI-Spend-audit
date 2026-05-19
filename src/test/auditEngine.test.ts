import { describe, it, expect, vi, beforeEach } from 'vitest'
import { calculateSavings, generateAISummary, type FormData } from '../utils/auditEngine'

// Mock Gemini SDK
vi.mock('@google/generative-ai', () => {
  const MockModel = {
    generateContent: vi.fn().mockResolvedValue({
      response: {
        text: () => 'AI generated summary'
      }
    })
  }
  const MockGenAI = vi.fn(() => ({
    getGenerativeModel: vi.fn(() => MockModel)
  }))
  return { GoogleGenerativeAI: MockGenAI }
})

describe('Audit Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('VITE_GEMINI_API_KEY', 'your-gemini-api-key')
  })

  describe('calculateSavings', () => {
    it('calculates savings correctly for ChatGPT optimization', async () => {
      const formData: FormData = {
        company: 'TestCo',
        tools: [
          {
            id: '1',
            name: 'ChatGPT',
            plan: 'Plus',
            seats: 10,
            cost: 200,
            useCase: 'Research'
          }
        ]
      }

      const result = await calculateSavings(formData)

      expect(result.totalCurrentSpend).toBe(200)
      // Rule: Plus & >3 seats -> Switch to ChatGPT Team (10% savings factor)
      expect(result.totalSavings).toBe(20)
      expect(result.percentage).toBe(10)
      expect(result.optimizations[0].recommendation).toBe('Switch to ChatGPT Team')
    })

    it('applies default 15% annual billing optimization for tools without specific logic', async () => {
      const formData: FormData = {
        company: 'TestCo',
        tools: [
          {
            id: '2',
            name: 'Midjourney',
            plan: 'Pro',
            seats: 1,
            cost: 150, // Cost must be > 100 for the fallback to apply
            useCase: 'Design'
          }
        ]
      }

      const result = await calculateSavings(formData)

      expect(result.totalCurrentSpend).toBe(150)
      // Rule: Fallback -> Annual billing (15% savings)
      expect(result.totalSavings).toBe(22.5) // 150 * 0.15
      expect(result.percentage).toBe(15)
      expect(result.optimizations[0].recommendation).toBe('Switch to Annual Billing')
    })

    it('handles multiple tools and aggregates results', async () => {
      const formData: FormData = {
        company: 'TestCo',
        tools: [
          { id: '1', name: 'ChatGPT', plan: 'Plus', seats: 10, cost: 200, useCase: '' },
          { id: '2', name: 'Midjourney', plan: 'Pro', seats: 1, cost: 150, useCase: '' }
        ]
      }

      const result = await calculateSavings(formData)

      expect(result.totalCurrentSpend).toBe(350)
      expect(result.totalSavings).toBe(42.5) // 20 + 22.5
      expect(result.optimizations).toHaveLength(2)
    })
  })

  describe('generateAISummary', () => {
    it('returns fallback summary when API key is not configured', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', 'your-gemini-api-key')

      const formData: FormData = {
        company: 'TestCo',
        tools: [{ id: '1', name: 'ChatGPT', plan: 'Plus', seats: 1, cost: 20, useCase: '' }]
      }
      const results = { savings: 3, percentage: 15 }

      const summary = await generateAISummary(formData, results)

      expect(summary).toContain('save $3 per month')
      expect(summary).toContain('15.0% reduction')
    })
  })
})