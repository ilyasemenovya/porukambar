(() => {
  const id = 113166324;
  if (window.porukamMetrikaLoaded) return;
  window.porukamMetrikaLoaded = true;
  document.querySelectorAll('form, #guest-chat, #review-dialog, #boss-dialog').forEach(el => el.classList.add('ym-hide-content'));
  (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r)return;}k=e.createElement(t);a=e.getElementsByTagName(t)[0];k.async=1;k.src=r;a.parentNode.insertBefore(k,a);})(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=113166324','ym');
  ym(id,'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:false});
})();
