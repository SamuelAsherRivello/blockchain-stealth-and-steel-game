import test from 'node:test';
import assert from 'node:assert/strict';
import { createRunPresentation } from '../../runtime/ui/run-presentation.js';

test('the virtual controller is hidden during run teardown and restored only for the fresh run presentation', () => {
  const virtualController = { hidden: false, style: { display: '' } };
  const presentation = createRunPresentation({ virtualController });

  presentation.dispose();
  assert.equal(virtualController.hidden, true);
  assert.equal(virtualController.style.display, 'none');

  presentation.show();
  assert.equal(virtualController.hidden, false);
  assert.equal(virtualController.style.display, '');
});
