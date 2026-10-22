/* Éditions de saison. Noël : automatique du 1er décembre au 6 janvier.
   Aperçu : ajouter ?fete=noel à l'adresse. Désactiver : ?fete=off */
(function(){
  'use strict';
  function noel(d){var m=d.getMonth(),j=d.getDate();return m===11||(m===0&&j<=6)}
  var q=new URLSearchParams(location.search),p=q.get('fete'),preview=p==='noel';
  var on=p==='off'?false:(preview||noel(new Date()));
  window.MaisonFetes={noel:noel};
  if(!on)return;
  var h=document.documentElement;h.classList.add('fete-noel');
  function init(){
    var b=document.body;
    var s=document.createElement('div');s.className='fete-strip';
    s.innerHTML='<span></span><i></i><b style="font-weight:500">Joyeuses fêtes</b><i></i><span class="r"></span>';
    b.insertBefore(s,b.firstChild);
    var hd=document.querySelector('header.site');
    if(hd){var g=document.createElement('div');g.className='fete-garland';g.setAttribute('aria-hidden','true');hd.parentNode.insertBefore(g,hd.nextSibling)}
    if(preview){
      var pv=document.createElement('div');pv.className='fete-preview';
      pv.innerHTML='Aperçu Noël<a href="'+location.pathname+'?fete=off'+location.hash+'">Quitter</a>';b.appendChild(pv)
    }
    if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    var c=document.createElement('canvas');c.className='fete-canvas';c.setAttribute('aria-hidden','true');b.appendChild(c);
    var x=c.getContext('2d'),W,H,D=Math.min(window.devicePixelRatio||1,2),F=[];
    var COL=['rgba(184,151,90,.75)','rgba(184,151,90,.5)','rgba(150,150,156,.55)','rgba(180,180,186,.5)','rgba(255,255,255,.95)'];
    function size(){W=innerWidth;H=innerHeight;c.width=W*D;c.height=H*D;x.setTransform(D,0,0,D,0,0);
      var n=Math.max(18,Math.min(60,Math.round(W/14)));
      while(F.length<n)F.push(mk(true));F.length=n}
    function mk(init){var r=1.2+Math.random()*2.8;return{x:Math.random()*W,y:init?Math.random()*H:-8,r:r,v:.25+r*.18,a:Math.random()*6.28,s:.004+Math.random()*.01,w:6+Math.random()*16,c:COL[Math.floor(Math.random()*COL.length)]}}
    size();addEventListener('resize',size);
    (function loop(){
      x.clearRect(0,0,W,H);
      for(var i=0;i<F.length;i++){var f=F[i];f.y+=f.v;f.a+=f.s;var px=f.x+Math.sin(f.a)*f.w;
        if(f.y>H+8){F[i]=mk(false);continue}
        x.beginPath();x.arc(px,f.y,f.r,0,6.283);x.fillStyle=f.c;x.fill();
        if(f.c.indexOf('255,255,255')>0){x.strokeStyle='rgba(184,151,90,.55)';x.lineWidth=.8;x.stroke()}}
      requestAnimationFrame(loop)})();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
