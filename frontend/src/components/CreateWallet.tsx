import React, { useState } from 'react';
import {
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface CreateWalletProps {
  onSubmit: (password: string) => Promise<void>;
  onBack: () => void;
  loading: boolean;
  error: string | null;
}

export function CreateWallet({ onSubmit, onBack, loading, error }: CreateWalletProps) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const passwordsMatch = password.length > 0 && password === confirm;
  const isLengthValid = password.length >= 8;
  const isValid = isLengthValid && passwordsMatch;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid && !loading) onSubmit(password);
  };

  return (
    <div className="glass-card max-w-lg mx-auto p-6 sm:p-8 space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-[#00CC52]/10 text-[#00CC52]">
          <KeyRound className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-white">
            Create Master Wallet
          </h2>
          <p className="text-xs text-[#7B8E84]">
            Generate your private non-custodial cryptographic vault
          </p>
        </div>
      </div>

      {/* Advisory Card */}
      <div className="p-4 rounded-xl bg-[#FFB020]/10 border border-[#FFB020]/25 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-[#FFB020] font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Self-Custody Security Protocol:</span>
        </div>
        <ul className="text-[#E2ECE5]/80 space-y-1.5 pl-5 list-disc text-[11px] leading-relaxed">
          <li>
            Your keys are encrypted <strong className="text-white">only on this device</strong> using AES-GCM 256-bit with PBKDF2 (600,000 rounds).
          </li>
          <li>
            In the next step, you will receive a <strong className="text-white">12-word mnemonic phrase</strong>.
          </li>
          <li>
            If you lose this phrase and forget your password, <strong className="text-red-400">your funds are unrecoverable</strong>.
          </li>
        </ul>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Password Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#7B8E84] uppercase tracking-wider block">
            Vault Master Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="input-field pr-10"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7B8E84] hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#7B8E84] uppercase tracking-wider block">
            Confirm Master Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="input-field pr-10"
              placeholder="Repeat your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            {confirm && passwordsMatch && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#00CC52]">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}
          </div>
          {confirm && !passwordsMatch && (
            <p className="text-red-400 text-[11px] font-mono">Passwords do not match</p>
          )}
        </div>

        {/* Checklist */}
        <div className="p-3 rounded-xl bg-[#080C09] border border-white/[0.05] space-y-1.5 text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span className={isLengthValid ? 'text-[#00CC52]' : 'text-[#7B8E84]'}>
              {isLengthValid ? '●' : '○'}
            </span>
            <span className={isLengthValid ? 'text-white' : 'text-[#7B8E84]'}>
              At least 8 characters
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={passwordsMatch ? 'text-[#00CC52]' : 'text-[#7B8E84]'}>
              {passwordsMatch ? '●' : '○'}
            </span>
            <span className={passwordsMatch ? 'text-white' : 'text-[#7B8E84]'}>
              Passwords match
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="btn-secondary flex-1 py-3 text-sm justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel</span>
          </button>

          <button
            type="submit"
            disabled={!isValid || loading}
            className="btn-primary flex-1 py-3 text-sm justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#050706]" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span>Create Wallet</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

    </div>
  );
}
