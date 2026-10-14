import React from 'react';
import { useApp } from '../context/AppContext';
import { TradeCategory } from '../types';
import {
  Wrench,
  Zap,
  Hammer,
  Wind,
  Shield,
  ArrowRight,
  Clock,
  DollarSign,
  CheckCircle2,
  MapPin
} from 'lucide-react';

export const LandingHero: React.FC = () => {
  const { navigateTo, jobs, currentUser } = useApp();

  const categories: {
    name: TradeCategory;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    avgQuoteTime: string;
  }[] = [
    {
      name: 'Plumber',
      icon: Wrench,
      description: 'Leak diagnostics, pipe clearing, fixtures, water heaters, and cleanouts.',
      avgQuoteTime: '< 15 mins',
    },
    {
      name: 'Electrician',
      icon: Zap,
      description: 'EV charging circuits, subpanels, breaker diagnosis, wiring, and fixtures.',
      avgQuoteTime: '< 25 mins',
    },
    {
      name: 'Carpenter',
      icon: Hammer,
      description: 'Custom cabinetry, crown molding, door jambs, framing, and decks.',
      avgQuoteTime: '< 40 mins',
    },
    {
      name: 'AC Technician',
      icon: Wind,
      description: 'Heat pump tuneups, condenser service, refrigerant leak tests, and thermostats.',
      avgQuoteTime: '< 20 mins',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Hero Section */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 leading-tight [text-wrap:balance]">
          Hyperlocal trade services with transparent competitive bidding.
        </h1>
        <p className="mt-5 text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
          Skip generic directories and endless phone calls. Post your job, receive custom bids from vetted neighborhood pros, and hire with clear guarantees.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => {
              if (currentUser?.role === 'customer') {
                navigateTo('post-job');
              } else {
                navigateTo('register');
              }
            }}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>Post a Job Request</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (currentUser?.role === 'provider') {
                navigateTo('provider-dashboard');
              } else {
                navigateTo('register');
              }
            }}
            className="px-6 py-3 bg-white hover:bg-neutral-50 text-neutral-800 text-sm font-semibold rounded-lg border border-neutral-300 shadow-2xs transition-colors cursor-pointer"
          >
            <span>Join as Trade Specialist</span>
          </button>
        </div>

        {/* Clean trust indicators */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-500 font-mono tabular-nums">
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-600" />
            100% Verified Trade Licenses
          </span>
          <span aria-hidden="true">·</span>
          <span>Zero Markups on Materials</span>
          <span aria-hidden="true">·</span>
          <span>Guaranteed 2-Hour Response Time</span>
        </div>
      </div>

      {/* Trade Categories Grid */}
      <div className="mb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-neutral-900">Supported Trade Categories</h2>
          <span className="text-xs text-neutral-500">All local contractors background-checked</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const count = jobs.filter((j) => j.category === cat.name && j.status === 'open').length;

            return (
              <div
                key={cat.name}
                className="bg-white border border-neutral-200 rounded-xl p-6 hover:border-neutral-300 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-neutral-900">{cat.name}</h3>
                  <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs font-mono tabular-nums text-neutral-500">
                  <span>{count} open requests</span>
                  <span className="text-indigo-600 font-medium">Avg {cat.avgQuoteTime}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mechanism-to-Outcome Chain */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-8 sm:p-12 mb-16">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-neutral-900">How Hyperlocal Bidding Works</h2>
          <p className="text-xs text-neutral-500 mt-1">
            Engineered for fair pricing, rapid dispatch, and total accountability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold font-mono">
              01
            </div>
            <h3 className="text-base font-bold text-neutral-900 pt-2">Publish Job Specifications</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Define the problem, specify your target budget, and enter your local address. Your job is immediately dispatched to active specialists in your zip code.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold font-mono">
              02
            </div>
            <h3 className="text-base font-bold text-neutral-900 pt-2">Receive Custom Proposals</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Tradespeople review your exact specs and submit bids with fixed prices, verified licenses, estimated arrival hours, and personalized proposals.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold font-mono">
              03
            </div>
            <h3 className="text-base font-bold text-neutral-900 pt-2">One-Click Hire & Direct Contact</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Compare quotes side-by-side. Click "Accept Bid & Hire" to lock in the provider, instantly unlock their phone number, and begin work.
            </p>
          </div>
        </div>
      </div>

      {/* Live Recent Job Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-neutral-900">Recent Marketplace Activity</h2>
          <span className="text-xs text-neutral-500 font-mono">Live local feed</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.slice(0, 4).map((job) => (
            <div
              key={job.id}
              className="bg-white border border-neutral-200 rounded-lg p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5 font-medium">
                  <span className="text-indigo-600 font-semibold">{job.category}</span>
                  <span>{job.createdAt}</span>
                </div>
                <h4 className="text-sm font-semibold text-neutral-900 line-clamp-1">{job.title}</h4>
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-2">
                  <MapPin className="w-3 h-3 text-neutral-400" />
                  <span>{job.location}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-mono tabular-nums">
                <span className="text-neutral-500">Budget: ${job.budget}</span>
                <span className="text-emerald-600 font-semibold">{job.status === 'hired' ? 'Hired' : 'Open for Bids'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
