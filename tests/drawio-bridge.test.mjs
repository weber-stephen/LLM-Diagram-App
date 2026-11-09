import test from 'node:test';
import assert from 'node:assert/strict';
import { attachDrawioBridge, invokeDrawioAction, DRAWIO_ORIGIN } from '../src/lib/drawio-bridge.ts';

test('draw.io bridge accepts only well-shaped events from its exact iframe origin and source', () => {
  let listener;
  const sent = [];
  const source = { postMessage: (message, origin) => sent.push({ message: JSON.parse(message), origin }) };
  const frame = { contentWindow: source };
  const host = { addEventListener: (_type, callback) => { listener = callback; }, removeEventListener: (_type, callback) => { if (listener === callback) listener = null; } };
  let loaded = 0;
  const detach = attachDrawioBridge(host, frame, '<mxGraphModel/>', () => loaded++);
  const emit = (origin, eventSource, data) => listener?.({ origin, source: eventSource, data });
  emit('https://evil.example', source, '{"event":"init"}');
  emit('https://embed.diagrams.net.evil.example', source, '{"event":"init"}');
  emit(DRAWIO_ORIGIN, {}, '{"event":"init"}');
  for (const bad of ['{', 'init', 'null', '[]', '{"event":23}', '{"event":"other"}']) emit(DRAWIO_ORIGIN, source, bad);
  assert.equal(sent.length, 0);
  emit(DRAWIO_ORIGIN, source, '{"event":"init"}');
  assert.deepEqual(sent, [{ message: { action: 'load', xml: '<mxGraphModel/>', fit: 1 }, origin: DRAWIO_ORIGIN }]);
  emit(DRAWIO_ORIGIN, source, '{"event":"load"}');
  assert.equal(loaded, 1);
  invokeDrawioAction(frame, 'zoomIn');
  assert.deepEqual(sent[1], { message: { action: 'invokeAction', actionName: 'zoomIn' }, origin: DRAWIO_ORIGIN });
  detach();
  emit(DRAWIO_ORIGIN, source, '{"event":"init"}');
  assert.equal(sent.length, 2);
});
