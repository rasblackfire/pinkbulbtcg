"use strict";
const $=id=>document.getElementById(id);
const escapeHTML=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const safeLink=v=>{try{const u=new URL(v);return u.protocol==="https:"&&/(^|\\.)marktplaats\\.nl$/.test(u.hostname)?u.href:""}catch{return ""}};
const money=v=>v===null||v===undefined||v===""?"Prijs op aanvraag":typeof v==="number"?new Intl.NumberFormat("nl-NL",{style:"currency",currency:"EUR"}).format(v):String(v);
let items=[];
function card(item){
 const sold=item.status==="verkocht",link=safeLink(item.link);
 const image=item.afbeelding|| (item.categorie==="pokemon"&&/^[a-z0-9-]+$/i.test(item.tcgdex_id||"")&&item.tcgdex_id?"https://assets.tcgdex.net/en/"+(item.tcgdex_id.includes("-")?"":""):"");
 // TCGdex afbeeldings-URL: gebruik een expliciete image-URL in de JSON of haal hem op via API.
 const photo=item._resolvedImage||item.afbeelding||"";
 const validPhoto=/^https:\/\//i.test(photo)||/^(?!\/\/)(?!.*\.\.\/)[\w\-./%]+$/.test(photo);
 const imageHTML=photo&&validPhoto?'<img loading="lazy" referrerpolicy="no-referrer" src="'+escapeHTML(photo)+'" alt="Voorbeeldafbeelding van '+escapeHTML(item.naam)+'" onerror="this.replaceWith(Object.assign(document.createElement(\'span\'),{className:\'placeholder\',textContent:\'🃏\'}))">':'<span class="placeholder" aria-hidden="true">🃏</span>';
 return '<article class="item-card'+(sold?' sold':'')+'"><div class="item-image">'+imageHTML+'</div><div class="item-info"><span class="tag">'+escapeHTML(({pokemon:"Pokémon",riftbound:"Riftbound",overig:"Overige TCG"})[item.categorie]||"TCG")+'</span><h3>'+escapeHTML(item.naam)+'</h3>'+(item.set?'<p>'+escapeHTML(item.set)+(item.nummer?' · '+escapeHTML(item.nummer):'')+'</p>':'')+(item.conditie?'<p>Conditie: '+escapeHTML(item.conditie)+'</p>':'')+'<div class="item-price">'+escapeHTML(money(item.prijs))+'</div>'+(sold?'<p>Deze is verkocht</p>':link?'<a class="btn" href="'+escapeHTML(link)+'" target="_blank" rel="noopener noreferrer">Bekijk op Marktplaats →</a>':'<p>Advertentielink volgt</p>')+'</div></article>';
}
function render(){
 const q=$("search").value.toLocaleLowerCase("nl").trim(),cat=$("category").value,availability=$("availability").value;
 const filtered=items.filter(x=>(cat==="alles"||x.categorie===cat)&&(availability==="alles"||x.status===availability)&&[x.naam,x.set,x.nummer,x.conditie].join(" ").toLocaleLowerCase("nl").includes(q));
 $("count").textContent=filtered.length+" "+(filtered.length===1?"product":"producten")+" gevonden";
 $("catalog").innerHTML=filtered.length?filtered.map(card).join(""):'<div class="catalog-empty" style="grid-column:1/-1"><h3>'+(!items.length?'Nog geen producten toegevoegd 💗':'Geen producten gevonden')+'</h3><p>'+(!items.length?'Ik ben mijn Pokémon- en TCG-aanbod nog aan het toevoegen. Op Marktplaats kun je ondertussen mijn actuele advertenties bekijken.':'Probeer een andere zoekterm of pas je filters aan.')+'</p><a class="btn" href="https://www.marktplaats.nl/u/amanda/7986935/" target="_blank" rel="noopener noreferrer">Bekijk Marktplaats →</a></div>';
}
async function load(){
 try{const response=await fetch("data/verkoop.json");if(!response.ok)throw Error("bestand niet gevonden");const data=await response.json();items=(Array.isArray(data)?data:[]).filter(x=>x&&x.status!=="voorbeeld"&&x.naam&&["pokemon","riftbound","overig"].includes(x.categorie)&&["beschikbaar","verkocht"].includes(x.status));
 await Promise.all(items.map(async item=>{if(item.categorie!=="pokemon"||item.afbeelding||!item.tcgdex_id||!/^[a-z0-9-]+$/i.test(item.tcgdex_id))return;try{const r=await fetch("https://api.tcgdex.net/v2/en/cards/"+encodeURIComponent(item.tcgdex_id));if(!r.ok)return;const d=await r.json();if(d.image)item._resolvedImage=d.image+"/high.webp"}catch{}}));
 }catch(e){$("count").textContent="Aanbod kon niet worden geladen."}
 render();
}
$("menu-toggle").addEventListener("click",function(){const menu=$("menu"),open=menu.classList.toggle("open");this.setAttribute("aria-expanded",String(open))});
["search","category","availability"].forEach(id=>$(id).addEventListener(id==="search"?"input":"change",render));
load();
