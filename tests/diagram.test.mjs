import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDiagramCode, validateDiagramXMLCode } from '../src/lib/validation.ts';
import { checkRequest, errorForStatus, DiagramRequestError } from '../src/lib/openai.ts';
import { DEFAULT_MODEL, isDiagramModel } from '../src/lib/model-config.ts';
import { postprocessDiagramXMLRegex, fixFillColors } from '../src/lib/postprocess-icons.ts';

test('model allowlist and request length', () => {
  assert.equal(DEFAULT_MODEL, 'gpt-6-luna');
  assert.equal(isDiagramModel('arbitrary-model'), false);
  assert.throws(() => checkRequest('x'.repeat(4001)), DiagramRequestError);
});

test('Mermaid parser accepts a diagram and rejects broken syntax and active directives', async () => {
  assert.equal((await validateDiagramCode('```mermaid\nflowchart TD\nA-->B\n```', 'mermaid')).isValid, true);
  assert.equal((await validateDiagramCode('flowchart TD\nA[broken', 'mermaid')).isValid, false);
  assert.equal((await validateDiagramCode('%%{init: {"securityLevel":"loose"}}%%\nflowchart TD\nA-->B', 'mermaid')).isValid, false);
});

test('XML rejects active content before parsing', () => {
  assert.equal(validateDiagramXMLCode('<!DOCTYPE mxfile><mxfile/>').isValid, false);
  assert.equal(validateDiagramXMLCode('<mxfile><script/></mxfile>').isValid, false);
  assert.equal(validateDiagramXMLCode('<mxfile image="https://example.com/icon.svg"/>').isValid, false);
});

test('XML postprocessing converts known service labels and unreadable fills', () => {
  const xml = '<mxCell id="2" value="EC2" style="shape=rectangle;fillColor=#000000;" vertex="1" parent="1"><mxGeometry x="0" y="0" width="100" height="60" as="geometry"/></mxCell>';
  assert.match(postprocessDiagramXMLRegex(xml), /mxgraph\.aws4\.ec2/);
  assert.match(fixFillColors(xml), /fillColor=#FFFFFF/);
});

test('API maps user-facing failures', () => {
  assert.equal(errorForStatus(401).code, 'auth');
  assert.equal(errorForStatus(403).code, 'access');
  assert.equal(errorForStatus(429).code, 'rate_limit');
  assert.equal(errorForStatus(429, 'insufficient_quota').code, 'quota');
  assert.equal(errorForStatus(500).code, 'service');
});
