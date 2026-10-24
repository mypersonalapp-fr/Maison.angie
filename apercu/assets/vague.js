/* Le titre d'accueil arrive en vague, une seule fois. */
(function(){
  'use strict';
  var h=document.querySelector('h1.h-xl');
  if(!h||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches))return;
  var st=document.createElement('style');
  st.textContent='@keyframes vague{0%{opacity:0;transform:translateY(.55em)}45%{opacity:1;transform:translateY(-.16em)}72%{transform:translateY(.05em)}100%{opacity:1;transform:none}}'+
  'h1.h-xl .vg{display:inline-block;opacity:0;white-space:pre}h1.h-xl.go .vg{animation:vague .95s cubic-bezier(.3,.7,.3,1) both;animation-delay:calc(var(--i)*55ms)}';
  document.head.appendChild(st);
  h.setAttribute('aria-label',h.textContent);
  var n=0;
  (function split(node){
    Array.prototype.slice.call(node.childNodes).forEach(function(c){
      if(c.nodeType===3){
        var f=document.createDocumentFragment();
        c.nodeValue.split('').forEach(function(ch){var s=document.createElement('span');s.className='vg';s.setAttribute('aria-hidden','true');s.style.setProperty('--i',n++);s.textContent=ch;f.appendChild(s)});
        c.parentNode.replaceChild(f,c);
      }else if(c.nodeType===1)split(c);
    });
  })(h);
  function go(){h.classList.add('go')}
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){go();io.disconnect()}},{threshold:.3});io.observe(h);
  }else go();
})();
