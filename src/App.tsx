import { useState } from 'react'
import { Routes, Route, useNavigate, useParams } from 'react-router-dom'
import { supabase } from './supabase'
import { calculateSavings, SUPPORTED_TOOLS, type FormData, type Results, type ToolEntry } from './utils/auditEngine'
import { Plus, Trash2, Calculator, ArrowRight, Share2, Mail, CheckCircle2, AlertCircle, ChevronDown, Activity } from 'lucide-react'

function App() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-purple-100">
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">Credex <span className="text-indigo-600">Audit</span></span>
          </div>
          <div className="text-sm font-medium text-slate-500">
            Professional AI Spend Analysis
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <Routes>
          <Route path="/" element={<AuditFormView />} />
          <Route path="/report/:id" element={<ResultsView />} />
        </Routes>
      </main>

      <footer className="border-t border-slate-100 py-12 bg-slate-50 mt-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-slate-400 text-sm">
            © 2026 Credex AI. All rights reserved.
          </div>
          <div className="flex gap-8 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function AuditFormView() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    company: '',
    tools: [{ id: '1', name: 'OpenAI', plan: 'Plus', seats: 1, cost: 20, useCase: '' }]
  })

  const addTool = () => {
    setFormData(prev => ({
      ...prev,
      tools: [...prev.tools, { 
        id: Math.random().toString(36).substr(2, 9), 
        name: 'OpenAI', 
        plan: 'Plus', 
        seats: 1, 
        cost: 0, 
        useCase: '' 
      }]
    }))
  }

  const removeTool = (id: string) => {
    if (formData.tools.length <= 1) return
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.filter(t => t.id !== id)
    }))
  }

  const updateTool = (id: string, updates: Partial<ToolEntry>) => {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.map(t => t.id === id ? { ...t, ...updates } : t)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const results = await calculateSavings(formData)
      const { data } = await supabase
        .from('audits')
        .insert([{
          company: formData.company,
          tools: formData.tools,
          results: results,
          created_at: new Date().toISOString()
        }])
        .select()

      if (data) {
        navigate(`/report/${data[0].id}`)
      } else {
        // Fallback for local dev without supabase
        const mockId = Math.random().toString(36).substr(2, 9)
        localStorage.setItem(`audit_${mockId}`, JSON.stringify({ formData, results }))
        navigate(`/report/${mockId}`)
      }
    } catch (error) {
      console.error('Audit failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
          Audit Your <span className="text-indigo-600">AI Spend</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-xl mx-auto">
          Identify over-provisioning and optimization opportunities across your AI stack in minutes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider">Company Name</label>
          <input
            type="text"
            value={formData.company}
            onChange={e => setFormData(prev => ({ ...prev, company: e.target.value }))}
            placeholder="e.g. Acme Corp"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-lg font-medium"
            required
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              AI Tool Stack
            </h2>
            <button
              type="button"
              onClick={addTool}
              className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Tool
            </button>
          </div>

          <div className="space-y-4">
            {formData.tools.map((tool) => (
              <div key={tool.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-indigo-200 transition-colors group relative">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Tool</label>
                    <div className="relative">
                      <select
                        value={tool.name}
                        onChange={e => updateTool(tool.id, { name: e.target.value })}
                        className="w-full pl-3 pr-10 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium appearance-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {SUPPORTED_TOOLS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Monthly Spend ($)</label>
                    <input
                      type="number"
                      value={tool.cost}
                      onChange={e => updateTool(tool.id, { cost: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Seats</label>
                    <input
                      type="number"
                      value={tool.seats}
                      onChange={e => updateTool(tool.id, { seats: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                      placeholder="1"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Primary Use Case</label>
                    <input
                      type="text"
                      value={tool.useCase}
                      onChange={e => updateTool(tool.id, { useCase: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. Dev productivity"
                    />
                  </div>
                </div>

                {formData.tools.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTool(tool.id)}
                    className="absolute -right-3 -top-3 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-all shadow-xl shadow-slate-200 group"
        >
          {loading ? 'Analyzing Your Stack...' : (
            <>
              Run Comprehensive Audit
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}

function ResultsView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [results, setResults] = useState<Results | null>(null)
  const [company, setCompany] = useState('')
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useState(() => {
    const fetchResults = async () => {
      const { data } = await supabase
        .from('audits')
        .select('*')
        .eq('id', id)
        .single()

      if (data) {
        setResults(data.results)
        setCompany(data.company)
      } else {
        const localData = localStorage.getItem(`audit_${id}`)
        if (localData) {
          const { formData, results } = JSON.parse(localData)
          setResults(results)
          setCompany(formData.company)
        }
      }
      setLoading(false)
    }
    fetchResults()
  })

  const handleLeadCapture = async (e: React.FormEvent) => {
    e.preventDefault()
    // Mock lead capture
    setSubmitted(true)
  }

  if (loading) return <div className="text-center py-24">Loading your report...</div>
  if (!results) return <div className="text-center py-24">Report not found.</div>

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
        <div className="flex-1 bg-indigo-600 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-200">
          <div className="flex items-center gap-2 mb-4 opacity-80">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-bold tracking-tight uppercase text-sm">{company} Audit Report</span>
          </div>
          <h2 className="text-indigo-100 font-semibold uppercase tracking-widest text-sm mb-2">Estimated Monthly Savings</h2>
          <div className="text-6xl font-black mb-4">${results.totalSavings.toFixed(0)}</div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-sm font-bold backdrop-blur-sm">
            <Activity className="w-4 h-4" />
            {results.percentage.toFixed(1)}% Cost Reduction
          </div>
        </div>

        <div className="w-full md:w-80 bg-slate-900 rounded-3xl p-8 text-white shadow-2xl shadow-slate-200">
          <h3 className="text-slate-400 font-semibold text-sm mb-4">Current Monthly Spend</h3>
          <div className="text-3xl font-bold mb-6">${results.totalCurrentSpend.toFixed(0)}</div>
          <h3 className="text-slate-400 font-semibold text-sm mb-4">Optimized Spend</h3>
          <div className="text-3xl font-bold text-emerald-400">${results.totalOptimizedSpend.toFixed(0)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-indigo-600" />
              Optimization Opportunities
            </h2>
            <div className="space-y-6">
              {results.optimizations.map((opt, i) => (
                <div key={i} className="flex gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center font-bold text-indigo-600 border border-slate-100 shrink-0">
                    {opt.toolName[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-slate-900">{opt.toolName}: {opt.recommendation}</h3>
                      <span className="text-emerald-600 font-bold text-sm bg-emerald-50 px-2 py-1 rounded-md">
                        -${(opt.currentCost - opt.optimizedCost).toFixed(0)}/mo
                      </span>
                    </div>
                    <ul className="space-y-1.5">
                      {opt.details.map((detail, j) => (
                        <li key={j} className="text-sm text-slate-600 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-50 rounded-3xl border border-indigo-100 p-8">
            <h2 className="text-2xl font-bold text-indigo-900 mb-4">AI-Generated Strategy</h2>
            <div className="prose prose-indigo max-w-none text-indigo-800 leading-relaxed font-medium">
              {results.summary}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm sticky top-24">
            {!submitted ? (
              <>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Get Full PDF Report</h3>
                <p className="text-slate-600 text-sm mb-6">
                  We'll send a detailed 12-page PDF audit including competitor benchmarks and implementation guides.
                </p>
                <form onSubmit={handleLeadCapture} className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" /> Send PDF Report
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Report Sent!</h3>
                <p className="text-slate-600 text-sm">Check your inbox for the full analysis.</p>
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Share2 className="w-4 h-4" /> Share Audit
              </h4>
              <div className="bg-slate-50 p-3 rounded-xl text-xs font-mono text-slate-500 break-all border border-slate-100">
                {window.location.href}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  alert('Link copied!')
                }}
                className="mt-3 w-full border border-slate-200 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Copy Report Link
              </button>
            </div>

            <button
              onClick={() => navigate('/')}
              className="mt-6 w-full text-indigo-600 font-bold text-sm hover:underline"
            >
              Start New Audit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

