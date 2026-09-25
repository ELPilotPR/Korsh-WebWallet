import { useState } from 'react';
import {
  ShieldAlert,
  Copy,
  Check,
  ArrowRight,
} from 'lucide-react';

interface BackupMnemonicProps {
  mnemonic: string;
  onConfirm: () => void;
}

export function BackupMnemonic({ mnemonic, onConfirm }: BackupMnemonicProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const words = mnemonic.split(' ');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card max-w-lg mx-auto p-6 sm:p-8 space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-[#00CC52]/10 text-[#00CC52]">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-white">
            12-Word Recovery Seed
          </h2>
          <p className="text-xs text-[#7B8E84]">
            This is the sovereign master key to your Korsh funds
          </p>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-[#FFB020]/10 border border-[#FFB020]/30 text-xs text-[#FFB020] space-y-1">
        <p className="font-bold">CRITICAL WARNING:</p>
        <p className="text-[11px] text-[#E2ECE5]/80">
          Never share these words with anyone or enter them into untrusted websites. Anyone with this phrase has full control of your balance.
        </p>
      </div>

      {/* Words Bento Grid */}
      <div className="card bg-[#080C09] border-white/[0.08] p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {words.map((word, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#0B100C] border border-white/[0.05] hover:border-[#00CC52]/30 transition-colors"
            >
              <span className="font-mono text-[11px] font-bold text-[#00CC52] w-5 text-right">
                {i + 1}.
              </span>
              <span className="font-mono font-medium text-xs sm:text-sm text-white">
                {word}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={handleCopy}
          className="btn-secondary w-full py-2.5 text-xs justify-center"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-[#00CC52]" />
              <span className="text-[#00CC52]">Copied Phrase to Clipboard</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Full Recovery Phrase</span>
            </>
          )}
        </button>
      </div>

      {/* Confirmation Checkbox */}
      <label className="flex items-start gap-3 p-3.5 rounded-xl bg-[#080C09] border border-white/[0.06] cursor-pointer hover:border-white/[0.12] transition-colors">
        <input
          type="checkbox"
          className="mt-0.5 w-4 h-4 rounded border-white/20 bg-[#050706] text-[#00CC52] focus:ring-[#00CC52] accent-[#00CC52]"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
        />
        <span className="text-xs text-[#E2ECE5]/90 leading-relaxed select-none">
          I have written down these 12 words and safely stored them offline. I acknowledge that if I lose them, my coins are permanently lost.
        </span>
      </label>

      {/* Continue Button */}
      <button
        onClick={onConfirm}
        disabled={!confirmed}
        className="btn-primary w-full py-3.5 text-sm justify-center"
      >
        <span>I've Saved My Backup</span>
        <ArrowRight className="w-4 h-4" />
      </button>

    </div>
  );
}
