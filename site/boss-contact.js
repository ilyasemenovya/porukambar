(() => {
const dialog=document.querySelector('#boss-dialog');
const trigger=document.querySelector('#boss-trigger');
if(!dialog || !trigger) return;
let recipient='';
trigger.addEventListener('click',()=>{dialog.showModal();document.body.classList.add('modal-open');});
dialog.querySelector('.boss-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');trigger.focus();});
dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close();}});
dialog.querySelectorAll('[data-boss]').forEach(button=>button.addEventListener('click',()=>{
recipient=button.dataset.boss;
dialog.querySelectorAll('[data-boss]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
dialog.close();
document.dispatchEvent(new CustomEvent('porukam:boss-message',{detail:{recipient}}));

}));
})();
