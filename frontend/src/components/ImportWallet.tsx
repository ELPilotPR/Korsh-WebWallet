import React, { useState } from 'react';
import {
  Download,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface ImportWalletProps {
  onImport: (mnemonic: string, password: string) => Promise<void>;
  onBack: () => void;
  loading: boolean;
  error: string | null;
}

export function ImportWallet({ onImport, onBack, loading, error }: ImportWalletProps) {
  const [mnemonic, setMnemonic] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const words = mnemonic.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const passwordsMatch = password.length > 0 && password === confirm;
  const isLengthValid = password.length >= 8;
  const isValid = wordCount === 12 && isLengthValid && passwordsMatch;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid && !loading) {
      onImport(mnemonic.trim().toLowerCase(), password);
    }
  };

  return (
    <div className="glass-card max-w-lg mx-auto p-6 sm:p-8 space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-[#00CC52]/10 text-[#00CC52]">
          <Download className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-white">
            Restore Vault
          </h2>
          <p className="text-xs text-[#7B8E84]">
            Import your wallet using your 12-word recovery seed
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Recovery Phrase Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-[#7B8E84] uppercase tracking-wider">
              12-Word Recovery Phrase
            </label>
            <span
              className={`font-mono text-xs font-semibold px-2 py-0.5 rounded-md ${
                wordCount === 12
                  ? 'bg-[#00CC52]/15 text-[#00CC52]'
                  : 'bg-white/[0.05] text-[#7B8E84]'
              }`}
            >
              {wordCount} / 12 words
            </span>
          </div>

          <textarea
            className="input-field h-28 resize-none font-mono text-xs sm:text-sm leading-relaxed"
            placeholder="enter your twelve words separated by single spaces..."
            value={mnemonic}
            onChange={(e) => setMnemonic(e.target.value)}
            autoFocus
          />
        </div>

        {/* New Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#7B8E84] uppercase tracking-wider block">
            New Master Password
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

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#7B8E84] uppercase tracking-wider block">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="input-field pr-10"
              placeholder="Repeat password"
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

        {error && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
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
            <span>Back</span>
          </button>

          <button
            type="submit"
            disabled={!isValid || loading}
            className="btn-primary flex-1 py-3 text-sm justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#050706]" />
                <span>Decrypting & Deriving...</span>
              </>
            ) : (
              <>
                <span>Import Wallet</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

    </div>
  );
}
