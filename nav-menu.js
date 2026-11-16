/* Centraal menu en vaste Instagram-link voor PinkBulbTCG. */
(()=>{"use strict";
const menu=document.getElementById("menu");if(!menu)return;
const current=location.pathname.split("/").pop()||"index.html";
const section=location.pathname.split("/").filter(Boolean).slice(-2,-1)[0]||"";
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

/* Google Analytics 4: pas laden nadat de bezoeker toestemming geeft. */
(()=>{
"use strict";
const measurementId="G-67M6EZZQ9S";
const consentKey="pinkbulbtcg_analytics_consent";
function loadAnalytics(){
 if(window.__pinkbulbAnalyticsLoaded)return;
 window.__pinkbulbAnalyticsLoaded=true;
 window.dataLayer=window.dataLayer||[];
 window.gtag=function(){window.dataLayer.push(arguments)};
 window.gtag("js",new Date());
 window.gtag("config",measurementId);
 const script=document.createElement("script");
 script.async=true;
 script.src="https://www.googletagmanager.com/gtag/js?id="+encodeURIComponent(measurementId);
 document.head.appendChild(script);
}
let saved=null;
try{saved=localStorage.getItem(consentKey)}catch(e){}
if(saved==="yes"){loadAnalytics();return}
if(saved==="no")return;
if(document.getElementById("pinkbulb-analytics-consent"))return;
const banner=document.createElement("aside");
banner.id="pinkbulb-analytics-consent";
banner.setAttribute("aria-label","Privacykeuze voor bezoekersstatistieken");
banner.style.cssText="position:fixed;bottom:16px;left:16px;right:16px;max-width:560px;z-index:99999;padding:18px;background:#1c101a;color:#fff;border:2px solid #ff2e93;box-shadow:0 6px 24px #0008;font:inherit";
banner.innerHTML='<p style="margin:0 0 12px">Mag ik anonieme bezoekersstatistieken bijhouden met Google Analytics? Zo kan ik PinkBulbTCG verbeteren. Alleen als je akkoord gaat, laad ik Analytics. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style="color:#ff94c8">Privacyinformatie Google</a>.</p><div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" data-consent="yes" style="cursor:pointer;background:#ff2e93;color:#160d15;border:0;padding:10px 15px;font-weight:700">Ja, is goed!</button><button type="button" data-consent="no" style="cursor:pointer;background:transparent;color:white;border:1px solid white;padding:10px 15px">Nee, bedankt</button></div>';
banner.querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>{
 const choice=button.dataset.consent;
 try{localStorage.setItem(consentKey,choice)}catch(e){}
 banner.remove();
 if(choice==="yes")loadAnalytics();
}));
document.body.appendChild(banner);
})();
