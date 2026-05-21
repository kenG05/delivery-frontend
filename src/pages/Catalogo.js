import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Catalogo.css';

function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [direccion, setDireccion] = useState('');
  const [metodoPago, setMetodoPago] = useState('tarjeta');
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  useEffect(() => {
    if (!token) { navigate('/'); return; }
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/productos');
      setProductos(res.data.productos);
    } catch (err) {
      console.error(err);
    }
  };

  const agregarAlCarrito = (producto) => {
    const existe = carrito.find(p => p.id === producto.id);
    if (existe) {
      setCarrito(carrito.map(p => p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  const quitarDelCarrito = (productoId) => {
    const existe = carrito.find(p => p.id === productoId);
    if (existe.cantidad === 1) {
      setCarrito(carrito.filter(p => p.id !== productoId));
    } else {
      setCarrito(carrito.map(p => p.id === productoId ? { ...p, cantidad: p.cantidad - 1 } : p));
    }
  };

  const calcularTotal = () => carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0);

  const cantidadEnCarrito = () => carrito.reduce((sum, p) => sum + p.cantidad, 0);

  const confirmarPedido = async () => {
    if (!direccion) { alert('Ingresa una dirección de entrega'); return; }
    setLoading(true);
    try {
      const productos = carrito.map(p => ({ nombre: p.nombre, precio: p.precio, cantidad: p.cantidad }));
      await axios.post('http://localhost:3000/api/pedidos', {
        productos,
        direccionEntrega: direccion,
        metodoPago
      }, { headers: { authorization: token } });
      setCarrito([]);
      setMostrarCarrito(false);
      navigate('/pedidos');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categorias = ['Todos', ...new Set(productos.map(p => p.categoria).filter(Boolean))];
  const productosFiltrados = categoriaActiva === 'Todos' ? productos : productos.filter(p => p.categoria === categoriaActiva);

  const cerrarSesion = () => { localStorage.clear(); navigate('/'); };

  return (
    <div className="catalogo-container">
      <div className="pedidos-sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo">⚡</span>
          <span className="sidebar-nombre">Zippi</span>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-nav-item activo"><span>🍽️</span> Catálogo</div>
          <div className="sidebar-nav-item" onClick={() => navigate('/pedidos')}><span>📦</span> Mis Pedidos</div>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-usuario">
            <div className="sidebar-avatar">{usuario.nombre?.charAt(0).toUpperCase()}</div>
            <div>
              <div className="sidebar-usuario-nombre">{usuario.nombre}</div>
              <div className="sidebar-usuario-rol">{usuario.rol}</div>
            </div>
          </div>
          <button className="sidebar-salir" onClick={cerrarSesion}>Cerrar sesión</button>
        </div>
      </div>

      <div className="catalogo-main">
        <div className="catalogo-header">
          <div>
            <h1 className="catalogo-titulo">¿Qué quieres pedir hoy?</h1>
            <p className="catalogo-subtitulo">Selecciona tus productos favoritos</p>
          </div>
          <button className="btn-carrito" onClick={() => setMostrarCarrito(true)}>
            🛒 Carrito
            {cantidadEnCarrito() > 0 && <span className="carrito-badge">{cantidadEnCarrito()}</span>}
          </button>
        </div>

        <div className="categorias-row">
          {categorias.map(cat => (
            <button
              key={cat}
              className={`categoria-btn ${categoriaActiva === cat ? 'activo' : ''}`}
              onClick={() => setCategoriaActiva(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {productosFiltrados.length === 0 ? (
          <div className="catalogo-vacio">
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍽️</div>
            <h3>No hay productos disponibles</h3>
            <p>El restaurante aún no ha agregado productos</p>
          </div>
        ) : (
          <div className="productos-grid">
            {productosFiltrados.map(producto => {
              const enCarrito = carrito.find(p => p.id === producto.id);
              return (
                <div key={producto.id} className="producto-card">
                  <div className="producto-imagen">
                    {producto.imagen ? (
                      <img src={producto.imagen} alt={producto.nombre} />
                    ) : (
                      <div className="producto-imagen-placeholder">🍽️</div>
                    )}
                  </div>
                  <div className="producto-info">
                    <div className="producto-categoria">{producto.categoria}</div>
                    <div className="producto-nombre">{producto.nombre}</div>
                    <div className="producto-descripcion">{producto.descripcion}</div>
                    <div className="producto-footer">
                      <div className="producto-precio">${producto.precio.toLocaleString()}</div>
                      {enCarrito ? (
                        <div className="producto-cantidad-ctrl">
                          <button onClick={() => quitarDelCarrito(producto.id)}>−</button>
                          <span>{enCarrito.cantidad}</span>
                          <button onClick={() => agregarAlCarrito(producto)}>+</button>
                        </div>
                      ) : (
                        <button className="btn-agregar-carrito" onClick={() => agregarAlCarrito(producto)}>
                          + Agregar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {mostrarCarrito && (
        <div className="carrito-overlay" onClick={() => setMostrarCarrito(false)}>
          <div className="carrito-panel" onClick={e => e.stopPropagation()}>
            <div className="carrito-header">
              <h2 className="carrito-titulo">Tu pedido</h2>
              <button className="carrito-cerrar" onClick={() => setMostrarCarrito(false)}>✕</button>
            </div>

            {carrito.length === 0 ? (
              <div className="carrito-vacio">
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🛒</div>
                <p>Tu carrito está vacío</p>
              </div>
            ) : (
              <>
                <div className="carrito-items">
                  {carrito.map(item => (
                    <div key={item.id} className="carrito-item">
                      <div className="carrito-item-info">
                        <div className="carrito-item-nombre">{item.nombre}</div>
                        <div className="carrito-item-precio">${item.precio.toLocaleString()} c/u</div>
                      </div>
                      <div className="carrito-item-ctrl">
                        <button onClick={() => quitarDelCarrito(item.id)}>−</button>
                        <span>{item.cantidad}</span>
                        <button onClick={() => agregarAlCarrito(item)}>+</button>
                      </div>
                      <div className="carrito-item-total">${(item.precio * item.cantidad).toLocaleString()}</div>
                    </div>
                  ))}
                </div>

                <div className="carrito-entrega">
                  <label className="form-label">Dirección de entrega</label>
                  <input
                    className="form-input"
                    placeholder="Ej: Av. Providencia 1234"
                    value={direccion}
                    onChange={e => setDireccion(e.target.value)}
                  />
                  <label className="form-label" style={{ marginTop: '12px' }}>Método de pago</label>
                  <div className="metodos-pago">
                    {[
                      { value: 'tarjeta', label: 'Tarjeta', icon: '💳' },
                      { value: 'efectivo', label: 'Efectivo', icon: '💵' },
                      { value: 'transferencia', label: 'Transferencia', icon: '🏦' }
                    ].map(m => (
                      <div key={m.value} className={`metodo-option ${metodoPago === m.value ? 'activo' : ''}`} onClick={() => setMetodoPago(m.value)}>
                        <span>{m.icon}</span>
                        <span>{m.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="carrito-total">
                  <span>Total</span>
                  <span className="carrito-total-valor">${calcularTotal().toLocaleString()}</span>
                </div>

                <button className={loading ? 'btn-loading' : 'btn-confirmar'} onClick={confirmarPedido} disabled={loading}>
                  {loading ? 'Procesando...' : '✓ Confirmar pedido'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Catalogo;