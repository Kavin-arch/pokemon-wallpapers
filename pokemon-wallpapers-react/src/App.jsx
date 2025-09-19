import { useState } from "react";
import "./App.css";

function App() {
  const [search, setSearch] = useState("");
  const [pokemon, setPokemon] = useState(null);

  const fetchPokemon = async () => {
    if (!search) return;
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${search.toLowerCase()}`);
    if (res.ok) {
      const data = await res.json();
      setPokemon(data);
    } else {
      setPokemon(null);
    }
  };

  return (
    <div className="app-container">
      <h1>🔥 Pokémon Wallpapers 🔥</h1>
      <input
        type="text"
        placeholder="Search Pokémon..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && fetchPokemon()}
        style={{ padding: "10px", borderRadius: "8px", border: "none", width: "250px" }}
      />
      <button
        onClick={fetchPokemon}
        style={{ marginLeft: "10px", padding: "10px 15px", borderRadius: "8px", border: "none", cursor: "pointer", background: "#ff4500", color: "white" }}
      >
        Search
      </button>

      {pokemon && (
        <div style={{ marginTop: "20px" }}>
          <h2>{pokemon.name.toUpperCase()}</h2>
          <img
            src={pokemon.sprites.other["official-artwork"].front_default}
            alt={pokemon.name}
            style={{ width: "300px", borderRadius: "15px", boxShadow: "0 0 20px #ff4500" }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
