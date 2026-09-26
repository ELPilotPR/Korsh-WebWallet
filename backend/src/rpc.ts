import http from 'http';

const RPC_USER = process.env.RPC_USER || 'korsh_rpc';
const RPC_PASS = process.env.RPC_PASS || '';
const RPC_HOST = process.env.RPC_HOST || '127.0.0.1';
const RPC_PORT = parseInt(process.env.RPC_PORT || '9776', 10);

let requestId = 0;
let lastRpcFailure = 0;
const RPC_COOLDOWN_MS = 10000; // 10 seconds cooldown if RPC connection fails

export async function rpcCall(method: string, params: unknown[] = []): Promise<unknown> {
  if (Date.now() - lastRpcFailure < RPC_COOLDOWN_MS) {
    throw new Error('RPC offline (in cooldown)');
  }

  const id = ++requestId;
  const body = JSON.stringify({ jsonrpc: '1.0', id, method, params });

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: RPC_HOST,
        port: RPC_PORT,
        method: 'POST',
        path: '/',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          Authorization:
            'Basic ' + Buffer.from(`${RPC_USER}:${RPC_PASS}`).toString('base64'),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              reject(new Error(parsed.error.message || 'RPC error'));
            } else {
              lastRpcFailure = 0; // Success, clear cooldown
              resolve(parsed.result);
            }
          } catch {
            reject(new Error('Invalid JSON from RPC'));
          }
        });
      }
    );

    req.on('error', (err) => {
      lastRpcFailure = Date.now();
      reject(err);
    });
    req.setTimeout(3000, () => {
      lastRpcFailure = Date.now();
      req.destroy();
      reject(new Error('RPC timeout'));
    });
    req.write(body);
    req.end();
  });
}
