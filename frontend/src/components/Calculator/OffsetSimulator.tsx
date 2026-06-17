import { useState } from 'react';
import { useCarbonStore } from '../../store/carbonStore';
import { formatKg } from '../../utils/formatters';

export const OffsetSimulator = () => {
  const result = useCarbonStore(s => s.result);
  const simulatedOffsetPct = useCarbonStore(s => s.simulatedOffsetPct);
  const setSimulatedOffsetPct = useCarbonStore(s => s.setSimulatedOffsetPct);
  
  const [showCertificate, setShowCertificate] = useState(false);
  const setStep = useCarbonStore(s => s.setStep);
  const committedActions = useCarbonStore(s => s.committedActions);

  if (!result) return null;

  const totalKg = result.total_kg;
  const completedSavings = committedActions.reduce((acc, curr) => {
    return acc + (curr.completed ? curr.estimated_saving_kg : 0);
  }, 0);
  const netProjected = Math.max(0, totalKg - completedSavings);
  const isEligibleForCertificate = netProjected <= 4000;
  const offsetKg = totalKg * (simulatedOffsetPct / 100);
  const netKg = Math.max(0, totalKg - offsetKg);

  // Equivalencies:
  // 1 tree absorbs ~22kg CO2 per year
  const treesEquiv = Math.round(offsetKg / 22);
  // 1 wind-turbine hour offsets ~1.5kg CO2e
  const turbineHoursEquiv = Math.round(offsetKg / 1.5);
  // Cost: approx $15 / tonne CO2e
  const offsetCost = (offsetKg / 1000) * 15;

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200/50 dark:border-slate-800/40 p-6 space-y-6 relative z-10 hover:border-emerald-250/40 dark:hover:border-slate-750/50 transition-all duration-300">
      <h3 className="text-base font-bold font-display text-gray-800 dark:text-white flex items-center gap-2 border-b border-gray-150 dark:border-slate-800 pb-3 leading-tight">
        <span aria-hidden="true" className="text-lg">🍃</span> Carbon Offset & Net Zero Simulator
      </h3>

      <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed font-sans">
        Simulate mitigating your emissions by funding certified green projects (reforestation, wind energy, methane capture) to bring your footprint down to net zero.
      </p>

      {/* Interactive Slider */}
      <div className="space-y-3.5 bg-slate-50/50 dark:bg-slate-900/40 border border-gray-150 dark:border-slate-800/50 rounded-2xl p-5">
        <div className="flex justify-between items-center text-xs font-bold text-gray-600 dark:text-slate-350">
          <span>Simulated Offset: {simulatedOffsetPct}%</span>
          <span className="text-emerald-600 dark:text-emerald-400">
            Offsetting {formatKg(offsetKg)} CO₂e
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={simulatedOffsetPct}
          onChange={(e) => setSimulatedOffsetPct(parseInt(e.target.value) || 0)}
          className="w-full slider-theme-3"
          aria-label="Carbon offset simulation slider"
        />

        <div className="grid grid-cols-2 gap-4 pt-3.5 border-t border-gray-100 dark:border-slate-800/65">
          <div>
            <span className="block text-[10px] font-bold text-gray-450 dark:text-slate-500 uppercase">Original Footprint</span>
            <span className="text-sm font-extrabold text-gray-750 dark:text-slate-300 tabular-nums">
              {formatKg(totalKg)}
            </span>
          </div>
          <div className="text-right">
            <span className="block text-[10px] font-bold text-gray-450 dark:text-slate-500 uppercase">Net Footprint</span>
            <span className={`text-sm font-black tabular-nums transition-colors duration-250 ${simulatedOffsetPct === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
              {formatKg(netKg)}
            </span>
          </div>
        </div>
      </div>

      {/* Equivalents Dashboard */}
      {simulatedOffsetPct > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
          {/* Trees */}
          <div className="bg-emerald-50/20 dark:bg-emerald-950/5 border border-emerald-100/60 dark:border-emerald-900/10 rounded-xl p-4 text-center">
            <span className="text-xl block mb-1" aria-hidden="true">🌳</span>
            <span className="block text-[10px] font-bold text-gray-400 dark:text-slate-550 uppercase">Reforestation</span>
            <span className="text-base font-black text-emerald-700 dark:text-emerald-400 tabular-nums leading-tight">
              +{treesEquiv.toLocaleString()}
            </span>
            <span className="block text-[9px] text-gray-500 dark:text-slate-400 font-medium mt-0.5">Trees planted / year</span>
          </div>

          {/* Clean Energy */}
          <div className="bg-blue-50/20 dark:bg-blue-950/5 border border-blue-100/60 dark:border-blue-900/10 rounded-xl p-4 text-center">
            <span className="text-xl block mb-1" aria-hidden="true">💨</span>
            <span className="block text-[10px] font-bold text-gray-400 dark:text-slate-550 uppercase">Wind Energy</span>
            <span className="text-base font-black text-blue-600 dark:text-blue-400 tabular-nums leading-tight">
              +{turbineHoursEquiv.toLocaleString()}
            </span>
            <span className="block text-[9px] text-gray-500 dark:text-slate-400 font-medium mt-0.5">Turbine operating hours</span>
          </div>

          {/* Est. Cost */}
          <div className="bg-purple-50/20 dark:bg-purple-950/5 border border-purple-100/60 dark:border-purple-900/10 rounded-xl p-4 text-center">
            <span className="text-xl block mb-1" aria-hidden="true">💳</span>
            <span className="block text-[10px] font-bold text-gray-400 dark:text-slate-550 uppercase">Estimated Cost</span>
            <span className="text-base font-black text-purple-600 dark:text-purple-400 tabular-nums leading-tight">
              ${offsetCost.toFixed(2)}
            </span>
            <span className="block text-[9px] text-gray-500 dark:text-slate-400 font-medium mt-0.5">USD per year</span>
          </div>
        </div>
      )}

      {/* Net Zero Achievement Banner */}
      {simulatedOffsetPct === 100 && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-950 dark:to-teal-900 text-white rounded-2xl p-5 text-center relative overflow-hidden shadow-lg animate-slide-up">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full filter blur-xl -translate-x-12 -translate-y-12" />
          {isEligibleForCertificate ? (
            <>
              <h4 className="text-base font-black font-display mb-1 relative z-10 flex items-center justify-center gap-1.5">
                🏆 You are a Net-Zero Hero!
              </h4>
              <p className="text-xs text-emerald-100 dark:text-slate-350 leading-relaxed mb-4 relative z-10 px-4 max-w-lg mx-auto">
                Your simulated carbon footprint is fully balanced. Generate a certificate of simulation below.
              </p>
              <button
                onClick={() => setShowCertificate(true)}
                className="bg-white hover:bg-emerald-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-emerald-800 dark:text-emerald-350 font-bold px-6 py-2.5 rounded-xl text-xs transition-all relative z-10 shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white dark:focus:ring-offset-slate-900"
              >
                📜 View Simulation Certificate
              </button>
            </>
          ) : (
            <>
              <h4 className="text-base font-black font-display mb-1 relative z-10 flex items-center justify-center gap-1.5 text-amber-300">
                🔒 Certificate Locked
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-4 relative z-10 px-4 max-w-lg mx-auto font-medium">
                Your baseline footprint is too high ({formatKg(totalKg)}) to qualify for Net-Zero modeling. First commit to and complete reduction actions on your <strong>Action Plan</strong> to drop your actual emissions below the {formatKg(4000)} global average threshold.
              </p>
              <button
                onClick={() => setStep('action-plan')}
                className="bg-white hover:bg-slate-100 text-slate-900 font-bold px-6 py-2.5 rounded-xl text-xs transition-all relative z-10 shadow focus:outline-none"
              >
                📋 Go to My Action Plan
              </button>
            </>
          )}
        </div>
      )}

      {/* Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white print:relative print:z-0 print:inset-auto">
          <div className="bg-white text-gray-900 rounded-3xl border-4 border-emerald-600/40 p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden print:border-2 print:border-black print:shadow-none print:p-6 print:rounded-none">
            
            {/* Elegant Certificate Border */}
            <div className="absolute inset-2 border-2 border-emerald-600/20 pointer-events-none rounded-2xl print:border-black print:inset-1" />
            
            {/* Header decor */}
            <div className="text-center space-y-4">
              <span className="text-4xl block print:text-3xl" aria-hidden="true">🌿</span>
              <h1 className="text-2xl font-extrabold font-display uppercase tracking-widest text-emerald-850 print:text-black">
                Certificate of Carbon Neutrality
              </h1>
              <p className="text-xs text-gray-450 uppercase font-semibold tracking-wider font-display">
                Simulated Net-Zero Achievement
              </p>
            </div>

            {/* Body */}
            <div className="text-center my-8 space-y-5">
              <p className="text-sm text-gray-500 italic">This document certifies that the individual of</p>
              <p className="text-lg font-bold font-display text-gray-805 bg-slate-50 py-1.5 px-4 rounded-xl border border-gray-150 inline-block tabular-nums print:bg-transparent print:border-none print:p-0">
                Device ID: {result.device_id.slice(0, 16)}...
              </p>
              <p className="text-sm text-gray-650 max-w-md mx-auto leading-relaxed">
                has successfully modeled a sustainable balance by offsetting <strong className="font-bold">{formatKg(totalKg)}</strong> of annual CO₂e carbon emissions to achieve a simulated state of
              </p>
              <p className="text-2xl font-black font-display text-emerald-600 tracking-tight print:text-black print:text-xl">
                Net-Zero Carbon Footprint
              </p>
            </div>

            {/* Footnote / details */}
            <div className="border-t border-gray-100 pt-6 flex justify-between text-[10px] text-gray-400 font-sans print:border-black">
              <div className="text-left space-y-1">
                <span>Equivalent offset metrics:</span>
                <span className="block font-semibold text-gray-700">{treesEquiv.toLocaleString()} trees planted</span>
                <span className="block font-semibold text-gray-700">{turbineHoursEquiv.toLocaleString()} clean wind hours</span>
              </div>
              <div className="text-right space-y-1">
                <span>Certified on:</span>
                <span className="block font-semibold text-gray-700">{new Date().toLocaleDateString('en-GB')}</span>
                <span className="block font-semibold text-gray-700">Carbon Footprint Simulator</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex justify-end gap-3 print:hidden">
              <button
                onClick={handlePrintCertificate}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow"
              >
                🖨️ Print / Save PDF
              </button>
              <button
                onClick={() => setShowCertificate(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
