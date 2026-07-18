const dialog=document.querySelector('#lightbox');
const dialogImg=dialog.querySelector('img');
const reachGoal=goal=>{if(typeof window.ym==='function')window.ym(110849525,'reachGoal',goal)};
document.querySelectorAll('.photo').forEach(button=>button.addEventListener('click',()=>{reachGoal('gallery_open');dialogImg.src=button.dataset.full;dialog.showModal()}));
document.querySelectorAll('[data-goal]').forEach(link=>link.addEventListener('click',()=>reachGoal(link.dataset.goal)));
document.querySelectorAll('.faq details').forEach(item=>item.addEventListener('toggle',()=>{if(item.open)reachGoal('faq_open')}));
dialog.querySelector('button').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
document.addEventListener('keydown',event=>{if(event.key==='Escape')dialog.close()});
