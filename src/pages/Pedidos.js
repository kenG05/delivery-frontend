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

  const cerrarSesion = () => { localStorage.clear(); navigate('/'); };

  const colores = {
    pendiente:  { bg: '#2d1f0a', text: '#f59e0b', border: '#78350f' },
    confirmado: { bg: '#0a1f2d', text: '#38bdf8', border: '#0c4a6e' },
    preparando: { bg: '#1f0a2d', text: '#a78bfa', border: '#4c1d95' },
    en_camino:  { bg: '#0a2d1f', text: '#34d399', border: '#064e3b' },
    entregado:  { bg: '#0a2d0a', text: '#4ade80', border: '#14532d' },
    cancelado:  { bg: '#2d0a0a', text: '#f87171', border: '#7f1d1d' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarBrand}>🚀 DeliveryApp</div>
        <nav style={styles.nav}>
          <div style={styles.navItemActivo}>📦 Mis Pedidos</div>
          <div style={styles.navItem} onClick={() => navigate('/nuevo-pedido')}>➕ Nuevo Pedido</div>
        </nav>
        <div style={styles.sidebarFooter}>
          <div style={styles.usuarioInfo}>
            <div style={styles.avatar}>{usuario.nombre?.charAt(0).toUpperCase()}</div>
            <div>
              <div style={styles.usuarioNombre}>{usuario.nombre}</div>
              <div style={styles.usuarioRol}>{usuario.rol}</div>
            </div>
          </div>
          <button style={styles.botonSalir} onClick={cerrarSesion}>Salir</button>
        </div>
      </div>

      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.titulo}>Mis Pedidos</h1>
            <p style={styles.subtitulo}>Gestiona y sigue tus pedidos en tiempo real</p>
          </div>
          <Link to="/nuevo-pedido" style={styles.botonNuevo}>+ Nuevo Pedido</Link>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {pedidos.length === 0 ? (
          <div style={styles.vacio}>
            <div style={styles.vacioIcon}>📭</div>
            <h3 style={styles.vacioTitulo}>No tienes pedidos aún</h3>
            <p style={styles.vacioDesc}>Haz tu primer pedido y aparecerá aquí</p>
            <Link to="/nuevo-pedido" style={styles.botonNuevo}>Hacer mi primer pedido</Link>
          </div>
        ) : (
          <div style={styles.grid}>
            {pedidos.map(pedido => {
              const color = colores[pedido.estado] || colores.pendiente;
              return (
                <div key={pedido.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <span style={styles.pedidoId}>Pedido #{pedido.id}</span>
                    <span style={{ ...styles.estado, background: color.bg, color: color.text, border: `1px solid ${color.border}` }}>
                      {pedido.estado.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={styles.cardBody}>
                    <div style={styles.infoRow}>
                      <span style={styles.infoIcon}>📍</span>
                      <span style={styles.infoText}>{pedido.direccionEntrega}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <span style={styles.infoIcon}>💳</span>
                      <span style={styles.infoText}>{pedido.metodoPago}</span>
                    </div>
                  </div>
                  <div style={styles.cardFooter}>
                    <div>
                      <div style={styles.total}>${pedido.total.toLocaleString()}</div>
                      <div style={styles.fecha}>{new Date(pedido.createdAt).toLocaleDateString()}</div>
                    </div>
                    <Link to={`/tracking/${pedido.id}`} style={styles.botonTracking}>
                      Ver tracking →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', background: '#0f1117' },
  sidebar: { width: '240px', background: '#13151f', borderRight: '1px solid #1e2130', display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0 },
  sidebarBrand: { fontSize: '18px', fontWeight: '700', color: '#f1f5f9', padding: '0 24px 24px', borderBottom: '1px solid #1e2130', marginBottom: '16px' },
  nav: { flex: 1, padding: '0 12px' },
  navItemActivo: { padding: '10px 12px', borderRadius: '8px', background: '#1e2130', color: '#6c63ff', fontSize: '14px', fontWeight: '500', marginBottom: '4px', cursor: 'pointer' },
  navItem: { padding: '10px 12px', borderRadius: '8px', color: '#64748b', fontSize: '14px', marginBottom: '4px', cursor: 'pointer' },
  sidebarFooter: { padding: '16px 24px', borderTop: '1px solid #1e2130' },
  usuarioInfo: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #6c63ff, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: 'white' },
  usuarioNombre: { fontSize: '13px', fontWeight: '500', color: '#f1f5f9' },
  usuarioRol: { fontSize: '11px', color: '#64748b', textTransform: 'capitalize' },
  botonSalir: { width: '100%', padding: '8px', background: 'transparent', border: '1px solid #2d3148', borderRadius: '8px', color: '#64748b', fontSize: '13px' },
  main: { flex: 1, padding: '32px', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' },
  titulo: { fontSize: '24px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' },
  subtitulo: { fontSize: '14px', color: '#64748b' },
  botonNuevo: { background: 'linear-gradient(135deg, #6c63ff, #4f46e5)', color: 'white', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '500' },
  error: { background: '#2d1b1b', border: '1px solid #ef4444', color: '#fca5a5', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' },
  vacio: { textAlign: 'center', padding: '80px 40px' },
  vacioIcon: { fontSize: '48px', marginBottom: '16px' },
  vacioTitulo: { fontSize: '20px', fontWeight: '600', color: '#f1f5f9', marginBottom: '8px' },
  vacioDesc: { fontSize: '14px', color: '#64748b', marginBottom: '24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' },
  card: { background: '#13151f', border: '1px solid #1e2130', borderRadius: '12px', padding: '20px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  pedidoId: { fontSize: '15px', fontWeight: '600', color: '#f1f5f9' },
  estado: { fontSize: '12px', fontWeight: '500', padding: '4px 10px', borderRadius: '20px' },
  cardBody: { marginBottom: '16px' },
  infoRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
  infoIcon: { fontSize: '14px' },
  infoText: { fontSize: '13px', color: '#94a3b8' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '16px', borderTop: '1px solid #1e2130' },
  total: { fontSize: '20px', fontWeight: '700', color: '#f1f5f9', marginBottom: '2px' },
  fecha: { fontSize: '12px', color: '#64748b' },
  botonTracking: { background: '#1e2130', color: '#6c63ff', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '500' }
};

export default Pedidos;