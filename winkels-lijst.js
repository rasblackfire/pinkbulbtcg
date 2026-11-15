(()=>{"use strict";
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const provinces=["Gelderland","Overijssel","Noord-Brabant","Utrecht","Noord-Holland","Zuid-Holland","Limburg","Zeeland","Flevoland","Friesland","Groningen","Drenthe"];
const exceptions={
"Barneveld":"Gelderland","Voorthuizen":"Gelderland","Ermelo":"Gelderland","Harderwijk":"Gelderland","Nijkerk":"Gelderland","Scherpenzeel":"Gelderland","Zaltbommel":"Gelderland","Nunspeet":"Gelderland","Epe":"Gelderland","Zeewolde":"Flevoland","Almere":"Flevoland","Lelystad":"Flevoland","Dronten":"Flevoland","Emmeloord":"Flevoland","Urk":"Flevoland","Kampen":"Overijssel","Genemuiden":"Overijssel","Steenwijk":"Overijssel","Werkendam":"Noord-Brabant","Boxmeer":"Noord-Brabant","Cuijk":"Noord-Brabant","Budel":"Noord-Brabant","Leerdam":"Utrecht","Breukelen":"Utrecht","Muiden":"Noord-Holland","Arkel":"Zuid-Holland","Roden":"Drenthe","Stadskanaal":"Groningen","Zuidlaren":"Drenthe"};
function provinceOf(s){
 if(s.province&&provinces.includes(s.province))return s.province;
 if(exceptions[s.city])return exceptions[s.city];
 const m=String(s.address||"").match(/\b(\d{4})\s?[A-Z]{2}\b/i);
 if(!m)return null;
 const n=+m[1].slice(0,2);
 if(n<=12)return "Noord-Holland";
 if(n===13)return "Flevoland";
 if(n<=21)return "Noord-Holland";
 if(n<=33)return "Zuid-Holland";
 if(n<=39)return "Utrecht";
 if(n<=40)return "Gelderland";
 if(n===41)return "Utrecht";
 if(n===42)return "Zuid-Holland";
 if(n<=45)return "Zeeland";
 if(n<=57)return "Noord-Brabant";
 if(n<=64)return "Limburg";
 if(n<=73)return "Gelderland";
 if(n<=77)return "Overijssel";
 if(n<=79)return "Drenthe";
 if(n<=81)return "Overijssel";
 if(n<=83)return "Flevoland";
 if(n<=92)return "Friesland";
 if(n<=94)return "Drenthe";
 if(n<=99)return "Groningen";
 return null;
}
const chainPattern=/\b(?:dreamland|top\s*1\s*toys|top1toys|smyths|media\s*markt|mediamarkt|intertoys)\b/i;
let stores=[],selected="Alle provincies",query="";
const isSpecial=s=>s.type==="special"&&!chainPattern.test(s.name);
const sortStores=(a,b)=>Number(isSpecial(b))-Number(isSpecial(a))||(a.city||"").localeCompare(b.city||"","nl")||a.name.localeCompare(b.name,"nl");
const mapUrl=s=>"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(s.address||[s.name,s.city,"Nederland"].filter(Boolean).join(", "));
const card=s=>'<article class="shop-card"><div class="shop-card-top"><span class="shop-tag '+(isSpecial(s)?"shop-tag-special":"")+'">'+(isSpecial(s)?"TCG-specialist":"Overige winkel")+'</span></div><h3>'+esc(s.name)+'</h3><p class="shop-city">'+esc(s.city||"")+'</p><p class="shop-address">'+esc(s.address||"Adres niet bekend")+'</p><a href="'+mapUrl(s)+'" target="_blank" rel="noopener noreferrer">Bekijk adres en route ↗</a></article>';
function render(){
 const matches=stores.filter(s=>(selected==="Alle provincies"||s.province===selected)&&(!query||[s.name,s.city,s.address,s.province].join(" ").toLocaleLowerCase("nl").includes(query))).sort(sortStores);
 $("shop-count").textContent=matches.length+" "+(matches.length===1?"winkel":"winkels")+" gevonden";
 const groups=new Map();
 for(const s of matches){const p=s.province||"Provincie onbekend";if(!groups.has(p))groups.set(p,[]);groups.get(p).push(s)}
 const order=selected==="Alle provincies"?[...provinces,"Provincie onbekend"]:[selected];
 $("shop-results").innerHTML=order.filter(p=>groups.has(p)).map(p=>{
  const items=groups.get(p),special=items.filter(isSpecial),other=items.filter(s=>!isSpecial(s));
  return '<section class="shop-province"><h2>'+esc(p)+' <small>('+items.length+')</small></h2>'+(special.length?'<h3 class="shop-category">TCG-specialisten</h3><div class="shop-grid">'+special.map(card).join("")+'</div>':'')+(other.length?'<h3 class="shop-category shop-category-other">Overige winkels</h3><div class="shop-grid">'+other.map(card).join("")+'</div>':'')+'</section>';
 }).join("")||'<p class="shop-empty">Geen winkels gevonden. Probeer een andere zoekterm of provincie.</p>';
}
function setProvince(value){
 selected=value;
 document.querySelectorAll("[data-province]").forEach(b=>{const active=b.dataset.province===value;b.classList.toggle("active",active);b.setAttribute("aria-pressed",String(active))});
 render();
}
const buttons=["Alle provincies",...provinces].map(p=>'<button type="button" data-province="'+esc(p)+'" aria-pressed="false">'+esc(p)+'</button>').join("");
$("shop-provinces").innerHTML=buttons;
$("shop-provinces").addEventListener("click",e=>{const b=e.target.closest("button[data-province]");if(b)setProvince(b.dataset.province)});
$("shop-search").addEventListener("input",e=>{query=e.target.value.trim().toLocaleLowerCase("nl");render()});
fetch("winkels.json",{cache:"no-cache"}).then(r=>{if(!r.ok)throw Error("Winkelgegevens niet beschikbaar");return r.json()}).then(data=>{
 stores=(Array.isArray(data)?data:[]).filter(s=>s&&s.name).map(s=>({...s,province:provinceOf(s)}));
 setProvince("Alle provincies");
}).catch(()=>{$("shop-count").textContent="Laden mislukt";$("shop-results").innerHTML='<p class="shop-empty">De winkellijst kan momenteel niet worden geladen. Probeer het later opnieuw.</p>'});
})();