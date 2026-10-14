import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Job, Bid, Message, Review, AppView, TradeCategory, JobStatus } from '../types';
import { INITIAL_USERS, INITIAL_JOBS, INITIAL_BIDS, INITIAL_MESSAGES, INITIAL_REVIEWS } from '../data/mockData';
import { db, auth, googleProvider } from '../firebase/config';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot
} from 'firebase/firestore';
import { signInWithPopup, signOut } from 'firebase/auth';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface AppContextType {
  users: User[];
  currentUser: User | null;
  jobs: Job[];
  bids: Bid[];
  messages: Message[];
  reviews: Review[];
  currentView: AppView;
  selectedJobId: string | null;
  toasts: Toast[];
  isOnlineFirestore: boolean;
  
  // Navigation
  navigateTo: (view: AppView, jobId?: string) => void;
  
  // Auth
  login: (email: string) => boolean;
  loginWithGoogle: () => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    role: 'customer' | 'provider';
    category?: TradeCategory;
    operatingArea?: string;
    phone?: string;
    companyName?: string;
  }) => User;
  logout: () => void;
  switchUser: (userId: string) => void;
  
  // Jobs
  createJob: (jobData: {
    title: string;
    category: TradeCategory;
    description: string;
    budget: number;
    location: string;
    urgency: 'Immediate (Today)' | 'Within 2-3 Days' | 'Flexible Schedule';
  }) => Job;
  
  // Bidding & Acceptance
  submitBid: (bidData: {
    jobId: string;
    proposedPrice: number;
    estimatedTime: string;
    pitch: string;
  }) => Bid | null;
  acceptBid: (jobId: string, bidId: string) => void;

  // Real-time Chat
  sendMessage: (jobId: string, text: string) => void;

  // Appointment Scheduling & Status
  scheduleAppointment: (jobId: string, date: string, timeSlot: string) => void;
  updateJobStatus: (jobId: string, status: JobStatus) => void;

  // Escrow & Invoices
  fundEscrow: (jobId: string) => void;
  releaseEscrow: (jobId: string) => void;

  // Reviews
  submitReview: (reviewData: {
    jobId: string;
    providerId: string;
    rating: number;
    comment: string;
  }) => void;
  
  // Utils
  addToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
  resetDatabase: () => void;
}

const STORAGE_KEY_PREFIX = 'fixlocal_data_v2_';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}users`);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedCurrent = localStorage.getItem(`${STORAGE_KEY_PREFIX}current_user`);
      if (savedCurrent) return JSON.parse(savedCurrent);
      const savedUsers = localStorage.getItem(`${STORAGE_KEY_PREFIX}users`);
      const userList = savedUsers ? JSON.parse(savedUsers) : INITIAL_USERS;
      return userList[0] || null;
    } catch {
      return INITIAL_USERS[0] || null;
    }
  });

  const [jobs, setJobs] = useState<Job[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}jobs`);
      return saved ? JSON.parse(saved) : INITIAL_JOBS;
    } catch {
      return INITIAL_JOBS;
    }
  });

  const [bids, setBids] = useState<Bid[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}bids`);
      return saved ? JSON.parse(saved) : INITIAL_BIDS;
    } catch {
      return INITIAL_BIDS;
    }
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}messages`);
      return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
    } catch {
      return INITIAL_MESSAGES;
    }
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}reviews`);
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  const [currentView, setCurrentView] = useState<AppView>(() => {
    if (currentUser?.role === 'provider') return 'provider-dashboard';
    if (currentUser?.role === 'customer') return 'customer-dashboard';
    return 'home';
  });

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isOnlineFirestore, setIsOnlineFirestore] = useState(false);

  // Firestore Sync & Listeners
  useEffect(() => {
    let unsubscribeJobs: (() => void) | undefined;
    let unsubscribeBids: (() => void) | undefined;
    let unsubscribeMessages: (() => void) | undefined;

    try {
      // Listen to Jobs
      const jobsCol = collection(db, 'jobs');
      unsubscribeJobs = onSnapshot(
        jobsCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteJobs = snapshot.docs.map((d) => d.data() as Job);
            setJobs(remoteJobs);
            setIsOnlineFirestore(true);
          }
        },
        (error) => {
          console.warn('Firestore onSnapshot jobs fallback to local storage:', error.message);
        }
      );

      // Listen to Bids
      const bidsCol = collection(db, 'bids');
      unsubscribeBids = onSnapshot(
        bidsCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteBids = snapshot.docs.map((d) => d.data() as Bid);
            setBids(remoteBids);
          }
        },
        (error) => {
          console.warn('Firestore onSnapshot bids fallback:', error.message);
        }
      );

      // Listen to Messages
      const messagesCol = collection(db, 'messages');
      unsubscribeMessages = onSnapshot(
        messagesCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteMessages = snapshot.docs.map((d) => d.data() as Message);
            setMessages(remoteMessages);
          }
        },
        (error) => {
          console.warn('Firestore onSnapshot messages fallback:', error.message);
        }
      );
    } catch (e) {
      console.warn('Firestore listener initialization fallback:', e);
    }

    return () => {
      unsubscribeJobs?.();
      unsubscribeBids?.();
      unsubscribeMessages?.();
    };
  }, []);

  // Save to LocalStorage for offline resilience
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}current_user`, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}current_user`);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}jobs`, JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}bids`, JSON.stringify(bids));
  }, [bids]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}messages`, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}reviews`, JSON.stringify(reviews));
  }, [reviews]);

  // Toast System
  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Navigation
  const navigateTo = (view: AppView, jobId?: string) => {
    setCurrentView(view);
    if (jobId !== undefined) {
      setSelectedJobId(jobId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth
  const login = (email: string): boolean => {
    const trimmed = email.trim().toLowerCase();
    const found = users.find((u) => u.email.toLowerCase() === trimmed);
    if (found) {
      setCurrentUser(found);
      addToast(`Welcome back, ${found.name}!`, 'success');
      if (found.role === 'customer') {
        navigateTo('customer-dashboard');
      } else {
        navigateTo('provider-dashboard');
      }
      return true;
    }
    addToast('Account not found with this email. Try one of the demo profiles.', 'error');
    return false;
  };

  const loginWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        const email = res.user.email || 'user@example.com';
        const name = res.user.displayName || 'Google User';
        const avatar = res.user.photoURL || undefined;

        let existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!existing) {
          existing = {
            id: `user_${res.user.uid}`,
            name,
            email,
            role: 'customer',
            avatar,
            operatingArea: 'Downtown Metro',
            phone: '(555) 100-2000',
          };
          setUsers((prev) => [existing!, ...prev]);
        }
        setCurrentUser(existing);
        addToast(`Signed in with Google as ${existing.name}`, 'success');
        navigateTo('customer-dashboard');
      }
    } catch (err: any) {
      console.warn('Google popup auth note:', err.message);
      addToast('Google Sign-in closed or unavailable in this sandbox frame. You can use any demo account or register directly!', 'info');
    }
  };

  const register = (userData: {
    name: string;
    email: string;
    role: 'customer' | 'provider';
    category?: TradeCategory;
    operatingArea?: string;
    phone?: string;
    companyName?: string;
  }): User => {
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      role: userData.role,
      category: userData.category,
      operatingArea: userData.operatingArea?.trim() || 'Metro Area',
      phone: userData.phone?.trim() || '(555) 123-4567',
      companyName: userData.companyName?.trim(),
      rating: userData.role === 'provider' ? 5.0 : undefined,
      completedJobsCount: userData.role === 'provider' ? 0 : undefined,
    };

    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);

    // Sync to Firestore if online
    try {
      setDoc(doc(db, 'users', newUser.id), newUser).catch(() => {});
    } catch {}

    addToast(`Account created as ${newUser.role === 'provider' ? 'Service Provider' : 'Customer'}!`, 'success');

    if (newUser.role === 'customer') {
      navigateTo('customer-dashboard');
    } else {
      navigateTo('provider-dashboard');
    }

    return newUser;
  };

  const logout = () => {
    try {
      signOut(auth).catch(() => {});
    } catch {}
    setCurrentUser(null);
    navigateTo('home');
    addToast('Signed out successfully.', 'info');
  };

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      addToast(`Switched persona to ${target.name} (${target.role === 'provider' ? target.category : 'Customer'})`, 'info');
      if (target.role === 'customer') {
        navigateTo('customer-dashboard');
      } else {
        navigateTo('provider-dashboard');
      }
    }
  };

  // Job Actions
  const createJob = (jobData: {
    title: string;
    category: TradeCategory;
    description: string;
    budget: number;
    location: string;
    urgency: 'Immediate (Today)' | 'Within 2-3 Days' | 'Flexible Schedule';
  }): Job => {
    const customer = currentUser?.role === 'customer' ? currentUser : users.find((u) => u.role === 'customer') || users[0];

    const newJob: Job = {
      id: `job_${Date.now()}`,
      customerId: customer.id,
      customerName: customer.name,
      customerAvatar: customer.avatar,
      customerPhone: customer.phone,
      title: jobData.title.trim(),
      category: jobData.category,
      description: jobData.description.trim(),
      budget: Number(jobData.budget),
      location: jobData.location.trim(),
      urgency: jobData.urgency,
      createdAt: 'Just now',
      status: 'open',
      escrowStatus: 'unfunded',
    };

    setJobs((prev) => [newJob, ...prev]);

    // Push to Firestore
    try {
      setDoc(doc(db, 'jobs', newJob.id), newJob).catch(() => {});
    } catch {}

    addToast('Job published! Local specialists have been notified.', 'success');
    navigateTo('customer-dashboard');
    return newJob;
  };

  // Bid Actions
  const submitBid = (bidData: {
    jobId: string;
    proposedPrice: number;
    estimatedTime: string;
    pitch: string;
  }): Bid | null => {
    if (!currentUser || currentUser.role !== 'provider') {
      addToast('Only registered service providers can submit bids.', 'error');
      return null;
    }

    const existing = bids.find((b) => b.jobId === bidData.jobId && b.providerId === currentUser.id);
    if (existing) {
      addToast('You have already submitted a bid for this job.', 'error');
      return null;
    }

    const newBid: Bid = {
      id: `bid_${Date.now()}`,
      jobId: bidData.jobId,
      providerId: currentUser.id,
      providerName: currentUser.name,
      providerAvatar: currentUser.avatar,
      providerCategory: currentUser.category || 'Plumber',
      providerRating: currentUser.rating || 5.0,
      providerCompletedJobs: currentUser.completedJobsCount || 1,
      providerPhone: currentUser.phone || '(555) 000-0000',
      proposedPrice: Number(bidData.proposedPrice),
      estimatedTime: bidData.estimatedTime.trim(),
      pitch: bidData.pitch.trim(),
      createdAt: 'Just now',
      status: 'pending',
    };

    setBids((prev) => [newBid, ...prev]);

    // Sync to Firestore
    try {
      setDoc(doc(db, 'bids', newBid.id), newBid).catch(() => {});
    } catch {}

    addToast('Bid proposal submitted to customer! They will review your quote.', 'success');
    return newBid;
  };

  const acceptBid = (jobId: string, bidId: string) => {
    const winningBid = bids.find((b) => b.id === bidId);

    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? {
              ...job,
              status: 'hired' as const,
              hiredBidId: bidId,
              hiredProviderId: winningBid?.providerId,
              hiredProviderName: winningBid?.providerName,
              escrowStatus: 'held' as const,
              escrowAmount: winningBid?.proposedPrice || job.budget,
              escrowFundedAt: 'Just now',
            }
          : job
      )
    );

    setBids((prev) =>
      prev.map((bid) => {
        if (bid.jobId === jobId) {
          return bid.id === bidId ? { ...bid, status: 'accepted' as const } : { ...bid, status: 'declined' as const };
        }
        return bid;
      })
    );

    // Initial greeting message in job chat
    const autoMsg: Message = {
      id: `msg_${Date.now()}`,
      jobId,
      senderId: winningBid?.providerId || 'system',
      senderName: winningBid?.providerName || 'Contractor',
      senderRole: 'provider',
      text: `Hello! Thank you for accepting my quote. I look forward to working on your ${winningBid?.providerCategory || 'service'} request. Let's confirm your address and appointment schedule!`,
      createdAt: 'Just now',
    };

    setMessages((prev) => [...prev, autoMsg]);

    // Update Firestore
    try {
      if (winningBid) {
        setDoc(doc(db, 'jobs', jobId), {
          status: 'hired',
          hiredBidId: bidId,
          hiredProviderId: winningBid.providerId,
          hiredProviderName: winningBid.providerName,
          escrowStatus: 'held',
          escrowAmount: winningBid.proposedPrice,
          escrowFundedAt: 'Just now',
        }, { merge: true }).catch(() => {});
        setDoc(doc(db, 'bids', bidId), { status: 'accepted' }, { merge: true }).catch(() => {});
        setDoc(doc(db, 'messages', autoMsg.id), autoMsg).catch(() => {});
      }
    } catch {}

    addToast(`Hired ${winningBid?.providerName}! Escrow funded & chat opened.`, 'success');
  };

  // Real-Time Chat
  const sendMessage = (jobId: string, text: string) => {
    if (!text.trim() || !currentUser) return;

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      jobId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      text: text.trim(),
      createdAt: 'Just now',
    };

    setMessages((prev) => [...prev, newMsg]);

    try {
      setDoc(doc(db, 'messages', newMsg.id), newMsg).catch(() => {});
    } catch {}
  };

  // Appointment Scheduling
  const scheduleAppointment = (jobId: string, date: string, timeSlot: string) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? {
              ...job,
              status: 'scheduled' as const,
              scheduledDate: date,
              scheduledTimeSlot: timeSlot,
            }
          : job
      )
    );

    try {
      setDoc(doc(db, 'jobs', jobId), {
        status: 'scheduled',
        scheduledDate: date,
        scheduledTimeSlot: timeSlot,
      }, { merge: true }).catch(() => {});
    } catch {}

    addToast(`Appointment scheduled for ${date} at ${timeSlot}!`, 'success');
  };

  // Status Progression
  const updateJobStatus = (jobId: string, status: JobStatus) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? {
              ...job,
              status,
            }
          : job
      )
    );

    try {
      setDoc(doc(db, 'jobs', jobId), { status }, { merge: true }).catch(() => {});
    } catch {}

    addToast(`Job status updated to ${status}!`, 'info');
  };

  // Escrow Operations
  const fundEscrow = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    const amount = job?.budget || 250;

    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? {
              ...j,
              escrowStatus: 'held' as const,
              escrowAmount: amount,
              escrowFundedAt: 'Just now',
            }
          : j
      )
    );

    try {
      setDoc(doc(db, 'jobs', jobId), {
        escrowStatus: 'held',
        escrowAmount: amount,
        escrowFundedAt: 'Just now',
      }, { merge: true }).catch(() => {});
    } catch {}

    addToast(`$${amount} securely locked in FixLocal Escrow Guarantee!`, 'success');
  };

  const releaseEscrow = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);

    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? {
              ...j,
              status: 'completed' as const,
              escrowStatus: 'released' as const,
              escrowReleasedAt: 'Just now',
            }
          : j
      )
    );

    try {
      setDoc(doc(db, 'jobs', jobId), {
        status: 'completed',
        escrowStatus: 'released',
        escrowReleasedAt: 'Just now',
      }, { merge: true }).catch(() => {});
    } catch {}

    addToast(`$${job?.escrowAmount || job?.budget} escrow funds released to provider! Work marked completed.`, 'success');
  };

  // Reviews & Ratings
  const submitReview = (reviewData: {
    jobId: string;
    providerId: string;
    rating: number;
    comment: string;
  }) => {
    if (!currentUser) return;

    const newReview: Review = {
      id: `rev_${Date.now()}`,
      jobId: reviewData.jobId,
      customerId: currentUser.id,
      customerName: currentUser.name,
      providerId: reviewData.providerId,
      rating: reviewData.rating,
      comment: reviewData.comment.trim(),
      createdAt: 'Just now',
    };

    setReviews((prev) => [newReview, ...prev]);

    // Recalculate provider score
    const providerReviews = [...reviews.filter((r) => r.providerId === reviewData.providerId), newReview];
    const avgScore = providerReviews.reduce((sum, r) => sum + r.rating, 0) / providerReviews.length;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === reviewData.providerId
          ? {
              ...u,
              rating: Number(avgScore.toFixed(2)),
              completedJobsCount: (u.completedJobsCount || 0) + 1,
            }
          : u
      )
    );

    try {
      setDoc(doc(db, 'reviews', newReview.id), newReview).catch(() => {});
      setDoc(doc(db, 'users', reviewData.providerId), {
        rating: Number(avgScore.toFixed(2)),
      }, { merge: true }).catch(() => {});
    } catch {}

    addToast(`Thank you! Your ${reviewData.rating}★ verified review has been published.`, 'success');
  };

  const resetDatabase = () => {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}users`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}current_user`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}jobs`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}bids`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}messages`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}reviews`);
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setJobs(INITIAL_JOBS);
    setBids(INITIAL_BIDS);
    setMessages(INITIAL_MESSAGES);
    setReviews(INITIAL_REVIEWS);
    setCurrentView('customer-dashboard');
    addToast('Reset platform database to sample state.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        users,
        currentUser,
        jobs,
        bids,
        messages,
        reviews,
        currentView,
        selectedJobId,
        toasts,
        isOnlineFirestore,
        navigateTo,
        login,
        loginWithGoogle,
        register,
        logout,
        switchUser,
        createJob,
        submitBid,
        acceptBid,
        sendMessage,
        scheduleAppointment,
        updateJobStatus,
        fundEscrow,
        releaseEscrow,
        submitReview,
        addToast,
        removeToast,
        resetDatabase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
