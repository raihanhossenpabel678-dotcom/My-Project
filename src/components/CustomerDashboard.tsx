import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Job, Bid } from '../types';
import {
  Plus,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  CheckCircle2,
  Phone,
  Star,
  ShieldCheck,
  Briefcase,
  MessageSquare,
  Calendar,
  DollarSign,
  FileText,
  Award
} from 'lucide-react';
import { JobChatDrawer } from './JobChatDrawer';
import { ScheduleModal } from './ScheduleModal';
import { EscrowInvoiceModal } from './EscrowInvoiceModal';
import { ReviewModal } from './ReviewModal';

export const CustomerDashboard: React.FC = () => {
  const {
    currentUser,
    jobs,
    bids,
    reviews,
    acceptBid,
    updateJobStatus,
    navigateTo,
    isOnlineFirestore,
  } = useApp();

  const [expandedJobIds, setExpandedJobIds] = useState<Record<string, boolean>>({
    job_1: true,
    job_2: true,
  });

  // Modals state
  const [chatJob, setChatJob] = useState<Job | null>(null);
  const [scheduleJob, setScheduleJob] = useState<Job | null>(null);
  const [invoiceJob, setInvoiceJob] = useState<Job | null>(null);
  const [reviewJob, setReviewJob] = useState<Job | null>(null);

  const toggleExpand = (jobId: string) => {
    setExpandedJobIds((prev) => ({
      ...prev,
      [jobId]: !prev[jobId],
    }));
  };

  const customerJobs = jobs.filter((j) => j.customerId === currentUser?.id);
  const totalPosted = customerJobs.length;
  const openJobs = customerJobs.filter((j) => j.status === 'open').length;
  const activeServices = customerJobs.filter((j) => ['hired', 'scheduled', 'in_progress'].includes(j.status)).length;
  const completedJobs = customerJobs.filter((j) => j.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Top Banner & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Customer Workspace
            </h1>
            {isOnlineFirestore && (
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Cloud Synced
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            Real-time status tracking, escrow management, contractor messaging, and verified evaluations.
          </p>
        </div>

        <button
          onClick={() => navigateTo('post-job')}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Job Request</span>
        </button>
      </div>

      {/* Top Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <div className="text-xs text-neutral-500 font-medium">Total Requests</div>
          <div className="text-2xl font-bold text-neutral-900 mt-1 font-mono tabular-nums">{totalPosted}</div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <div className="text-xs text-neutral-500 font-medium">Open for Quotes</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1 font-mono tabular-nums">{openJobs}</div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <div className="text-xs text-neutral-500 font-medium">In Progress & Scheduled</div>
          <div className="text-2xl font-bold text-amber-600 mt-1 font-mono tabular-nums">{activeServices}</div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <div className="text-xs text-neutral-500 font-medium">Completed & Verified</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono tabular-nums">{completedJobs}</div>
        </div>
      </div>

      {/* Job List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">Your Posted Service Requests</h2>
          <span className="text-xs text-neutral-500 font-mono tabular-nums">
            Showing {customerJobs.length} active listings
          </span>
        </div>

        {customerJobs.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
            <Briefcase className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-neutral-900">No active job listings yet</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Post your first repair or renovation request to receive competitive quotes from local licensed trade professionals.
            </p>
            <button
              onClick={() => navigateTo('post-job')}
              className="mt-5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Request</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {customerJobs.map((job) => {
              const isExpanded = !!expandedJobIds[job.id];
              const jobBids = bids.filter((b) => b.jobId === job.id);
              const winningBid = job.hiredBidId ? bids.find((b) => b.id === job.hiredBidId) : null;
              const hasReview = reviews.some((r) => r.jobId === job.id);

              return (
                <div
                  key={job.id}
                  className="bg-white border border-neutral-200 rounded-xl overflow-hidden transition-all shadow-xs"
                >
                  {/* Job Header Card */}
                  <div
                    onClick={() => toggleExpand(job.id)}
                    className="p-6 cursor-pointer hover:bg-neutral-50/60 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 mb-1.5">
                          <span className="font-semibold text-indigo-600">{job.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>{job.urgency}</span>
                          <span aria-hidden="true">·</span>
                          <span>Posted {job.createdAt}</span>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-neutral-400" />
                            {job.location}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-neutral-900 leading-snug">
                          {job.title}
                        </h3>

                        <p className="text-xs text-neutral-600 mt-1 line-clamp-2">
                          {job.description}
                        </p>

                        {/* Status tracker progression bar */}
                        <div className="mt-4 pt-3 border-t border-neutral-100 flex flex-wrap items-center gap-4 text-xs font-mono">
                          <div className="flex items-center gap-1">
                            <span className="text-neutral-400">Current Phase:</span>
                            <span className="font-semibold uppercase tracking-wider text-indigo-600">
                              {job.status === 'open' && '1. Open for Quotes'}
                              {job.status === 'hired' && '2. Specialist Hired (Escrow Funded)'}
                              {job.status === 'scheduled' && `3. Scheduled (${job.scheduledDate})`}
                              {job.status === 'in_progress' && '4. Work In Progress'}
                              {job.status === 'completed' && '5. Completed & Escrow Released'}
                            </span>
                          </div>

                          {job.escrowStatus === 'held' && (
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              ${job.escrowAmount || job.budget} in Protected Escrow
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right stats */}
                      <div className="flex items-center gap-6 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-100 font-mono tabular-nums">
                        <div>
                          <div className="text-[11px] text-neutral-400">Budget Target</div>
                          <div className="text-base font-bold text-neutral-900">${job.budget}</div>
                        </div>

                        <div className="text-right">
                          <div className="text-[11px] text-neutral-400">Quotes</div>
                          <div className="text-base font-bold text-indigo-600">
                            {jobBids.length}
                          </div>
                        </div>

                        {/* Status visual state */}
                        <div className="min-w-28 text-right">
                          {job.status === 'completed' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Completed
                            </span>
                          ) : job.status === 'scheduled' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 text-xs font-semibold">
                              <Calendar className="w-3.5 h-3.5" />
                              Scheduled
                            </span>
                          ) : job.status === 'hired' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 text-xs font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Hired
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-100 text-neutral-700 text-xs font-medium">
                              Open for Bids
                            </span>
                          )}
                        </div>

                        <div className="text-neutral-400 hover:text-neutral-700">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Operational Toolbar for Hired/Active/Completed Jobs */}
                  {job.status !== 'open' && (
                    <div className="px-6 py-3 bg-neutral-100/70 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-neutral-800">Assigned Pro:</span>
                        <span className="text-indigo-600 font-bold">{job.hiredProviderName}</span>
                        {job.scheduledDate && (
                          <span className="text-neutral-500 font-mono">
                            · Visit: {job.scheduledDate} ({job.scheduledTimeSlot})
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Live Chat Trigger */}
                        <button
                          type="button"
                          onClick={() => setChatJob(job)}
                          className="px-3 py-1.5 bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-800 font-medium rounded-md shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Direct Chat</span>
                        </button>

                        {/* Scheduling Trigger */}
                        <button
                          type="button"
                          onClick={() => setScheduleJob(job)}
                          className="px-3 py-1.5 bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-800 font-medium rounded-md shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{job.scheduledDate ? 'Change Schedule' : 'Set Appointment'}</span>
                        </button>

                        {/* Invoice & Escrow Trigger */}
                        <button
                          type="button"
                          onClick={() => setInvoiceJob(job)}
                          className="px-3 py-1.5 bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-800 font-medium rounded-md shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Invoice & Escrow</span>
                        </button>

                        {/* Completion / Review Trigger */}
                        {job.status === 'completed' && !hasReview && (
                          <button
                            type="button"
                            onClick={() => setReviewJob(job)}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-md shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5 fill-white" />
                            <span>Leave Review</span>
                          </button>
                        )}
                        {hasReview && (
                          <span className="text-emerald-700 font-medium text-xs flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Reviewed
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Expanded Bids Section */}
                  {isExpanded && (
                    <div className="border-t border-neutral-200 bg-neutral-50/70 p-6 sm:p-8">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                          Provider Proposals & Bids ({jobBids.length})
                        </div>
                        {job.status === 'open' && jobBids.length > 0 && (
                          <span className="text-xs text-neutral-500">
                            Accepting a bid funds the platform escrow guarantee and unlocks direct chat.
                          </span>
                        )}
                      </div>

                      {jobBids.length === 0 ? (
                        <div className="bg-white border border-neutral-200 rounded-lg p-6 text-center text-xs text-neutral-500">
                          No provider quotes received yet. Local {job.category.toLowerCase()} specialists have been notified.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {jobBids.map((bid) => {
                            const isAccepted = bid.status === 'accepted';
                            const isJobHired = job.status !== 'open';

                            return (
                              <div
                                key={bid.id}
                                className={`bg-white rounded-lg border transition-all p-5 sm:p-6 ${
                                  isAccepted
                                    ? 'border-emerald-400 ring-2 ring-emerald-500/20 bg-emerald-50/20'
                                    : 'border-neutral-200'
                                }`}
                              >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                  <div className="flex items-start gap-3.5">
                                    {bid.providerAvatar ? (
                                      <img
                                        src={bid.providerAvatar}
                                        alt={bid.providerName}
                                        referrerPolicy="no-referrer"
                                        className="w-12 h-12 rounded-full object-cover border border-neutral-200 shrink-0"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700 flex items-center justify-center font-bold text-sm shrink-0">
                                        {bid.providerName.charAt(0)}
                                      </div>
                                    )}

                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-bold text-neutral-900">
                                          {bid.providerName}
                                        </h4>
                                        <span className="text-xs text-neutral-400">·</span>
                                        <span className="text-xs font-semibold text-indigo-600">
                                          {bid.providerCategory}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1 font-mono tabular-nums">
                                        <span className="flex items-center gap-1 text-amber-600 font-medium">
                                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                          {bid.providerRating.toFixed(1)}
                                        </span>
                                        <span aria-hidden="true">·</span>
                                        <span>{bid.providerCompletedJobs} jobs completed</span>
                                        <span aria-hidden="true">·</span>
                                        <span className="flex items-center gap-1 text-neutral-600">
                                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                          Background Verified
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="sm:text-right shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-100 font-mono tabular-nums">
                                    <div className="text-xs text-neutral-400">Proposed Fixed Quote</div>
                                    <div className="text-2xl font-bold text-neutral-900 mt-0.5">
                                      ${bid.proposedPrice}
                                    </div>
                                    <div className="text-xs text-neutral-500 mt-0.5 flex sm:justify-end items-center gap-1">
                                      <Clock className="w-3 h-3 text-neutral-400" />
                                      <span>Est: {bid.estimatedTime}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-4 pt-3.5 border-t border-neutral-100">
                                  <div className="text-xs font-semibold text-neutral-700 mb-1">
                                    Specialist Proposal & Message:
                                  </div>
                                  <p className="text-xs text-neutral-700 leading-relaxed bg-neutral-50/70 p-3 rounded-md border border-neutral-100">
                                    "{bid.pitch}"
                                  </p>
                                </div>

                                <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-3">
                                  <div className="text-xs text-neutral-400 font-mono">
                                    Submitted {bid.createdAt}
                                  </div>

                                  {isAccepted ? (
                                    <div className="flex flex-wrap items-center gap-3">
                                      <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 bg-emerald-100/70 px-3 py-1.5 rounded-md">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <span>Hired Professional</span>
                                      </div>
                                      {bid.providerPhone && (
                                        <a
                                          href={`tel:${bid.providerPhone}`}
                                          className="text-xs font-medium text-neutral-700 hover:text-neutral-900 flex items-center gap-1 bg-white border border-neutral-200 px-3 py-1.5 rounded-md shadow-2xs"
                                        >
                                          <Phone className="w-3.5 h-3.5 text-indigo-600" />
                                          <span>Call: {bid.providerPhone}</span>
                                        </a>
                                      )}
                                    </div>
                                  ) : isJobHired ? (
                                    <span className="text-xs text-neutral-400 italic">
                                      Another provider was selected for this request
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => acceptBid(job.id, bid.id)}
                                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                      <span>Accept Bid & Fund Escrow</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Render active modals */}
      {chatJob && <JobChatDrawer job={chatJob} onClose={() => setChatJob(null)} />}
      {scheduleJob && <ScheduleModal job={scheduleJob} onClose={() => setScheduleJob(null)} />}
      {invoiceJob && <EscrowInvoiceModal job={invoiceJob} onClose={() => setInvoiceJob(null)} />}
      {reviewJob && <ReviewModal job={reviewJob} onClose={() => setReviewJob(null)} />}
    </div>
  );
};
