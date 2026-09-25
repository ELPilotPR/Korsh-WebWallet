import React, { useState } from 'react';
import logoEmblem from '../assets/logo-emblem-green.png';
import {
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Trash2,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  Shield,
} from 'lucide-react';

interface UnlockWalletProps {
  address: string;
  onUnlock: (password: string) => Promise<void>;
  onLogout: () => void;
  onRestore?: () => void;
  loading: boolean;
  error: string | null;
}

export function UnlockWallet({
  address,
  onUnlock,
  onLogout,
  onRestore,
  loading,
  error,
}: UnlockWalletProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password && !loading) onUnlock(password);
  };

  return (
    <div className="glass-card max-w-md mx-auto p-6 sm:p-8 space-y-7 animate-fadeIn text-center relative overflow-hidden border border-white/[0.1]">
      {/* Top Ambient Glow Spotlight inside card */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#00CC52]/15 blur-3xl pointer-events-none -mt-8" />

      {/* Brand Emblem & Header */}
      <div className="space-y-3 relative z-10">
        <div className="relative inline-block">
          <img
            src={logoEmblem}
            alt="Korsh"
            className="w-16 h-16 mx-auto object-contain drop-shadow-[0_0_24px_rgba(0,204,82,0.45)] hover:scale-105 transition-transform"
          />
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00CC52]/10 border border-[#00CC52]/30 text-xs font-semibold text-[#00CC52] mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00CC52] animate-ping" />
            <span>Korsh Mainnet Vault</span>
          </div>
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight">
            Unlock Master Vault
          </h2>
          <p className="text-xs text-[#7B8E84] mt-1">
            Keys are encrypted locally in browser memory
          </p>
        </div>

        {/* Address Vault Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#080C09] border border-white/[0.08] text-xs font-mono text-white/90">
          <ShieldCheck className="w-4 h-4 text-[#00CC52]" />
          <span>{address.slice(0, 8)}...{address.slice(-6)}</span>
        </div>
      </div>

      {/* Unlock Form */}
      <form onSubmit={handleSubmit} className="space-y-4 text-left relative z-10">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-[#7B8E84] uppercase tracking-wider">
              Master Password
            </label>
            {onRestore && (
              <button
                type="button"
                onClick={onRestore}
                className="text-[#00CC52] hover:text-[#00e65c] text-[11px] font-medium transition-colors"
              >
                Restore with 12 words?
              </button>
            )}
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="input-field pr-10 text-sm"
              placeholder="Enter your master password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!password || loading}
          className="btn-primary w-full py-3.5 text-sm justify-center group"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#050706]" />
              <span>Decrypting AES-GCM Vault...</span>
            </>
          ) : (
            <>
              <KeyRound className="w-4 h-4 text-[#050706]" />
              <span>Open Wallet</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Security Note */}
      <div className="p-3 rounded-xl bg-[#080C09]/90 border border-white/[0.05] text-[11px] text-[#7B8E84] flex items-center justify-center gap-2">
        <Shield className="w-3.5 h-3.5 text-[#00CC52]" />
        <span>Non-Custodial: Server never receives your keys</span>
      </div>

      {/* Danger Zone: Purge Wallet from Browser */}
      <div className="pt-3 border-t border-white/[0.06] relative z-10">
        {!showConfirmDelete ? (
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="text-xs text-[#7B8E84] hover:text-red-400 transition-colors inline-flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset / Remove wallet from this device</span>
          </button>
        ) : (
          <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 space-y-2 text-xs text-left">
            <p className="text-red-300 font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>Are you sure you want to remove this wallet?</span>
            </p>
            <p className="text-[11px] text-[#7B8E84] leading-relaxed">
              This will wipe the encrypted keystore from this browser. You will need your 12-word seed phrase to regain access.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="btn-secondary flex-1 py-2 text-xs justify-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="btn-danger flex-1 py-2 text-xs justify-center"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
