// Client for the eIquidus explorer API (defaults to live official explorer)
const EXPLORER_URL = (process.env.EXPLORER_URL || 'https://explorer.korsh.org').replace(/\/+$/, '');

async function explorerFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${EXPLORER_URL}${path}`, {
    headers: {
      'User-Agent': 'KorshWebWallet/1.0',
      'Accept': 'application/json, text/plain, */*',
    },
  });
  if (!res.ok) {
    throw new Error(`Explorer API error: ${res.status}`);
  }
  const data = await res.json();
  return data as T;
}

export interface ExplorerSummary {
  difficulty: string;
  difficultyHybrid?: string;
  supply: number;
  hashrate: string;
  lastPrice?: number;
  connections: number;
  blockcount: number;
}

export async function getNetworkSummary(): Promise<ExplorerSummary | null> {
  try {
    return await explorerFetch<ExplorerSummary>('/ext/getsummary');
  } catch {
    return null;
  }
}

export interface ExplorerAddress {
  a_id: string;
  balance: number;
  received: number;
  sent: number;
  last_txs: Array<{
    addresses: string;
    type: string;
  }>;
}

export interface ExplorerUtxo {
  txid: string;
  vout: number;
  amount: number;
  scriptPubKey: string;
  height: number;
}

// Get balance for address (returns balance in coins, we convert to duffs)
export async function getBalance(address: string): Promise<{
  balance: number;
  received: number;
  sent: number;
}> {
  try {
    const balanceRes = await explorerFetch<string | number | { error?: string }>(`/ext/getbalance/${address}`);

    if (typeof balanceRes === 'object' && balanceRes !== null && 'error' in balanceRes) {
      return { balance: 0, received: 0, sent: 0 };
    }

    const rawNum = typeof balanceRes === 'string' ? parseFloat(balanceRes) : Number(balanceRes);
    const balanceCoins = isNaN(rawNum) ? 0 : rawNum;

    // Also try to get full address info
    try {
      const addrInfo = await explorerFetch<ExplorerAddress | { error?: string }>(
        `/ext/getaddress/${address}`
      );
      if (!addrInfo || 'error' in addrInfo || !('balance' in addrInfo)) {
        return { balance: Math.round(balanceCoins * 1e8), received: 0, sent: 0 };
      }
      return {
        balance: Math.round(((addrInfo.balance !== undefined ? addrInfo.balance : balanceCoins)) * 1e8),
        received: Math.round(((addrInfo.received || 0)) * 1e8),
        sent: Math.round(((addrInfo.sent || 0)) * 1e8),
      };
    } catch {
      return { balance: Math.round(balanceCoins * 1e8), received: 0, sent: 0 };
    }
  } catch {
    // Address not found or explorer unreachable, default to 0 balance
    return { balance: 0, received: 0, sent: 0 };
  }
}

// Get UTXOs for address via explorer API
export async function getUtxos(address: string): Promise<ExplorerUtxo[]> {
  try {
    const data = await explorerFetch<ExplorerUtxo[] | { error: string }>(
      `/ext/getutxos/${address}`
    );
    if (!Array.isArray(data)) {
      return [];
    }
    return data;
  } catch {
    return [];
  }
}

export interface ExplorerTx {
  txid: string;
  sent: number;     // coins sent TO this address in this tx
  received: number;  // coins received FROM this address in this tx
  balance: number;   // running balance after this tx
  timestamp: number;
}

// Get address transaction history
export async function getAddressTxs(
  address: string,
  start = 0,
  length = 50
): Promise<ExplorerTx[]> {
  try {
    const data = await explorerFetch<ExplorerTx[] | { error: string }>(
      `/ext/getaddresstxs/${address}/${start}/${length}`
    );
    if (!Array.isArray(data)) {
      return [];
    }
    // The explorer returns amounts as strings (e.g. "0.05") — normalize to numbers
    return data.map((tx) => ({
      ...tx,
      balance: Number(tx.balance) || 0,
      received: Number(tx.received) || 0,
      sent: Number(tx.sent) || 0,
      timestamp: Number(tx.timestamp) || 0,
    }));
  } catch {
    return [];
  }
}

export interface RecentBlock {
  blockindex: number;
  blockhash: string;
  txid: string;
  recipients: number;
  amount: string;
  timestamp: number;
}

export async function getRecentBlocks(count = 5): Promise<RecentBlock[]> {
  try {
    const raw = await explorerFetch<{ data: unknown[][] }>(`/ext/getlasttxs/0/0/${count}/internal`);
    if (!raw || !Array.isArray(raw.data)) return [];
    return raw.data.map((row) => ({
      blockindex: Number(row[0]),
      blockhash: String(row[1]),
      txid: String(row[2]),
      recipients: Number(row[3]),
      amount: String(row[4]),
      timestamp: Number(row[5]),
    }));
  } catch {
    return [];
  }
}
