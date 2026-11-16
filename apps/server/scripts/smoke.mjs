/**
 * End-to-end smoke harness against a running server (default :3001).
 * Usage: node scripts/smoke.mjs
 */
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import WebSocket from 'ws';

const BASE = process.env.SMOKE_BASE ?? 'http://127.0.0.1:3001';
const WS_BASE = process.env.SMOKE_WS ?? 'ws://127.0.0.1:3001/yjs';

const results = [];

function pass(name, detail = '') {
  results.push({ name, ok: true, detail });
  console.log(`PASS  ${name}${detail ? ` — ${detail}` : ''}`);
}

function fail(name, detail) {
  results.push({ name, ok: false, detail });
  console.error(`FAIL  ${name} — ${detail}`);
}

async function json(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

function waitSynced(provider, label, ms = 8000) {
  return new Promise((resolve, reject) => {
    if (provider.synced) {
      resolve(null);
      return;
    }
    const t = setTimeout(
      () => reject(new Error(`${label} sync timeout`)),
      ms,
    );
    provider.on('sync', (synced) => {
      if (synced) {
        clearTimeout(t);
        resolve(null);
      }
    });
  });
}

function connect(code, doc) {
  return new WebsocketProvider(WS_BASE, code, doc, {
    WebSocketPolyfill: WebSocket,
    disableBc: true,
  });
}

async function main() {
  // 1. Health
  {
    const { status, data } = await json('GET', '/health');
    if (status === 200 && data?.status === 'ok') pass('health');
    else fail('health', `${status} ${JSON.stringify(data)}`);
  }

  // 2. Create session
  let code;
  {
    const { status, data } = await json('POST', '/api/sessions', {
      title: 'Smoke Suite',
    });
    if (status === 201 && data?.code) {
      code = data.code;
      pass('create session', code);
    } else fail('create session', `${status} ${JSON.stringify(data)}`);
  }
  if (!code) throw new Error('no session code');

  // 3. Get / bad code / invalid charset
  {
    const ok = await json('GET', `/api/sessions/${code}`);
    if (ok.status === 200 && ok.data.code === code) pass('get session');
    else fail('get session', JSON.stringify(ok));

    const missing = await json('GET', '/api/sessions/ZZZZZZ');
    if (missing.status === 404) pass('get missing → 404');
    else fail('get missing → 404', String(missing.status));

    const bad = await json('GET', '/api/sessions/ABCDE0');
    if (bad.status === 400) pass('get invalid charset → 400');
    else fail('get invalid charset → 400', String(bad.status));
  }

  // 4. WS reject unknown session
  {
    await new Promise((resolve) => {
      let done = false;
      const finish = (fn) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        fn();
        resolve();
      };
      const ws = new WebSocket(`${WS_BASE}/ZZZZZZ`);
      const timer = setTimeout(() => {
        finish(() => fail('ws unknown session → 404', 'timeout'));
        try {
          ws.terminate();
        } catch {
          /* ignore */
        }
      }, 3000);
      ws.on('open', () => {
        finish(() => fail('ws unknown session', 'opened unexpectedly'));
        ws.close();
      });
      ws.on('unexpected-response', (_req, res) => {
        finish(() => {
          if (res.statusCode === 404) pass('ws unknown session → 404');
          else fail('ws unknown session → 404', String(res.statusCode));
        });
      });
      ws.on('error', () => {
        // node ws may error after unexpected-response
      });
    });
  }

  // 5. Two-client live sync
  {
    const doc1 = new Y.Doc();
    const doc2 = new Y.Doc();
    const p1 = connect(code, doc1);
    const p2 = connect(code, doc2);
    try {
      await Promise.all([waitSynced(p1, 'p1'), waitSynced(p2, 'p2')]);
      const got = new Promise((resolve, reject) => {
        const t = setTimeout(() => reject(new Error('no observe')), 5000);
        doc2.getArray('entries').observe(() => {
          clearTimeout(t);
          resolve(doc2.getArray('entries').toJSON());
        });
      });
      doc1.getArray('entries').push([
        { id: '1', name: 'Bob', event: 'jumprope', people: 'Bob', percentage: '' },
      ]);
      const remote = await got;
      if (remote[0]?.name === 'Bob') pass('two-client live sync');
      else fail('two-client live sync', JSON.stringify(remote));
    } catch (e) {
      fail('two-client live sync', e.message);
    } finally {
      p1.destroy();
      p2.destroy();
      doc1.destroy();
      doc2.destroy();
    }
  }

  // 6. Persist + reconnect (allow unload)
  {
    await new Promise((r) => setTimeout(r, 1500));
    const docA = new Y.Doc();
    const pA = connect(code, docA);
    try {
      await waitSynced(pA, 'writer');
      docA.getMap('meta').set('title', 'persisted-title');
      docA.getArray('entries').push([
        { id: '2', name: 'Amy', event: 'dance', people: 'Amy', percentage: '100' },
      ]);
      await new Promise((r) => setTimeout(r, 500));
    } finally {
      pA.destroy();
      docA.destroy();
    }

    await new Promise((r) => setTimeout(r, 2000));

    const docB = new Y.Doc();
    const pB = connect(code, docB);
    try {
      await waitSynced(pB, 'reader');
      await new Promise((r) => setTimeout(r, 300));
      const entries = docB.getArray('entries').toJSON();
      const title = docB.getMap('meta').get('title');
      const names = entries.map((e) => e.name).sort().join(',');
      if (names.includes('Amy') && names.includes('Bob') && title === 'persisted-title') {
        pass('persist + reconnect', names);
      } else {
        fail(
          'persist + reconnect',
          `title=${title} entries=${JSON.stringify(entries)}`,
        );
      }
    } catch (e) {
      fail('persist + reconnect', e.message);
    } finally {
      pB.destroy();
      docB.destroy();
    }
  }

  // 7. Concurrent edits converge
  {
    const doc1 = new Y.Doc();
    const doc2 = new Y.Doc();
    const p1 = connect(code, doc1);
    const p2 = connect(code, doc2);
    try {
      await Promise.all([waitSynced(p1, 'c1'), waitSynced(p2, 'c2')]);
      doc1.getArray('entries').push([{ id: 'c1', name: 'Concurrent1' }]);
      doc2.getArray('entries').push([{ id: 'c2', name: 'Concurrent2' }]);
      await new Promise((r) => setTimeout(r, 800));
      const a = doc1.getArray('entries').toJSON().map((e) => e.name);
      const b = doc2.getArray('entries').toJSON().map((e) => e.name);
      if (a.includes('Concurrent1') && a.includes('Concurrent2') &&
          b.includes('Concurrent1') && b.includes('Concurrent2')) {
        pass('concurrent edits converge');
      } else {
        fail('concurrent edits converge', `a=${a} b=${b}`);
      }
    } catch (e) {
      fail('concurrent edits converge', e.message);
    } finally {
      p1.destroy();
      p2.destroy();
      doc1.destroy();
      doc2.destroy();
    }
  }

  // 8. Delete session
  {
    const del = await json('DELETE', `/api/sessions/${code}`);
    if (del.status === 204) pass('delete session');
    else fail('delete session', String(del.status));

    const gone = await json('GET', `/api/sessions/${code}`);
    if (gone.status === 404) pass('deleted session gone');
    else fail('deleted session gone', String(gone.status));
  }

  const failed = results.filter((r) => !r.ok);
  console.log('\n---');
  console.log(`${results.length - failed.length}/${results.length} passed`);
  if (failed.length) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
