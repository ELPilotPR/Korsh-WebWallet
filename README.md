# Korsh Web Wallet

**The official non-custodial web wallet for Korsh (KSH).**

Live at: [wallet.korsh.org](https://wallet.korsh.org)

---

## What is it?

Korsh Web Wallet is a browser-based, self-custody wallet that lets you create, manage, send, and receive KSH — all without trusting a third party with your private keys.

Your keys are generated and stored **only in your browser**, encrypted with your password using AES-256-GCM. The server never sees or stores any private keys, mnemonics, or passwords.

## Features

- **Create a new wallet** — generates a BIP39 12-word recovery phrase
- **Import an existing wallet** — restore from your 12-word recovery phrase
- **Send KSH** — build and sign transactions entirely in the browser
- **Receive KSH** — display your address with a QR code for easy sharing
- **Transaction history** — view your recent incoming and outgoing transactions
- **Real-time balance** — fetched directly from the Korsh blockchain
- **Copy recovery phrase** — one-click copy for safe backup
- **Modern dark UI** — clean, responsive design with Korsh's green accent

## Security

- **Non-custodial / Self-custody** — your private keys never leave your browser
- **AES-256-GCM encryption** — wallet data encrypted with your password (PBKDF2, 600,000 iterations)
- **BIP39 / BIP44 standard** — 12-word mnemonic, HD key derivation (`m/44'/5001'/0'/0/0`)
- **No server-side accounts** — nothing to hack on the server
- **No tracking, no analytics** — your privacy is respected
- **Rate-limited API** — protection against abuse
- **HTTPS only** — all traffic encrypted in transit

> **Important:** This is a self-custody wallet. If you lose your 12-word recovery phrase and your password, **there is no way to recover your funds**. No one can help you — not even us. Always back up your recovery phrase in a safe place.

## How It Works

```
┌──────────────────────────┐          ┌──────────────────────────┐
│  Your Browser            │  HTTPS   │  Server                  │
│                          │◄────────►│                          │
│  - Generate keys (BIP39) │          │  API Proxy (read-only)   │
│  - Sign transactions     │          │  ├─ Balance              │
│  - Encrypt wallet (AES)  │          │  ├─ UTXOs                │
│  - Store in localStorage │          │  ├─ History              │
│                          │          │  └─ Broadcast signed TX  │
│  Keys NEVER leave here   │          │  No keys. No accounts.   │
└──────────────────────────┘          └──────────────────────────┘
```

The backend is a lightweight API proxy that connects to a Korsh full node. It only provides:
- Balance lookups
- UTXO data for transaction building
- Transaction history
- Broadcasting of already-signed transactions
- Blockchain info

## Tech Stack

### Frontend
- React + TypeScript + Vite
- Tailwind CSS (dark mode)
- bitcoinjs-lib (transaction building & signing)
- bip39 / bip32 (key generation & derivation)
- Web Crypto API + AES-256-GCM (wallet encryption)
- qrcode.react (QR code generation)

### Backend
- Node.js + Express + TypeScript
- RPC client for Korsh Core
- Explorer API integration (eIquidus)
- express-rate-limit

### Deployment
- Docker Compose (or plain Node.js + systemd)
- Nginx reverse proxy with SSL (Let's Encrypt)

## Korsh Network Parameters

| Parameter | Value |
|-----------|-------|
| P2PKH prefix | `0x3F` (addresses start with **S**) |
| P2SH prefix | `0x52` (addresses start with **R**) |
| WIF prefix | `0x80` |
| BIP44 coin type | `5001` |
| Derivation path | `m/44'/5001'/0'/0/0` |
| Smallest unit | 1 duff = 0.00000001 KSH |
| Node RPC port (mainnet) | `9776` |
| P2P port (mainnet) | `9777` |
| Block time | 60 s |
| Max supply | 10,000,000 KSH |

## Self-Hosting

### Prerequisites
- A running Korsh full node with RPC enabled (`korshd`, RPC on `127.0.0.1:9776`)
- An eIquidus explorer instance for the same node (default `http://127.0.0.1:8091`)
- Docker and Docker Compose (or Node.js 20+)
- Nginx with SSL (recommended)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/ELPilotPR/Korsh-WebWallet.git
   cd Korsh-WebWallet
   ```

2. Build the frontend:
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

3. Configure environment variables:
   ```bash
   # Set your node RPC password (see korsh.conf on the node)
   export RPC_PASS=your_rpc_password
   ```

4. Start the services:
   ```bash
   docker-compose up -d
   ```

5. Configure Nginx as a reverse proxy with SSL for your domain
   (see `nginx/wallet.korsh.org.conf`).

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3011` | API server port |
| `HOST` | `127.0.0.1` | API bind address |
| `RPC_HOST` | `127.0.0.1` | Korsh RPC host |
| `RPC_PORT` | `9776` | Korsh RPC port |
| `RPC_USER` | `korsh_rpc` | RPC username |
| `RPC_PASS` | — | RPC password (required) |
| `CORS_ORIGIN` | `https://wallet.korsh.org` (+ dev origins) | Comma-separated CORS allow-list |
| `EXPLORER_URL` | `http://127.0.0.1:8091` | eIquidus explorer URL |

## Live UI (v3, Sep 2026)

The production UI at wallet.korsh.org is the redesigned v3 build:

- **Installable PWA** — service worker (network-first for the HTML shell, stale-while-revalidate for assets, `/api/*` never cached) + web manifest, so the wallet installs on desktop and mobile
- **Network telemetry tab** — live hashrate, difficulty, peers, port, masternodes, supply and Recent Mined Blocks, served by `GET /api/network-stats` and `GET /api/recent-blocks`
- **QR scanner** on Send (camera) and QR receive card
- **Client-side signing** with per-tx detail (fee rate shown in duffs/B) and a broadcast-confirmation screen

Backend hardening that ships with v3:

- CORS is a strict allow-list (`CORS_ORIGIN`, comma-separated); unknown origins are rejected — never return `callback(null, true)` in the else path
- `app.set('trust proxy', 'loopback')` so rate-limiting keys on the real client IP behind nginx
- Amounts coming from the eIquidus explorer are normalized to numbers at the API boundary
- `/api/utxos` resolves outputs in parallel (RPC first, explorer fallback) and accepts both receive (`vout`) and spend (`vin`) txs so change outputs are spendable
- The nginx vhost allows the camera (`Permissions-Policy: camera=(self)`) and serves `/sw.js` with `Cache-Control: no-cache`

Verification (Sep 25, 2026): create/backup/unlock E2E 31/31, WebKit smoke 7/7, import + history E2E 8/8 including a real 0.01 KSH send signed in the browser and confirmed on-chain.

## License

MIT

## Links

- **Website:** [korsh.org](https://korsh.org)
- **Explorer:** [explorer.korsh.org](https://explorer.korsh.org)
- **Mining pool:** [pool.korsh.org](https://pool.korsh.org)
- **Wallet:** [wallet.korsh.org](https://wallet.korsh.org)
- **GitHub:** [github.com/ELPilotPR/Korsh-WebWallet](https://github.com/ELPilotPR/Korsh-WebWallet)
