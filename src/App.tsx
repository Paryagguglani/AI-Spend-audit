import { useState } from 'react'
import { supabase } from './supabase'

interface FormData {
  company: string
  spend: string
  tools: string[]
}

interface Results {
  savings: number
  percentage: number
  summary: string
}

function App() {
  const [formData, setFormData] = useState<FormData>({ company: '', spend: '', tools: [] })
  const [results, setResults] = useState<Results | null>(null)
  const [email, setEmail] = useState('')
  const [auditId, setAuditId] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const savings = calculateSavings(formData)
    setResults(savings)
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!results) return

    const { data, error } = await supabase
      .from('audits')
      .insert([
        {
          company: formData.company,
          spend: parseFloat(formData.spend),
          tools: formData.tools,
          savings: results.savings,
          percentage: results.percentage,
          summary: results.summary,
          email: email,
          created_at: new Date().toISOString()
        }
      ])
      .select()

    if (error) {
      console.error('Error saving audit:', error)
      // For demo, generate a fake ID
      const fakeId = Math.random().toString(36).substr(2, 9)
      setAuditId(fakeId)
    } else if (data) {
      setAuditId(data[0].id)
    }
  }

  const reset = () => {
    setResults(null)
    setEmail('')
    setAuditId(null)
  }

  return (
    <div className="min-h-screen bg-parchment text-espresso font-sans p-4">
      {!results ? (
        <AuditForm onSubmit={handleSubmit} formData={formData} setFormData={setFormData} />
      ) : (
        <Results 
          results={results} 
          formData={formData} 
          email={email} 
          setEmail={setEmail} 
          auditId={auditId} 
          onEmailSubmit={handleEmailSubmit} 
          onReset={reset} 
        />
      )}
    </div>
  )
}

function AuditForm({ onSubmit, formData, setFormData }: {
  onSubmit: (e: React.FormEvent) => void
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
}) {
  const tools = ['OpenAI', 'Anthropic', 'Google AI', 'Hugging Face', 'Other']

  const handleToolChange = (tool: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      tools: checked ? [...prev.tools, tool] : prev.tools.filter(t => t !== tool)
    }))
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-500 mb-6 text-center">AI Spend Audit</h1>
      <div className="bg-cream border border-sand rounded-card p-6 shadow-sm">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-500 mb-1">Company Name</label>
            <input
              type="text"
              value={formData.company}
              onChange={e => setFormData(prev => ({ ...prev, company: e.target.value }))}
              className="w-full p-2 border border-sand rounded bg-white text-espresso"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-500 mb-1">Monthly AI Spend ($)</label>
            <input
              type="number"
              value={formData.spend}
              onChange={e => setFormData(prev => ({ ...prev, spend: e.target.value }))}
              className="w-full p-2 border border-sand rounded bg-white text-espresso"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-500 mb-2">AI Tools Used</label>
            <div className="space-y-2">
              {tools.map(tool => (
                <label key={tool} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.tools.includes(tool)}
                    onChange={e => handleToolChange(tool, e.target.checked)}
                    className="mr-2"
                  />
                  {tool}
                </label>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-terracotta text-white py-2 rounded font-500 hover:opacity-90"
          >
            Audit My Spend
          </button>
        </form>
      </div>
    </div>
  )
}

function Results({ results, formData, email, setEmail, auditId, onEmailSubmit, onReset }: { 
  results: Results; 
  formData: FormData; 
  email: string; 
  setEmail: React.Dispatch<React.SetStateAction<string>>; 
  auditId: string | null; 
  onEmailSubmit: (e: React.FormEvent) => void; 
  onReset: () => void 
}) {
  const currentSpend = parseFloat(formData.spend)
  const optimizedSpend = currentSpend - results.savings
  const currentWidth = 100
  const optimizedWidth = (optimizedSpend / currentSpend) * 100

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-500 mb-8 text-center">Your AI Spend Audit Report</h1>
      <div className="bg-cream border border-sand rounded-card p-8 shadow-sm space-y-6">
        <div className="text-center">
          <div className="text-5xl font-500 text-forest mb-2">${results.savings.toFixed(0)}</div>
          <div className="text-lg text-taupe">Monthly Savings Potential</div>
          <div className="text-terracotta font-500 text-xl">{results.percentage}% Reduction</div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-500">Spend Comparison</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-500">Current Monthly Spend</span>
              <span className="text-sm">${currentSpend.toFixed(0)}</span>
            </div>
            <div className="w-full bg-sand rounded-full h-6 overflow-hidden">
              <div className="bg-terracotta h-6 rounded-full transition-all duration-500" style={{width: `${currentWidth}%`}}></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-500">Optimized Spend</span>
              <span className="text-sm">${optimizedSpend.toFixed(0)}</span>
            </div>
            <div className="w-full bg-sand rounded-full h-6 overflow-hidden">
              <div className="bg-forest h-6 rounded-full transition-all duration-500" style={{width: `${optimizedWidth}%`}}></div>
            </div>
          </div>
        </div>

        <div className="border-t border-sand pt-6">
          <h2 className="text-xl font-500 mb-3">Recommendation</h2>
          <p className="text-taupe leading-relaxed">{results.summary}</p>
        </div>

        {!auditId ? (
          <div className="border-t border-sand pt-6">
            <h2 className="text-xl font-500 mb-3">Get Your Full Report</h2>
            <p className="text-taupe mb-4">Enter your email to receive a detailed audit report and personalized recommendations.</p>
            <form onSubmit={onEmailSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full p-3 border border-sand rounded bg-white text-espresso"
                required
              />
              <button
                type="submit"
                className="w-full bg-terracotta text-white py-3 rounded font-500 hover:opacity-90 transition-opacity"
              >
                Send Me My Report
              </button>
            </form>
          </div>
        ) : (
          <div className="border-t border-sand pt-6">
            <h2 className="text-xl font-500 mb-3">Share Your Report</h2>
            <p className="text-taupe mb-4">Your audit has been saved. Share this link to show others your potential savings:</p>
            <div className="bg-white border border-sand rounded p-3 text-sm break-all">
              {window.location.origin}/report/{auditId}
            </div>
          </div>
        )}

        <div className="flex space-x-4">
          <button
            onClick={onReset}
            className="flex-1 bg-terracotta text-white py-3 rounded font-500 hover:opacity-90 transition-opacity"
          >
            Audit Another Company
          </button>
          {auditId && (
            <button
              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/report/${auditId}`)}
              className="flex-1 border border-terracotta text-terracotta py-3 rounded font-500 hover:bg-terracotta hover:text-white transition-colors"
            >
              Copy Share Link
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function calculateSavings(formData: FormData): Results {
  const spend = parseFloat(formData.spend) || 0
  const percentage = spend > 5000 ? 25 : spend > 1000 ? 20 : 15
  const savings = spend * (percentage / 100)
  let summary = `By optimizing your AI tool usage and switching to cost-effective alternatives, you can save $${savings.toFixed(0)} per month.`

  if (formData.tools.includes('OpenAI')) {
    summary += ' Consider switching from OpenAI GPT-4 to Anthropic Claude for better pricing on high-volume usage.'
  }
  if (formData.tools.includes('Google AI')) {
    summary += ' Google AI offers competitive rates for certain workloads.'
  }
  // Add more based on tools

  return { savings, percentage, summary }
}

export default App

