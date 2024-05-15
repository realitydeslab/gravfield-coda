sm=performer("A").pos.plot().tap(sendosc);


a = mousemove(doc)
  .resample(periodic(10))
  .mvavrg({ size: 5 })
  .plot({ legend: 'Mouse Position'})
  .delta({ size: 5 })
  .plot({ legend: 'Mouse velocity' })
  .delta({ size: 5 })
  .plot({ legend: 'Mouse acceleration' })
  .sendosc2("/test");


  // generate a constant unit signal sampled at 1Hz, and accumulate
// the results (sliced at 10 iterations)
const process = periodic(1000)
.constant(1)
.accum()
.tap(log)
.sendosc2("/test")

clear()


const sm = periodic(10)
.constant(1)
.accum()
// .tap(log)
.performer(0)
.plot()
.pfm_dist("AC")
.plot();


const sm1 = periodic(10)
.constant(1)
.accum()
.performer("A")
.plot()
.pfm_maxy("A")
.plot()
.scale({ outmin: 0, outmax: 1 })
.oscto("A", "drag");



const sm2 = periodic(10)
.constant(1)
.accum()
// .tap(log)
.performer(0)
.plot()
.pfm_maxy("ABC")
.tap(log)


stop(sm2)