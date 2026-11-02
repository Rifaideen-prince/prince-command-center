'use client';

import React, { useState } from 'react';
import {
  Microscope,
  Plus,
  BookOpen,
  FlaskConical,
  FileText,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Check,
  ChevronRight
} from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { ResearchPaper, ResearchExperiment } from '../../lib/types';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';

export function ResearchView() {
  const { research, updateResearch } = useCommandCenter();

  const [activeTab, setActiveTab] = useState<'overview' | 'literature' | 'experiments' | 'results'>('overview');
  const [paperModalOpen, setPaperModalOpen] = useState(false);
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [aiInsightResult, setAiInsightResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // New paper form
  const [paperTitle, setPaperTitle] = useState('');
  const [paperAuthors, setPaperAuthors] = useState('');
  const [paperYear, setPaperYear] = useState('2025');
  const [paperDoi, setPaperDoi] = useState('');
  const [paperFindings, setPaperFindings] = useState('');

  // New experiment form
  const [expTitle, setExpTitle] = useState('');
  const [expParams, setExpParams] = useState('');
  const [expResults, setExpResults] = useState('');
  const [expConclusion, setExpConclusion] = useState('');

  const handleAddPaper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paperTitle.trim()) return;

    const newPaper: ResearchPaper = {
      id: `paper-${Date.now()}`,
      title: paperTitle.trim(),
      authors: paperAuthors.trim() || 'Research Authors',
      year: parseInt(paperYear) || 2025,
      doi: paperDoi.trim(),
      status: 'to_read',
      keyFindings: paperFindings.trim()
    };

    updateResearch({
      literature: [...research.literature, newPaper]
    });

    setPaperTitle('');
    setPaperAuthors('');
    setPaperDoi('');
    setPaperFindings('');
    setPaperModalOpen(false);
  };

  const handleAddExperiment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim()) return;

    const newExp: ResearchExperiment = {
      id: `exp-${Date.now()}`,
      title: expTitle.trim(),
      date: new Date().toISOString().split('T')[0],
      parameters: expParams.trim(),
      results: expResults.trim(),
      conclusion: expConclusion.trim(),
      success: true
    };

    updateResearch({
      experiments: [...research.experiments, newExp]
    });

    setExpTitle('');
    setExpParams('');
    setExpResults('');
    setExpConclusion('');
    setExpModalOpen(false);
  };

  const handleAIAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      if (!research.title && research.literature.length === 0 && research.experiments.length === 0) {
        setAiInsightResult(
          `AI Research Synthesis:
• No research literature or experimental batch data logged yet.
• Add peer-reviewed papers under the "Literature" tab or log lab runs under the "Experiments" tab.
• The AI engine will correlate parameters, spectra, and conclusions once entered.`
        );
      } else {
        setAiInsightResult(
          `AI Synthesis for "${research.title || 'Current Research'}":
• Cataloged Literature: ${research.literature.length} paper(s) reviewed.
• Completed Experiments: ${research.experiments.length} batch run(s) recorded.
• Next Recommendation: Continue systematic characterization and methodology logging.`
        );
      }
      setIsAnalyzing(false);
    }, 700);
  };

  const handleTogglePaperStatus = (paperId: string) => {
    const updated = research.literature.map(p => {
      if (p.id === paperId) {
        const nextStatus: ResearchPaper['status'] =
          p.status === 'to_read' ? 'reading' : p.status === 'reading' ? 'extracted' : 'cited';
        return { ...p, status: nextStatus };
      }
      return p;
    });
    updateResearch({ literature: updated });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-purple-500/20 text-purple-400">
                <Microscope className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono uppercase font-bold text-purple-400">
                Specialized Research Laboratory
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {research.title || 'Specialized Research Laboratory'}
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {research.problem || 'Define your research problem, methodology, literature, and laboratory experiments.'}
            </p>
          </div>

          <button
            onClick={handleAIAnalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg shadow-purple-600/25 transition-all self-start sm:self-center shrink-0"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>{isAnalyzing ? 'Analyzing Methodology...' : 'Run AI Research Synthesis'}</span>
          </button>
        </div>

        {/* AI Insight Box if triggered */}
        {aiInsightResult && (
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/40 text-xs text-purple-200 whitespace-pre-line leading-relaxed animate-in fade-in duration-200">
            {aiInsightResult}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 border-t border-slate-800 pt-3">
          {(['overview', 'literature', 'experiments', 'results'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab === 'literature' ? `Literature (${research.literature.length})` : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Overview (Problem, Solution, Hypothesis, Methodology) */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Research Question &amp; Hypothesis
            </h3>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <strong className="text-indigo-400 block mb-1">Question:</strong>
              {research.researchQuestion || <span className="text-slate-500 italic">No research question defined yet.</span>}
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <strong className="text-emerald-400 block mb-1">Hypothesis:</strong>
              {research.hypothesis || <span className="text-slate-500 italic">No hypothesis formulated yet.</span>}
            </div>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Electrochemical Methodology &amp; Protocol
            </h3>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
              {research.methodology || <span className="text-slate-500 italic font-sans">No methodology protocol specified yet.</span>}
            </div>
            <div className="space-y-1 pt-1">
              <span className="text-[11px] font-semibold text-slate-400">Key Objectives:</span>
              {research.objectives.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No key objectives specified yet.</p>
              ) : (
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                  {research.objectives.map((obj, i) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Literature Papers */}
      {activeTab === 'literature' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-slate-400">
              Peer-reviewed bibliography &amp; methodology extraction
            </span>
            <button
              onClick={() => setPaperModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Paper</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {research.literature.length === 0 ? (
              <div className="col-span-full p-8 text-center text-xs text-slate-500 bg-slate-950 border border-slate-800 rounded-2xl">
                No research papers cataloged yet. Click &quot;Add Paper&quot; above to log literature.
              </div>
            ) : (
              research.literature.map((paper) => (
                <div
                  key={paper.id}
                  className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full ${
                        paper.status === 'extracted'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : paper.status === 'reading'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-indigo-500/20 text-indigo-400'
                      }`}
                    >
                      {paper.status.replace('_', ' ')}
                    </span>
                    {paper.year && (
                      <span className="text-[11px] font-mono text-slate-500">{paper.year}</span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-white leading-snug">{paper.title}</h4>
                  <p className="text-[11px] text-slate-400 font-mono">{paper.authors}</p>

                  {paper.keyFindings && (
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] text-slate-300 leading-relaxed">
                      <strong className="text-indigo-400 block mb-0.5 font-mono">Key Extraction:</strong>
                      {paper.keyFindings}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500">{paper.doi || 'DOI Registered'}</span>
                    <button
                      onClick={() => handleTogglePaperStatus(paper.id)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      Advance Status →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Experiments Log */}
      {activeTab === 'experiments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-slate-400">
              Electrochemical Batch Runs &amp; Characterization
            </span>
            <button
              onClick={() => setExpModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Lab Experiment</span>
            </button>
          </div>

          <div className="space-y-3">
            {research.experiments.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-950 border border-slate-800 rounded-2xl">
                No lab experiments logged yet. Click &quot;Log Lab Experiment&quot; above to record your first run.
              </div>
            ) : (
              research.experiments.map((exp) => (
                <div
                  key={exp.id}
                  className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <FlaskConical className="w-4 h-4 text-emerald-400" />
                      {exp.title}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-500">{exp.date}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] uppercase font-mono text-slate-500 block">Parameters</span>
                      <span className="text-slate-300">{exp.parameters}</span>
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] uppercase font-mono text-slate-500 block">Results</span>
                      <span className="text-slate-300">{exp.results}</span>
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] uppercase font-mono text-slate-500 block">Conclusion</span>
                      <span className="text-emerald-400 font-medium">{exp.conclusion}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Results & Next Milestones */}
      {activeTab === 'results' && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white">Synthesized Findings &amp; Milestones</h3>
          <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950 p-4 rounded-xl border border-slate-800">
            {research.results || 'No synthesized findings documented yet.'}
          </p>
          <div className="pt-2">
            <span className="text-xs font-semibold text-slate-400 block mb-1">Laboratory Note:</span>
            <p className="text-xs text-indigo-300 font-medium">
              {research.notes || 'No laboratory observations noted yet.'}
            </p>
          </div>
        </div>
      )}

      {/* Add Paper Modal */}
      <Modal
        isOpen={paperModalOpen}
        onClose={() => setPaperModalOpen(false)}
        title="Add Research Literature"
        subtitle="Catalog papers with authors, DOI, and key methodology extraction"
      >
        <form onSubmit={handleAddPaper} className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Paper Title</label>
            <input
              type="text"
              value={paperTitle}
              onChange={(e) => setPaperTitle(e.target.value)}
              placeholder="e.g. Green Electrochemical Synthesis of Graphene..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Authors</label>
              <input
                type="text"
                value={paperAuthors}
                onChange={(e) => setPaperAuthors(e.target.value)}
                placeholder="e.g. Coleman et al."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Year</label>
              <input
                type="number"
                value={paperYear}
                onChange={(e) => setPaperYear(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">DOI / Link</label>
            <input
              type="text"
              value={paperDoi}
              onChange={(e) => setPaperDoi(e.target.value)}
              placeholder="10.1038/nnano..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Key Extraction / Findings</label>
            <textarea
              value={paperFindings}
              onChange={(e) => setPaperFindings(e.target.value)}
              rows={2}
              placeholder="What specific parameter or synthesis yield does this paper demonstrate?"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setPaperModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
            >
              Add Paper
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Experiment Modal */}
      <Modal
        isOpen={expModalOpen}
        onClose={() => setExpModalOpen(false)}
        title="Log Lab Run / Experiment"
        subtitle="Record voltage, concentration, Raman/XRD characterization, and conclusion"
      >
        <form onSubmit={handleAddExperiment} className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Batch / Experiment Title</label>
            <input
              type="text"
              value={expTitle}
              onChange={(e) => setExpTitle(e.target.value)}
              placeholder="e.g. Batch C1: 0.25M ammonium sulfate at 15V pulse"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Parameters (Voltage, Temp, Duration)</label>
            <input
              type="text"
              value={expParams}
              onChange={(e) => setExpParams(e.target.value)}
              placeholder="e.g. 10V peak, 10Hz square pulse, 45 min, 25°C"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Observed Results &amp; Spectra</label>
            <input
              type="text"
              value={expResults}
              onChange={(e) => setExpResults(e.target.value)}
              placeholder="e.g. Raman ratio I(2D)/I(G) = 1.9, high dispersion stability"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Scientific Conclusion</label>
            <input
              type="text"
              value={expConclusion}
              onChange={(e) => setExpConclusion(e.target.value)}
              placeholder="e.g. Verified optimal parameter for single-sheet yield without lattice rupture"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setExpModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
            >
              Save Experiment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
