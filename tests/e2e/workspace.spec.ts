import { test, expect } from '@playwright/test';

const reply = (kind: string, message: string, diagram = '') => ({
  model: 'test-model',
  choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ kind, message, diagram }) } }],
});

test('workspace requires a key', async ({ page }) => {
  await page.goto('/workspace');
  await expect(page).toHaveURL(/\/start$/);
  await expect(page.getByRole('heading', { name: 'Connect your key to begin.' })).toBeVisible();
});

test('proposal is reviewed, approved, and survives reload', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('openai_api_key', 'test-only-key'));
  let requests = 0;
  await page.route('https://api.openai.com/v1/chat/completions', async route => {
    requests++;
    await route.fulfill({ json: reply('proposal', 'Review this flow.', 'flowchart TD\nA-->B') });
  });
  await page.goto('/workspace');
  await page.getByRole('textbox', { name: 'Your message' }).fill('Show A to B');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByRole('button', { name: 'Approve and apply' })).toBeVisible();
  await expect(page.getByText('Review this flow.')).toBeVisible();
  await page.getByRole('button', { name: 'Approve and apply' }).click();
  await expect(page.getByRole('button', { name: 'Download approved' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Download approved' })).toBeVisible();
  await expect(page.getByText('Review this flow.')).toBeVisible();
  expect(requests).toBe(1);
});

test('failed request preserves draft and can be retried', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('openai_api_key', 'test-only-key'));
  let requests = 0;
  await page.route('https://api.openai.com/v1/chat/completions', async route => {
    requests++;
    if (requests === 1) await route.fulfill({ status: 503, json: { error: {} } });
    else await route.fulfill({ json: reply('message', 'Ready to help.') });
  });
  await page.goto('/workspace');
  await page.getByRole('textbox', { name: 'Your message' }).fill('Help with a flow');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.locator('.inline-error[role="alert"]')).toContainText('preserved');
  await expect(page.getByRole('textbox', { name: 'Your message' })).toHaveValue('Help with a flow');
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(page.getByText('Ready to help.')).toBeVisible();
  expect(requests).toBe(2);
});

test('rejected proposal does not replace the approved diagram', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('openai_api_key', 'test-only-key'));
  await page.route('https://api.openai.com/v1/chat/completions', route =>
    route.fulfill({ json: reply('proposal', 'Review this flow.', 'flowchart TD\nA-->B') }));
  await page.goto('/workspace');
  await page.getByRole('textbox', { name: 'Your message' }).fill('Show A to B');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByRole('button', { name: 'Reject' })).toBeVisible();
  await page.getByRole('button', { name: 'Reject' }).click();
  await expect(page.getByRole('button', { name: 'Approve and apply' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Download approved' })).toHaveCount(0);
});

test('failed replies preserve the approved diagram, snapshot, and draft', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('openai_api_key', 'test-only-key'));
  const approvedCode = 'flowchart TD\nA-->B';
  const failures = [
    { choices: [{ finish_reason: 'stop', message: { refusal: 'I cannot help.', content: null } }] },
    { choices: [{ finish_reason: 'length', message: { content: JSON.stringify({ kind: 'proposal', message: 'Partial', diagram: 'flowchart TD\nA-->C' }) } }] },
    reply('proposal', 'Broken diagram', 'flowchart TD\nA-->'),
  ];
  let requests = 0;
  await page.route('https://api.openai.com/v1/chat/completions', route => {
    const result = requests++ === 0 ? reply('proposal', 'Review this flow.', approvedCode) : failures.shift();
    return route.fulfill({ json: result });
  });
  await page.goto('/workspace');
  const draft = page.getByRole('textbox', { name: 'Your message' });
  await draft.fill('Create a flow');
  await page.getByRole('button', { name: 'Send message' }).click();
  await page.getByRole('button', { name: 'Approve and apply' }).click();
  await expect(page.getByRole('button', { name: 'Download approved' })).toBeVisible();

  for (const request of ['Try a refusal', 'Try a truncated reply', 'Try broken code']) {
    await draft.fill(request);
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.locator('.inline-error[role="alert"]')).toContainText('preserved');
    await expect(draft).toHaveValue(request);
    await expect(page.getByRole('button', { name: 'Download approved' })).toBeVisible();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('diagram_library_v1') || '[]'));
    expect(saved[0].code).toBe(approvedCode);
    expect(saved[0].snapshots).toHaveLength(1);
    expect(saved[0].proposal).toBeNull();
  }
  await page.reload();
  await expect(page.getByRole('button', { name: 'Download approved' })).toBeVisible();
  expect(requests).toBe(4);
});

test('draw.io iframe receives XML and mobile zoom actions through the JSON protocol', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('https://embed.diagrams.net/**', route => route.fulfill({ contentType: 'text/html', body: `<!doctype html><script>
    window.received = [];
    window.addEventListener('message', event => {
      const message = JSON.parse(event.data);
      window.received.push({ message, origin: event.origin });
      if (message.action === 'load') parent.postMessage(JSON.stringify({ event: 'load' }), '*');
    });
    parent.postMessage(JSON.stringify({ event: 'init' }), '*');
  </script>` }));
  await page.goto('/');
  await page.evaluate(() => {
    sessionStorage.setItem('openai_api_key', 'test-only-key');
    localStorage.setItem('diagram_library_v1', JSON.stringify([{ id: 'xml-one', title: 'Architecture', type: 'architecture', createdAt: 1, updatedAt: 1, code: '<mxGraphModel/>', snapshots: [], snapshotIndex: -1, editHistory: [], entries: [], proposal: null }]));
    localStorage.setItem('diagram_library_active_v1', 'xml-one');
  });
  await page.goto('/workspace');
  const frame = page.frameLocator('iframe[title="draw.io diagram preview"]');
  await expect(page.getByRole('button', { name: 'Zoom in' })).toBeEnabled();
  const initial = await frame.locator('body').evaluate(() => (window as unknown as { received: Array<{ message: { action: string; xml: string; fit: number }; origin: string }> }).received);
  expect(initial[0]).toEqual({ message: { action: 'load', xml: '<mxGraphModel/>', fit: 1 }, origin: 'http://127.0.0.1:3100' });
  await page.getByRole('button', { name: 'Zoom in' }).click();
  await page.getByRole('button', { name: 'Zoom out' }).click();
  await page.getByRole('button', { name: 'Reset zoom' }).click();
  const actions = await frame.locator('body').evaluate(() => (window as unknown as { received: Array<{ message: { action: string; actionName?: string } }> }).received.map(item => item.message));
  expect(actions.slice(1)).toEqual([
    { action: 'invokeAction', actionName: 'zoomIn' },
    { action: 'invokeAction', actionName: 'zoomOut' },
    { action: 'invokeAction', actionName: 'smartFit' },
  ]);
});

test('clear all local data removes diagrams, conversations, proposal, and key', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    sessionStorage.setItem('openai_api_key', 'test-only-key');
    localStorage.setItem('diagram_library_v1', JSON.stringify([{ id: 'one', title: 'Private diagram', type: 'flowchart', createdAt: 1, updatedAt: 1, code: 'flowchart TD\nA-->B', snapshots: [], snapshotIndex: -1, editHistory: [], entries: [{ role: 'user', content: 'Private conversation' }], proposal: { request: 'Private proposal', diagram: 'flowchart TD\nA-->C', format: 'mermaid', baseDiagram: '', model: 'test', promptVersion: 'test' } }]));
    localStorage.setItem('diagram_library_active_v1', 'one');
    localStorage.setItem('unrelated', 'keep');
  });
  await page.goto('/workspace');
  await expect(page.getByText('Private conversation')).toBeVisible();
  await page.getByText('Settings').click();
  await page.getByRole('button', { name: 'Clear all local data' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Clear all local data' }).click();
  await expect(page).toHaveURL(/\/$/);
  const stored = await page.evaluate(() => ({ diagrams: localStorage.getItem('diagram_library_v1'), key: sessionStorage.getItem('openai_api_key'), unrelated: localStorage.getItem('unrelated') }));
  expect(stored).toEqual({ diagrams: null, key: null, unrelated: 'keep' });
  await page.goto('/workspace');
  await expect(page).toHaveURL(/\/start$/);
});

test('telemetry sends only allowed outcome fields after opt-in and stops after opt-out', async ({ browser }) => {
  test.skip(process.env.NEXT_PUBLIC_POSTHOG_TEST_MODE !== '1' || !process.env.NEXT_PUBLIC_POSTHOG_KEY || !process.env.NEXT_PUBLIC_POSTHOG_HOST, 'requires a build with test telemetry settings');
  const context = await browser.newContext({ baseURL: 'http://127.0.0.1:3100', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36' });
  const page = await context.newPage();
  const requests: string[] = [];
  await page.route('https://telemetry.example.test/**', route => {
    requests.push(route.request().postData() || '');
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
  await page.route('https://api.openai.com/v1/chat/completions', route => route.fulfill({ json: reply('message', 'Ready to help.') }));
  await page.goto('/');
  await page.evaluate(() => sessionStorage.setItem('openai_api_key', 'test-only-key'));
  await page.goto('/workspace');
  const send = async (message: string) => {
    await page.getByRole('textbox', { name: 'Your message' }).fill(message);
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByText('Ready to help.').last()).toBeVisible();
  };
  await send('Before opt-in');
  expect(requests).toHaveLength(0);
  await page.getByText('Conversation options').click();
  await page.getByRole('checkbox', { name: /Share outcome and timing/ }).check();
  await send('After opt-in');
  await expect.poll(() => requests.length, { timeout: 5_000 }).toBeGreaterThan(0);
  const payload = requests.join('\n');
  const events = requests.flatMap(body => (JSON.parse(body) as { batch: Array<{ event: string; properties: Record<string, unknown> }> }).batch);
  expect(events.map(event => event.event)).toEqual(['agent_turn']);
  expect(Object.keys(events[0].properties).sort()).toEqual(['distinct_id', 'duration_ms', 'format', 'model', 'outcome', 'prompt_version', 'response_model', 'token']);
  expect(payload).toContain('agent_turn');
  expect(payload).not.toContain('After opt-in');
  expect(payload).not.toContain('test-only-key');
  expect(payload).not.toContain('Ready to help.');
  await page.getByRole('checkbox', { name: /Share outcome and timing/ }).uncheck();
  const before = requests.length;
  await send('After opt-out');
  await page.waitForTimeout(3500);
  expect(requests.length).toBe(before);
  await page.getByText('Settings').click();
  await page.getByRole('button', { name: 'Clear all local data' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Clear all local data' }).click();
  await expect(page).toHaveURL(/\/$/);
  const remaining = await page.evaluate(() => ({ consent: sessionStorage.getItem('diagram_telemetry_consent'), posthog: Object.keys(localStorage).filter(key => key.includes('ph_opt') || key.includes('ph_')) }));
  expect(remaining).toEqual({ consent: null, posthog: [] });
  await context.close();
});

test('live diagrams.net embed loads XML and accepts zoom controls', async ({ page }) => {
  test.skip(process.env.RUN_LIVE_DRAWIO !== '1', 'external service smoke check');
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.evaluate(() => {
    sessionStorage.setItem('openai_api_key', 'test-only-key');
    const xml = '<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="2" value="Hello" vertex="1" parent="1"><mxGeometry x="10" y="10" width="100" height="40" as="geometry"/></mxCell></root></mxGraphModel>';
    localStorage.setItem('diagram_library_v1', JSON.stringify([{ id: 'live-xml', title: 'Live XML', type: 'architecture', createdAt: 1, updatedAt: 1, code: xml, snapshots: [], snapshotIndex: -1, editHistory: [], entries: [], proposal: null }]));
    localStorage.setItem('diagram_library_active_v1', 'live-xml');
  });
  await page.goto('/workspace');
  await expect(page.getByRole('button', { name: 'Zoom in' })).toBeEnabled({ timeout: 45_000 });
  const frame = page.frameLocator('iframe[title="draw.io diagram preview"]');
  await expect(frame.getByText('Hello')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Zoom in' }).click();
  await page.getByRole('button', { name: 'Zoom out' }).click();
  await page.getByRole('button', { name: 'Reset zoom' }).click();
});
