const gallery = document.getElementById("gallery");
const searchInput = document.getElementById("search");
let allPokemon = [];

// Fetch first 60 Pokémon quickly
async function fetchPokemon() {
  for (let i = 1; i <= 60; i++) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);
    const data = await response.json();

    const pokemon = {
      name: data.name,
      src: data.sprites.other["official-artwork"].front_default
    };

    allPokemon.push(pokemon);
    renderWallpapers(); // refresh as they load
  }
}

// Render Gallery
function renderWallpapers(filter = "") {
  gallery.innerHTML = "";
  allPokemon
    .filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
    .forEach(p => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${p.src}" alt="${p.name}">
        <h3>${p.name.toUpperCase()}</h3>
        <a href="${p.src}" download>
          <button>Download</button>
        </a>
      `;
      gallery.appendChild(card);
    });
}

// Search
searchInput.addEventListener("input", (e) => {
  renderWallpapers(e.target.value);
});

// Start
fetchPokemon();
