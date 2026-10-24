/* Édition Noël permanente : bannière de fanions + vraie neige (flocons à six branches) sur tout le site, tout le temps */
(function(){
  'use strict';
  function init(){
    var s=document.querySelector('.fete-strip');
    if(s&&!document.querySelector('.nd-bunting')){var b=document.createElement('div');b.className='nd-bunting';b.setAttribute('aria-hidden','true');s.parentNode.insertBefore(b,s.nextSibling)}
    var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    var c=document.createElement('canvas');c.className='nd-snow';c.setAttribute('aria-hidden','true');document.body.appendChild(c);
    var x=c.getContext('2d'),W,H,D=Math.min(window.devicePixelRatio||1,2),F=[];
    var COL=['rgba(110,130,158,.9)','rgba(184,151,90,.95)','rgba(140,158,182,.9)','rgba(138,109,47,.85)'];
    function mk(init){var r=14+Math.random()*22;return{x:Math.random()*W,y:init?Math.random()*H:-20,r:r,v:.7+Math.random()*1.3+r*.04,a:Math.random()*6.28,s:.006+Math.random()*.012,w:8+Math.random()*22,rot:Math.random()*6.28,vr:(Math.random()-.5)*.02,c:COL[Math.floor(Math.random()*COL.length)]}}
    function size(){W=innerWidth;H=innerHeight;c.width=W*D;c.height=H*D;x.setTransform(D,0,0,D,0,0);var n=Math.max(18,Math.min(40,Math.round(W/30)));while(F.length<n)F.push(mk(true));F.length=n}
    function flake(f,px){
      x.save();x.translate(px,f.y);x.rotate(f.rot);x.strokeStyle=f.c;x.lineWidth=Math.max(2,f.r/5);x.lineCap='round';
      for(var k=0;k<6;k++){x.rotate(Math.PI/3);x.beginPath();x.moveTo(0,0);x.lineTo(0,-f.r);
        x.moveTo(0,-f.r*.55);x.lineTo(f.r*.28,-f.r*.8);x.moveTo(0,-f.r*.55);x.lineTo(-f.r*.28,-f.r*.8);x.stroke()}
      x.restore()}
    size();addEventListener('resize',size);
    if(reduce){F.forEach(function(f){flake(f,f.x)});return}
    (function loop(){
      x.clearRect(0,0,W,H);
      for(var i=0;i<F.length;i++){var f=F[i];f.y+=f.v;f.a+=f.s;f.rot+=f.vr;var px=f.x+Math.sin(f.a)*f.w;
        if(f.y>H+20){F[i]=mk(false);continue}
        flake(f,px)}
      requestAnimationFrame(loop)})();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
