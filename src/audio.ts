let context: AudioContext | undefined;
let engine: OscillatorNode | undefined;
let volume: GainNode | undefined;
let muted = false;
export function startAudio() {
  context ??= new AudioContext();
  void context.resume();
  if (engine) return;
  engine = context.createOscillator(); engine.type = 'sawtooth'; engine.frequency.value = 42;
  const filter = context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 150;
  volume = context.createGain(); volume.gain.value = muted ? 0 : .035;
  engine.connect(filter); filter.connect(volume); volume.connect(context.destination); engine.start();
}
export function engineSpeed(speed: number, active: boolean) {
  if (!context || !engine || !volume) return;
  engine.frequency.setTargetAtTime(42 + Math.abs(speed)*3, context.currentTime, .15);
  volume.gain.setTargetAtTime(muted || !active ? 0 : .035, context.currentTime, .1);
}
export function setMuted(value: boolean) { muted = value; }
export function horn() {
  if (!context || muted) return;
  for (const hz of [370, 465]) {
    const oscillator = context.createOscillator(), gain = context.createGain();
    oscillator.type = 'sawtooth'; oscillator.frequency.value = hz;
    gain.gain.setValueAtTime(.035, context.currentTime); gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .3);
    oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime+.32);
  }
}
