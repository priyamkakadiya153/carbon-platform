/**
 * App — Main application layout with ARIA landmarks.
 *
 * Accessibility features:
 *   - role="banner" on header
 *   - <nav aria-label="Main navigation">
 *   - id="main-content" tabIndex={-1} as skip-link target
 *   - role="contentinfo" on footer
 *   - Error boundary wraps the entire app
 */import { useEffect, useState } from 'react';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { SkipLink } from './components/shared/SkipLink';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { CarbonForm } from './components/Calculator/CarbonForm';
import { ResultsDisplay } from './components/Calculator/ResultsDisplay';
import { InsightsList } from './components/Insights/InsightsList';
import { HistoryChart } from './components/History/HistoryChart';
import { HistoryTable } from './components/History/HistoryTable';
import { ActionPlanDashboard } from './components/ActionPlan/ActionPlanDashboard';
import { useCarbonStore } from './store/carbonStore';

const NavLink = ({
  label,
  active,
  onClick,
  className = '',
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  className?: string;
}) => (
  <button
    onClick={onClick}
    aria-current={active ? 'page' : undefined}
    className={`
      px-4 py-2 rounded-xl text-sm font-bold font-display transition-all duration-150
      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
      ${
        active
          ? 'bg-primary-200 text-slate-955 shadow-md shadow-primary-200/20 dark:bg-primary-500 dark:text-white'
          : 'text-gray-600 dark:text-slate-300 hover:text-primary-700 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-slate-800'
      }
      ${className}
    `}
  >
    {label}
  </button>
);

function AppContent() {
  const step = useCarbonStore(s => s.step);
  const setStep = useCarbonStore(s => s.setStep);
  const result = useCarbonStore(s => s.result);
  const insights = useCarbonStore(s => s.insights);
  const history = useCarbonStore(s => s.history);
  const isLoadingHistory = useCarbonStore(s => s.isLoadingHistory);
  const fetchHistory = useCarbonStore(s => s.fetchHistory);
  const reset = useCarbonStore(s => s.reset);
  const error = useCarbonStore(s => s.error);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleHistoryClick = () => {
    setStep('history');
    fetchHistory();
  };

  // Focus main content area on step change (for keyboard/screen reader users)
  useEffect(() => {
    const main = document.getElementById('main-content');
    if (main) main.focus();
  }, [step]);

  return (
    <div className="min-h-screen animated-bg text-gray-900 dark:text-slate-100 transition-colors duration-300 flex flex-col relative overflow-hidden">
      {/* Drifting Background Gradient Orbs */}
      <div className="orb-container" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* Skip Link */}
      <SkipLink />

      {/* ------------------------------------------------------------------ */}
      {/* Header / Navigation                                                  */}
      {/* ------------------------------------------------------------------ */}
      <header
        role="banner"
        className="sticky top-0 z-40 bg-white/75 dark:bg-slate-900/75 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-800/40 shadow-sm relative z-40 print:hidden"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={reset}
            aria-label="Carbon Footprint Platform — return to calculator"
            className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg p-1 hover:opacity-95 transition-opacity"
          >
            <span className="text-xl sm:text-2xl animate-pulse-slow" aria-hidden="true">
              🌱
            </span>
            <div className="text-left font-display">
              <span className="block text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight">
                Carbon Platform
              </span>
              <span className="block text-[10px] sm:text-xs text-primary-600 dark:text-primary-400 font-bold leading-tight">
                Understand · Track · Reduce
              </span>
            </div>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl border border-gray-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-850 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              <span className="text-lg flex items-center justify-center h-5 w-5 transform transition-transform duration-500 hover:rotate-45">
                {darkMode ? '☀️' : '🌙'}
              </span>
            </button>

            {/* Desktop Navigation */}
            <nav aria-label="Main navigation" className="hidden sm:block">
              <ul className="flex items-center gap-1.5 list-none m-0 p-0">
                <li>
                  <NavLink
                    label="Calculate"
                    active={step === 'form' || step === 'results'}
                    onClick={() => setStep(result ? 'results' : 'form')}
                  />
                </li>
                <li>
                  <NavLink
                    label="Action Plan"
                    active={step === 'action-plan'}
                    onClick={() => setStep('action-plan')}
                  />
                </li>
                <li>
                  <NavLink label="History" active={step === 'history'} onClick={handleHistoryClick} />
                </li>
              </ul>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="sm:hidden p-2 rounded-xl border border-gray-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-850 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-expanded={isMenuOpen}
              aria-label="Toggle main navigation menu"
            >
              <span className="text-lg flex items-center justify-center h-5 w-5">
                {isMenuOpen ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMenuOpen && (
          <nav
            aria-label="Mobile navigation"
            className="sm:hidden border-t border-gray-200/50 dark:border-slate-800/40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md animate-fade-in"
          >
            <ul className="flex flex-col gap-2 p-4 list-none m-0">
              <li>
                <NavLink
                  label="Calculate"
                  active={step === 'form' || step === 'results'}
                  onClick={() => {
                    setStep(result ? 'results' : 'form');
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left justify-start block"
                />
              </li>
              <li>
                <NavLink
                  label="Action Plan"
                  active={step === 'action-plan'}
                  onClick={() => {
                    setStep('action-plan');
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left justify-start block"
                />
              </li>
              <li>
                <NavLink
                  label="History"
                  active={step === 'history'}
                  onClick={() => {
                    handleHistoryClick();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left justify-start block"
                />
              </li>
            </ul>
          </nav>
        )}
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Hero Banner (only on form step)                                      */}
      {/* ------------------------------------------------------------------ */}
      {step === 'form' && (
        <div className="bg-gradient-to-r from-emerald-600 via-primary-600 to-teal-500 dark:from-emerald-950 dark:via-slate-900 dark:to-teal-900 text-white py-12 px-4 shadow-inner relative overflow-hidden z-10 print:hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.08),transparent_50%)] pointer-events-none" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="text-3xl sm:text-5xl font-black font-display mb-3.5 tracking-tight bg-clip-text bg-gradient-to-r from-white via-slate-100 to-emerald-100">
              What's Your Carbon Footprint?
            </h1>
            <p className="text-primary-100 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
              Enter your lifestyle data below to calculate your annual CO₂e emissions, compare against benchmarks,
              simulate offsets to achieve Net-Zero neutrality, and track your ongoing footprint reductions.
            </p>
            <div className="flex flex-wrap justify-center gap-5 sm:gap-8 mt-7 text-xs sm:text-sm text-primary-200 dark:text-slate-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <span aria-hidden="true" className="text-base">📊</span> Science-backed factors
              </span>
              <span className="flex items-center gap-1.5">
                <span aria-hidden="true" className="text-base">✨</span> Gemini AI insights
              </span>
              <span className="flex items-center gap-1.5">
                <span aria-hidden="true" className="text-base">📋</span> Action Plan tracker
              </span>
              <span className="flex items-center gap-1.5">
                <span aria-hidden="true" className="text-base">🏆</span> Eco achievements
              </span>
              <span className="flex items-center gap-1.5">
                <span aria-hidden="true" className="text-base">🔒</span> Anonymous & private
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Main Content                                                         */}
      {/* ------------------------------------------------------------------ */}
      <main
        id="main-content"
        tabIndex={-1}
        aria-label="Main content"
        className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 focus:outline-none flex-grow"
      >
        {step === 'form' && <CarbonForm />}

        {step === 'results' && result && (
          <div className="space-y-8">
            {/* Action buttons header */}
            <div className="flex justify-between items-center relative z-10 print:hidden">
              <button
                onClick={() => setStep('form')}
                aria-label="Back to calculator form"
                className="
                  flex items-center gap-2 text-sm text-gray-550 hover:text-primary-700
                  dark:text-slate-400 dark:hover:text-primary-400
                  focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg px-2.5 py-1.5
                  transition-colors duration-150 font-medium
                "
              >
                <span aria-hidden="true">←</span> Back to Calculator
              </button>
              <button
                onClick={() => window.print()}
                className="
                  flex items-center gap-1.5 text-xs text-primary-750 dark:text-primary-400 font-bold
                  bg-white/50 dark:bg-slate-900/40 border border-gray-200/50 dark:border-slate-800/40
                  hover:bg-gray-105 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-xl px-4 py-2
                  transition-all duration-150 shadow-sm
                "
                aria-label="Print carbon footprint report card"
              >
                <span>🖨️</span> Print Report Card
              </button>
            </div>
            <ResultsDisplay result={result} />
            {insights && <InsightsList insightsResponse={insights} />}
          </div>
        )}

        {step === 'action-plan' && <ActionPlanDashboard />}

        {step === 'history' && (
          <div className="space-y-6 relative z-10">
            <div>
              <h1 className="text-2xl font-extrabold font-display text-gray-900 dark:text-white mb-1">Your Carbon History</h1>
              <p className="text-gray-500 dark:text-slate-400 text-sm">
                Track your footprint over time to see the impact of your changes.
              </p>
            </div>
            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-4 flex items-start gap-3"
              >
                <span className="text-red-500 text-lg" aria-hidden="true">
                  ⚠️
                </span>
                <div>
                  <p className="text-sm font-bold text-red-800 dark:text-red-300">Failed to load history</p>
                  <p className="text-sm text-red-600 dark:text-red-450 mt-0.5">{error}</p>
                </div>
              </div>
            )}
            {isLoadingHistory ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner label="Loading your history..." size="lg" />
              </div>
            ) : (
              <>
                <HistoryChart history={history} />
                <HistoryTable history={history} />
              </>
            )}
          </div>
        )}
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* Footer                                                               */}
      {/* ------------------------------------------------------------------ */}
      <footer role="contentinfo" className="border-t border-gray-200/50 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm mt-auto py-8 px-4 print:hidden">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-6">
            <div>
              <h2 className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-2.5">Data Sources</h2>
              <ul className="text-xs text-gray-500 dark:text-slate-400 space-y-1.5 list-none m-0 p-0">
                <li>UK DEFRA 2023 — Transport & Home Energy factors</li>
                <li>US EPA 2023 — Electricity grid emissions</li>
                <li>ICAO Carbon Calculator — Aviation emissions</li>
                <li>Our World in Data 2023 — Diet emissions & global average</li>
                <li>IPCC AR6 / SR1.5 — Consumption & Paris target</li>
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-2.5">About</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed m-0">
                This tool provides estimates for educational purposes based on peer-reviewed
                emission factors. Individual results may vary based on local grid mix, vehicle
                efficiency, and personal circumstances.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-200/50 dark:border-slate-800/60 pt-4 flex flex-col sm:flex-row justify-between items-center gap-2.5 text-xs text-gray-400 dark:text-slate-500">
            <span>© 2024 Carbon Footprint Awareness Platform</span>
            <span className="flex items-center gap-1 text-gray-550 dark:text-slate-400">
              Powered by{' '}
              <span aria-label="Google Gemini AI" className="font-semibold text-gray-600 dark:text-slate-300">
                Google Gemini
              </span>{' '}
              ·{' '}
              <span aria-label="Google Cloud" className="font-semibold text-gray-600 dark:text-slate-300">
                Google Cloud
              </span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
