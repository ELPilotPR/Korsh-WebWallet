import React, { useState } from 'react';
import logoEmblem from '../assets/logo-emblem-green.png';
import {
  Unlock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Trash2,
  ShieldCheck,
} from 'lucide-react';

interface UnlockWalletProps {
  address: string;
  onUnlock: (password: string) => Promise<void>;
  onLogout: () => void;
  loading: boolean;
  error: string | null;
}

export function UnlockWallet({ address, onUnlock, onLogout, loading, error }: UnlockWalletProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password && !loading) onUnlock(password);
  };

  return (
    <div className="glass-card max-w-md mx-auto p-6 sm:p-8 space-y-6 animate-fadeIn text-center">
      
      {/* Brand Emblem */}
      <div>
        <div className="relative inline-block mb-3">
          <img
            src={logoEmblem}
            alt="Korsh"
            className="w-16 h-16 mx-auto object-contain drop-shadow-[0_0_20px_rgba(0,204,82,0.4)]"
          />
        </div>
        <h2 className="font-heading font-black text-2xl text-white">
          Unlock Master Vault
        </h2>
        <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-[#080C09] border border-white/[0.08] text-xs font-mono text-[#00CC52]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{address.slice(0, 6)}...{address.slice(-6)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#7B8E84] uppercase tracking-wider block">
            Vault Master Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="input-field pr-10"
              placeholder="Enter your password..."
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
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!password || loading}
          className="btn-primary w-full py-3.5 text-sm justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#050706]" />
              <span>Decrypting Keys...</span>
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4" />
              <span>Unlock Wallet</span>
            </>
          )}
        </button>
      </form>

      {/* Danger Zone: Purge Wallet from Browser */}
      <div className="pt-4 border-t border-white/[0.06]">
        {!showConfirmDelete ? (
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="text-xs text-[#7B8E84] hover:text-red-400 transition-colors inline-flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset or delete wallet from this device</span>
          </button>
        ) : (
          <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/40 space-y-2 text-xs">
            <p className="text-red-300 font-semibold">Are you absolutely sure?</p>
            <p className="text-[11px] text-[#7B8E84]">
              This removes the encrypted key from local storage. Ensure you have your 12-word recovery phrase before proceeding.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="btn-secondary flex-1 py-1.5 text-xs justify-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="btn-danger flex-1 py-1.5 text-xs justify-center"
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
