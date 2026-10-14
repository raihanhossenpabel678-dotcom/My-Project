import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-neutral-200 bg-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <span className="font-bold text-neutral-800">FixLocal</span>
          <span>·</span>
          <span>Hyperlocal Service Finder & Bidding Platform</span>
        </div>
        <div className="flex items-center gap-6">
          <span>Verified Local Contractors</span>
          <span>·</span>
          <span>Direct Quotes</span>
          <span>·</span>
          <span>Zero Platform Markups</span>
        </div>
      </div>
    </footer>
  );
};
