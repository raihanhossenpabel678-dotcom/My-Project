import React from 'react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { currentUser, currentView, navigateTo, logout } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => {
            if (currentUser?.role === 'customer') {
              navigateTo('customer-dashboard');
            } else if (currentUser?.role === 'provider') {
              navigateTo('provider-dashboard');
            } else {
              navigateTo('home');
            }
          }}
          className="text-xl font-bold tracking-tight text-neutral-900 whitespace-nowrap shrink-0 text-left cursor-pointer hover:opacity-90 transition-opacity"
        >
          FixLocal
        </button>

        {/* Zone 2: 4-5 Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-600">
          {currentUser?.role === 'customer' && (
            <>
              <button
                onClick={() => navigateTo('customer-dashboard')}
                className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  currentView === 'customer-dashboard'
                    ? 'text-indigo-600 font-semibold'
                    : 'hover:text-neutral-900'
                }`}
              >
                My Jobs & Bids
              </button>
              <button
                onClick={() => navigateTo('post-job')}
                className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  currentView === 'post-job'
                    ? 'text-indigo-600 font-semibold'
                    : 'hover:text-neutral-900'
                }`}
              >
                Post New Job
              </button>
            </>
          )}

          {currentUser?.role === 'provider' && (
            <>
              <button
                onClick={() => navigateTo('provider-dashboard')}
                className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  currentView === 'provider-dashboard'
                    ? 'text-indigo-600 font-semibold'
                    : 'hover:text-neutral-900'
                }`}
              >
                Available Work Feed
              </button>
            </>
          )}

          <button
            onClick={() => navigateTo('home')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              currentView === 'home' ? 'text-indigo-600 font-semibold' : 'hover:text-neutral-900'
            }`}
          >
            Marketplace Overview
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover border border-neutral-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center text-xs font-semibold">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-neutral-900 leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] text-neutral-500 capitalize">
                    {currentUser.role === 'provider' ? currentUser.category : 'Customer'}
                  </div>
                </div>
              </div>

              {currentUser.role === 'customer' ? (
                <button
                  onClick={() => navigateTo('post-job')}
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  Post a Job
                </button>
              ) : (
                <button
                  onClick={() => navigateTo('provider-dashboard')}
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  Find Jobs
                </button>
              )}

              <button
                onClick={logout}
                className="text-xs font-medium text-neutral-500 hover:text-neutral-900 px-2 py-1 rounded transition-colors whitespace-nowrap shrink-0"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateTo('login')}
                className="px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Sign In
              </button>
              <button
                onClick={() => navigateTo('register')}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
