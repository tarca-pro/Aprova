import {registerRoot, Composition, AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import React from 'react';
const Teste=()=>{const f=useCurrentFrame();return <AbsoluteFill style={{background:'#0b0b0e',justifyContent:'center',alignItems:'center'}}><h1 style={{color:'#ffc21a',fontSize:120,fontFamily:'sans-serif',opacity:interpolate(f,[0,15],[0,1])}}>@claarkio</h1></AbsoluteFill>};
registerRoot(()=> <Composition id="Teste" component={Teste} durationInFrames={30} fps={30} width={1080} height={1920}/>);
