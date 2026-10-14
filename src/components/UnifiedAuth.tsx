import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, TradeCategory } from '../types';
import {
  ArrowRight,
  Wrench,
  User as UserIcon,
  Eye,
  EyeOff,
  KeyRound,
  Check,
  ShieldCheck,
  Copy
} from 'lucide-react';

interface UnifiedAuthProps {
  initialMode?: 'login' | 'register';
}

const generateStrongPassword = (): string => {
  const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowers = 'abcdefghijkmnopqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%^&*+=?';

  // Ensure at least one from each required pool
  let pwd = '';
  pwd += uppers[Math.floor(Math.random() * uppers.length)];
  pwd += lowers[Math.floor(Math.random() * lowers.length)];
  pwd += numbers[Math.floor(Math.random() * numbers.length)];
  pwd += symbols[Math.floor(Math.random() * symbols.length)];

  const allChars = uppers + lowers + numbers + symbols;
  for (let i = 0; i < 10; i++) {
    pwd += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Randomize order
  return pwd
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('');
};

export const UnifiedAuth: React.FC<UnifiedAuthProps> = ({ initialMode = 'login' }) => {
  const { login, register, users, switchUser, addToast, loginWithGoogle } = useApp();
  
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<TradeCategory>('Plumber');
  const [operatingArea, setOperatingArea] = useState('Downtown Metro');
  const [phone, setPhone] = useState('(555) 240-8833');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('Password@123#Secure');
  const [showPassword, setShowPassword] = useState(false);
  const [suggestedPassword, setSuggestedPassword] = useState<string>(() => generateStrongPassword());
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Evaluate password strength criteria
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  const criteriaCount = [
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSymbol,
  ].filter(Boolean).length;

  const isStrong = criteriaCount >= 4 && hasMinLength;

  const getStrengthLabel = () => {
    if (password.length === 0) return { label: 'None', color: 'bg-neutral-200', text: 'text-neutral-400' };
    if (criteriaCount <= 2) return { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600' };
    if (criteriaCount <= 3) return { label: 'Moderate', color: 'bg-amber-500', text: 'text-amber-600' };
    return { label: 'Strong & Secure', color: 'bg-emerald-500', text: 'text-emerald-600' };
  };

  const strength = getStrengthLabel();

  // Apply suggested strong password
  const handleApplySuggestedPassword = () => {
    const strong = suggestedPassword || generateStrongPassword();
    setPassword(strong);
    setShowPassword(true);
    setCopiedNotification(true);
    
    // Copy to clipboard if available
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(strong).catch(() => {});
    }
    
    addToast('Strong password applied and copied to clipboard!', 'success');

    // Generate a fresh next suggestion
    setSuggestedPassword(generateStrongPassword());

    setTimeout(() => {
      setCopiedNotification(false);
    }, 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (authMode === 'login') {
      if (!email.trim()) {
        setError('Please enter your email address.');
        return;
      }
      const success = login(email);
      if (!success) {
        setError('No account found with this email. Try our demo profiles below or register.');
      }
    } else {
      if (!name.trim()) {
        setError('Please enter your full name or trade name.');
        return;
      }
      if (!email.trim()) {
        setError('Please enter a valid email address.');
        return;
      }

      // Strong password validation enforcement
      if (!isStrong) {
        setError('A strong password is required (minimum 8 characters with numbers, uppercase, and special characters). You can click "Use Suggested Strong Password" to apply one instantly.');
        return;
      }
      
      register({
        name,
        email,
        role: selectedRole,
        category: selectedRole === 'provider' ? category : undefined,
        operatingArea: selectedRole === 'provider' ? operatingArea : undefined,
        phone,
        companyName: selectedRole === 'provider' ? companyName : undefined,
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-6 sm:p-8">
        {/* Header Title & Subtitle */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            {authMode === 'login' ? 'Sign in to FixLocal' : 'Create your FixLocal account'}
          </h1>
          <p className="text-sm text-neutral-500 mt-1.5">
            {authMode === 'login'
              ? 'Access your jobs, live bids, and local service interactions'
              : 'Join the transparent hyperlocal bidding network'}
          </p>
        </div>

        {/* Role Toggle Switch */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
            Select Account Type
          </label>
          <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-lg">
            <button
              type="button"
              onClick={() => setSelectedRole('customer')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs font-medium transition-all ${
                selectedRole === 'customer'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <UserIcon className="w-4 h-4 text-neutral-500" />
              <span>Customer (Hire Pros)</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('provider')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs font-medium transition-all ${
                selectedRole === 'provider'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Wrench className="w-4 h-4 text-indigo-600" />
              <span>Service Provider (Bid on Jobs)</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                {selectedRole === 'provider' ? 'Primary Contact / Owner Name' : 'Full Name'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={selectedRole === 'provider' ? 'e.g. Marcus Vance' : 'e.g. Sarah Jenkins'}
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
            />
          </div>

          {/* Password with Strong Password Suggestion & Strength Meter */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-neutral-700">
                Password
              </label>
              {authMode === 'register' && (
                <span className={`text-[11px] font-semibold font-mono ${strength.text}`}>
                  {strength.label}
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-3.5 pr-11 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm font-mono text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-700 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strong Password Suggestion Box (Active in Register mode) */}
            {authMode === 'register' && (
              <div className="mt-3 p-3.5 rounded-lg bg-neutral-50 border border-neutral-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="text-xs font-semibold text-neutral-800">
                      Suggested Strong Password:
                    </span>
                    <span className="text-xs font-mono font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                      {suggestedPassword}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplySuggestedPassword}
                    className="text-xs font-semibold px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Use Suggested Password</span>
                  </button>
                </div>

                {copiedNotification && (
                  <div className="text-[11px] text-emerald-600 font-medium mt-2 flex items-center gap-1 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Password copied to clipboard & applied to field.
                  </div>
                )}

                {/* Password Strength Progress Bar */}
                <div className="mt-3">
                  <div className="grid grid-cols-4 gap-1.5 h-1.5 mb-2">
                    <div className={`rounded-full ${criteriaCount >= 1 ? strength.color : 'bg-neutral-200'}`} />
                    <div className={`rounded-full ${criteriaCount >= 2 ? strength.color : 'bg-neutral-200'}`} />
                    <div className={`rounded-full ${criteriaCount >= 3 ? strength.color : 'bg-neutral-200'}`} />
                    <div className={`rounded-full ${criteriaCount >= 4 && hasMinLength ? strength.color : 'bg-neutral-200'}`} />
                  </div>

                  {/* Requirements Checklist */}
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-neutral-500 font-mono">
                    <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-700 font-medium' : 'text-neutral-400'}`}>
                      {hasMinLength ? '✓' : '○'} At least 8 characters
                    </span>
                    <span className={`flex items-center gap-1 ${hasUppercase ? 'text-emerald-700 font-medium' : 'text-neutral-400'}`}>
                      {hasUppercase ? '✓' : '○'} Uppercase letter (A-Z)
                    </span>
                    <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-700 font-medium' : 'text-neutral-400'}`}>
                      {hasNumber ? '✓' : '○'} Number (0-9)
                    </span>
                    <span className={`flex items-center gap-1 ${hasSymbol ? 'text-emerald-700 font-medium' : 'text-neutral-400'}`}>
                      {hasSymbol ? '✓' : '○'} Special symbol (!@#$)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Extra Provider Registration Fields */}
          {authMode === 'register' && selectedRole === 'provider' && (
            <div className="pt-2 space-y-4 border-t border-neutral-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                    Trade Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TradeCategory)}
                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                  >
                    <option value="Plumber">Plumber</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Carpenter">Carpenter</option>
                    <option value="AC Technician">AC Technician</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                    Operating Area
                  </label>
                  <input
                    type="text"
                    value={operatingArea}
                    onChange={(e) => setOperatingArea(e.target.value)}
                    placeholder="e.g. Downtown Metro"
                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                    Company / Trade Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Apex Mechanical"
                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                    Direct Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <span>
              {authMode === 'login'
                ? `Sign In as ${selectedRole === 'provider' ? 'Provider' : 'Customer'}`
                : `Register as ${selectedRole === 'provider' ? 'Service Provider' : 'Customer'}`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-neutral-400">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={loginWithGoogle}
            className="w-full py-2.5 px-4 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold rounded-lg border border-neutral-300 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign In with Google (Firebase)</span>
          </button>
        </form>

        {/* Mode Switch (Login <-> Register) */}
        <div className="mt-6 pt-5 border-t border-neutral-100 text-center">
          <p className="text-xs text-neutral-500">
            {authMode === 'login' ? "Don't have an account yet?" : 'Already registered?'}
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login');
                setError(null);
              }}
              className="ml-1.5 font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              {authMode === 'login' ? 'Create an account' : 'Sign in here'}
            </button>
          </p>
        </div>

        {/* Instant Demo Profile Login Shortcuts */}
        <div className="mt-8 pt-6 border-t border-neutral-200">
          <div className="text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-3">
            One-Click Test Accounts
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {users.slice(0, 4).map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => switchUser(user.id)}
                className="text-left p-2.5 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <div className="text-xs font-semibold text-neutral-900 leading-tight">
                  {user.name}
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  {user.role === 'customer' ? 'Customer' : `${user.category} · ${user.operatingArea}`}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
