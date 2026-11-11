(() => {
 const stage=document.querySelector('.scroll-logo-stage');
 if(!stage)return;
 const top=stage.querySelector('.scroll-hand-top'),bottom=stage.querySelector('.scroll-hand-bottom');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let scheduled=false;
 function render(){
  scheduled=false;
  const track=document.querySelector(".hero-scroll-track");

  const y=window.scrollY;
  const duration=220;
  const p=reduced.matches?1:Math.max(0,Math.min(1,y/duration));
  const ease=p*p*(3-2*p);
  top.style.transform=`translate(${40-88*ease}%,${-20+85*ease}%)`;
  bottom.style.transform=`translate(${-40+88*ease}%,${20-85*ease}%)`;

 }
 function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(render)}}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);reduced.addEventListener('change',schedule);render();
})();
