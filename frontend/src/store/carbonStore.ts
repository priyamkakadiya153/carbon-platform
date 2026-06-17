/**
 * Zustand store for the Carbon Footprint Awareness Platform.
 *
 * State shape:
 *   inputs          — Partial CarbonInput being edited in the form
 *   result          — Latest CarbonResult from the API
 *   insights        — Latest InsightsResponse from the API
 *   history         — Array of HistoryEntry objects for the current device
 *   isCalculating   — True while /api/calculate is in-flight
 *   isLoadingInsights — True while /api/insights is in-flight
 *   isLoadingHistory  — True while /api/entries GET is in-flight
 *   error           — User-facing error message or null
 *   step            — Current view: 'form' | 'results' | 'history'
 */

import { create } from 'zustand';
import { apiClient } from '../api/client';
import type { AppStep, CarbonInput, CarbonResult, HistoryEntry, InsightsResponse, CommittedAction, InsightItem } from '../types';
import { getDeviceId } from '../utils/formatters';

interface CarbonState {
  // Data
  inputs: Partial<CarbonInput>;
  result: CarbonResult | null;
  insights: InsightsResponse | null;
  history: HistoryEntry[];
  committedActions: CommittedAction[];
  simulatedOffsetPct: number;

  // Loading states
  isCalculating: boolean;
  isLoadingInsights: boolean;
  isLoadingHistory: boolean;

  // UI
  error: string | null;
  step: AppStep;

  // Actions
  setInputs: (inputs: Partial<CarbonInput>) => void;
  calculate: (inputs: CarbonInput) => Promise<void>;
  fetchInsights: () => Promise<void>;
  saveEntry: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  setStep: (step: AppStep) => void;
  clearError: () => void;
  reset: () => void;
  commitAction: (action: InsightItem) => void;
  uncommitAction: (actionText: string) => void;
  toggleActionComplete: (actionText: string) => void;
  setSimulatedOffsetPct: (pct: number) => void;
}

export const useCarbonStore = create<CarbonState>((set, get) => ({
  // Initial state
  inputs: {},
  result: null,
  insights: null,
  history: [],
  committedActions: (() => {
    try {
      const saved = localStorage.getItem('carbon_committed_actions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })(),
  simulatedOffsetPct: (() => {
    try {
      const saved = localStorage.getItem('carbon_simulated_offset');
      return saved ? parseFloat(saved) || 0 : 0;
    } catch {
      return 0;
    }
  })(),
  isCalculating: false,
  isLoadingInsights: false,
  isLoadingHistory: false,
  error: null,
  step: 'form',

  setInputs: inputs => set(state => ({ inputs: { ...state.inputs, ...inputs } })),

  calculate: async (inputs: CarbonInput) => {
    set({ isCalculating: true, error: null, result: null, insights: null });
    try {
      const result = await apiClient.calculateFootprint(inputs);
      set({ result, inputs, step: 'results', isCalculating: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to calculate footprint',
        isCalculating: false,
      });
    }
  },

  fetchInsights: async () => {
    const { result } = get();
    if (!result) return;

    set({ isLoadingInsights: true, error: null });
    try {
      const deviceId = getDeviceId();
      const insights = await apiClient.getInsights(result, deviceId);
      set({ insights, isLoadingInsights: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch insights',
        isLoadingInsights: false,
      });
    }
  },

  saveEntry: async () => {
    const { result, insights } = get();
    if (!result || !insights) return;

    try {
      await apiClient.saveEntry(result, insights.insights);
    } catch (err) {
      // Non-critical — log but don't surface to user
    }
  },

  fetchHistory: async () => {
    set({ isLoadingHistory: true, error: null });
    try {
      const deviceId = getDeviceId();
      const history = await apiClient.getHistory(deviceId);
      set({ history, isLoadingHistory: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load history',
        isLoadingHistory: false,
      });
    }
  },

  setStep: step => set({ step }),

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      inputs: {},
      result: null,
      insights: null,
      error: null,
      step: 'form',
    }),

  commitAction: (action: InsightItem) => {
    const { committedActions } = get();
    if (committedActions.some(a => a.action === action.action)) return;
    const newActions: CommittedAction[] = [
      ...committedActions,
      { ...action, completed: false, committedAt: new Date().toISOString() },
    ];
    localStorage.setItem('carbon_committed_actions', JSON.stringify(newActions));
    set({ committedActions: newActions });
  },

  uncommitAction: (actionText: string) => {
    const { committedActions } = get();
    const newActions = committedActions.filter(a => a.action !== actionText);
    localStorage.setItem('carbon_committed_actions', JSON.stringify(newActions));
    set({ committedActions: newActions });
  },

  toggleActionComplete: (actionText: string) => {
    const { committedActions } = get();
    const newActions = committedActions.map(a =>
      a.action === actionText ? { ...a, completed: !a.completed } : a
    );
    localStorage.setItem('carbon_committed_actions', JSON.stringify(newActions));
    set({ committedActions: newActions });
  },

  setSimulatedOffsetPct: (pct: number) => {
    localStorage.setItem('carbon_simulated_offset', pct.toString());
    set({ simulatedOffsetPct: pct });
  },
}));
