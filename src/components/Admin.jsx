import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import "./Admin.css";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [load, setLoad] = useState(false);

  // Panel Administrador
  const [guests, setGuests] = useState([
    { id: "", firstName: "", lastName: "", tableNumber: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [loadingGuests, setLoadingGuests] = useState(false);
  const [message, setMessage] = useState("");
  const [listGuests, setListGuests] = useState([]);
  const [hasConsulted, setHasConsulted] = useState(false);

  // Datos para editar
  const [loadEdit, setLoadEdit] = useState(false);
  const [editId, setEditId] = useState("");
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editTableNumber, setEditTableNumber] = useState("");

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    // Cambia "admin123" por tu contraseña deseada
    setLoad(true);
    if (password === "ignavercel123") {
      const response = await fetch("https://weeding-back.onrender.com/ping");
      if (!response.ok) {
        setMessage("Error de conexión con el servidor");
        return;
      }
      const data = await response.json();
      console.log(data);
      setIsAuthenticated(true);
      setMessage("");
      setLoad(false);
    } else {
      setMessage("Contraseña incorrecta");
      setPassword("");
      setLoad(false);
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
        guest.tableNumber !== ""
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
        }
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
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener listado");
      }

      const data = await response.json();

      console.log(data);
      setListGuests(data.guests);
      setHasConsulted(true);
    } catch (error) {
      alert(error.message || "Error al obtener listado");
      console.log(error.message || "Error al obtener listado");
    } finally {
      setLoadingGuests(false);
    }
  };

  const handleEditGuest = async () => {
    setLoadEdit(true);

    if (!editId || !editFirstName || !editLastName || !editTableNumber) {
      alert("Por favor, ingrese todos los campos");
      setLoadEdit(false);
      return;
    }
    //construir payload
    const payload = {};

    if (editId) payload.id = Number(editId);
    if (editFirstName) payload.firstName = editFirstName;
    if (editLastName) payload.lastName = editLastName;
    if (editTableNumber) payload.table = Number(editTableNumber);

    try {
      const response = await fetch(
        "https://weeding-back.onrender.com/admin/edit-guest",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-admin-password": password,
          },
          body: JSON.stringify(payload),
        }
      );

      console.log("Response: ", response);

      if (!response.ok) {
        throw new Error("Error al editar invitado");
      }

      const data = await response.json();

      console.log(data);

      alert("Invitado editado correctamente, actualizar listado superior");
      setEditId("");
      setEditFirstName("");
      setEditLastName("");
      setEditTableNumber("");
    } catch (error) {
      console.log(error);
      alert(error.message || "Error al editar invitado");
    } finally {
      setLoadEdit(false);
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
            <button type="submit" disabled={load} className="login-btn">
              {load ? "Iniciando Sesión..." : "Acceder"}
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
          className={`form-message ${
            message.includes("✓") ? "success" : "error"
          }`}
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
          {loadingGuests
            ? "Cargando..."
            : hasConsulted
            ? "Actualizar Lista"
            : "Consultar Invitados"}
        </button>
        {listGuests.length > 0 && (
          <table className="guests-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Mesa</th>
              </tr>
            </thead>
            <tbody>
              {listGuests.map((guest, index) => (
                <tr key={index}>
                  <td>{guest.id}</td>
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

      <div className="edit-list-box">
        <h2 className="list-title">Editar Invitados</h2>
        <p className="subtitle-edit">
          Con el ID de la tabla podrá editar nombre, apellido y N° Mesa
        </p>
        <div className="box-edit-input">
          <input
            type="text"
            placeholder="ID"
            className="edit-input"
            value={editId}
            onChange={(e) => setEditId(e.target.value)}
          />
        </div>
        <div className="box-edit-input">
          <input
            type="text"
            placeholder="Nombre"
            className="edit-input"
            value={editFirstName}
            onChange={(e) => setEditFirstName(e.target.value)}
          />
        </div>
        <div className="box-edit-input">
          <input
            type="text"
            placeholder="Apellido"
            className="edit-input"
            value={editLastName}
            onChange={(e) => setEditLastName(e.target.value)}
          />
        </div>
        <div className="box-edit-input">
          <input
            type="number"
            placeholder="N° Mesa"
            className="edit-input"
            value={editTableNumber}
            onChange={(e) => setEditTableNumber(e.target.value)}
          />
        </div>

        <div>
          <button
            disabled={loadEdit}
            onClick={handleEditGuest}
            className="edit-btn"
          >
            {loadEdit ? "Editando..." : "Editar Invitado"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Admin;
