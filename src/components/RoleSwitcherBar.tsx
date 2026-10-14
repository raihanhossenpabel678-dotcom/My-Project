import React from 'react';
import { useApp } from '../context/AppContext';
import { Users, RotateCcw } from 'lucide-react';

export const RoleSwitcherBar: React.FC = () => {
  const { users, currentUser, switchUser, resetDatabase, isOnlineFirestore } = useApp();

  return (
    <div className="bg-neutral-900 text-neutral-300 text-xs border-b border-neutral-800 py-1.5 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded border border-neutral-700">
            <span className={`w-1.5 h-1.5 rounded-full ${isOnlineFirestore ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
            {isOnlineFirestore ? 'Firebase Online' : 'Local + Cloud Sync'}
          </span>
          <Users className="w-3.5 h-3.5 text-indigo-400 ml-1" />
          <span className="font-medium text-neutral-200">Switch Persona:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {users.map((user) => {
              const isActive = currentUser?.id === user.id;
              return (
                <button
                  key={user.id}
                  onClick={() => switchUser(user.id)}
                  className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white'
                  }`}
                >
                  {user.name} ({user.role === 'customer' ? 'Customer' : user.category})
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={resetDatabase}
          title="Reset mock data to default"
          className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-200 text-xs px-2 py-1 rounded hover:bg-neutral-800 transition-colors whitespace-nowrap"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Sample Data</span>
        </button>
      </div>
    </div>
  );
};
