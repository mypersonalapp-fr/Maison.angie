/* Édition Noël v2 : titre, verset, banderole, nœuds hors photos, neige hors photos, musique */
(function(){
  'use strict';
  var NOIR=window.ND2_THEME==='noir';
  if(NOIR)document.documentElement.classList.add('nd2-noir');
  function bow(){var a=NOIR?['#F2F2F2','#B9B9B9','#6E6E6E','#555']:['#EBD8A6','#C9A661','#8A6D2F','#6e5522'];
    return '<svg viewBox="0 0 150 100" aria-hidden="true"><defs><linearGradient id="g'+(bow.n=(bow.n||0)+1)+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+a[0]+'"/><stop offset=".55" stop-color="'+a[1]+'"/><stop offset="1" stop-color="'+a[2]+'"/></linearGradient></defs>'+
    '<path d="M75 52C55 20 10 6 8 40C6 72 52 72 75 52Z" fill="url(#g'+bow.n+')" stroke="'+a[2]+'" stroke-width="1.2"/><path d="M75 52C95 20 140 6 142 40C144 72 98 72 75 52Z" fill="url(#g'+bow.n+')" stroke="'+a[2]+'" stroke-width="1.2"/>'+
    '<path d="M70 50C52 30 28 24 22 40" fill="none" stroke="#fff" stroke-width="2" opacity=".6"/><path d="M80 50C98 30 122 24 128 40" fill="none" stroke="#fff" stroke-width="2" opacity=".6"/>'+
    '<path d="M68 60L44 96L60 89L70 99L77 62Z" fill="'+a[1]+'" stroke="'+a[2]+'"/><path d="M82 60L106 96L90 89L80 99L73 62Z" fill="'+a[1]+'" stroke="'+a[2]+'"/>'+
    '<rect x="62" y="40" width="26" height="24" rx="7" fill="'+a[2]+'" stroke="'+a[3]+'"/></svg>'}
  function init(){
    var s=document.querySelector('.fete-strip');
    if(s){var b=s.querySelector('b');if(b)b.textContent='Joyeux Noël';
      var v=document.createElement('div');v.className='nd2-verse';v.innerHTML='« Un sauveur nous est né »<small>Luc 2:11</small>';s.parentNode.insertBefore(v,s.nextSibling);
      var bn=document.createElement('div');bn.className='nd-bunting';bn.setAttribute('aria-hidden','true');v.parentNode.insertBefore(bn,v.nextSibling)}
    // nœuds : au bord haut de chaque section, à gauche / au milieu / à droite, jamais sur une photo
    var pos=['l','r','c','r','l','c'],k=0,gar=document.querySelector('.fete-garland');
    document.querySelectorAll('section,footer.site').forEach(function(e){
      if(e.closest('.rd-wall,.rl'))return;
      var i=document.createElement('i');i.className='nd2-bow '+pos[k++%pos.length];i.innerHTML=bow();e.appendChild(i);
      if(e.matches('section.band')&&gar){var d=document.createElement('div');d.className='nd2-div';d.setAttribute('aria-hidden','true');
        d.style.backgroundImage=getComputedStyle(gar).backgroundImage;e.parentNode.insertBefore(d,e)}
    });
    // neige : gros flocons, jamais au-dessus d'une photo ou d'une vidéo
    var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    var c=document.createElement('canvas');c.className='nd2-snow';c.setAttribute('aria-hidden','true');document.body.appendChild(c);
    var x=c.getContext('2d'),W,H,D=Math.min(window.devicePixelRatio||1,2),F=[];
    var COL=NOIR?['rgba(90,90,96,.8)','rgba(140,140,148,.85)','rgba(60,60,66,.7)']:['rgba(110,130,158,.85)','rgba(184,151,90,.9)','rgba(140,158,182,.85)','rgba(138,109,47,.8)'];
    function mk(init){var r=9+Math.random()*12;return{x:Math.random()*W,y:init?Math.random()*H:-30,r:r,v:.6+Math.random()*1.1+r*.03,a:Math.random()*6.28,s:.006+Math.random()*.012,w:8+Math.random()*20,rot:Math.random()*6.28,vr:(Math.random()-.5)*.02,c:COL[Math.floor(Math.random()*COL.length)]}}
    function size(){W=innerWidth;H=innerHeight;c.width=W*D;c.height=H*D;x.setTransform(D,0,0,D,0,0);var n=Math.max(16,Math.min(34,Math.round(W/38)));while(F.length<n)F.push(mk(true));F.length=n}
    function flake(f,px){x.save();x.translate(px,f.y);x.rotate(f.rot);x.strokeStyle=f.c;x.lineWidth=Math.max(1.4,f.r/6);x.lineCap='round';
      for(var q=0;q<6;q++){x.rotate(Math.PI/3);x.beginPath();x.moveTo(0,0);x.lineTo(0,-f.r);x.moveTo(0,-f.r*.55);x.lineTo(f.r*.28,-f.r*.8);x.moveTo(0,-f.r*.55);x.lineTo(-f.r*.28,-f.r*.8);x.stroke()}x.restore()}
    function mask(){x.beginPath();x.rect(0,0,W,H);
      document.querySelectorAll('img:not(.nd2-skip),video,.rd-pn,.rl-stage').forEach(function(e){if(e.closest('header.site')||(e.tagName==='IMG'&&e.closest('.rd-pn,.rl-stage')))return;var r=e.getBoundingClientRect();if(r.width>40&&r.height>40&&r.bottom>0&&r.top<H)x.rect(r.left,r.top,r.width,r.height)});
      x.clip('evenodd')}
    size();addEventListener('resize',size);
    if(!reduce)(function loop(){x.save();x.clearRect(0,0,W,H);mask();
      for(var i=0;i<F.length;i++){var f=F[i];f.y+=f.v;f.a+=f.s;f.rot+=f.vr;var px=f.x+Math.sin(f.a)*f.w;if(f.y>H+30){F[i]=mk(false);continue}flake(f,px)}
      x.restore();requestAnimationFrame(loop)})();
    // musique : « Douce nuit » (domaine public), synthétisée, démarre au clic
    var btn=document.createElement('button');btn.type='button';btn.className='nd2-mu';btn.setAttribute('aria-pressed','false');btn.innerHTML='<b>♪</b><span>Musique</span>';document.body.appendChild(btn);
    var ctx=null,playing=false,timer=null,E=.4;
    var N={C:261.63,D:293.66,E:329.63,F:349.23,G:392,A:440,B:493.88,c:523.25,d:587.33,e:659.25,f:698.46};
    var seq=[['G',3],['A',1],['G',2],['E',6],['G',3],['A',1],['G',2],['E',6],['d',4],['d',2],['B',6],['c',4],['c',2],['G',6],['A',4],['A',2],['c',3],['B',1],['A',2],['G',3],['A',1],['G',2],['E',6],['A',4],['A',2],['c',3],['B',1],['A',2],['G',3],['A',1],['G',2],['E',6],['d',4],['d',2],['f',3],['d',1],['B',2],['c',6],['e',6],['c',3],['G',1],['E',2],['G',3],['F',1],['D',2],['C',6]];
    function note(fq,t,len){var o=ctx.createOscillator(),o2=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o2.type='triangle';o.frequency.value=fq;o2.frequency.value=fq*2.003;
      var g2=ctx.createGain();g2.gain.value=.18;o2.connect(g2);g2.connect(g);o.connect(g);g.connect(master);
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.5,t+.015);g.gain.exponentialRampToValueAtTime(.001,t+Math.min(len*E+1.4,3));o.start(t);o2.start(t);o.stop(t+3.2);o2.stop(t+3.2)}
    var master;
    function loopSong(){var t=ctx.currentTime+.1,tot=0;seq.forEach(function(n){note(N[n[0]],t+tot*E,n[1]);tot+=n[1]});
      timer=setTimeout(function(){if(playing)loopSong()},(tot*E+3)*1000)}
    function start(){if(!ctx){var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;ctx=new AC();master=ctx.createGain();master.gain.value=.35;
        var dl=ctx.createDelay();dl.delayTime.value=.28;var fb=ctx.createGain();fb.gain.value=.3;dl.connect(fb);fb.connect(dl);master.connect(dl);dl.connect(ctx.destination);master.connect(ctx.destination)}
      if(ctx.state==='suspended')ctx.resume();playing=true;btn.classList.add('on');btn.setAttribute('aria-pressed','true');btn.querySelector('span').textContent='Musique : oui';loopSong()}
    function stop(){playing=false;clearTimeout(timer);if(ctx)ctx.suspend();btn.classList.remove('on');btn.setAttribute('aria-pressed','false');btn.querySelector('span').textContent='Musique'}
    btn.addEventListener('click',function(){playing?stop():start()});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
