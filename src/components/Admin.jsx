import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import "./Admin.css";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [guests, setGuests] = useState([
    { firstName: "", lastName: "", tableNumber: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [loadingGuests, setLoadingGuests] = useState(false);
  const [message, setMessage] = useState("");
  const [listGuests, setListGuests] = useState([]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    // Cambia "admin123" por tu contraseña deseada
    if (password === "ignavercel123") {
      setIsAuthenticated(true);
      setMessage("");
    } else {
      setMessage("Contraseña incorrecta");
      setPassword("");
    }
  };

  const handleGuestChange = (index, field, value) => {
    const newGuests = [...guests];
    newGuests[index][field] = value;
    setGuests(newGuests);
  };

  const handleAddGuest = () => {
    setGuests([...guests, { firstName: "", lastName: "", tableNumber: "" }]);
  };

  const handleRemoveGuest = (index) => {
    if (guests.length > 1) {
      setGuests(guests.filter((_, i) => i !== index));
    }
  };

  const handleSubmitGuests = async (e) => {
    e.preventDefault();

    // Validar que todos los campos estén completos
    const isValid = guests.every(
      (guest) =>
        guest.firstName.trim() &&
        guest.lastName.trim() &&
        guest.tableNumber !== "",
    );

    if (!isValid) {
      setMessage("Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "https://weeding-back.onrender.com/admin/add-guests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-password": password,
          },
          body: JSON.stringify({
            guests: guests.map((guest) => ({
              firstName: guest.firstName.toLowerCase().trim(),
              lastName: guest.lastName.toLowerCase().trim(),
              table: Number(guest.tableNumber),
            })),
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Error al agregar los invitados");
      }

      setMessage("✓ Invitados agregados correctamente");
      setGuests([{ firstName: "", lastName: "", tableNumber: "" }]);
    } catch (err) {
      setMessage(err.message || "Error al procesar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  const handleConsultGuests = async () => {
    setLoadingGuests(true);
    try {
      const response = await fetch(
        "https://weeding-back.onrender.com/admin/guests",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-admin-password": password,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Error al obtener listado");
      }

      const data = await response.json();

      console.log(data);
      setListGuests(data.guests);
    } catch (error) {
      alert(error.message || "Error al obtener listado");
      console.log(error.message || "Error al obtener listado");
    } finally {
      setLoadingGuests(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="login-container">
          <div className="login-header">
            <Lock size={40} />
            <h1>Acceso Administrador</h1>
          </div>
          <form onSubmit={handlePasswordSubmit} className="login-form">
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa la contraseña"
                className="password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="toggle-password-btn"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <button type="submit" className="login-btn">
              Acceder
            </button>
          </form>
          {message && <p className="error-message">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1 className="admin-title">Panel Administrador - Agregar Invitados</h1>
        <button
          onClick={() => {
            setIsAuthenticated(false);
            setMessage("");
            setPassword("");
            setGuests([{ firstName: "", lastName: "", tableNumber: "" }]);
          }}
          className="logout-btn"
        >
          Cerrar Sesión
        </button>
      </div>

      <form onSubmit={handleSubmitGuests} className="guests-form">
        <div className="guests-list">
          {guests.map((guest, index) => (
            <div key={index} className="guest-row">
              <input
                type="text"
                value={guest.firstName}
                onChange={(e) =>
                  handleGuestChange(index, "firstName", e.target.value)
                }
                placeholder="Nombre"
                className="guest-input"
              />
              <input
                type="text"
                value={guest.lastName}
                onChange={(e) =>
                  handleGuestChange(index, "lastName", e.target.value)
                }
                placeholder="Apellido"
                className="guest-input"
              />
              <input
                type="number"
                value={guest.tableNumber}
                onChange={(e) =>
                  handleGuestChange(index, "tableNumber", e.target.value)
                }
                placeholder="Mesa"
                className="guest-input table-input"
              />
              {guests.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveGuest(index)}
                  className="remove-btn"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddGuest}
          className="add-guest-btn"
        >
          + Agregar más invitado
        </button>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Procesando..." : "Guardar Invitados"}
        </button>
      </form>

      {message && (
        <p
          className={`form-message ${message.includes("✓") ? "success" : "error"}`}
        >
          {message}
        </p>
      )}

      <div className="list-box">
        {/* renderizar lista de invitados */}
        <h2 className="list-title">Listado de Invitados</h2>
        <button
          onClick={handleConsultGuests}
          className="consult-btn"
          disabled={loadingGuests}
        >
          {loadingGuests ? "Cargando..." : "Consultar Invitados"}
        </button>
        {listGuests.length > 0 && (
          <table className="guests-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Mesa</th>
              </tr>
            </thead>
            <tbody>
              {listGuests.map((guest, index) => (
                <tr key={index}>
                  <td>
                    {guest.first_name.charAt(0).toUpperCase() +
                      guest.first_name.slice(1)}
                  </td>
                  <td>
                    {guest.last_name.charAt(0).toUpperCase() +
                      guest.last_name.slice(1)}
                  </td>
                  <td>{guest.table_number}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Admin;
