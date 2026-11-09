import test from 'node:test';
import assert from 'node:assert/strict';
import { useDiagramLibrary } from '../src/lib/diagramLibrary.ts';
import { clearLocalData } from '../src/lib/clear-local-data.ts';

function storage() {
  const values = new Map();
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
  };
}

test.beforeEach(() => {
  globalThis.localStorage = storage();
  globalThis.sessionStorage = storage();
  useDiagramLibrary.setState({ diagrams: [], activeId: null, hydrated: false, saveError: null });
});

test('imports the current diagram once and keeps new diagrams separate', () => {
  localStorage.setItem('diagram_current_state', 'flowchart TD; A-->B');
  sessionStorage.setItem('diagram_agent_session_v1', JSON.stringify({ entries: [{ role: 'user', content: 'Map A to B' }] }));
  const library = useDiagramLibrary.getState();
  library.hydrate();
  const imported = useDiagramLibrary.getState().diagrams[0];
  assert.equal(imported.code, 'flowchart TD; A-->B');
  assert.equal(imported.entries[0].content, 'Map A to B');
  assert.equal(localStorage.getItem('diagram_current_state'), null);
  library.createDiagram();
  const state = useDiagramLibrary.getState();
  assert.equal(state.diagrams.length, 2);
  assert.equal(state.diagrams.find(d => d.id === imported.id).code, 'flowchart TD; A-->B');
  assert.equal(state.diagrams.find(d => d.id === state.activeId).code, '');
  library.selectDiagram(imported.id);
  assert.equal(useDiagramLibrary.getState().activeId, imported.id);
  library.deleteDiagram(imported.id);
  assert.equal(useDiagramLibrary.getState().diagrams.length, 1);
  assert.notEqual(useDiagramLibrary.getState().activeId, imported.id);
});

test('approval persists a snapshot and reverting restores the prior version', () => {
  useDiagramLibrary.getState().hydrate();
  const id = useDiagramLibrary.getState().activeId;
  const proposal = diagram => ({ diagram, format: 'mermaid', baseDiagram: '', model: 'gpt-6-luna', promptVersion: 'agent-v1', request: 'draw it' });
  useDiagramLibrary.getState().approve(id, proposal('flowchart TD\nA-->B'));
  useDiagramLibrary.getState().approve(id, proposal('flowchart TD\nA-->C'));
  const approved = useDiagramLibrary.getState().diagrams[0];
  assert.equal(approved.snapshots.length, 2);
  assert.equal(approved.code, 'flowchart TD\nA-->C');
  useDiagramLibrary.getState().revert(id, approved.snapshots[0].id);
  assert.equal(useDiagramLibrary.getState().diagrams[0].code, 'flowchart TD\nA-->B');
  assert.equal(JSON.parse(localStorage.getItem('diagram_library_v1'))[0].code, 'flowchart TD\nA-->B');
});

test('stored diagrams and active selection survive a fresh hydrate', () => {
  useDiagramLibrary.getState().hydrate();
  const first = useDiagramLibrary.getState().activeId;
  useDiagramLibrary.getState().createDiagram();
  const second = useDiagramLibrary.getState().activeId;
  useDiagramLibrary.getState().selectDiagram(first);
  useDiagramLibrary.setState({ diagrams: [], activeId: null, hydrated: false, saveError: null });
  useDiagramLibrary.getState().hydrate();
  assert.equal(useDiagramLibrary.getState().diagrams.length, 2);
  assert.equal(useDiagramLibrary.getState().activeId, first);
  assert.ok(useDiagramLibrary.getState().diagrams.some(diagram => diagram.id === second));
});

test('conversation and proposal persist across reload and diagram deletion removes both', () => {
  useDiagramLibrary.getState().hydrate();
  const id = useDiagramLibrary.getState().activeId;
  useDiagramLibrary.getState().updateDiagram(id, { entries: [{ role: 'user', content: 'Secret draft' }], proposal: { diagram: '<mxGraphModel/>', format: 'diagramxml', baseDiagram: '', model: 'test', promptVersion: 'test', request: 'draw' } });
  useDiagramLibrary.setState({ diagrams: [], activeId: null, hydrated: false, saveError: null });
  useDiagramLibrary.getState().hydrate();
  assert.equal(useDiagramLibrary.getState().diagrams[0].entries[0].content, 'Secret draft');
  assert.equal(useDiagramLibrary.getState().diagrams[0].proposal.request, 'draw');
  useDiagramLibrary.getState().deleteDiagram(id);
  assert.equal(JSON.stringify(localStorage.getItem('diagram_library_v1')).includes('Secret draft'), false);
  assert.equal(JSON.stringify(localStorage.getItem('diagram_library_v1')).includes('draw'), false);
});

test('clear all removes app data and key while retaining unrelated origin data', () => {
  useDiagramLibrary.getState().hydrate();
  const id = useDiagramLibrary.getState().activeId;
  useDiagramLibrary.getState().updateDiagram(id, { entries: [{ role: 'user', content: 'Secret draft' }] });
  localStorage.setItem('diagram_model', 'gpt-6-luna');
  localStorage.setItem('other_app', 'keep');
  sessionStorage.setItem('openai_api_key', 'test-key');
  sessionStorage.setItem('diagram_telemetry_consent', 'yes');
  clearLocalData();
  assert.equal(localStorage.getItem('diagram_library_v1'), null);
  assert.equal(localStorage.getItem('diagram_model'), null);
  assert.equal(sessionStorage.getItem('openai_api_key'), null);
  assert.equal(sessionStorage.getItem('diagram_telemetry_consent'), null);
  assert.equal(localStorage.getItem('other_app'), 'keep');
  assert.equal(useDiagramLibrary.getState().hydrated, false);
  useDiagramLibrary.getState().hydrate();
  assert.equal(useDiagramLibrary.getState().diagrams[0].entries.length, 0);
});
