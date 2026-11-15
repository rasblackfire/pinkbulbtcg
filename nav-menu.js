/* Eén uitklapmenu tegelijk, ook bij klikken en toetsenbordgebruik. */
(()=>{"use strict";
const menu=document.getElementById("menu");if(!menu)return;
const dropdowns=[...menu.querySelectorAll(":scope > .nav-dropdown > details")];
dropdowns.forEach(current=>{
  current.addEventListener("toggle",()=>{
    if(current.open)dropdowns.forEach(other=>{if(other!==current)other.open=false});
  });
  current.querySelector("summary")?.addEventListener("click",()=>{
    if(!current.open)dropdowns.forEach(other=>{if(other!==current)other.open=false});
  });
});
document.addEventListener("pointerdown",event=>{
  if(!menu.contains(event.target))dropdowns.forEach(d=>d.open=false);
});
document.addEventListener("keydown",event=>{
  if(event.key==="Escape")dropdowns.forEach(d=>d.open=false);
});
menu.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>dropdowns.forEach(d=>d.open=false)));
})();
