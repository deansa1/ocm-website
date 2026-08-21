async function loadJson(path){
  const res=await fetch(path,{cache:'no-store'});
  if(!res.ok) throw new Error('Unable to load content');
  return res.json();
}
function esc(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function fmtDate(v){if(!v)return'';const d=new Date(v+'T00:00:00');return isNaN(d)?v:d.toLocaleDateString('en-AU',{day:'numeric',month:'long',year:'numeric'});}

async function renderArticleList(){
  const el=document.querySelector('[data-article-list]'); if(!el)return;
  try{
    const data=await loadJson('content/articles.json');
    const items=[...(data.articles||[])].sort((a,b)=>String(b.date).localeCompare(String(a.date)));
    if(!items.length){el.innerHTML='<div class="empty-state">Articles and insights will appear here as they are published.</div>';return;}
    el.innerHTML=items.map(a=>`<article class="content-list-card">${a.image?`<img src="${esc(a.image)}" alt="">`:''}<div><div class="content-meta">${esc(fmtDate(a.date))}${a.author?` · ${esc(a.author)}`:''}</div><h3>${esc(a.title)}</h3><p>${esc(a.summary||'')}</p><a class="text-link" href="article.html?slug=${encodeURIComponent(a.slug)}">Read article →</a></div></article>`).join('');
  }catch(e){el.innerHTML='<div class="empty-state">Articles are temporarily unavailable.</div>';}
}

async function renderArticle(){
  const el=document.querySelector('[data-article]'); if(!el)return;
  const slug=new URLSearchParams(location.search).get('slug');
  try{
    const data=await loadJson('content/articles.json');
    const a=(data.articles||[]).find(x=>x.slug===slug);
    if(!a){el.innerHTML='<h1>Article not found</h1><p><a href="articles.html">Return to Articles</a></p>';return;}
    document.title=`${a.title} | OCM`;
    const body=window.marked?window.marked.parse(a.body||''):esc(a.body||'').replace(/\n/g,'<br>');
    el.innerHTML=`<div class="kicker">OCM Article</div><h1>${esc(a.title)}</h1><div class="content-meta">${esc(fmtDate(a.date))}${a.author?` · ${esc(a.author)}`:''}</div>${a.image?`<img class="article-hero-image" src="${esc(a.image)}" alt="">`:''}<div class="article-body">${body}</div>`;
  }catch(e){el.innerHTML='<h1>Article unavailable</h1><p>Please try again later.</p>';}
}

async function renderResourceList(){
  const el=document.querySelector('[data-resource-list]'); if(!el)return;
  try{
    const data=await loadJson('content/resources.json');
    const items=[...(data.resources||[])].sort((a,b)=>String(b.date).localeCompare(String(a.date)));
    if(!items.length){el.innerHTML='<div class="empty-state">Additional guides, templates and implementation resources will appear here as they are published.</div>';return;}
    el.innerHTML=items.map(r=>`<article class="content-list-card">${r.image?`<img src="${esc(r.image)}" alt="">`:''}<div><div class="content-meta">${esc(r.type||'Resource')}${r.date?` · ${esc(fmtDate(r.date))}`:''}</div><h3>${esc(r.title)}</h3><p>${esc(r.summary||'')}</p>${r.url?`<a class="text-link" href="${esc(r.url)}" target="_blank" rel="noopener">Open resource →</a>`:''}</div></article>`).join('');
  }catch(e){el.innerHTML='<div class="empty-state">Resources are temporarily unavailable.</div>';}
}

document.addEventListener('DOMContentLoaded',()=>{renderArticleList();renderArticle();renderResourceList();});
