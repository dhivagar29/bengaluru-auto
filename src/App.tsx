import { Component, Suspense, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { World } from './World';
import { fares, spawn, stepCar } from './physics';
import type { CarState } from './physics';
import { engineSpeed, horn, setMuted, startAudio } from './audio';

const state = { car: spawn(), keys: new Set<string>(), lookX: 0, lookY: 0, active: false, fare: 0, passenger: false, earnings: 0, trips: 0, toast: '', toastUntil: 0 };
function reset() { state.car = spawn(); state.lookX=0; state.lookY=0; state.keys.clear(); }
function Driver({ ready, update }: { ready: () => void; update: () => void }) {
  const { camera, gl } = useThree();
  const elapsed = useRef(0);
  useEffect(() => { ready(); }, [ready]);
  useFrame((_, delta) => {
    const k = state.keys;
    if (state.active) state.car = stepCar(state.car, {forward:k.has('KeyW')||k.has('ArrowUp'),reverse:k.has('KeyS')||k.has('ArrowDown'),left:k.has('KeyA')||k.has('ArrowLeft'),right:k.has('KeyD')||k.has('ArrowRight'),brake:k.has('Space')||k.has('ShiftLeft')||k.has('ShiftRight')},delta);
    const car = state.car;
    camera.position.set(car.x, 2.15+Math.sin(car.distance*2)*Math.min(Math.abs(car.speed)*.0015,.022), car.z);
    camera.rotation.order='YXZ'; camera.rotation.set(state.lookY,car.yaw+state.lookX,0);
    engineSpeed(car.speed,state.active);
    if (state.active) {
      const fare = fares[state.fare]; const target = state.passenger ? fare.drop : fare.pickup;
      if (Math.hypot(car.x-target[0],car.z-target[1])<5 && Math.abs(car.speed)<2) {
        if (!state.passenger) { state.passenger=true; state.toast=`Passenger aboard. Off to ${fare.to}!`; }
        else { state.earnings+=fare.reward; state.trips++; state.passenger=false; state.fare=(state.fare+1)%fares.length; state.toast=`Trip complete! +₹${fare.reward} · Chennagide!`; }
        state.toastUntil=performance.now()+4500;
      }
    }
    elapsed.current += delta;
    if (elapsed.current>.08) { elapsed.current=0; update(); gl.domElement.dataset.ready='true'; }
  });
  return null;
}
function Marker({ point, passenger }: {point:number[];passenger:boolean}) {
  const ref = useRef<import('three').Group>(null);
  useFrame(({clock})=>{ if(ref.current) { ref.current.position.y=2.8+Math.sin(clock.elapsedTime*2)*.2; ref.current.rotation.y=clock.elapsedTime*.6; } });
  return <group position={[point[0],.12,point[1]]}>
    <mesh rotation={[-Math.PI/2,0,0]}><ringGeometry args={[2.4,2.8,48]}/><meshBasicMaterial color={passenger?'#8de7d2':'#ffcc53'} transparent opacity={.8}/></mesh>
    <mesh position={[0,1,0]}><cylinderGeometry args={[2.7,2.7,2,40,1,true]}/><meshBasicMaterial color={passenger?'#8de7d2':'#ffcc53'} transparent opacity={.12} depthWrite={false}/></mesh>
    <group ref={ref}><mesh><octahedronGeometry args={[.7]}/><meshStandardMaterial color={passenger?'#88dec5':'#ffd159'} emissive="#eab65c" emissiveIntensity={.35}/></mesh></group>
  </group>;
}
function Map({car,target}:{car:CarState;target:number[]}) {
  const mx=(x:number)=> (x+82)*1.25, mz=(z:number)=>(z+115)*.78;
  return <svg viewBox="0 0 205 170" aria-label="Neighborhood map showing your position and fare destination">
    <rect width="205" height="170" rx="8" fill="#dedec4"/>
    {[-60,0,60].map(x=><path key={x} d={`M${mx(x)} 0V170`} stroke="#faf6e4" strokeWidth="12"/>)}
    {[-100,-40,20,80].map(z=><path key={z} d={`M0 ${mz(z)}H205`} stroke="#faf6e4" strokeWidth="10"/>)}
    {[-30,30].flatMap(x=>[-70,-10,50].map(z=><rect key={`${x},${z}`} x={mx(x)-19} y={mz(z)-15} width="38" height="30" rx="3" fill={z<0?'#b2c1a0':'#c9c7a8'}/>))}
    <text x="105" y="35" className="map-label">INDIRANAGAR</text><text x="105" y="135" className="map-label">KORAMANGALA</text>
    <circle cx={mx(target[0])} cy={mz(target[1])} r="6" fill="#e9a42e" stroke="#fff8dd" strokeWidth="2"/>
    <g transform={`translate(${mx(car.x)} ${mz(car.z)}) rotate(${-car.yaw*180/Math.PI})`}><circle r="9" fill="#255f48" opacity=".16"/><path d="M0 -7 5 5 0 3 -5 5Z" fill="#20583f" stroke="#fff" strokeWidth="1.5"/></g>
  </svg>;
}
function Cockpit({ speed }: {speed:number}) {
  return <div className="cockpit" aria-hidden="true">
    <div className="roof"><span>ನಮ್ಮ ಬೆಂಗಳೂರು</span><span className="roof-tag">KA 01 · N 1986</span></div>
    <div className="pillar left"/><div className="pillar right"/>
    <div className="mirror"><div className="mirror-road"/><i/></div><div className="mirror-stem"/>
    <div className="dashboard"><div className="dash-seam"/><span className="dash-brand">ನಮ್ಮ AUTO</span>
      <div className="dial"><div className="dial-numbers">0　20　40　60</div><div className="needle" style={{transform:`rotate(${-65+Math.abs(speed)*6}deg)`}}/><span>km/h</span></div>
      <div className="handlebar"><div className="grip a"/><div className="grip b"/><div className="handle-center"/></div>
      <div className="dash-sticker">ONE AND HALF?<br/><b>Only good vibes.</b></div>
    </div>
  </div>;
}
class GameBoundary extends Component<{children:ReactNode},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed?<div className="fallback">This ride needs WebGL.<br/>Enable hardware acceleration and reload.</div>:this.props.children;}
}
export default function App() {
  const [tick,setTick]=useState(0), [ready,setReady]=useState(false), [started,setStarted]=useState(false), [active,setActive]=useState(false), [muted,changeMuted]=useState(false), [help,setHelp]=useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const readyCallback = useRef(()=>setReady(true)).current;
  const update = useRef(()=>setTick(v=>v+1)).current;
  useEffect(()=>{
    const down=(e:KeyboardEvent)=>{
      if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
      if (e.code==='Escape') {state.active=false;state.keys.clear();setActive(false);}
      if (!state.active) return;
      state.keys.add(e.code);
      if(e.code==='KeyH'&&!e.repeat) horn();
      if(e.code==='KeyR'&&!e.repeat) reset();
      if(e.code==='KeyM'&&!e.repeat) changeMuted(v=>!v);
    };
    const up=(e:KeyboardEvent)=>state.keys.delete(e.code);
    const move=(e:MouseEvent)=>{if(document.pointerLockElement){state.lookX=Math.max(-1.4,Math.min(1.4,state.lookX-e.movementX*.002)); state.lookY=Math.max(-.45,Math.min(.4,state.lookY-e.movementY*.002));}};
    const lock=()=>{if(!document.pointerLockElement){state.active=false; state.keys.clear();setActive(false);}};
    const blur=()=>{state.keys.clear();state.active=false;setActive(false);};
    window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('mousemove',move);window.addEventListener('blur',blur);document.addEventListener('pointerlockchange',lock);
    return ()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('mousemove',move);window.removeEventListener('blur',blur);document.removeEventListener('pointerlockchange',lock);};
  },[]);
  useEffect(()=>setMuted(muted),[muted]);
  const start = ()=>{ if(!ready)return; startAudio();state.active=true;setActive(true);setStarted(true);setHelp(false);state.lookX=0;state.lookY=0;stage.current?.requestPointerLock()?.catch(()=>{state.toast='Mouse capture unavailable. Keyboard driving is ready.';state.toastUntil=performance.now()+4000;}); };
  const fare=fares[state.fare], target=state.passenger?fare.drop:fare.pickup;
  const distance=Math.round(Math.hypot(state.car.x-target[0],state.car.z-target[1]));
  return <main data-tick={tick} data-driving={active} data-x={state.car.x.toFixed(2)} data-z={state.car.z.toFixed(2)} data-speed={state.car.speed.toFixed(2)} data-trips={state.trips}>
    <div className="scene" ref={stage} onClick={()=>{if(started&&!active)start();}}><GameBoundary><Canvas shadows dpr={[1,1.5]} camera={{fov: 70, near:.1,far:350,position:[-3,2.15,68]}} gl={{antialias:true,powerPreference:'high-performance'}}><Suspense fallback={null}><World/><Marker point={target} passenger={state.passenger}/><Driver ready={readyCallback} update={update}/></Suspense></Canvas></GameBoundary></div>
    <Cockpit speed={state.car.speed}/>
    <header><a className="wordmark" href="/" aria-label="Bengaluru Auto home"><span className="logo-icon">↗</span><span>BENGALURU<span className="wordmark-auto">AUTO<span className="edition"> THE CITY IS YOURS.</span></span></span></a><div className="header-right"><span className="live-dot"/> FREE ROAM <span className="header-divider"/><span>17:24 <span className="sun">☀</span></span><button onClick={()=>changeMuted(v=>!v)} aria-label={muted?'Unmute audio':'Mute audio'} title="Toggle audio (M)">{muted?'♪ ×':'♪'}</button><button onClick={()=>{if(document.pointerLockElement)document.exitPointerLock();state.active=false;setActive(false);setHelp(v=>!v);}} aria-label="Show controls">?</button></div></header>
    <div className="location"><span className="eyebrow">12.93° N &nbsp; 77.62° E</span><h1>{state.car.z<0?'Indiranagar':'Koramangala'}<span>↗</span></h1><p>{state.car.z<0?'Tree-lined streets. One more coffee.':'A little chaos. A lot of character.'}</p></div>
    <aside className="fare-card"><div className="fare-top"><span className="eyebrow">{state.passenger?'ON A TRIP':'A LITTLE SIDE QUEST'}</span><span className="fare-icon">↗</span></div><h2>{state.passenger?fare.to:'Coffee, then a ride?'}</h2><p>{state.passenger?'Your passenger is enjoying the scenic route.':`A passenger is waiting at ${fare.from}.`}</p><div className="fare-bottom"><span><i className="gold-dot"/>{state.passenger?'DROP-OFF':'PICKUP'} <b>{distance} m</b></span><strong>₹{fare.reward}</strong></div><div className="fare-hint">{distance<7?`Brake to stop inside the ${state.passenger?'mint':'golden'} circle.`:'Follow the golden marker. Or just explore.'}</div></aside>
    {(!active||help)&&<section className={`start-panel ${started?'compact':''}`}><div className="eyebrow">{started?'TAKE YOUR TIME, BOSS.':'NO RUSH. NO WRONG TURNS.'}</div><h2>{started?'Back on the road?':<>Meter down.<br/>City open.</>}</h2><p>{started?'Your auto is right where you left it.':'The best way to see Bengaluru? From behind the handlebar.'}</p><button className="start-button" disabled={!ready} onClick={start}>{!ready?'Warming up…':started?'Resume your ride':'Let’s take a ride'}<span>↗</span></button><div className="start-controls"><span><kbd>W A S D</kbd> drive</span><span><kbd>↔</kbd> mouse look</span><span><kbd>SPACE</kbd> brake</span></div><small>{started?'Esc pauses · R brings you home':'Click to capture mouse · Esc to pause · Desktop experience'}</small></section>}
    {state.toastUntil>performance.now()&&<div className="toast" role="status">✦ &nbsp;{state.toast}</div>}
    <div className="map-card"><div className="map-top"><span>NAMMA NEIGHBORHOOD</span><span>N ↑</span></div><Map car={state.car} target={target}/><div className="map-bottom"><span><i className="green-dot"/>YOU</span><span><i className="gold-dot"/>{state.passenger?'DROP-OFF':'PICKUP'}</span><span>EXPLORE FREELY</span></div></div>
    <div className="meter-card"><div className="meter-heading"><span className="live-dot"/>NAMMA METER<span>AUTO</span></div><div className="meter-body"><div className="speed"><strong>{Math.round(Math.abs(state.car.speed)*3.6).toString().padStart(2,'0')}</strong><span>km/h</span></div><div className="earnings"><span>TODAY’S EARNINGS</span><b>₹{state.earnings.toString().padStart(3,'0')}</b><small>{state.trips} {state.trips===1?'trip':'trips'} · {(state.car.distance/1000).toFixed(1)} km</small></div></div><div className="meter-footer">{state.passenger?'● PASSENGER ON BOARD':'● ON YOUR OWN TIME'}<span>{state.car.speed<-.1?'R':'D'}</span></div></div>
    <footer><span><kbd>W A S D</kbd> Drive</span><span><kbd>MOUSE</kbd> Look</span><span><kbd>SPACE / SHIFT</kbd> Brake</span><span><kbd>H</kbd> Horn</span><span><kbd>R</kbd> Reset</span><span><kbd>ESC</kbd> Pause</span><span className="footer-tag">MADE FOR THE DETOUR.</span></footer>
  </main>;
}
