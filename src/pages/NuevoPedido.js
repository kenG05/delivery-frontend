import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/NuevoPedido.css';

function NuevoPedido() {
  const [direccion, setDireccion] = useState('');
  const [metodoPago, setMetodoPago] = useState('tarjeta');
  const [productos, setProductos] = useState([{ nombre: '', precio: '', cantidad: 1 }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const agregarProducto = () => setProductos([...productos, { nombre: '', precio: '', cantidad: 1 }]);
  const eliminarProducto = (i) => setProductos(productos.filter((_, idx) => idx !== i));
  const actualizarProducto = (i, campo, valor) => {
    const nuevos = [...productos];
    nuevos[i][campo] = valor;
    setProductos(nuevos);
  };
  const calcularTotal = () => productos.reduce((sum, p) => sum + (parseFloat(p.precio) || 0) * p.cantidad, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('https://tiptop-vocalist-scope.ngrok-free.dev/api/pedidos', {
        productos: productos.map(p => ({ nombre: p.nombre, precio: parseFloat(p.precio), cantidad: parseInt(p.cantidad) })),
        direccionEntrega: direccion,
        metodoPago
      }, { headers: { authorization: token } });
      navigate('/pedidos');
    } catch (err) {
      setError('Error al crear el pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nuevo-container">
      <div className="pedidos-sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo">⚡</span>
          <span className="sidebar-nombre">Zippi</span>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-nav-item" onClick={() => navigate('/pedidos')}>
            <span>📦</span> Mis Pedidos
          </div>
          <div className="sidebar-nav-item activo">
            <span>➕</span> Nuevo Pedido
          </div>
        </nav>
      </div>

      <div className="nuevo-main">
        <div className="nuevo-header">
          <div>
            <h1 className="nuevo-titulo">Nuevo Pedido</h1>
            <p className="nuevo-subtitulo">Completa los datos para realizar tu pedido</p>
          </div>
        </div>

        {error && <div className="nuevo-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="nuevo-grid">
            <div className="nuevo-col-izq">
              <div className="nuevo-card">
                <h3 className="nuevo-card-titulo">🛍️ Productos</h3>
                {productos.map((producto, index) => (
                  <div key={index} className="producto-item">
                    <div className="producto-item-header">
                      <span className="producto-num">Producto {index + 1}</span>
                      {productos.length > 1 && (
                        <button type="button" className="btn-eliminar" onClick={() => eliminarProducto(index)}>✕ Eliminar</button>
                      )}
                    </div>
                    <div className="producto-inputs">
                      <div className="form-grupo">
                        <label className="form-label">Nombre</label>
                        <input
                          className="form-input"
                          placeholder="Ej: Pizza grande"
                          value={producto.nombre}
                          onChange={e => actualizarProducto(index, 'nombre', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-grupo">
                        <label className="form-label">Precio</label>
                        <input
                          className="form-input"
                          placeholder="0"
                          type="number"
                          value={producto.precio}
                          onChange={e => actualizarProducto(index, 'precio', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-grupo">
                        <label className="form-label">Cant.</label>
                        <input
                          className="form-input"
                          type="number"
                          min="1"
                          value={producto.cantidad}
                          onChange={e => actualizarProducto(index, 'cantidad', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" className="btn-agregar" onClick={agregarProducto}>
                  + Agregar otro producto
                </button>
              </div>

              <div className="nuevo-card">
                <h3 className="nuevo-card-titulo">📍 Dirección de entrega</h3>
                <div className="form-grupo">
                  <label className="form-label">Dirección</label>
                  <input
                    className="form-input"
                    placeholder="Ej: Av. Providencia 1234, Santiago"
                    value={direccion}
                    onChange={e => setDireccion(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="nuevo-card">
                <h3 className="nuevo-card-titulo">💳 Método de pago</h3>
                <div className="metodos-pago">
                  {[
                    { value: 'tarjeta', label: 'Tarjeta', icon: '💳' },
                    { value: 'efectivo', label: 'Efectivo', icon: '💵' },
                    { value: 'transferencia', label: 'Transferencia', icon: '🏦' }
                  ].map(m => (
                    <div
                      key={m.value}
                      className={`metodo-option ${metodoPago === m.value ? 'activo' : ''}`}
                      onClick={() => setMetodoPago(m.value)}
                    >
                      <span className="metodo-icon">{m.icon}</span>
                      <span className="metodo-label">{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="nuevo-col-der">
              <div className="resumen-card">
                <h3 className="nuevo-card-titulo">📋 Resumen del pedido</h3>
                <div className="resumen-items">
                  {productos.map((p, i) => p.nombre && (
                    <div key={i} className="resumen-item">
                      <span className="resumen-nombre">{p.nombre} x{p.cantidad}</span>
                      <span className="resumen-precio">${((parseFloat(p.precio) || 0) * p.cantidad).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="resumen-total">
                  <span>Total</span>
                  <span className="resumen-total-valor">${calcularTotal().toLocaleString()}</span>
                </div>
                <button type="submit" className={loading ? 'btn-loading' : 'btn-confirmar'} disabled={loading}>
                  {loading ? 'Procesando...' : '✓ Confirmar Pedido'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NuevoPedido;
