import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useParams } from 'react-router-dom'
import { supabase } from './supabase'
import { calculateSavings, SUPPORTED_TOOLS, TOOL_PLANS, type FormData, type Results, type ToolEntry } from './utils/auditEngine'
import { generateAuditPDF } from './utils/pdfGenerator'
import { Plus, Trash2, Calculator, ArrowRight, ArrowLeft, Share2, Mail, CheckCircle2, AlertCircle, ChevronDown, Activity, Users, Lightbulb } from 'lucide-react'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-slate-900 font-sans selection:bg-purple-200">
      <nav className="border-b border-white/30 bg-white/40 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">AI Spend <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">Audit</span></span>
          </div>
          <div className="text-sm font-medium text-slate-600 bg-white/50 px-3 py-1 rounded-full border border-white shadow-sm">
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

      <footer className="border-t border-white/40 py-12 bg-white/20 backdrop-blur-md mt-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-slate-500 text-sm font-medium">
            © 2026 AI Spend Audit. All rights reserved.
          </div>
          <div className="flex gap-8 text-sm font-bold text-slate-600">
            <a href="#" className="hover:text-violet-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-violet-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-violet-600 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function AuditFormView() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>(() => {
    const saved = localStorage.getItem('audit_form_draft')
    return saved ? JSON.parse(saved) : {
      company: '',
      teamSize: 10,
      primaryUseCase: 'mixed',
      tools: [{ id: '1', name: 'ChatGPT', plan: 'Plus', seats: 1, cost: 20, useCase: '' }]
    }
  })

  useEffect(() => {
    localStorage.setItem('audit_form_draft', JSON.stringify(formData))
  }, [formData])

  const addTool = () => {
    setFormData(prev => ({
      ...prev,
      tools: [...prev.tools, {
        id: Math.random().toString(36).substr(2, 9),
        name: 'ChatGPT',
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
    setFormData(prev => {
      const newTools = prev.tools.map(t => {
        if (t.id === id) {
          const updated = { ...t, ...updates }
          if (updates.name && updates.name !== t.name) {
            updated.plan = TOOL_PLANS[updates.name as keyof typeof TOOL_PLANS][0]
          }
          return updated
        }
        return t
      })
      return { ...prev, tools: newTools }
    })
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

      localStorage.removeItem('audit_form_draft')

      if (data) {
        navigate(`/report/${data[0].id}`)
      } else {
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
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4 drop-shadow-sm">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">SpendSight AI</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-xl mx-auto font-medium">
          Identify over-provisioning and optimization opportunities across your AI stack in minutes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border-t border-white/80 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] shadow-purple-200/50 p-8 grid grid-cols-1 md:grid-cols-2 gap-6 transition-all hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] hover:shadow-purple-300/50">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Company Name</label>
            <input
              type="text"
              value={formData.company}
              onChange={e => setFormData(prev => ({ ...prev, company: e.target.value }))}
              placeholder="e.g. Acme Corp"
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 bg-slate-50/50 shadow-inner focus:bg-white focus:border-violet-300 focus:ring-4 focus:ring-violet-500/20 transition-all text-lg font-bold outline-none"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
              <Users className="w-4 h-4 text-violet-600" />
              Total Team Size
            </label>
            <input
              type="number"
              value={formData.teamSize}
              onChange={e => setFormData(prev => ({ ...prev, teamSize: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 bg-slate-50/50 shadow-inner focus:bg-white focus:border-violet-300 focus:ring-4 focus:ring-violet-500/20 transition-all outline-none font-bold"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
              <Lightbulb className="w-4 h-4 text-violet-600" />
              Primary Use Case
            </label>
            <div className="relative">
              <select
                value={formData.primaryUseCase}
                onChange={e => setFormData(prev => ({ ...prev, primaryUseCase: e.target.value as FormData['primaryUseCase'] }))}
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 bg-slate-50/50 shadow-inner focus:bg-white focus:border-violet-300 focus:ring-4 focus:ring-violet-500/20 transition-all appearance-none outline-none font-bold cursor-pointer"
              >
                <option value="coding">Software Development</option>
                <option value="writing">Content & Writing</option>
                <option value="data">Data & Analysis</option>
                <option value="research">Market Research</option>
                <option value="mixed">Mixed Usage</option>
              </select>
              <ChevronDown className="absolute right-4 top-4 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-violet-600" />
              AI Tool Stack
            </h2>
            <button
              type="button"
              onClick={addTool}
              className="flex items-center gap-2 text-sm font-bold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Tool
            </button>
          </div>

          <div className="space-y-4">
            {formData.tools.map((tool) => (
              <div key={tool.id} className="bg-white/80 backdrop-blur-xl rounded-3xl border-t border-white/80 shadow-lg shadow-slate-200/50 p-6 hover:shadow-xl hover:shadow-violet-200/50 transition-all group relative transform origin-center">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Tool Name</label>
                    <div className="relative">
                      <select
                        value={tool.name}
                        onChange={e => updateTool(tool.id, { name: e.target.value })}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border-2 border-slate-100 bg-slate-50/50 shadow-inner text-sm font-bold appearance-none focus:bg-white focus:border-violet-300 focus:ring-4 focus:ring-violet-500/20 outline-none cursor-pointer transition-all"
                      >
                        {SUPPORTED_TOOLS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Plan Tier</label>
                    <div className="relative">
                      <select
                        value={tool.plan}
                        onChange={e => updateTool(tool.id, { plan: e.target.value })}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border-2 border-slate-100 bg-slate-50/50 shadow-inner text-sm font-bold appearance-none focus:bg-white focus:border-violet-300 focus:ring-4 focus:ring-violet-500/20 outline-none cursor-pointer transition-all"
                      >
                        {TOOL_PLANS[tool.name as keyof typeof TOOL_PLANS]?.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Monthly Spend ($)</label>
                    <input
                      type="number"
                      value={tool.cost}
                      onChange={e => updateTool(tool.id, { cost: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50/50 shadow-inner text-sm font-bold focus:bg-white focus:border-violet-300 focus:ring-4 focus:ring-violet-500/20 outline-none transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Total Seats</label>
                    <input
                      type="number"
                      value={tool.seats}
                      onChange={e => updateTool(tool.id, { seats: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50/50 shadow-inner text-sm font-bold focus:bg-white focus:border-violet-300 focus:ring-4 focus:ring-violet-500/20 outline-none transition-all"
                      placeholder="1"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Sub-Use Case</label>
                    <input
                      type="text"
                      value={tool.useCase}
                      onChange={e => updateTool(tool.id, { useCase: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50/50 shadow-inner text-sm font-bold focus:bg-white focus:border-violet-300 focus:ring-4 focus:ring-violet-500/20 outline-none transition-all"
                      placeholder="e.g. Content writing, Debugging"
                    />
                  </div>
                </div>

                {formData.tools.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTool(tool.id)}
                    className="absolute -right-3 -top-3 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-500 hover:border-rose-500 shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 pb-12">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white py-4 rounded-2xl font-black text-xl flex items-center justify-center gap-2 hover:from-violet-500 hover:via-fuchsia-500 hover:to-pink-500 disabled:opacity-50 transition-all shadow-[0_15px_30px_rgba(217,_70,_239,_0.3)] hover:shadow-[0_20px_40px_rgba(217,_70,_239,_0.4)] border-b-4 border-violet-800 active:border-b-0 active:translate-y-1 group"
          >
            {loading ? 'Analyzing Your Stack...' : (
              <>
                Run Comprehensive Audit
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
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
  const [role, setRole] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
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
  }, [id])

  const handleLeadCapture = async (e: React.FormEvent) => {
    e.preventDefault()
    if (honeypot) return // Basic bot protection via honeypot
    if (!results) return

    setSending(true)
    try {
      // 1. Proactively generate the PDF and trigger a browser download
      const { doc, base64 } = generateAuditPDF(company || 'Valued Client', results)
      doc.save(`SpendSight_AI_Audit_${(company || 'Report').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`)

      // 2. Trigger the real email delivery via Vercel Edge Serverless function
      try {
        const emailResponse = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            company: company || 'Valued Client',
            pdfBase64: base64,
            totalSavings: results.totalSavings
          })
        })

        if (!emailResponse.ok) {
          const errorData = await emailResponse.json().catch(() => ({}))
          console.warn('API email sending failed:', errorData.error || emailResponse.statusText)
        }
      } catch (emailErr) {
        console.error('Failed to connect to send-email API endpoint:', emailErr)
      }

      // 3. Update Supabase
      try {
        await supabase
          .from('audits')
          .update({
            lead_email: email,
            lead_role: role,
            lead_captured_at: new Date().toISOString()
          })
          .eq('id', id)
      } catch (dbErr) {
        console.warn('Database lead record update skipped (Local mock ID used or db disconnected):', dbErr)
      }

      setSubmitted(true)
    } catch (err) {
      console.error('PDF generation or lead submission failed:', err)
      alert('An error occurred while generating your report. Please try again.')
    } finally {
      setSending(false)
    }
  }

  if (loading) return <div className="text-center py-24 font-bold text-violet-600 animate-pulse text-lg">Loading your report...</div>
  if (!results) return <div className="text-center py-24 font-bold text-slate-500 text-lg">Report not found.</div>

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-6 flex">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-violet-600 transition-colors group px-4 py-2 bg-white/50 hover:bg-white rounded-xl shadow-sm border border-slate-200"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Start New Audit
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-8 items-stretch mb-12">
        <div className="flex-1 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 rounded-3xl p-8 text-white shadow-[0_20px_50px_rgba(217,_70,_239,_0.3)] relative overflow-hidden border-t border-white/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6 opacity-90 bg-white/20 w-fit px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/20">
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-bold tracking-tight uppercase text-xs">{company} Audit Report</span>
            </div>
            <h2 className="text-violet-100 font-bold uppercase tracking-widest text-sm mb-2">Estimated Monthly Savings</h2>
            <div className="text-7xl font-black mb-6 tracking-tighter drop-shadow-md">${results.totalSavings.toFixed(0)}</div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-sm font-bold text-violet-700 shadow-lg">
              <Activity className="w-5 h-5 text-fuchsia-500" />
              {results.percentage.toFixed(1)}% Cost Reduction
            </div>
          </div>
        </div>

        <div className="w-full md:w-80 bg-slate-900 rounded-3xl p-8 text-white shadow-2xl shadow-slate-900/50 border-t border-slate-700 relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-violet-600/20 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">Current Monthly Spend</h3>
            <div className="text-4xl font-black mb-8">${results.totalCurrentSpend.toFixed(0)}</div>
            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">Optimized Spend</h3>
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">${results.totalOptimizedSpend.toFixed(0)}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border-t border-white/80 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] p-8">
            <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <div className="p-2 bg-violet-100 rounded-xl">
                <AlertCircle className="w-6 h-6 text-violet-600" />
              </div>
              Optimization Opportunities
            </h2>
            <div className="space-y-6">
              {results.optimizations.map((opt, i) => (
                <div key={i} className="flex gap-6 p-6 rounded-3xl bg-slate-50 border-2 border-white shadow-sm hover:shadow-md hover:border-violet-100 transition-all">
                  <div className="w-14 h-14 bg-gradient-to-br from-violet-100 to-fuchsia-100 rounded-2xl shadow-inner flex items-center justify-center font-black text-2xl text-violet-600 border border-white shrink-0">
                    {opt.toolName[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                      <h3 className="font-bold text-lg text-slate-900 leading-tight">{opt.toolName}: <span className="text-slate-600 font-semibold">{opt.recommendation}</span></h3>
                      <span className="text-emerald-700 font-black text-sm bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-sm shrink-0">
                        -${(opt.currentCost - opt.optimizedCost).toFixed(0)}/mo
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {opt.details.map((detail, j) => (
                        <li key={j} className="text-sm font-medium text-slate-600 flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-900 rounded-3xl border-t border-indigo-700 p-8 text-indigo-50 shadow-2xl shadow-indigo-900/50">
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
              <div className="p-2 bg-indigo-800 rounded-xl">
                <Lightbulb className="w-6 h-6 text-indigo-300" />
              </div>
              AI-Generated Strategy
            </h2>
            <div className="prose prose-invert prose-indigo max-w-none text-indigo-100 leading-relaxed font-medium">
              {results.summary}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white/90 backdrop-blur-2xl rounded-3xl border-t border-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] p-8 sticky top-24">
            {!submitted ? (
              <>
                <h3 className="text-xl font-black text-slate-900 mb-3">Get Full PDF Report</h3>
                <p className="text-slate-600 text-sm font-medium mb-8 leading-relaxed">
                  We'll send a detailed 12-page PDF audit including competitor benchmarks and implementation guides.
                </p>
                <form onSubmit={handleLeadCapture} className="space-y-5">
                  {/* Honeypot field for bot protection */}
                  <div className="hidden" aria-hidden="true">
                    <input
                      type="text"
                      value={honeypot}
                      onChange={e => setHoneypot(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Work Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 bg-slate-50 shadow-inner focus:bg-white focus:border-violet-300 focus:ring-4 focus:ring-violet-500/20 outline-none font-bold transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Your Role</label>
                    <div className="relative">
                      <select
                        value={role}
                        onChange={e => setRole(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 rounded-2xl border-2 border-slate-100 bg-slate-50 shadow-inner focus:bg-white focus:border-violet-300 focus:ring-4 focus:ring-violet-500/20 outline-none font-bold appearance-none cursor-pointer transition-all"
                        required
                      >
                        <option value="">Select Role</option>
                        <option value="cto">CTO / VP Engineering</option>
                        <option value="cfo">CFO / Finance Lead</option>
                        <option value="founder">Founder / CEO</option>
                        <option value="manager">Engineering Manager</option>
                        <option value="other">Other</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      disabled={sending}
                      className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 border-b-4 border-black active:border-b-0 active:translate-y-1 disabled:opacity-70"
                    >
                      {sending ? 'Sending...' : (
                        <>
                          <Mail className="w-5 h-5" /> Send PDF Report
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-center text-slate-400 mt-5 leading-relaxed font-medium">
                      By requesting this report, you agree to our terms. For high-savings cases, an AI specialist will reach out with a custom implementation strategy.
                    </p>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-50">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Report Sent!</h3>
                <p className="text-slate-600 font-medium">Check your inbox for the full analysis.</p>
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-violet-600" /> Share Audit
              </h4>
              <div className="bg-slate-50 p-4 rounded-2xl text-xs font-mono font-medium text-slate-500 break-all border-2 border-slate-100 shadow-inner">
                {window.location.href}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  alert('Link copied!')
                }}
                className="mt-4 w-full bg-white border-2 border-slate-200 py-3 rounded-2xl text-sm font-bold hover:bg-slate-50 hover:border-violet-200 hover:text-violet-700 transition-all active:scale-95 shadow-sm"
              >
                Copy Report Link
              </button>
            </div>

            <button
              onClick={() => navigate('/')}
              className="mt-6 w-full text-violet-600 font-bold text-sm hover:text-violet-800 transition-colors"
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
