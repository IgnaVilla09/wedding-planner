import "./App.css";
import { useState } from "react";
import { Heart } from "lucide-react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Hero from "./components/Hero";
import Admin from "./components/Admin";

function SearchPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [tableNumber, setTableNumber] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Función para normalizar el texto (minúscula, sin acentos, ñ -> n)
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Elimina acentos
      .replace(/ñ/g, "n"); // Reemplaza ñ por n
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      setError("Por favor ingresa nombre y apellido");
      return;
    }

    setLoading(true);
    setError("");
    setTableNumber(null);

    try {
      const response = await fetch("https://weeding-back.onrender.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: normalizeText(firstName),
          lastName: normalizeText(lastName),
        }),
      });

      if (!response.ok) {
        throw new Error("No se encontró el registro");
      }

      const data = await response.json();

      if (data.found === false) {
        throw new Error("No se encontró el registro");
      }

      setTableNumber(data.table);
    } catch (err) {
      setError(err.message || "Error al buscar la mesa");
      setTableNumber(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Hero />

      <div className="container">
        <div>
          <div className="box-header">
            <Heart color="green" size={30} />
            <span className="text-header">Evelyn & Matías</span>
          </div>
        </div>
        <h1>Búsqueda de Mesa</h1>

        <form onSubmit={handleSearch} className="search-form">
          <div className="form-group">
            <label htmlFor="firstName">Nombre:</label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ingresa tu nombre"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Apellido:</label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Ingresa tu apellido"
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Buscando..." : "Buscar Mesa"}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {tableNumber !== null && (
          <div className="result-container">
            <h2>Tu Mesa Asignada</h2>
            <p className="table-number">Mesa #{tableNumber}</p>
          </div>
        )}
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;
