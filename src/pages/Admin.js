import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Admin() {
  const [pedidos, setPedidos] = useState([]);
  const [repartidores, setRepartidores] = useState([]);
  const [vista, setVista] = useState('pedidos');
  const [stats, setStats] = useState({ total: 0, pendientes: 0, enCamino: 0, entregados: 0 });
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  useEffect(() => {
    if (!token || usuario.rol !== 'admin') { navigate('/'); return; }
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [pedidosRes, repartidoresRes] = await Promise.all([
        axios.get('http://localhost:3000/api/pedidos', { headers: { authorization: token } }),
        axios.get('http://localhost:3000/api/repartidores', { headers: { authorization: token } })
      ]);
      const p = pedidosRes.data.pedidos;
      setPedidos(p);
      setRepartidores(repartidoresRes.data.repartidores);
      setStats({
        total: p.length,
        pendientes: p.filter(x => x.estado === 'pendiente').length,
        enCamino: p.filter(x => x.estado === 'en_camino').length,
        entregados: p.filter(x => x.estado === 'entregado').length
      });
    } catch (err) {
      console.error(err);
    }
  };

  const cambiarEstado = async (pedidoId, estado) => {
    try {
      await axios.put(`http://localhost:3000/api/pedidos/${pedidoId}/estado`,
        { estado },
        { headers: { authorization: token } }
      );
      cargarDatos();
    } catch (err) {
      console.error(err);
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

  const statsConfig = [
    { label: 'Total pedidos', valor: stats.total, icon: '📦', color: '#6c63ff' },
    { label: 'Pendientes',    valor: stats.pendientes, icon: '⏳', color: '#f59e0b' },
    { label: 'En camino',     valor: stats.enCamino,   icon: '🚀', color: '#34d399' },
    { label: 'Entregados',    valor: stats.entregados, icon: '✅', color: '#4ade80' }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarBrand}>🚀 DeliveryApp</div>
        <nav style={styles.nav}>
          <div style={vista === 'pedidos' ? styles.navActivo : styles.navItem} onClick={() => setVista('pedidos')}>📦 Pedidos</div>
          <div style={vista === 'repartidores' ? styles.navActivo : styles.navItem} onClick={() => setVista('repartidores')}>🏍️ Repartidores</div>
        </nav>
        <div style={styles.sidebarFooter}>
          <div style={styles.usuarioInfo}>
            <div style={styles.avatar}>{usuario.nombre?.charAt(0).toUpperCase()}</div>
            <div>
              <div style={styles.usuarioNombre}>{usuario.nombre}</div>
              <div style={styles.usuarioRol}>Administrador</div>
            </div>
          </div>
          <button style={styles.botonSalir} onClick={cerrarSesion}>Cerrar sesión</button>
        </div>
      </div>

      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.titulo}>{vista === 'pedidos' ? 'Gestión de Pedidos' : 'Gestión de Repartidores'}</h1>
            <p style={styles.subtitulo}>Panel de control en tiempo real</p>
          </div>
          <button style={styles.botonRefresh} onClick={cargarDatos}>↻ Actualizar</button>
        </div>

        <div style={styles.statsGrid}>
          {statsConfig.map((s, i) => (
            <div key={i} style={styles.statCard}>
              <div style={styles.statIcon}>{s.icon}</div>
              <div style={{ ...styles.statNum, color: s.color }}>{s.valor}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {vista === 'pedidos' && (
          <div style={styles.tabla}>
            <div style={styles.tablaHeader}>
              <span>ID</span>
              <span>Cliente</span>
              <span>Dirección</span>
              <span>Total</span>
              <span>Estado</span>
              <span>Cambiar estado</span>
            </div>
            {pedidos.length === 0 && <p style={styles.vacio}>No hay pedidos aún</p>}
            {pedidos.map(pedido => {
              const color = colores[pedido.estado] || colores.pendiente;
              return (
                <div key={pedido.id} style={styles.tablaFila}>
                  <span style={styles.idCell}>#{pedido.id}</span>
                  <span style={styles.celda}>Cliente {pedido.clienteId}</span>
                  <span style={styles.celdaDireccion}>{pedido.direccionEntrega}</span>
                  <span style={{ ...styles.celda, fontWeight: '600', color: '#f1f5f9' }}>${pedido.total.toLocaleString()}</span>
                  <span style={{ ...styles.estadoBadge, background: color.bg, color: color.text, border: `1px solid ${color.border}` }}>
                    {pedido.estado.replace('_', ' ')}
                  </span>
                  <select
                    style={styles.select}
                    value={pedido.estado}
                    onChange={e => cambiarEstado(pedido.id, e.target.value)}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="preparando">Preparando</option>
                    <option value="en_camino">En camino</option>
                    <option value="entregado">Entregado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              );
            })}
          </div>
        )}

        {vista === 'repartidores' && (
          <div style={styles.tabla}>
            <div style={{ ...styles.tablaHeader, gridTemplateColumns: '50px 1fr 1fr 1fr 120px' }}>
              <span>ID</span>
              <span>Nombre</span>
              <span>Teléfono</span>
              <span>Vehículo</span>
              <span>Estado</span>
            </div>
            {repartidores.length === 0 && <p style={styles.vacio}>No hay repartidores registrados</p>}
            {repartidores.map(r => (
              <div key={r.id} style={{ ...styles.tablaFila, gridTemplateColumns: '50px 1fr 1fr 1fr 120px' }}>
                <span style={styles.idCell}>#{r.id}</span>
                <span style={styles.celda}>{r.nombre}</span>
                <span style={styles.celda}>{r.telefono}</span>
                <span style={styles.celda}>{r.vehiculo}</span>
                <span style={{
                  ...styles.estadoBadge,
                  background: r.disponible ? '#0a2d0a' : '#2d0a0a',
                  color: r.disponible ? '#4ade80' : '#f87171',
                  border: `1px solid ${r.disponible ? '#14532d' : '#7f1d1d'}`
                }}>
                  {r.disponible ? 'Disponible' : 'Ocupado'}
                </span>
              </div>
            ))}
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
  navActivo: { padding: '10px 12px', borderRadius: '8px', background: '#1e2130', color: '#6c63ff', fontSize: '14px', fontWeight: '500', marginBottom: '4px', cursor: 'pointer' },
  navItem: { padding: '10px 12px', borderRadius: '8px', color: '#64748b', fontSize: '14px', marginBottom: '4px', cursor: 'pointer' },
  sidebarFooter: { padding: '16px 24px', borderTop: '1px solid #1e2130' },
  usuarioInfo: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #6c63ff, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: 'white' },
  usuarioNombre: { fontSize: '13px', fontWeight: '500', color: '#f1f5f9' },
  usuarioRol: { fontSize: '11px', color: '#64748b' },
  botonSalir: { width: '100%', padding: '8px', background: 'transparent', border: '1px solid #2d3148', borderRadius: '8px', color: '#64748b', fontSize: '13px' },
  main: { flex: 1, padding: '32px', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' },
  titulo: { fontSize: '24px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' },
  subtitulo: { fontSize: '14px', color: '#64748b' },
  botonRefresh: { background: '#1e2130', border: '1px solid #2d3148', color: '#94a3b8', padding: '8px 16px', borderRadius: '8px', fontSize: '13px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' },
  statCard: { background: '#13151f', border: '1px solid #1e2130', borderRadius: '12px', padding: '20px', textAlign: 'center' },
  statIcon: { fontSize: '28px', marginBottom: '8px' },
  statNum: { fontSize: '32px', fontWeight: '700', marginBottom: '4px' },
  statLabel: { fontSize: '13px', color: '#64748b' },
  tabla: { background: '#13151f', border: '1px solid #1e2130', borderRadius: '12px', overflow: 'hidden' },
  tablaHeader: { display: 'grid', gridTemplateColumns: '50px 1fr 2fr 120px 130px 150px', gap: '12px', padding: '14px 20px', background: '#0f1117', fontSize: '12px', fontWeight: '500', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },
  tablaFila: { display: 'grid', gridTemplateColumns: '50px 1fr 2fr 120px 130px 150px', gap: '12px', padding: '14px 20px', borderTop: '1px solid #1e2130', alignItems: 'center' },
  idCell: { fontSize: '13px', fontWeight: '600', color: '#6c63ff' },
  celda: { fontSize: '13px', color: '#94a3b8' },
  celdaDireccion: { fontSize: '13px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  estadoBadge: { fontSize: '12px', fontWeight: '500', padding: '4px 10px', borderRadius: '20px', textAlign: 'center' },
  select: { padding: '6px 10px', borderRadius: '6px', border: '1px solid #2d3148', background: '#1e2130', color: '#94a3b8', fontSize: '12px', cursor: 'pointer' },
  vacio: { textAlign: 'center', padding: '40px', color: '#64748b' }
};

export default Admin;