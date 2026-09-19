export type CarState = { x: number; z: number; yaw: number; speed: number; distance: number };
export type Controls = { forward: boolean; reverse: boolean; left: boolean; right: boolean; brake: boolean };
export const roadsX = [-60, 0, 60];
export const roadsZ = [-100, -40, 20, 80];
export const spawn = (): CarState => ({ x: -3, z: 68, yaw: 0, speed: 0, distance: 0 });
export function onRoad(x: number, z: number) {
  return Math.abs(x) < 69 && z > -109 && z < 89 && (roadsX.some(r => Math.abs(x-r) < 7.5) || roadsZ.some(r => Math.abs(z-r) < 7.5));
}
export function stepCar(car: CarState, controls: Controls, delta: number): CarState {
  const dt = Math.min(delta, .05);
  let speed = car.speed + ((controls.forward ? 8 : 0) - (controls.reverse ? 6 : 0)) * dt;
  speed *= Math.exp(-(controls.brake ? 7 : controls.forward || controls.reverse ? .18 : .8) * dt);
  speed = Math.max(-7, Math.min(22, speed));
  if (Math.abs(speed) < .025) speed = 0;
  const yaw = car.yaw + ((controls.left ? 1 : 0) - (controls.right ? 1 : 0)) * Math.min(Math.abs(speed)/7, 1) * Math.sign(speed) * 1.1 * dt;
  const x = car.x - Math.sin(yaw)*speed*dt, z = car.z - Math.cos(yaw)*speed*dt;
  if (!onRoad(x, z)) return { ...car, yaw, speed: 0 };
  return { x, z, yaw, speed, distance: car.distance + Math.abs(speed)*dt };
}
export const fares = [
  { pickup: [-3, 28], drop: [57, -64], from: 'Third Wave Coffee', to: '100 Feet Road', reward: 85 },
  { pickup: [57, -82], drop: [-3, 52], from: 'Indiranagar Social', to: 'Koramangala Market', reward: 95 },
];
