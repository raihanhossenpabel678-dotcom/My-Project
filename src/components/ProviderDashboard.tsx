import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Job, TradeCategory } from '../types';
import {
  MapPin,
  Clock,
  DollarSign,
  Send,
  X,
  CheckCircle2,
  Briefcase,
  MessageSquare,
  Calendar,
  FileText,
  Play
} from 'lucide-react';
import { JobChatDrawer } from './JobChatDrawer';
import { ScheduleModal } from './ScheduleModal';
import { EscrowInvoiceModal } from './EscrowInvoiceModal';

export const ProviderDashboard: React.FC = () => {
  const { currentUser, jobs, bids, submitBid, updateJobStatus, isOnlineFirestore } = useApp();

  const providerCategory = currentUser?.category || 'Plumber';
  const [activeFilter, setActiveFilter] = useState<'matching' | 'all' | 'my-bids'>('matching');
  const [categoryFilter, setCategoryFilter] = useState<TradeCategory | 'All'>(providerCategory);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Drawer state
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [proposedPrice, setProposedPrice] = useState<string>('');
  const [estimatedTime, setEstimatedTime] = useState<string>('');
  const [pitch, setPitch] = useState<string>('');
  const [bidError, setBidError] = useState<string | null>(null);

  // Modals state
  const [chatJob, setChatJob] = useState<Job | null>(null);
  const [scheduleJob, setScheduleJob] = useState<Job | null>(null);
  const [invoiceJob, setInvoiceJob] = useState<Job | null>(null);

  const handleOpenBidDrawer = (job: Job) => {
    setSelectedJob(job);
    const myExistingBid = bids.find(
      (b) => b.jobId === job.id && b.providerId === currentUser?.id
    );
    if (myExistingBid) {
      setProposedPrice(myExistingBid.proposedPrice.toString());
      setEstimatedTime(myExistingBid.estimatedTime);
      setPitch(myExistingBid.pitch);
    } else {
      setProposedPrice(job.budget.toString());
      setEstimatedTime('2-3 hours (Can start today)');
      setPitch(`Licensed ${job.category} with 10+ years experience in ${currentUser?.operatingArea || 'Metro area'}. We bring full diagnostic tools and offer a standard 90-day workmanship guarantee.`);
    }
    setBidError(null);
  };

  const handleCloseBidDrawer = () => {
    setSelectedJob(null);
    setBidError(null);
  };

  const handleSubmitBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    const priceNum = parseFloat(proposedPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setBidError('Please enter a valid proposed price.');
      return;
    }
    if (!estimatedTime.trim()) {
      setBidError('Please provide an estimated completion timeline.');
      return;
    }
    if (!pitch.trim() || pitch.trim().length < 15) {
      setBidError('Please write a brief pitch explaining your qualifications or arrival window.');
      return;
    }

    const created = submitBid({
      jobId: selectedJob.id,
      proposedPrice: priceNum,
      estimatedTime,
      pitch,
    });

    if (created) {
      setSelectedJob(null);
    }
  };

  const myBids = bids.filter((b) => b.providerId === currentUser?.id);
  const myBidJobIds = new Set(myBids.map((b) => b.jobId));

  const filteredJobs = jobs.filter((job) => {
    if (activeFilter === 'my-bids') {
      return myBidJobIds.has(job.id);
    }
    if (activeFilter === 'matching') {
      if (job.category !== providerCategory) return false;
    } else if (categoryFilter !== 'All') {
      if (job.category !== categoryFilter) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        job.title.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Provider Workspace Header Banner */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-full object-cover border border-neutral-200 shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center text-lg font-bold shrink-0">
                {currentUser?.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-neutral-900">{currentUser?.name}</h1>
                <span className="text-xs text-neutral-500 font-medium">·</span>
                <span className="text-xs font-semibold text-indigo-600">{currentUser?.category || 'Service Provider'}</span>
                {isOnlineFirestore && (
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Cloud Synced
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 mt-1 font-mono tabular-nums">
                <span>{currentUser?.companyName || 'Independent Contractor'}</span>
                <span aria-hidden="true">·</span>
                <span>Area: {currentUser?.operatingArea || 'Metro District'}</span>
                <span aria-hidden="true">·</span>
                <span>Rating: {currentUser?.rating?.toFixed(1) || '5.0'} ★</span>
                <span aria-hidden="true">·</span>
                <span>{currentUser?.completedJobsCount || 0} verified jobs completed</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-neutral-100 font-mono tabular-nums">
            <div className="text-left md:text-right">
              <div className="text-xs text-neutral-400">Active Proposals</div>
              <div className="text-xl font-bold text-neutral-900 mt-0.5">{myBids.length}</div>
            </div>
            <div className="text-left md:text-right border-l border-neutral-200 pl-6">
              <div className="text-xs text-neutral-400">Open in Category</div>
              <div className="text-xl font-bold text-indigo-600 mt-0.5">
                {jobs.filter((j) => j.status === 'open' && j.category === providerCategory).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-1 p-1 bg-neutral-200/70 rounded-lg self-start">
          <button
            onClick={() => setActiveFilter('matching')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeFilter === 'matching'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            My Specialty ({providerCategory})
          </button>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeFilter === 'all'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            All Local Requests
          </button>
          <button
            onClick={() => setActiveFilter('my-bids')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeFilter === 'my-bids'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            My Bids ({myBids.length})
          </button>
        </div>

        <div className="flex items-center gap-3">
          {activeFilter === 'all' && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="text-xs px-3 py-2 bg-white border border-neutral-300 rounded-lg text-neutral-700 focus:outline-none focus:border-indigo-600"
            >
              <option value="All">All Trades</option>
              <option value="Plumber">Plumber</option>
              <option value="Electrician">Electrician</option>
              <option value="Carpenter">Carpenter</option>
              <option value="AC Technician">AC Technician</option>
            </select>
          )}

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search local jobs..."
              className="w-full sm:w-60 px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Job Feed List */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
          <Briefcase className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-neutral-900">No active job listings found</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            {activeFilter === 'my-bids'
              ? "You haven't submitted bids on any jobs yet. Browse matching requests to send your first proposal."
              : 'There are no open customer requests matching your current filter criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredJobs.map((job) => {
            const jobBids = bids.filter((b) => b.jobId === job.id);
            const myExistingBid = jobBids.find((b) => b.providerId === currentUser?.id);
            const isHiredForThis = job.status !== 'open' && (myExistingBid?.status === 'accepted' || job.hiredProviderId === currentUser?.id);

            return (
              <div
                key={job.id}
                className="bg-white border border-neutral-200 rounded-xl p-6 hover:border-neutral-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-neutral-500 mb-2.5">
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className="text-indigo-600 font-semibold">{job.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{job.urgency}</span>
                      <span aria-hidden="true">·</span>
                      <span>{job.createdAt}</span>
                    </div>

                    {job.status === 'open' && (
                      <span className="text-xs font-medium text-emerald-700 font-mono">
                        Accepting Bids
                      </span>
                    )}
                    {isHiredForThis && (
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        You Were Hired!
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-neutral-900 leading-snug line-clamp-2 mb-2">
                    {job.title}
                  </h3>

                  <p className="text-xs text-neutral-600 line-clamp-3 mb-4 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-neutral-100 text-xs text-neutral-600 mb-4">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end font-mono tabular-nums">
                      <span className="text-neutral-400">Budget:</span>
                      <span className="font-semibold text-neutral-900">${job.budget}</span>
                    </div>
                  </div>
                </div>

                {/* Card footer action */}
                <div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-xs text-neutral-500 font-mono tabular-nums">
                      {jobBids.length} {jobBids.length === 1 ? 'quote received' : 'quotes received'}
                    </div>

                    {myExistingBid && !isHiredForThis && (
                      <button
                        onClick={() => handleOpenBidDrawer(job)}
                        className="px-3.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Bid Placed (${myExistingBid.proposedPrice})</span>
                      </button>
                    )}

                    {!myExistingBid && job.status === 'open' && (
                      <button
                        onClick={() => handleOpenBidDrawer(job)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Submit Bid Quote</span>
                      </button>
                    )}
                  </div>

                  {/* Operational controls if provider is hired for this job */}
                  {isHiredForThis && (
                    <div className="mt-3 pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setChatJob(job)}
                          className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-medium rounded-md transition-colors flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Chat Client</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setScheduleJob(job)}
                          className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-medium rounded-md transition-colors flex items-center gap-1"
                        >
                          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Schedule Visit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setInvoiceJob(job)}
                          className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-medium rounded-md transition-colors flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Escrow & Bill</span>
                        </button>
                      </div>

                      {/* Status progression triggers */}
                      {job.status === 'scheduled' && (
                        <button
                          type="button"
                          onClick={() => updateJobStatus(job.id, 'in_progress')}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-1"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Start Service</span>
                        </button>
                      )}

                      {job.status === 'in_progress' && (
                        <button
                          type="button"
                          onClick={() => updateJobStatus(job.id, 'completed')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Finished</span>
                        </button>
                      )}

                      {job.status === 'completed' && (
                        <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Job Completed
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bidding Drawer Overlay */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="p-6 border-b border-neutral-200 flex items-start justify-between gap-4 sticky top-0 bg-white z-10">
              <div>
                <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                  {selectedJob.category} Service Proposal
                </div>
                <h2 className="text-lg font-bold text-neutral-900 leading-snug">
                  {selectedJob.title}
                </h2>
                <div className="flex items-center gap-2 text-xs text-neutral-500 mt-2 font-mono tabular-nums">
                  <span>Client Budget: ${selectedJob.budget}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedJob.urgency}</span>
                </div>
              </div>

              <button
                onClick={handleCloseBidDrawer}
                className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 space-y-6">
              <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 text-xs space-y-2">
                <div className="font-semibold text-neutral-800">Job Scope:</div>
                <p className="text-neutral-600 leading-relaxed">{selectedJob.description}</p>
                <div className="flex items-center gap-1 text-neutral-500 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{selectedJob.location}</span>
                </div>
              </div>

              {bidError && (
                <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {bidError}
                </div>
              )}

              <form id="bidForm" onSubmit={handleSubmitBid} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-2">
                    Your Proposed Price ($ USD)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      required
                      min="20"
                      step="5"
                      value={proposedPrice}
                      onChange={(e) => setProposedPrice(e.target.value)}
                      placeholder="e.g. 260"
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm font-mono tabular-nums text-neutral-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-2">
                    Estimated Completion Time & Availability
                  </label>
                  <input
                    type="text"
                    required
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    placeholder="e.g. 2 hours (Can arrive today by 2:30 PM)"
                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-2">
                    Pitch / Qualifications Note
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={pitch}
                    onChange={(e) => setPitch(e.target.value)}
                    placeholder="Highlight your trade experience, specific tools carried in your van, warranty on workmanship..."
                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between gap-4 sticky bottom-0">
              <button
                type="button"
                onClick={handleCloseBidDrawer}
                className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="bidForm"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>Submit Official Bid</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Render active modals */}
      {chatJob && <JobChatDrawer job={chatJob} onClose={() => setChatJob(null)} />}
      {scheduleJob && <ScheduleModal job={scheduleJob} onClose={() => setScheduleJob(null)} />}
      {invoiceJob && <EscrowInvoiceModal job={invoiceJob} onClose={() => setInvoiceJob(null)} />}
    </div>
  );
};
