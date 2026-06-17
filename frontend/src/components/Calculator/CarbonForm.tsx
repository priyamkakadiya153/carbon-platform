/**
 * CarbonForm — Multi-step wizard carbon footprint input form.
 *
 * WCAG 2.1 AA compliance features:
 *   - Every input has an associated <label> via htmlFor/id pairing
 *   - aria-describedby links inputs to helper text and error messages
 *   - Radio groups use <fieldset> + <legend>
 *   - Validation errors shown with role="alert" and aria-live="polite"
 *   - Submit button uses aria-busy during calculation
 *   - All validation done client-side with Zod before API call
 */

import { type ChangeEvent, type FormEvent, useState } from 'react';
import { useCarbonStore } from '../../store/carbonStore';
import type { CarbonInput } from '../../types';
import { getDeviceId } from '../../utils/formatters';
import { carbonInputSchema, type CarbonInputForm } from '../../utils/validators';
import { LoadingSpinner } from '../shared/LoadingSpinner';

type FormErrors = Partial<Record<keyof CarbonInputForm, string>>;

const initialValues: CarbonInputForm = {
  transport_km_car_petrol: 0,
  transport_km_car_diesel: 0,
  transport_km_car_electric: 0,
  transport_km_bus: 0,
  transport_km_train: 0,
  flights_short_haul: 0,
  flights_long_haul: 0,
  home_electricity_kwh: 0,
  home_gas_kwh: 0,
  household_size: 1,
  diet_type: 'meat_medium',
  consumption_level: 'medium',
  device_id: getDeviceId(),
};

const InputField = ({
  id,
  label,
  value,
  unit,
  helper,
  error,
  step = 'any',
  min = 0,
  max = 20000,
  onChange,
  onBlur,
  presets = [],
  theme = 1,
}: {
  id: string;
  label: string;
  value: number;
  unit?: string;
  helper?: string;
  error?: string;
  step?: string | number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  onBlur: () => void;
  presets?: number[];
  theme?: 1 | 2 | 3;
}) => {
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;
  const describedBy = [helper ? helperId : '', error ? errorId : ''].filter(Boolean).join(' ');

  // Dynamic focus glows based on step themes
  const focusGlowClass = theme === 1 
    ? 'focus-within-glow-1' 
    : theme === 2 
      ? 'focus-within-glow-2' 
      : 'focus-within-glow-3';
      
  const hoverBorderClass = theme === 1
    ? 'hover:border-blue-300 dark:hover:border-blue-800'
    : theme === 2
      ? 'hover:border-orange-300 dark:hover:border-orange-800'
      : 'hover:border-emerald-300 dark:hover:border-emerald-800';

  const presetHoverClass = theme === 1
    ? 'hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-900'
    : theme === 2
      ? 'hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-650 dark:hover:text-orange-400 hover:border-orange-200 dark:hover:border-orange-900'
      : 'hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-900';

  const inputFocusClass = theme === 1
    ? 'focus:ring-blue-550 focus:border-blue-500'
    : theme === 2
      ? 'focus:ring-orange-500 focus:border-orange-500'
      : 'focus:ring-emerald-500 focus:border-emerald-500';

  return (
    <div className={`space-y-2.5 p-4 sm:p-5 rounded-2xl bg-white/50 dark:bg-slate-900/40 border border-gray-200/60 dark:border-slate-800/60 shadow-sm transition-all duration-300 ${focusGlowClass} ${hoverBorderClass}`}>
      <div className="flex justify-between items-center flex-wrap gap-2">
        <label htmlFor={id} className="block text-sm font-bold text-gray-700 dark:text-slate-200">
          {label}
          {unit && <span className="text-gray-400 dark:text-slate-400 font-normal text-xs ml-1">({unit})</span>}
        </label>
        {presets.length > 0 && (
          <div className="flex gap-1 items-center">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  onChange(Math.min(max, value + preset));
                  onBlur();
                }}
                className={`text-[10px] font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-gray-200/70 dark:border-slate-700 text-gray-600 dark:text-slate-350 transition-colors focus:outline-none ${presetHoverClass}`}
              >
                +{preset.toLocaleString()}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                onChange(min);
                onBlur();
              }}
              className="text-[10px] font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-gray-200/70 dark:border-slate-700 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-200 dark:hover:border-red-900 transition-colors focus:outline-none"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Number Input */}
        <input
          id={id}
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          aria-describedby={describedBy || undefined}
          aria-invalid={!!error}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(parseFloat(e.target.value) || 0)}
          onBlur={onBlur}
          className={`
            w-full sm:w-28 rounded-lg border px-3 py-2 text-sm font-bold focus:outline-none
            focus:ring-2 transition-colors duration-150 bg-white dark:bg-slate-900 text-gray-900 dark:text-white
            ${inputFocusClass}
            ${error ? 'border-red-400 bg-red-50/50 dark:bg-red-950/20' : 'border-gray-300 dark:border-slate-750 hover:border-gray-400 dark:hover:border-slate-650'}
          `}
        />

        {/* Range Slider */}
        <div className="flex-1 flex items-center gap-2">
          <input
            type="range"
            min={min}
            max={max}
            step={step === 'any' ? (max <= 100 ? 1 : 100) : step}
            value={value}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              onChange(parseFloat(e.target.value) || 0);
            }}
            onBlur={onBlur}
            className={`flex-1 w-full slider-theme-${theme}`}
            aria-label={`${label} slider`}
          />
        </div>
      </div>

      {helper && (
        <span id={helperId} className="block text-xs text-gray-550 dark:text-slate-400">
          {helper}
        </span>
      )}
      {error && (
        <span
          id={errorId}
          role="alert"
          aria-live="polite"
          className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 font-bold animate-pulse"
        >
          <span aria-hidden="true">⚠</span> {error}
        </span>
      )}
    </div>
  );
};

const SectionHeader = ({
  icon,
  title,
  description,
  id,
}: {
  icon: string;
  title: string;
  description: string;
  id: string;
}) => (
  <div className="flex items-start gap-3 mb-6 pb-4 border-b border-gray-150 dark:border-slate-800/60">
    <span className="text-3xl animate-pulse-slow" aria-hidden="true">
      {icon}
    </span>
    <div>
      <h2 id={id} className="text-xl font-bold font-display text-gray-900 dark:text-white leading-tight">
        {title}
      </h2>
      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 font-medium">{description}</p>
    </div>
  </div>
);

export const CarbonForm = () => {
  const [values, setValues] = useState<CarbonInputForm>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof CarbonInputForm, boolean>>>({});
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const calculate = useCarbonStore(s => s.calculate);
  const isCalculating = useCarbonStore(s => s.isCalculating);
  const storeError = useCarbonStore(s => s.error);
  const clearError = useCarbonStore(s => s.clearError);

  const validateField = (field: keyof CarbonInputForm, value: unknown) => {
    const partial = { ...values, [field]: value };
    const result = carbonInputSchema.safeParse(partial);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const msg = fieldErrors[field]?.[0];
      setErrors(prev => ({ ...prev, [field]: msg ?? undefined }));
    } else {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const updateField = <K extends keyof CarbonInputForm>(field: K, value: CarbonInputForm[K]) => {
    setValues(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validateField(field, value);
    }
    if (storeError) clearError();
  };

  const handleBlur = (field: keyof CarbonInputForm) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, values[field]);
  };

  const validateStep = (step: 1 | 2 | 3): boolean => {
    const result = carbonInputSchema.safeParse(values);
    if (result.success) {
      return true;
    }

    const fieldErrors = result.error.flatten().fieldErrors;
    const newErrors: FormErrors = {};
    let hasStepError = false;

    const stepFields: Record<1 | 2 | 3, Array<keyof CarbonInputForm>> = {
      1: [
        'transport_km_car_petrol',
        'transport_km_car_diesel',
        'transport_km_car_electric',
        'transport_km_bus',
        'transport_km_train',
        'flights_short_haul',
        'flights_long_haul',
      ],
      2: ['home_electricity_kwh', 'home_gas_kwh', 'household_size'],
      3: ['diet_type', 'consumption_level'],
    };

    const fieldsToCheck = stepFields[step];
    fieldsToCheck.forEach(field => {
      if (fieldErrors[field]?.[0]) {
        newErrors[field] = fieldErrors[field][0];
        hasStepError = true;
      }
    });

    setErrors(prev => ({ ...prev, ...newErrors }));
    const stepTouched = fieldsToCheck.reduce((acc, f) => ({ ...acc, [f]: true }), {});
    setTouched(prev => ({ ...prev, ...stepTouched }));

    return !hasStepError;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => (prev < 3 ? (prev + 1 as 1 | 2 | 3) : prev));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => (prev > 1 ? (prev - 1 as 1 | 2 | 3) : prev));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (currentStep < 3) {
      handleNext();
      return;
    }

    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return;
    }

    const result = carbonInputSchema.safeParse(values);
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      const newErrors: FormErrors = {};
      for (const [k, msgs] of Object.entries(flat)) {
        if (msgs?.[0]) newErrors[k as keyof CarbonInputForm] = msgs[0];
      }
      setErrors(newErrors);
      return;
    }

    await calculate(result.data as CarbonInput);
  };

  const stepNames = ['Transport', 'Home Energy', 'Diet & Lifestyle'];

  return (
    <div className="space-y-6">
      {/* Visual Stepper Tracker */}
      <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-gray-200/50 dark:border-slate-800/40 shadow-sm flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-slate-800 -translate-y-1/2 z-0 hidden sm:block px-12" />
        {stepNames.map((name, index) => {
          const stepNum = index + 1;
          const isCompleted = currentStep > stepNum;
          const isActive = currentStep === stepNum;
          return (
            <button
              key={name}
              type="button"
              onClick={() => {
                if (stepNum < currentStep) {
                  setCurrentStep(stepNum as 1 | 2 | 3);
                } else if (stepNum > currentStep) {
                  let canJump = true;
                  for (let s = currentStep; s < stepNum; s++) {
                    if (!validateStep(s as 1 | 2 | 3)) {
                      canJump = false;
                      break;
                    }
                  }
                  if (canJump) {
                    setCurrentStep(stepNum as 1 | 2 | 3);
                  }
                }
              }}
              className="relative z-10 flex flex-col items-center gap-1.5 focus:outline-none"
              aria-label={`Step ${stepNum}: ${name}`}
            >
              <span
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold font-display transition-all duration-300 ring-4 ${
                  isCompleted
                    ? 'bg-primary-600 dark:bg-primary-500 text-white ring-primary-100 dark:ring-primary-950/60'
                    : isActive
                      ? 'bg-primary-600 dark:bg-primary-500 text-white ring-primary-200 dark:ring-primary-900/60 scale-110 shadow-md shadow-primary-600/10'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-450 ring-transparent hover:bg-gray-200 dark:hover:bg-slate-750'
                }`}
              >
                {isCompleted ? '✓' : stepNum}
              </span>
              <span
                className={`text-xs font-bold font-display transition-colors ${
                  isActive ? 'text-primary-700 dark:text-primary-400' : 'text-gray-500 dark:text-slate-450'
                }`}
              >
                {name}
              </span>
            </button>
          );
        })}
      </div>

      <form
        onSubmit={handleSubmit}
        aria-label="Carbon footprint calculator form"
        noValidate
        className="space-y-6 animate-fade-in"
      >
        {/* Step 1: Transport */}
        <section
          aria-labelledby="transport-heading"
          className={`bg-white/80 dark:bg-slate-900/65 backdrop-blur-md rounded-3xl border p-6 transition-all duration-300 step-glow-1 ${currentStep !== 1 ? 'hidden' : ''}`}
        >
            <SectionHeader
              id="transport-heading"
              icon="🚗"
              title="Transport & Travel"
              description="Enter your annual travel distances and frequency of flights."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                id="transport_km_car_petrol"
                label="Petrol Car"
                value={values.transport_km_car_petrol}
                unit="km/year"
                helper="Annual distance driven in petrol or hybrid car"
                error={errors.transport_km_car_petrol}
                max={50000}
                presets={[1000, 5000]}
                theme={1}
                onChange={v => updateField('transport_km_car_petrol', v)}
                onBlur={() => handleBlur('transport_km_car_petrol')}
              />
              <InputField
                id="transport_km_car_diesel"
                label="Diesel Car"
                value={values.transport_km_car_diesel}
                unit="km/year"
                helper="Annual distance driven in diesel car"
                error={errors.transport_km_car_diesel}
                max={50000}
                presets={[1000, 5000]}
                theme={1}
                onChange={v => updateField('transport_km_car_diesel', v)}
                onBlur={() => handleBlur('transport_km_car_diesel')}
              />
              <InputField
                id="transport_km_car_electric"
                label="Electric Vehicle"
                value={values.transport_km_car_electric}
                unit="km/year"
                helper="Annual distance driven in battery electric vehicle"
                error={errors.transport_km_car_electric}
                max={50000}
                presets={[1000, 5000]}
                theme={1}
                onChange={v => updateField('transport_km_car_electric', v)}
                onBlur={() => handleBlur('transport_km_car_electric')}
              />
              <InputField
                id="transport_km_bus"
                label="Bus"
                value={values.transport_km_bus}
                unit="km/year"
                helper="Annual distance travelled by bus or coach"
                error={errors.transport_km_bus}
                max={20000}
                presets={[500, 2000]}
                theme={1}
                onChange={v => updateField('transport_km_bus', v)}
                onBlur={() => handleBlur('transport_km_bus')}
              />
              <InputField
                id="transport_km_train"
                label="Train / Metro"
                value={values.transport_km_train}
                unit="km/year"
                helper="Annual distance by train, metro, or tram"
                error={errors.transport_km_train}
                max={30000}
                presets={[1000, 5000]}
                theme={1}
                onChange={v => updateField('transport_km_train', v)}
                onBlur={() => handleBlur('transport_km_train')}
              />
              <InputField
                id="flights_short_haul"
                label="Short-Haul Flights"
                value={values.flights_short_haul}
                unit="flights/year"
                helper="Flights under 3 hours (e.g. London to Paris)"
                error={errors.flights_short_haul}
                step={1}
                min={0}
                max={50}
                presets={[1, 5]}
                theme={1}
                onChange={v => updateField('flights_short_haul', Math.round(v))}
                onBlur={() => handleBlur('flights_short_haul')}
              />
              <InputField
                id="flights_long_haul"
                label="Long-Haul Flights"
                value={values.flights_long_haul}
                unit="flights/year"
                helper="Flights over 3 hours (e.g. London to New York)"
                error={errors.flights_long_haul}
                step={1}
                min={0}
                max={20}
                presets={[1, 2]}
                theme={1}
                onChange={v => updateField('flights_long_haul', Math.round(v))}
                onBlur={() => handleBlur('flights_long_haul')}
              />
            </div>
          </section>

        {/* Step 2: Home Energy */}
        <section
          aria-labelledby="home-heading"
          className={`bg-white/80 dark:bg-slate-900/65 backdrop-blur-md rounded-3xl border p-6 transition-all duration-300 step-glow-2 ${currentStep !== 2 ? 'hidden' : ''}`}
        >
            <SectionHeader
              id="home-heading"
              icon="🏠"
              title="Home Energy & Household"
              description="Your household's annual energy consumption. Energy factors are divided equally among occupants."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                id="home_electricity_kwh"
                label="Electricity"
                value={values.home_electricity_kwh}
                unit="kWh/year"
                helper="Annual electricity use — UK average is ~3,700 kWh/year"
                error={errors.home_electricity_kwh}
                max={15000}
                presets={[500, 1000]}
                theme={2}
                onChange={v => updateField('home_electricity_kwh', v)}
                onBlur={() => handleBlur('home_electricity_kwh')}
              />
              <InputField
                id="home_gas_kwh"
                label="Natural Gas"
                value={values.home_gas_kwh}
                unit="kWh/year"
                helper="Annual gas use — UK average is ~12,000 kWh/year"
                error={errors.home_gas_kwh}
                max={25000}
                presets={[1000, 5000]}
                theme={2}
                onChange={v => updateField('home_gas_kwh', v)}
                onBlur={() => handleBlur('home_gas_kwh')}
              />
              <InputField
                id="household_size"
                label="Household Size"
                value={values.household_size}
                unit="people"
                helper="Number of people sharing your home"
                error={errors.household_size}
                step={1}
                min={1}
                max={10}
                presets={[1]}
                theme={2}
                onChange={v => updateField('household_size', Math.round(v))}
                onBlur={() => handleBlur('household_size')}
              />
            </div>
          </section>

        {/* Step 3: Diet & Lifestyle */}
        <section
          aria-labelledby="lifestyle-heading"
          className={`bg-white/80 dark:bg-slate-900/65 backdrop-blur-md rounded-3xl border p-6 transition-all duration-300 step-glow-3 ${currentStep !== 3 ? 'hidden' : ''}`}
        >
            <SectionHeader
              id="lifestyle-heading"
              icon="🥗"
              title="Diet & Lifestyle"
              description="Your food choices and consumption habits have a significant impact on emissions."
            />
            <div className="space-y-6">
              {/* Diet Type — radio group */}
              <fieldset>
                <legend className="text-sm font-semibold text-gray-750 dark:text-slate-250 mb-3.5 font-display">
                  Dietary Pattern
                  <span className="block text-xs font-normal text-gray-500 dark:text-slate-450 mt-0.5 font-sans">
                    Select the option that best describes your typical daily food intake
                  </span>
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {(
                    [
                      {
                        value: 'meat_heavy',
                        label: '🥩 Meat-heavy',
                        desc: 'Meat with most meals (>100g/day)',
                      },
                      {
                        value: 'meat_medium',
                        label: '🍗 Meat-moderate',
                        desc: 'Meat a few times a week',
                      },
                      {
                        value: 'vegetarian',
                        label: '🥚 Vegetarian',
                        desc: 'No meat, but dairy & eggs are fine',
                      },
                      { value: 'vegan', label: '🌱 Vegan', desc: 'Fully plant-based diet' },
                    ] as const
                  ).map(({ value, label, desc }) => (
                    <label
                      key={value}
                      htmlFor={`diet-type-${value}`}
                      className={`
                        flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer
                        transition-all duration-300 hover:scale-[1.015] hover:shadow-md
                        ${
                          values.diet_type === value
                            ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/20'
                            : 'border-gray-250/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 hover:border-emerald-200 dark:hover:border-slate-700'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        id={`diet-type-${value}`}
                        name="diet_type"
                        value={value}
                        checked={values.diet_type === value}
                        onChange={() => updateField('diet_type', value)}
                        className="mt-1 accent-emerald-500 dark:accent-emerald-400"
                      />
                      <span className="sr-only">{label}</span>
                      <div className="flex-1 font-sans">
                        <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center justify-between">
                          {label}
                          {values.diet_type === value && (
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400" aria-hidden="true">
                              ✓ Active
                            </span>
                          )}
                        </span>
                        <span className="block text-xs text-gray-500 dark:text-slate-400 mt-0.5">{desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Consumption Level */}
              <div className="space-y-2">
                <label htmlFor="consumption_level" className="block text-sm font-bold font-display text-gray-755 dark:text-slate-250">
                  Shopping & Consumption Level
                </label>
                <span id="consumption-helper" className="text-xs text-gray-500 dark:text-slate-450 block font-medium">
                  How much do you typically spend on new goods (clothes, electronics, furniture, books)?
                </span>
                <select
                  id="consumption_level"
                  value={values.consumption_level}
                  onChange={e =>
                    updateField(
                      'consumption_level',
                      e.target.value as CarbonInputForm['consumption_level']
                    )
                  }
                  aria-describedby="consumption-helper"
                  className="
                    w-full sm:w-72 rounded-lg border border-gray-300 dark:border-slate-700 px-3.5 py-2.5 text-sm font-semibold
                    focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                    bg-white dark:bg-slate-900 hover:border-gray-400 dark:hover:border-slate-600 text-gray-900 dark:text-white transition-colors duration-150
                  "
                >
                  <option value="low">🌿 Low — mostly second-hand, minimal new goods</option>
                  <option value="medium">⚖️ Medium — average consumer spending</option>
                  <option value="high">🛒 High — frequent new purchases</option>
                </select>
              </div>
            </div>
          </section>

        {/* Error Banner */}
        {storeError && (
          <div
            role="alert"
            aria-live="assertive"
            className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-4 flex items-start gap-3"
          >
            <span className="text-red-500 text-lg" aria-hidden="true">
              ⚠️
            </span>
            <div>
              <p className="text-sm font-bold text-red-800 dark:text-red-300">Calculation failed</p>
              <p className="text-sm text-red-600 dark:text-red-450 mt-0.5">{storeError}</p>
            </div>
          </div>
        )}

        {/* Multi-step Wizard Navigation Buttons */}
        <div className="flex justify-between items-center gap-4 pt-2">
          {currentStep > 1 ? (
            <button
              key="back-btn"
              type="button"
              onClick={handleBack}
              className="
                flex items-center gap-2 border border-gray-350 dark:border-slate-750
                text-gray-700 dark:text-slate-350 px-6 py-3 rounded-xl text-sm font-bold font-display
                hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-450 dark:hover:border-slate-650
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus-visible:ring-offset-slate-950
                transition-all active:scale-95 shadow-sm
              "
            >
              <span>←</span> Back
            </button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <button
              key="next-btn"
              type="button"
              onClick={handleNext}
              className="
                flex items-center gap-2 bg-primary-200 dark:bg-primary-500 text-slate-950 dark:text-white
                px-6 py-3 rounded-xl text-sm font-bold font-display
                hover:bg-primary-300 dark:hover:bg-primary-600
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus-visible:ring-offset-slate-950
                transition-all active:scale-95 shadow-sm
              "
            >
              Next Step <span>→</span>
            </button>
          ) : (
            <button
              key="submit-btn"
              type="submit"
              disabled={isCalculating}
              aria-busy={isCalculating}
              aria-label={
                isCalculating ? 'Calculating your carbon footprint...' : 'Calculate my carbon footprint'
              }
              className="
                flex items-center gap-3 bg-primary-200 dark:bg-primary-500 text-slate-950 dark:text-white
                px-8 py-3.5 rounded-xl text-base font-bold font-display
                hover:bg-primary-300 dark:hover:bg-primary-600 active:scale-95
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus-visible:ring-offset-slate-950
                disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
                transition-all duration-200 shadow-lg shadow-primary-200/25 dark:shadow-none
                min-w-[200px] justify-center
              "
            >
              {isCalculating ? (
                <LoadingSpinner label="Calculating..." size="sm" />
              ) : (
                <>
                  <span aria-hidden="true">🌍</span>
                  Calculate Footprint
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
