/* Éditions de saison. Noël : automatique du 1er décembre au 6 janvier.
   Pâques : automatique 14 jours avant jusqu'au lundi de Pâques.
   Aperçu : ?fete=noel ou ?fete=paques. Désactiver : ?fete=off */
(function(){
  'use strict';
  function noel(d){var m=d.getMonth(),j=d.getDate();return m===11||(m===0&&j<=6)}
  function paquesDate(y){var a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),
    hh=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-hh-k)%7,m=Math.floor((a+11*hh+22*l)/451),
    mo=Math.floor((hh+l-7*m+114)/31),da=((hh+l-7*m+114)%31)+1;return new Date(y,mo-1,da)}
  function paques(d){var e=paquesDate(d.getFullYear()),t=new Date(d.getFullYear(),d.getMonth(),d.getDate());
    var diff=Math.round((e-t)/864e5);return diff<=14&&diff>=-1}
  var q=new URLSearchParams(location.search),p=q.get('fete'),preview=p==='noel'||p==='paques';
  var theme=p==='paques'?'paques':p==='noel'?'noel':(noel(new Date())?'noel':(paques(new Date())?'paques':null));
  var on=p==='off'?false:!!theme;
  window.MaisonFetes={noel:noel,paques:paques};
  if(!on)return;
  var h=document.documentElement;h.classList.add('fete','fete-'+theme);
  function init(){
    var b=document.body;
    var s=document.createElement('div');s.className='fete-strip';
    s.innerHTML='<span></span><i></i><b style="font-weight:500">'+(theme==='paques'?'Joyeuses Pâques':'Joyeuses fêtes')+'</b><i></i><span class="r"></span>';
    b.insertBefore(s,b.firstChild);
    var hd=document.querySelector('header.site');
    if(hd){var g=document.createElement('div');g.className='fete-garland';g.setAttribute('aria-hidden','true');hd.parentNode.insertBefore(g,hd.nextSibling)}
    if(preview){
      var pv=document.createElement('div');pv.className='fete-preview';
      pv.innerHTML='Aperçu '+(theme==='paques'?'Pâques':'Noël')+'<a href="'+location.pathname+'?fete=off'+location.hash+'">Quitter</a>';b.appendChild(pv)
    }
    if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    var c=document.createElement('canvas');c.className='fete-canvas';c.setAttribute('aria-hidden','true');b.appendChild(c);
    var x=c.getContext('2d'),W,H,D=Math.min(window.devicePixelRatio||1,2),F=[];
    var COL=theme==='paques'?['rgba(232,190,190,.85)','rgba(207,195,221,.85)','rgba(191,208,188,.85)','rgba(238,223,168,.85)','rgba(255,255,255,.95)']:['rgba(184,151,90,.75)','rgba(184,151,90,.5)','rgba(150,150,156,.55)','rgba(180,180,186,.5)','rgba(255,255,255,.95)'];
    function size(){W=innerWidth;H=innerHeight;c.width=W*D;c.height=H*D;x.setTransform(D,0,0,D,0,0);
      var n=Math.max(18,Math.min(60,Math.round(W/14)));
      while(F.length<n)F.push(mk(true));F.length=n}
    function mk(init){var r=1.2+Math.random()*2.8;return{x:Math.random()*W,y:init?Math.random()*H:-8,r:r,v:.25+r*.18,a:Math.random()*6.28,s:.004+Math.random()*.01,w:6+Math.random()*16,c:COL[Math.floor(Math.random()*COL.length)]}}
    size();addEventListener('resize',size);
    (function loop(){
      x.clearRect(0,0,W,H);
      for(var i=0;i<F.length;i++){var f=F[i];f.y+=f.v;f.a+=f.s;var px=f.x+Math.sin(f.a)*f.w;
        if(f.y>H+8){F[i]=mk(false);continue}
        x.beginPath();
        if(theme==='paques'){x.ellipse(px,f.y,f.r*1.9,f.r*1.1,f.a,0,6.283)}else{x.arc(px,f.y,f.r,0,6.283)}
        x.fillStyle=f.c;x.fill();
        if(f.c.indexOf('255,255,255')>0){x.strokeStyle=theme==='paques'?'rgba(201,160,160,.7)':'rgba(184,151,90,.55)';x.lineWidth=.8;x.stroke()}}
      requestAnimationFrame(loop)})();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
