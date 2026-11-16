/* Nieuws-overzicht: alle berichten komen uit data/news.json. */
(()=>{"use strict";
const feed=document.getElementById("news-feed");
if(!feed)return;
const message=document.getElementById("news-status");
const showError=()=>{if(message)message.textContent="Het nieuws kon niet geladen worden. Probeer de pagina opnieuw te laden.";};
fetch("data/news.json",{cache:"no-cache"})
 .then(response=>{if(!response.ok)throw new Error("Nieuws niet beschikbaar");return response.json()})
 .then(items=>{
  if(!Array.isArray(items))throw new Error("Ongeldige nieuwsgegevens");
  const valid=items.filter(n=>n.title&&/^nieuws\/[a-z0-9-]+\.html$/.test(n.url||"")).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  const fragment=document.createDocumentFragment();
  valid.forEach(n=>{
   const card=document.createElement("article");card.className="news-card";
   if(n.image){const a=document.createElement("a");a.href=n.url;a.setAttribute("aria-label","Lees: "+n.title);const img=document.createElement("img");img.className="news-card-photo";img.src=n.image;img.alt=n.imageAlt||n.title;img.loading="lazy";img.decoding="async";a.append(img);card.append(a)}
   const content=document.createElement("div"),tag=document.createElement("span"),h=document.createElement("h2"),link=document.createElement("a"),p=document.createElement("p"),more=document.createElement("a");
   tag.className="tag";const d=new Date((n.date||"")+"T12:00:00");tag.textContent=(Number.isNaN(d.getTime())?n.date:d.toLocaleDateString("nl-NL",{day:"numeric",month:"long",year:"numeric"}))+" · "+(n.category||"Nieuws");
   link.href=n.url;link.textContent=n.title;h.append(link);p.textContent=n.excerpt||"";more.className="btn";more.href=n.url;more.textContent="Lees het nieuwsbericht →";
   content.append(tag,h,p,more);card.append(content);fragment.append(card);
  });
  feed.replaceChildren(fragment);
  if(message)message.textContent=valid.length?"":"Er zijn nog geen nieuwsberichten.";
 }).catch(showError);
})();