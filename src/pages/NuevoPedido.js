import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function NuevoPedido() {
  const [direccion, setDireccion] = useState('');
  const [metodoPago, setMetodoPago] = useState('tarjeta');
  const [productos, setProductos] = useState([
    { nombre: '', precio: '', cantidad: 1 }
  ]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const agregarProducto = () => {
    setProductos([...productos, { nombre: '', precio: '', cantidad: 1 }]);
  };

  const eliminarProducto = (index) => {
    setProductos(productos.filter((_, i) => i !== index));
  };

  const actualizarProducto = (index, campo, valor) => {
    const nuevos = [...productos];
    nuevos[index][campo] = valor;
    setProductos(nuevos);
  };

  const calcularTotal = () => {
    return productos.reduce((sum, p) => sum + (parseFloat(p.precio) || 0) * p.cantidad, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productosFormateados = productos.map(p => ({
        nombre: p.nombre,
        precio: parseFloat(p.precio),
        cantidad: parseInt(p.cantidad)
      }));

      await axios.post('http://localhost:3000/api/pedidos', {
        productos: productosFormateados,
        direccionEntrega: direccion,
        metodoPago
      }, {
        headers: { authorization: token }
      });

      navigate('/pedidos');
    } catch (err) {
      setError('Error al crear el pedido');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Link to="/pedidos" style={styles.volver}>← Volver</Link>
        <h2 style={styles.titulo}>Nuevo Pedido</h2>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={styles.seccion}>
          <h3 style={styles.seccionTitulo}>Productos</h3>
          {productos.map((producto, index) => (
            <div key={index} style={styles.productoRow}>
              <input
                style={{ ...styles.input, flex: 2 }}
                placeholder="Nombre del producto"
                value={producto.nombre}
                onChange={e => actualizarProducto(index, 'nombre', e.target.value)}
                required
              />
              <input
                style={{ ...styles.input, flex: 1 }}
                placeholder="Precio"
                type="number"
                value={producto.precio}
                onChange={e => actualizarProducto(index, 'precio', e.target.value)}
                required
              />
              <input
                style={{ ...styles.input, flex: 0.5, minWidth: '60px' }}
                placeholder="Cant."
                type="number"
                min="1"
                value={producto.cantidad}
                onChange={e => actualizarProducto(index, 'cantidad', e.target.value)}
                required
              />
              {productos.length > 1 && (
                <button type="button" style={styles.botonEliminar} onClick={() => eliminarProducto(index)}>✕</button>
              )}
            </div>
          ))}
          <button type="button" style={styles.botonAgregar} onClick={agregarProducto}>
            + Agregar producto
          </button>
        </div>

        <div style={styles.seccion}>
          <h3 style={styles.seccionTitulo}>Dirección de entrega</h3>
          <input
            style={styles.input}
            placeholder="Ej: Av. Providencia 1234, Santiago"
            value={direccion}
            onChange={e => setDireccion(e.target.value)}
            required
          />
        </div>

        <div style={styles.seccion}>
          <h3 style={styles.seccionTitulo}>Método de pago</h3>
          <select style={styles.input} value={metodoPago} onChange={e => setMetodoPago(e.target.value)}>
            <option value="tarjeta">Tarjeta de crédito/débito</option>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
          </select>
        </div>

        <div style={styles.totalBox}>
          <span style={styles.totalLabel}>Total del pedido:</span>
          <span style={styles.totalValor}>${calcularTotal().toLocaleString()}</span>
        </div>

        <button type="submit" style={styles.botonEnviar}>Confirmar Pedido</button>
      </form>
    </div>
  );
}

const styles = {
  container: { maxWidth: '700px', margin: '0 auto', padding: '20px' },
  header: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' },
  volver: { color: '#ff6b35', textDecoration: 'none', fontSize: '15px' },
  titulo: { color: '#333', margin: 0 },
  error: { color: 'red', textAlign: 'center' },
  seccion: { background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  seccionTitulo: { color: '#333', marginBottom: '16px', marginTop: 0 },
  productoRow: { display: 'flex', gap: '8px', marginBottom: '10px', alignItems: 'center' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  botonEliminar: { background: '#fee', border: '1px solid #fcc', color: '#f44336', borderRadius: '8px', padding: '10px', cursor: 'pointer', fontSize: '14px' },
  botonAgregar: { background: 'transparent', border: '1px dashed #ff6b35', color: '#ff6b35', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', width: '100%', marginTop: '8px' },
  totalBox: { background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  totalLabel: { fontSize: '16px', color: '#333', fontWeight: '500' },
  totalValor: { fontSize: '24px', fontWeight: 'bold', color: '#ff6b35' },
  botonEnviar: { width: '100%', padding: '14px', background: '#ff6b35', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', fontWeight: '500' }
};

export default NuevoPedido;