const GALLERY = document.getElementById('gallery');
const SEARCH = document.getElementById('search');
const LOAD_MORE = document.getElementById('loadMore');
const CLEAR = document.getElementById('clearSearch');
const FAV_TOGGLE = document.getElementById('favoritesToggle');

// Modal elements
const MODAL = document.getElementById('pokedexModal');
const MODAL_NAME = document.getElementById('modalName');
const MODAL_IMG = document.getElementById('modalImg');
const MODAL_ENTRY = document.getElementById('modalEntry');
const CLOSE_MODAL = document.getElementById('closeModal');

let allPokemon = [];
let shownMode = 'all';
let batchSize = 30;
let nextId = 1;
let loading = false;
let favorites = new Set(JSON.parse(localStorage.getItem('pw:favs') || '[]'));

const GENERATION_RANGES = {
  1: [1,151], 2: [152,251], 3: [252,386], 4: [387,493],
  5: [494,649], 6: [650,721], 7: [722,809], 8: [810,905]
};
let currentGen = null;

function debounce(fn, wait=300){
  let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), wait); };
}
function typeClass(t){ return t.toLowerCase(); }
function saveFavs(){ localStorage.setItem('pw:favs', JSON.stringify(Array.from(favorites))); }

function showSkeleton(count=8){
  for(let i=0;i<count;i++){ const s=document.createElement('div'); s.className='skeleton'; GALLERY.appendChild(s); }
}

const io=new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      const img=entry.target;
      if(img.dataset.src){ img.src=img.dataset.src; img.removeAttribute('data-src'); io.unobserve(img); }
    }
  });
},{rootMargin:'200px'});

function addCard(p){
  const card=document.createElement('article');
  card.className='card';

  const img=document.createElement('img');
  img.alt=p.name; img.loading='lazy'; img.dataset.src=p.src;
  card.appendChild(img);

  const meta=document.createElement('div'); meta.className='meta';
  const titleRow=document.createElement('div'); titleRow.className='title-row';
  const title=document.createElement('div'); title.className='title'; title.textContent=p.name;
  const favBtn=document.createElement('button'); favBtn.className='icon-btn favorite';
  favBtn.innerHTML=favorites.has(p.name)?'❤':'♡';
  favBtn.onclick=()=>{ if(favorites.has(p.name)){favorites.delete(p.name);favBtn.innerHTML='♡';}
    else{favorites.add(p.name);favBtn.innerHTML='❤';} saveFavs(); };
  titleRow.appendChild(title); titleRow.appendChild(favBtn);
  meta.appendChild(titleRow);

  const badges=document.createElement('div'); badges.className='badge-row';
  p.types.forEach(t=>{ const b=document.createElement('span'); b.className='badge '+typeClass(t); b.textContent=t; badges.appendChild(b); });
  meta.appendChild(badges);

  card.appendChild(meta);
  GALLERY.appendChild(card);
  io.observe(img);

  // 🔥 Click to open Pokédex entry
  card.addEventListener('click',()=>showPokedex(p));
}

async function fetchPokedexEntry(id){
  try{
    const r=await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
    if(!r.ok) return "No entry available.";
    const data=await r.json();
    const entry=data.flavor_text_entries.find(e=>e.language.name==="en");
    return entry? entry.flavor_text.replace(/\f/g,' ') : "No entry available.";
  }catch{ return "Error fetching entry."; }
}

async function showPokedex(p){
  MODAL.classList.remove('hidden');
  MODAL_NAME.textContent=p.name.toUpperCase();
  MODAL_IMG.src=p.src;
  MODAL_ENTRY.textContent="Loading entry...";
  MODAL_ENTRY.textContent=await fetchPokedexEntry(p.id);
}
CLOSE_MODAL.onclick=()=>MODAL.classList.add('hidden');
window.onclick=(e)=>{ if(e.target===MODAL) MODAL.classList.add('hidden'); };

function artworkFromData(data){
  return data.sprites?.other?.['official-artwork']?.front_default ||
         data.sprites?.other?.dream_world?.front_default ||
         data.sprites?.front_default || null;
}
async function fetchPokemonById(id){
  try{
    const r=await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if(!r.ok) return null;
    const data=await r.json();
    return { id:data.id, name:data.name, src:artworkFromData(data), types:data.types.map(t=>t.type.name) };
  }catch{ return null; }
}

async function fetchBatch(limitId=null){
  if(loading) return; loading=true; showSkeleton(6);
  const ids=Array.from({length:batchSize},(_,i)=>nextId+i).filter(id=>!limitId||id<=limitId);
  nextId+=batchSize;
  for(const id of ids){
    const p=await fetchPokemonById(id);
    const s=GALLERY.querySelector('.skeleton'); if(s) s.remove();
    if(p){ allPokemon.push(p); if(shownMode==='all') addCard(p); }
  }
  loading=false;
}

function renderFromCache(filter=''){
  GALLERY.innerHTML='';
  const list= shownMode==='favorites'? allPokemon.filter(p=>favorites.has(p.name)):allPokemon;
  const q=filter.trim().toLowerCase();
  list.filter(p=>p.name.includes(q)).forEach(addCard);
}

const debouncedRender=debounce(()=>renderFromCache(SEARCH.value),250);
SEARCH.addEventListener('input',debouncedRender);
CLEAR.addEventListener('click',()=>{SEARCH.value='';renderFromCache('');});
LOAD_MORE.addEventListener('click',()=>{ 
  if(currentGen){ const [start,end]=GENERATION_RANGES[currentGen]; fetchBatch(end); }
  else fetchBatch();
});
FAV_TOGGLE.addEventListener('click',()=>{ shownMode=shownMode==='favorites'?'all':'favorites'; renderFromCache(SEARCH.value); });

// Generation filter buttons
document.querySelectorAll('.gen-filters button').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.gen-filters button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    currentGen=parseInt(btn.dataset.gen);
    const [start,end]=GENERATION_RANGES[currentGen];
    allPokemon=[]; nextId=start; GALLERY.innerHTML='';
    fetchBatch(end);
  });
});

fetchBatch();
// Initial fetch of first batch
// This code provides a complete implementation for a Pokémon wallpaper gallery with search, favorites, lazy loading, and Pokédex entries.
// It uses vanilla JavaScript and the PokéAPI to fetch data.
// The UI elements are assumed to be present in the HTML with the specified IDs and classes.
