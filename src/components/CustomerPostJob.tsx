import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TradeCategory } from '../types';
import { DollarSign, MapPin, ArrowLeft, Send } from 'lucide-react';

export const CustomerPostJob: React.FC = () => {
  const { createJob, navigateTo, currentUser } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TradeCategory>('Plumber');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState(currentUser?.operatingArea || '412 Montgomery St, Downtown Metro');
  const [urgency, setUrgency] = useState<'Immediate (Today)' | 'Within 2-3 Days' | 'Flexible Schedule'>('Within 2-3 Days');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide a descriptive job title.');
      return;
    }

    if (!description.trim() || description.trim().length < 20) {
      setError('Please provide a detailed description (at least 20 characters) so providers can bid accurately.');
      return;
    }

    const budgetNum = parseFloat(budget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      setError('Please enter a valid target budget amount.');
      return;
    }

    if (!location.trim()) {
      setError('Please provide the service address or neighborhood.');
      return;
    }

    createJob({
      title,
      category,
      description,
      budget: budgetNum,
      location,
      urgency,
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
      {/* Top back navigation */}
      <div className="mb-6">
        <button
          onClick={() => navigateTo('customer-dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Dashboard</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-6 sm:p-10">
        <div className="border-b border-neutral-100 pb-6 mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Publish New Service Request
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Specify the trade work required. Verified local service providers will review specifications and submit competitive bids.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Title */}
          <div>
            <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-2">
              Job Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master bathroom leaking shutoff valve & drain clear"
              className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
            />
            <p className="text-xs text-neutral-400 mt-1.5">
              Clear, specific titles receive faster quotes from relevant trades.
            </p>
          </div>

          {/* Trade Category & Budget in 2-col */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-2">
                Trade Specialty
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TradeCategory)}
                className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
              >
                <option value="Plumber">Plumber (Piping, Drains, Fixtures, Heaters)</option>
                <option value="Electrician">Electrician (Panels, Wiring, Outlets, Lighting)</option>
                <option value="Carpenter">Carpenter (Framing, Cabinetry, Trim, Decks)</option>
                <option value="AC Technician">AC Technician (HVAC, Heat Pumps, Refrigerant)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-2">
                Target Budget ($ USD)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <DollarSign className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  required
                  min="25"
                  step="5"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="250"
                  className="w-full pl-9 pr-4 py-3 bg-white border border-neutral-300 rounded-lg text-sm font-mono tabular-nums text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                />
              </div>
              <p className="text-xs text-neutral-400 mt-1.5">
                Providers will bid based on this guideline or submit custom estimates.
              </p>
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-2">
              Detailed Scope of Work
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe symptoms, brand/model if known, accessibility, any materials already purchased, and specific outcome expectations..."
              className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
            />
          </div>

          {/* Location & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-2">
                Service Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. 542 Pine Street, Downtown Metro"
                  className="w-full pl-9 pr-4 py-3 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-2">
                Timeline / Urgency
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
              >
                <option value="Immediate (Today)">Immediate (Today / Emergency)</option>
                <option value="Within 2-3 Days">Within 2-3 Days</option>
                <option value="Flexible Schedule">Flexible Schedule (Next 1-2 Weeks)</option>
              </select>
            </div>
          </div>

          {/* Pre-fill quick samples for testing convenience */}
          <div className="pt-2">
            <span className="text-xs text-neutral-400 font-medium">Quick Templates:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  setTitle('Water Heater Pilot Light Failure & Thermocouple Check');
                  setCategory('Plumber');
                  setBudget('220');
                  setDescription('50-gallon Bradford White gas water heater is failing to stay lit. Status light blinks error code for flame sensor. Need diagnostic and replacement parts.');
                  setUrgency('Immediate (Today)');
                }}
                className="text-xs px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
              >
                Water Heater Diagnostic
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitle('Replace Subpanel Breakers & Install Whole-House Surge Protector');
                  setCategory('Electrician');
                  setBudget('450');
                  setDescription('Square D QO panel needs 2 tandem breakers replaced due to nuisance tripping, plus installation of a Type 2 surge protector in the garage.');
                  setUrgency('Within 2-3 Days');
                }}
                className="text-xs px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
              >
                Electrical Panel Upgrade
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitle('Solid Hardwood Entry Door Weatherstripping & Lockset Mortise');
                  setCategory('Carpenter');
                  setBudget('320');
                  setDescription('Solid oak exterior door is sticking along the top jamb and drafty at threshold. Need plane adjustment, silicone bulb seals, and mortise deadbolt fit.');
                  setUrgency('Flexible Schedule');
                }}
                className="text-xs px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
              >
                Door Alignment & Trim
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-neutral-100 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigateTo('customer-dashboard')}
              className="px-5 py-2.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Publish Job</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
