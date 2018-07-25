// =====
// Scalelearn
// =====
//
// TODO: Write description
//

// Generate a smooth random signal
a = periodic(20)
  .rand({ size: 2 })
  .biquad({ f0: 2 })
  .plot({ legend: 'Data Stream' });

// Setup a data recorder
b = a.recorder({ name: 'data' });

// Learn data scale from recordings
minmax = b.scalelearn();
c = a.scale2(minmax)
  .plot({ legend: 'Scaled data' });
