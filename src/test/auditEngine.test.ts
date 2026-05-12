import { describe, it, expect, vi, beforeEach } from 'vitest'
import { calculateSavings, generateAISummary, type FormData } from '../utils/auditEngine'

// Mock Anthropic SDK
vi.mock('@anthropic-ai/sdk', () => {
  const MockAnthropic = vi.fn(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: 'AI generated summary' }]
      })
    }
  }))
  return { default: MockAnthropic }
})

describe('Audit Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('VITE_ANTHROPIC_API_KEY', 'your-anthropic-api-key')
  })

  describe('calculateSavings', () => {
    it('calculates savings correctly for OpenAI optimization', async () => {
      const formData: FormData = {
        company: 'TestCo',
        tools: [
          {
            id: '1',
            name: 'OpenAI',
            plan: 'Plus',
            seats: 10,
            cost: 200,
            useCase: 'Research'
          }
        ]
      }

      const result = await calculateSavings(formData)

      expect(result.totalCurrentSpend).toBe(200)
      // Rule: Plus & >5 seats -> Switch to Team (10% savings factor)
      expect(result.totalSavings).toBe(20)
      expect(result.percentage).toBe(10)
      expect(result.optimizations[0].recommendation).toBe('Switch to Team plan')
    })

    it('calculates savings correctly for Midjourney annual billing', async () => {
      const formData: FormData = {
        company: 'TestCo',
        tools: [
          {
            id: '2',
            name: 'Midjourney',
            plan: 'Pro',
            seats: 1,
            cost: 60,
            useCase: 'Design'
          }
        ]
      }

      const result = await calculateSavings(formData)

      expect(result.totalCurrentSpend).toBe(60)
      // Rule: Pro plan -> Annual billing (20% savings)
      expect(result.totalSavings).toBe(12)
      expect(result.percentage).toBe(20)
    })

    it('applies default 15% annual billing optimization for other tools', async () => {
      const formData: FormData = {
        company: 'TestCo',
        tools: [
          {
            id: '3',
            name: 'Perplexity',
            plan: 'Pro',
            seats: 5,
            cost: 200,
            useCase: 'Research'
          }
        ]
      }

      const result = await calculateSavings(formData)

      expect(result.totalSavings).toBe(30) // 200 * 0.15
      expect(result.optimizations[0].recommendation).toBe('Switch to Annual Billing')
    })

    it('handles multiple tools and aggregates results', async () => {
      const formData: FormData = {
        company: 'TestCo',
        tools: [
          { id: '1', name: 'OpenAI', plan: 'Plus', seats: 10, cost: 200, useCase: '' },
          { id: '2', name: 'Midjourney', plan: 'Pro', seats: 1, cost: 60, useCase: '' }
        ]
      }

      const result = await calculateSavings(formData)

      expect(result.totalCurrentSpend).toBe(260)
      expect(result.totalSavings).toBe(32) // 20 + 12
      expect(result.optimizations).toHaveLength(2)
    })
  })

  describe('generateAISummary', () => {
    it('returns fallback summary when API key is not configured', async () => {
      vi.stubEnv('VITE_ANTHROPIC_API_KEY', 'your-anthropic-api-key')

      const formData: FormData = {
        company: 'TestCo',
        tools: [{ id: '1', name: 'OpenAI', plan: 'Plus', seats: 1, cost: 20, useCase: '' }]
      }
      const results = { savings: 3, percentage: 15 }

      const summary = await generateAISummary(formData, results)

      expect(summary).toContain('save $3 per month')
      expect(summary).toContain('15.0% reduction')
    })
  })
})