/* Centraal menu en vaste Instagram-link voor PinkBulbTCG. */
(()=>{"use strict";
const menu=document.getElementById("menu");if(!menu)return;
const current=location.pathname.split("/").pop()||"index.html";
const items=[
["index.html","Home"],["blog.html","Blog"],["nieuws.html","Nieuws"],
["Verzamelen",[["tips.html","Tips & Tricks"],["beginnersgids.html","Beginnersgids"],["woordenboek.html","Woordenboek"],["binders.html","Binders"]]],
["Ontdekken",[["beurzen.html","Beurzen & events"],["winkels.html","Winkels"],["webshops.html","Webshops & Discord"],["releases.html","Releasekalender"],["verkoop.html","Verkoop"]]],
["Over mij",[["over-mij.html","Over mij"],["samenwerken.html","Samenwerken"]]],["zoeken.html","⌕ Zoeken"]];
const escape=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const root=location.pathname.includes("/blog/")||location.pathname.includes("/nieuws/")||location.pathname.includes("/tips/")?"../":"";
const link=([url,label])=>'<li><a href="'+root+url+'"'+(url===current?' class="on" aria-current="page"':'')+'>'+escape(label)+'</a></li>';
menu.innerHTML=items.map(item=>Array.isArray(item[1])?'<li class="nav-dropdown"><details><summary>'+escape(item[0])+'</summary><ul class="nav-submenu">'+item[1].map(link).join("")+'</ul></details></li>':link(item)).join("");
const bar=menu.closest(".bar");
if(bar&&!bar.querySelector(".header-instagram")){
 const a=document.createElement("a");
 a.className="header-instagram";a.href="https://www.instagram.com/pinkbulbasaurtcg/";a.target="_blank";a.rel="noopener noreferrer";a.setAttribute("aria-label","Instagram van PinkBulbTCG openen");a.title="Volg PinkBulbTCG op Instagram";
 a.innerHTML='<svg aria-hidden="true" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>';
 bar.appendChild(a);
}
if(!document.getElementById("shared-header-styles")){
 const css=document.createElement("style");css.id="shared-header-styles";
 css.textContent='.header-instagram{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;width:42px;height:42px;color:#ff2e93;border:2px solid #ff2e93;background:#1c101a;transition:background .15s,color .15s,transform .15s;margin-left:10px;order:4}.header-instagram:hover,.header-instagram:focus-visible{background:#ff2e93;color:#160d15;transform:translateY(-2px)}.header-instagram:focus-visible{outline:2px solid #e8ff3a;outline-offset:3px}@media(max-width:850px){.header-instagram{order:2;margin-left:auto;width:39px;height:39px}.bar .burger{order:3;margin-left:8px}.bar nav{order:4}}';
 document.head.appendChild(css);
}
const dropdowns=[...menu.querySelectorAll(":scope > .nav-dropdown > details")];
dropdowns.forEach(current=>{current.addEventListener("toggle",()=>{if(current.open)dropdowns.forEach(other=>{if(other!==current)other.open=false})});current.querySelector("summary")?.addEventListener("click",()=>{if(!current.open)dropdowns.forEach(other=>{if(other!==current)other.open=false})})});
document.addEventListener("pointerdown",event=>{if(!menu.contains(event.target))dropdowns.forEach(d=>d.open=false)});
document.addEventListener("keydown",event=>{if(event.key==="Escape")dropdowns.forEach(d=>d.open=false)});
menu.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>dropdowns.forEach(d=>d.open=false)));
})();