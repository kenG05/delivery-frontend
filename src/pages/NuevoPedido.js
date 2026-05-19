import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

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
      await axios.post('http://localhost:3000/api/pedidos', {
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
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarBrand}>🚀 DeliveryApp</div>
        <nav style={styles.nav}>
          <Link to="/pedidos" style={styles.navItem}>📦 Mis Pedidos</Link>
          <div style={styles.navActivo}>➕ Nuevo Pedido</div>
        </nav>
      </div>

      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.titulo}>Nuevo Pedido</h1>
            <p style={styles.subtitulo}>Completa los datos para realizar tu pedido</p>
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.grid}>
            <div style={styles.columnaIzq}>
              <div style={styles.card}>
                <h3 style={styles.cardTitulo}>🛍️ Productos</h3>
                {productos.map((producto, index) => (
                  <div key={index} style={styles.productoCard}>
                    <div style={styles.productoHeader}>
                      <span style={styles.productoNum}>Producto {index + 1}</span>
                      {productos.length > 1 && (
                        <button type="button" style={styles.botonEliminar} onClick={() => eliminarProducto(index)}>✕ Eliminar</button>
                      )}
                    </div>
                    <div style={styles.productoGrid}>
                      <div style={styles.grupo}>
                        <label style={styles.label}>Nombre</label>
                        <input
                          style={styles.input}
                          placeholder="Ej: Pizza grande"
                          value={producto.nombre}
                          onChange={e => actualizarProducto(index, 'nombre', e.target.value)}
                          required
                        />
                      </div>
                      <div style={styles.grupo}>
                        <label style={styles.label}>Precio</label>
                        <input
                          style={styles.input}
                          placeholder="0"
                          type="number"
                          value={producto.precio}
                          onChange={e => actualizarProducto(index, 'precio', e.target.value)}
                          required
                        />
                      </div>
                      <div style={styles.grupo}>
                        <label style={styles.label}>Cantidad</label>
                        <input
                          style={styles.input}
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
                <button type="button" style={styles.botonAgregar} onClick={agregarProducto}>
                  + Agregar otro producto
                </button>
              </div>
            </div>

            <div style={styles.columnaDer}>
              <div style={styles.card}>
                <h3 style={styles.cardTitulo}>📍 Entrega</h3>
                <div style={styles.grupo}>
                  <label style={styles.label}>Dirección de entrega</label>
                  <input
                    style={styles.input}
                    placeholder="Ej: Av. Providencia 1234, Santiago"
                    value={direccion}
                    onChange={e => setDireccion(e.target.value)}
                    required
                  />
                </div>
                <div style={styles.grupo}>
                  <label style={styles.label}>Método de pago</label>
                  <select style={styles.input} value={metodoPago} onChange={e => setMetodoPago(e.target.value)}>
                    <option value="tarjeta">💳 Tarjeta de crédito/débito</option>
                    <option value="efectivo">💵 Efectivo</option>
                    <option value="transferencia">🏦 Transferencia</option>
                  </select>
                </div>
              </div>

              <div style={styles.resumenCard}>
                <h3 style={styles.cardTitulo}>Resumen</h3>
                {productos.map((p, i) => p.nombre && (
                  <div key={i} style={styles.resumenFila}>
                    <span style={styles.resumenNombre}>{p.nombre} x{p.cantidad}</span>
                    <span style={styles.resumenPrecio}>${((parseFloat(p.precio) || 0) * p.cantidad).toLocaleString()}</span>
                  </div>
                ))}
                <div style={styles.resumenTotal}>
                  <span>Total</span>
                  <span style={styles.totalValor}>${calcularTotal().toLocaleString()}</span>
                </div>
                <button type="submit" style={loading ? styles.botonLoading : styles.boton} disabled={loading}>
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

const styles = {
  container: { display: 'flex', minHeight: '100vh', background: '#0f1117' },
  sidebar: { width: '240px', background: '#13151f', borderRight: '1px solid #1e2130', display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0 },
  sidebarBrand: { fontSize: '18px', fontWeight: '700', color: '#f1f5f9', padding: '0 24px 24px', borderBottom: '1px solid #1e2130', marginBottom: '16px' },
  nav: { padding: '0 12px' },
  navActivo: { padding: '10px 12px', borderRadius: '8px', background: '#1e2130', color: '#6c63ff', fontSize: '14px', fontWeight: '500', marginBottom: '4px' },
  navItem: { display: 'block', padding: '10px 12px', borderRadius: '8px', color: '#64748b', fontSize: '14px', marginBottom: '4px' },
  main: { flex: 1, padding: '32px', overflowY: 'auto' },
  header: { marginBottom: '32px' },
  titulo: { fontSize: '24px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' },
  subtitulo: { fontSize: '14px', color: '#64748b' },
  error: { background: '#2d1b1b', border: '1px solid #ef4444', color: '#fca5a5', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' },
  columnaIzq: {},
  columnaDer: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: { background: '#13151f', border: '1px solid #1e2130', borderRadius: '12px', padding: '24px', marginBottom: '16px' },
  cardTitulo: { fontSize: '15px', fontWeight: '600', color: '#f1f5f9', marginBottom: '20px' },
  productoCard: { background: '#0f1117', border: '1px solid #1e2130', borderRadius: '10px', padding: '16px', marginBottom: '12px' },
  productoHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  productoNum: { fontSize: '13px', fontWeight: '500', color: '#6c63ff' },
  botonEliminar: { background: '#2d1b1b', border: '1px solid #7f1d1d', color: '#f87171', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' },
  productoGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' },
  grupo: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '500', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: { width: '100%', padding: '10px 14px', background: '#1e2130', border: '1px solid #2d3148', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  botonAgregar: { width: '100%', padding: '10px', background: 'transparent', border: '1px dashed #2d3148', borderRadius: '8px', color: '#6c63ff', fontSize: '14px' },
  resumenCard: { background: '#13151f', border: '1px solid #1e2130', borderRadius: '12px', padding: '24px' },
  resumenFila: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
  resumenNombre: { fontSize: '13px', color: '#94a3b8' },
  resumenPrecio: { fontSize: '13px', color: '#f1f5f9', fontWeight: '500' },
  resumenTotal: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #1e2130', marginTop: '8px', marginBottom: '20px', fontSize: '15px', fontWeight: '600', color: '#f1f5f9' },
  totalValor: { fontSize: '24px', fontWeight: '700', color: '#6c63ff' },
  boton: { width: '100%', padding: '13px', background: 'linear-gradient(135deg, #6c63ff, #4f46e5)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600' },
  botonLoading: { width: '100%', padding: '13px', background: '#2d3148', color: '#64748b', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600' }
};

export default NuevoPedido;