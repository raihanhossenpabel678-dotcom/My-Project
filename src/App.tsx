/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { RoleSwitcherBar } from './components/RoleSwitcherBar';
import { Header } from './components/Header';
import { UnifiedAuth } from './components/UnifiedAuth';
import { CustomerPostJob } from './components/CustomerPostJob';
import { CustomerDashboard } from './components/CustomerDashboard';
import { ProviderDashboard } from './components/ProviderDashboard';
import { LandingHero } from './components/LandingHero';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';

const MainContent: React.FC = () => {
  const { currentView } = useApp();

  return (
    <main className="flex-1 min-h-[calc(100vh-14rem)]">
      {currentView === 'home' && <LandingHero />}
      {currentView === 'login' && <UnifiedAuth initialMode="login" />}
      {currentView === 'register' && <UnifiedAuth initialMode="register" />}
      {currentView === 'post-job' && <CustomerPostJob />}
      {currentView === 'customer-dashboard' && <CustomerDashboard />}
      {currentView === 'provider-dashboard' && <ProviderDashboard />}
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
        <RoleSwitcherBar />
        <Header />
        <MainContent />
        <Footer />
        <ToastContainer />
      </div>
    </AppProvider>
  );
}
