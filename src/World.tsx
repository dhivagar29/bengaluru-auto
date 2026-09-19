import { memo, useMemo } from 'react';
import { CanvasTexture, SRGBColorSpace } from 'three';
import { Sky } from '@react-three/drei';
import { roadsX, roadsZ } from './physics';

function Box({ p, s, color, ...props }: { p: [number,number,number]; s: [number,number,number]; color: string; rotation?: [number,number,number] }) {
  return <mesh position={p} castShadow receiveShadow {...props}><boxGeometry args={s}/><meshStandardMaterial color={color} roughness={.9}/></mesh>;
}
function Sign({ text, p, width = 8, color = '#f7e8bb', bg = '#20574c', rotation = 0 }: { text: string; p: [number,number,number]; width?: number; color?: string; bg?: string; rotation?: number }) {
  const texture = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 192;
    const ctx = c.getContext('2d')!; ctx.fillStyle=bg; ctx.fillRect(0,0,1024,192);
    ctx.strokeStyle=color; ctx.lineWidth=4; ctx.strokeRect(12,12,1000,168);
    ctx.fillStyle=color; ctx.font='bold 65px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(text,512,100,970);
    const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; return t;
  }, [text,color,bg]);
  return <mesh position={p} rotation={[0,rotation,0]}><planeGeometry args={[width,width*.1875]}/><meshStandardMaterial map={texture} roughness={1}/></mesh>;
}
function Tree({ x, z, size = 1 }: { x:number; z:number; size?:number }) {
  return <group position={[x,0,z]} scale={size}>
    <mesh position={[0,2.6,0]} castShadow><cylinderGeometry args={[.2,.35,5.2,6]}/><meshStandardMaterial color="#79604a"/></mesh>
    {[[0,6,0,2.8],[-1.5,5.2,0,2.2],[1.4,5.5,.6,2.4]].map(([a,b,c,r],i)=><mesh key={i} position={[a,b,c]} castShadow><icosahedronGeometry args={[r,1]}/><meshStandardMaterial color={['#6b8950','#547748','#809454'][i]} flatShading/></mesh>)}
  </group>;
}
export function Auto({ x, z, rotation = 0 }: { x:number; z:number; rotation?:number }) {
  return <group position={[x,0,z]} rotation={[0,rotation,0]}>
    <Box p={[0,.85,0]} s={[1.8,1,2.5]} color="#368353"/><Box p={[0,1.8,.5]} s={[1.85,.95,1.5]} color="#292e29"/>
    <Box p={[0,2.35,.1]} s={[1.95,.25,2.4]} color="#f3bc35"/><Box p={[0,1.5,-1.08]} s={[1.8,.38,.3]} color="#f3bc35"/>
    {[-.83,.83].map(x=><Box key={x} p={[x,1.85,-.95]} s={[.09,1,.1]} color="#edb839"/>)}
    {[[-.95,.45,.65],[.95,.45,.65],[0,.45,-1]].map((p,i)=><mesh key={i} position={p as [number,number,number]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.42,.42,.25,12]}/><meshStandardMaterial color="#242826"/></mesh>)}
    <Box p={[0,1,-1.28]} s={[.55,.3,.05]} color="#fff2b8"/>
  </group>;
}
const shopNames = ['DARSHINI • COFFEE','THIRD WAVE COFFEE','NANDINI MILK','BLOSSOM BOOKS','MTR • TIFFIN ROOM','CORNER HOUSE','INDIRANAGAR SOCIAL','THE FILTER COFFEE','LOCAL • KITCHEN','FLOWER MARKET','NAMMA STORES','DOSE & CHUTNEY'];
const palette = ['#ce9676','#e5c994','#b8c6ae','#cbac96','#d1bc81','#aac2b9'];
function Building({ x,z,index,leafy }: {x:number;z:number;index:number;leafy:boolean}) {
  const h = leafy ? 7 + index%3*1.5 : 9 + index%4*2;
  return <group position={[x,0,z]}>
    <Box p={[0,h/2,0]} s={[15,h,17]} color={palette[index%palette.length]}/>
    <Box p={[0,h+.2,0]} s={[15.5,.4,17.5]} color="#ede0bd"/>
    <Box p={[0,.2,0]} s={[17,.4,19]} color="#c2b599"/>
    {[-1,1].map(side=><group key={side}>
      <Box p={[side*7.56,2.1,0]} s={[.1,3,13]} color="#344e47"/>
      {[-5,0,5].map(v=><group key={v}>
        <Box p={[side*7.66,2.1,v]} s={[.13,3,.12]} color="#d9c99f"/>
        {[5.5,8.5,11.5].filter(y=>y<h-1).map(y=><Box key={y} p={[side*7.56,y,v]} s={[.08,1.65,2.5]} color="#597777"/>)}
      </group>)}
      <Box p={[side*8,3.65,0]} s={[1.9,.17,16]} color={index%2?'#a86040':'#68856a'} rotation={[0,0,side*.12]}/>
      <Sign text={shopNames[index%shopNames.length]} p={[side*7.7,4.5,0]} rotation={side*Math.PI/2} width={13} bg={index%3===0?'#884e37':'#28554a'}/>
    </group>)}
    <Sign text={shopNames[index%shopNames.length]} p={[0,4.4,8.56]} width={13} bg={index%2?'#88513e':'#244e44'}/>
    {[-5,0,5].map(v=><Box key={v} p={[v,2,8.56]} s={[3.8,2.8,.08]} color="#425b51"/>)}
    <Box p={[0,3.4,9]} s={[15,.15,1.8]} color={index%2?'#c48051':'#4b7257'}/>
    <Box p={[4,h+.7,3]} s={[2,1,2]} color="#737775"/>
  </group>;
}
export const World = memo(function World() {
  return <>
    <color attach="background" args={['#dccbb0']}/><fog attach="fog" args={['#dccbb0',85,240]}/>
    <Sky sunPosition={[100,45,-80]} turbidity={7} rayleigh={.6}/>
    <hemisphereLight args={['#fff0d2','#807958',2.3]}/>
    <directionalLight position={[-40,65,20]} intensity={3.2} color="#ffddac" castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-100} shadow-camera-right={100} shadow-camera-top={100} shadow-camera-bottom={-100} shadow-bias={-.0005}/>
    <Box p={[0,-.25,-10]} s={[500,.4,500]} color="#a6ad7d"/>
    {roadsX.map(x=><Box key={x} p={[x,-.015,-10]} s={[17,.1,200]} color="#727873"/>)}
    {roadsZ.map(z=><Box key={z} p={[0,.001,z]} s={[137,.1,17]} color="#727873"/>)}
    {roadsX.flatMap(x=>Array.from({length:32},(_,i)=>{const z=-104+i*6; return roadsZ.every(r=>Math.abs(r-z)>10)?<Box key={`${x},${z}`} p={[x,.048,z]} s={[.12,.012,2.4]} color="#ded5ae"/>:null;}))}
    {roadsZ.flatMap(z=>[-60,0,60].flatMap(x=>[-1,1].flatMap(side=>Array.from({length:6},(_,i)=><Box key={`${x},${z},${side},${i}`} p={[x-5+i*2,.06,z+side*10]} s={[1,.015,2.3]} color="#d6d5bb"/>))))}
    {[-30,30].flatMap((x,xi)=>[-70,-10,50].flatMap((z,zi)=>[-11,11].flatMap((dx,di)=>[-13,13].map((dz,dzi)=><Building key={`${x+dx},${z+dz}`} x={x+dx} z={z+dz} index={xi*6+zi*4+di*2+dzi} leafy={z<0}/>))))}
    {[-79,79].flatMap(x=>[-94,-65,-35,-5,25,55,85].map((z,i)=><Building key={`${x},${z}`} x={x} z={z} index={i+3} leafy={z<0}/>))}
    {[-10,10,50,70,-50,-70].flatMap(x=>[-91,-70,-49,-29,-8,10,31,53,70].map((z,i)=><Tree key={`${x},${z}`} x={x} z={z} size={z<0?1.1:.78+i%2*.15}/>))}
    {[-60,0,60].flatMap(x=>[-70,-10,50].map(z=><group key={`${x},${z}`}>
      <Box p={[x+8.5,3.6,z]} s={[.12,7.2,.12]} color="#4f625b"/><Box p={[x+7.5,7.2,z]} s={[2.2,.14,.15]} color="#4f625b"/><Box p={[x+6.6,7.1,z]} s={[.8,.15,.4]} color="#fff0b6"/>
    </group>))}
    <Auto x={4.8} z={-10}/><Auto x={-5.3} z={49} rotation={Math.PI}/><Auto x={64.8} z={-43}/><Auto x={-55} z={-76} rotation={Math.PI}/>
    {[[-5.8,-64],[65.5,14],[-65.5,34]].map(([x,z],i)=><group key={i}><Box p={[x,.8,z]} s={[1.8,1.1,3.5]} color={['#dddcc9','#be7151','#86a5a2'][i]}/><Box p={[x,1.5,z]} s={[1.6,.6,1.9]} color="#486061"/></group>)}
    <group position={[0,0,-104]}><Box p={[0,8,0]} s={[145,.8,5]} color="#aaa997"/>{[-60,-30,0,30,60].map(x=><Box key={x} p={[x,4,0]} s={[1.2,8,1.2]} color="#a8a894"/>)}<Box p={[28,9.7,0]} s={[30,2.4,2.8]} color="#bcc7b5"/><Box p={[28,10,1.45]} s={[28,.8,.1]} color="#677d79"/></group>
    <Sign text="100 FEET ROAD  ↑   INDIRANAGAR" p={[0,7,-33]} width={12}/><Box p={[-6.5,3.5,-33]} s={[.17,7,.17]} color="#536459"/>
    <Sign text="NAMMA BENGALURU" p={[-19,6,39]} width={13} bg="#9a5439"/>
    {[[-10,26],[-10,30],[10,54],[50,-80]].map(([x,z],i)=><group key={i}><Box p={[x,1,z]} s={[1.7,1.6,1]} color="#b3714a"/><mesh position={[x,2,z]} rotation={[-Math.PI/2,0,0]}><coneGeometry args={[2,.5,6]}/><meshStandardMaterial color={i%2?'#d39c48':'#a95438'}/></mesh><Box p={[x,1.6,z]} s={[1.8,.2,1.2]} color="#dcb46c"/></group>)}
  </>;
});
