import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  useEffect(() => {
    if (!token) { navigate('/'); return; }
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/pedidos', {
        headers: { authorization: token }
      });
      setPedidos(res.data.pedidos);
    } catch (err) {
      setError('Error al cargar pedidos');
    }
  };

  const cerrarSesion = () => {
    localStorage.clear();
    navigate('/');
  };

  const colores = {
    pendiente: '#ff9800',
    confirmado: '#2196f3',
    preparando: '#9c27b0',
    en_camino: '#03a9f4',
    entregado: '#4caf50',
    cancelado: '#f44336'
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.titulo}>Mis Pedidos</h2>
        <div style={styles.headerRight}>
          <span style={styles.saludo}>Hola, {usuario.nombre}</span>
          <Link to="/nuevo-pedido" style={styles.botonNuevo}>+ Nuevo Pedido</Link>
          <button style={styles.botonSalir} onClick={cerrarSesion}>Salir</button>
        </div>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {pedidos.length === 0 ? (
        <div style={styles.vacio}>
          <p>No tienes pedidos aún.</p>
          <Link to="/nuevo-pedido" style={styles.botonNuevo}>Hacer mi primer pedido</Link>
        </div>
      ) : (
        <div style={styles.lista}>
          {pedidos.map(pedido => (
            <div key={pedido.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.pedidoId}>Pedido #{pedido.id}</span>
                <span style={{ ...styles.estado, background: colores[pedido.estado] }}>
                  {pedido.estado.replace('_', ' ')}
                </span>
              </div>
              <p style={styles.direccion}>📍 {pedido.direccionEntrega}</p>
              <p style={styles.total}>Total: ${pedido.total.toLocaleString()}</p>
              <div style={styles.cardFooter}>
                <span style={styles.fecha}>
                  {new Date(pedido.fechaCreacion).toLocaleDateString()}
                </span>
                <Link to={`/tracking/${pedido.id}`} style={styles.botonTracking}>
                  Ver tracking
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  titulo: { color: '#333' },
  saludo: { color: '#888', fontSize: '14px' },
  botonNuevo: { background: '#ff6b35', color: 'white', padding: '10px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px' },
  botonSalir: { background: 'transparent', border: '1px solid #ddd', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  error: { color: 'red', textAlign: 'center' },
  vacio: { textAlign: 'center', padding: '60px', color: '#888' },
  lista: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  pedidoId: { fontWeight: 'bold', color: '#333' },
  estado: { color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '13px' },
  direccion: { color: '#666', marginBottom: '8px', fontSize: '14px' },
  total: { fontWeight: 'bold', color: '#333', marginBottom: '12px' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  fecha: { color: '#aaa', fontSize: '13px' },
  botonTracking: { color: '#ff6b35', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }
};

export default Pedidos;