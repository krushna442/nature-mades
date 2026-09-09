import react from 'react';
import AeroShards from './AeroShards';
import './App.css'

function App() {

  return (
  <div style={{ width: '100%', height: '700px', position: 'relative' }}>
  <AeroShards
    backgroundColor="#000000"
    shardColor="#10B981"
    accentColor="#3B82F6"
    placement="full"
    flow="stream"
    material="pearl"
    detail="balanced"
    effect="none"
    scale={1}
    spread={1}
    depth={1}
    speed={1}
    spin={1}
    interaction="repel"
    density={1.5}
    shardSize={1.1}
    stretch={1}
    turbulence={1}
    glow={1}
    edgeSoftness={2}
    bloom={0.5}
    grain={0.05}
    chromaticAberration={0.0075}
    transitionDuration={1}
    interactionRadius={1.5}
    interactionStrength={0.5}
    rippleIntensity={1}
    holdToGather
    paused={false}
/>
<div className='text-white absolute top-0 left-0 w-full min-h-screen'> 
  <div className='w-[70vw] mx-auto border-[0.01px] border-[#a2a0a046] bg-[#0000004f] backdrop-blur-md mt-14 px-4 flex justify-between items-center  h-12 rounded-2xl '>
    <p className='text-bold text-2xl' style={{fontFamily:'ui-sans-serif'}}>Nature<span className='text-emerald-700 font-extrabold'>Mades</span></p>
    <ul className='flex gap-2 '>
<li>Products</li>
<li>Products</li>
<li>Products</li>
<li>Products</li>

    </ul>
     </div>
</div>
</div>
  )
}

export default App
