(()=>{"use strict";
const input=document.getElementById("glossary-search"),list=document.getElementById("glossary-list"),count=document.getElementById("glossary-count"),filters=document.getElementById("glossary-categories");if(!input||!list||!filters)return;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const categories=["Kaartinformatie","Rarity & zeldzaamheid","Holo & kaartvarianten","Producten & boxen","Spelen & regels","Beurzen & verzamelen","Bescherming & binders","Merken & grading"];
let words=[],active="Alles";
function render(){
const q=input.value.trim().toLocaleLowerCase("nl");
const filtered=words.filter(w=>(active==="Alles"||w.category===active)&&(w.term+" "+w.description+" "+w.category).toLocaleLowerCase("nl").includes(q)).sort((a,b)=>a.term.localeCompare(b.term,"nl"));
count.textContent=filtered.length+" van "+words.length+" begrippen";
filters.querySelectorAll("button").forEach(b=>{const selected=b.dataset.category===active;b.classList.toggle("active",selected);b.setAttribute("aria-pressed",String(selected))});
const grouped=active==="Alles"&&!q?categories.map(c=>[c,filtered.filter(w=>w.category===c)]).filter(g=>g[1].length):[[active==="Alles"?"Zoekresultaten":active,filtered]];
list.innerHTML=filtered.length?grouped.map(([name,entries])=>'<section class="glossary-group"><h2>'+esc(name)+' <small>('+entries.length+')</small></h2><div class="glossary-cards">'+entries.map(w=>'<article class="glossary-entry"><h3>'+esc(w.term)+'</h3><p>'+esc(w.description)+'</p>'+(w.link?'<a href="'+esc(w.link)+'">Lees meer →</a>':'')+'</article>').join("")+'</div></section>').join(""):'<p>Geen begrippen gevonden. Probeer een andere zoekterm of categorie.</p>';
}
fetch("data/woordenboek.json",{cache:"no-cache"}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{
words=data;filters.innerHTML=["Alles",...categories].map(c=>'<button type="button" data-category="'+esc(c)+'" aria-pressed="false">'+esc(c)+'</button>').join("");
filters.addEventListener("click",e=>{const b=e.target.closest("button[data-category]");if(!b)return;active=b.dataset.category;render()});
input.addEventListener("input",render);render();
}).catch(()=>list.textContent="Het woordenboek kon niet worden geladen.");
})();