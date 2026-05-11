import { useState } from 'react'

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const savings = calculateSavings(formData)
    setResults(savings)
  }

  const reset = () => setResults(null)

  return (
    <div className="min-h-screen bg-parchment text-espresso font-sans p-4">
      {!results ? (
        <AuditForm onSubmit={handleSubmit} formData={formData} setFormData={setFormData} />
      ) : (
        <Results results={results} onReset={reset} />
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

function Results({ results, onReset }: { results: Results; onReset: () => void }) {
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-500 mb-6 text-center">Audit Results</h1>
      <div className="bg-cream border border-sand rounded-card p-6 shadow-sm space-y-4">
        <div className="text-center">
          <div className="text-3xl font-500 text-forest">${results.savings.toFixed(0)}</div>
          <div className="text-sm text-taupe">Monthly Savings</div>
        </div>
        <div className="text-center text-terracotta font-500">
          {results.percentage}% reduction
        </div>
        <p className="text-sm text-taupe">{results.summary}</p>
        <button
          onClick={onReset}
          className="w-full bg-terracotta text-white py-2 rounded font-500 hover:opacity-90"
        >
          Audit Another
        </button>
      </div>
    </div>
  )
}

function calculateSavings(formData: FormData): Results {
  const spend = parseFloat(formData.spend) || 0
  const percentage = spend > 5000 ? 25 : spend > 1000 ? 20 : 15
  const savings = spend * (percentage / 100)
  const summary = `By optimizing your AI tool usage and switching to cost-effective alternatives, you can save $${savings.toFixed(0)} per month.`
  return { savings, percentage, summary }
}

export default App

