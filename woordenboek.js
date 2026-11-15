(()=>{"use strict";
const input=document.getElementById("glossary-search"),list=document.getElementById("glossary-list"),count=document.getElementById("glossary-count"),filters=document.getElementById("glossary-categories"),alphabet=document.getElementById("glossary-alphabet");if(!input||!list||!filters||!alphabet)return;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const categories=["Kaartinformatie","Rarity & zeldzaamheid","Holo & kaartvarianten","Producten & boxen","Spelen & regels","Beurzen & verzamelen","Bescherming & binders","Merken & grading"];
let words=[],active="Alles",letter="Alles";
function render(){
const q=input.value.trim().toLocaleLowerCase("nl");
const filtered=words.filter(w=>(active==="Alles"||w.category===active)&&(letter==="Alles"||w.term.toLocaleUpperCase("nl").startsWith(letter))&&(w.term+" "+w.description+" "+w.category).toLocaleLowerCase("nl").includes(q)).sort((a,b)=>a.term.localeCompare(b.term,"nl"));
count.textContent=filtered.length+" van "+words.length+" begrippen";
alphabet.querySelectorAll("button").forEach(b=>{const selected=b.dataset.letter===letter;b.classList.toggle("active",selected);b.setAttribute("aria-pressed",String(selected))});
filters.querySelectorAll("button").forEach(b=>{const selected=b.dataset.category===active;b.classList.toggle("active",selected);b.setAttribute("aria-pressed",String(selected))});
const grouped=active==="Alles"&&!q?categories.map(c=>[c,filtered.filter(w=>w.category===c)]).filter(g=>g[1].length):[[active==="Alles"?"Zoekresultaten":active,filtered]];
list.innerHTML=filtered.length?grouped.map(([name,entries])=>'<section class="glossary-group"><h2>'+esc(name)+' <small>('+entries.length+')</small></h2><div class="glossary-cards">'+entries.map(w=>'<article class="glossary-entry"><h3>'+esc(w.term)+'</h3><p>'+esc(w.description)+'</p>'+'</article>').join("")+'</div></section>').join(""):'<p>Geen begrippen gevonden. Probeer een andere zoekterm of categorie.</p>';
}
fetch("data/woordenboek.json",{cache:"no-cache"}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{
words=data;const letters="ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");const available=new Set(words.map(w=>w.term.charAt(0).toLocaleUpperCase("nl")));alphabet.innerHTML=['Alles',...letters].map(l=>'<button type="button" data-letter="'+l+'" aria-pressed="false"'+(l!=="Alles"&&!available.has(l)?' disabled title="Geen begrippen met deze letter"':'')+'>'+l+'</button>').join("");alphabet.addEventListener("click",e=>{const b=e.target.closest("button[data-letter]");if(!b||b.disabled)return;letter=b.dataset.letter;render();list.scrollIntoView({behavior:"smooth",block:"start"})});filters.innerHTML=["Alles",...categories].map(c=>'<button type="button" data-category="'+esc(c)+'" aria-pressed="false">'+esc(c)+'</button>').join("");
filters.addEventListener("click",e=>{const b=e.target.closest("button[data-category]");if(!b)return;active=b.dataset.category;render()});
input.addEventListener("input",render);render();
}).catch(()=>list.textContent="Het woordenboek kon niet worden geladen.");
})();