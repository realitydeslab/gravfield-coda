import { map } from '@most/core';
import { iterations, size } from './options';
import withAttr from '../../src/lib/common/mixins';
import { makeRandomEvents, collectEventsFor } from '../../test/helper/testEnv';

const a = withAttr({
  type: 'emg',
  format: 'vector',
  size,
  samplerate: 200,
})(makeRandomEvents(iterations, size));
const stream = map(x => x, a);

function benchmark(deferred) {
  collectEventsFor(1, stream).then(() => {
    deferred.resolve();
  });
}

export default suite => suite.add(
  `Baseline # ${iterations} x ${size} `,
  benchmark,
  { defer: true },
);
