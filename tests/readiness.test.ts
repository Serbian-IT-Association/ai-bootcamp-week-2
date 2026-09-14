import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getReadinessLevel, type ReadinessLevel } from '../client/readiness.ts';

const boundaryCases: ReadonlyArray<readonly [number, ReadinessLevel]> = [
  [0, 'Zagrevanje'],
  [39, 'Zagrevanje'],
  [40, 'Na dobrom putu'],
  [74, 'Na dobrom putu'],
  [75, 'Spremno za intervju'],
  [100, 'Spremno za intervju']
];

test('getReadinessLevel maps all boundary values', () => {
  for (const [percentage, expectedLevel] of boundaryCases) {
    assert.equal(getReadinessLevel(percentage), expectedLevel, `percentage ${percentage}`);
  }
});
