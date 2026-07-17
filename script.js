const dialog=document.querySelector('#lightbox');
const dialogImg=dialog.querySelector('img');
document.querySelectorAll('.photo').forEach(button=>button.addEventListener('click',()=>{dialogImg.src=button.dataset.full;dialog.showModal()}));
dialog.querySelector('button').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
document.addEventListener('keydown',event=>{if(event.key==='Escape')dialog.close()});
