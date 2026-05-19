import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';

function Tracking() {
  const { id } = useParams();
  const [estado, setEstado] = useState('pendiente');
  const [ubicacion, setUbicacion] = useState(null);
  const [eventos, setEventos] = useState([]);

  const pasos = [
    { key: 'pendiente',  label: 'Pendiente',  icon: '⏳' },
    { key: 'confirmado', label: 'Confirmado', icon: '✅' },
    { key: 'preparando', label: 'Preparando', icon: '👨‍🍳' },
    { key: 'en_camino',  label: 'En camino',  icon: '🚀' },
    { key: 'entregado',  label: 'Entregado',  icon: '🎉' }
  ];

  useEffect(() => {
    const socket = io('http://localhost:3000');
    socket.on('connect', () => {
      socket.emit('unirse_pedido', parseInt(id));
      agregarEvento('Conectado al tracking del pedido', '🔗');
    });
    socket.on('ubicacion_actualizada', (data) => {
      setUbicacion({ latitud: data.latitud, longitud: data.longitud });
      agregarEvento(`Repartidor en: ${data.latitud}, ${data.longitud}`, '📍');
    });
    socket.on('estado_actualizado', (data) => {
      setEstado(data.estado);
      agregarEvento(`Estado: ${data.estado.replace('_', ' ')}`, '🔄');
    });
    return () => socket.disconnect();
  }, [id]);

  const agregarEvento = (mensaje, icon = '•') => {
    setEventos(prev => [{ mensaje, icon, hora: new Date().toLocaleTimeString() }, ...prev]);
  };

  const pasoActual = pasos.findIndex(p => p.key === estado);

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarBrand}>🚀 DeliveryApp</div>
        <nav style={styles.nav}>
          <Link to="/pedidos" style={styles.navItem}>← Mis Pedidos</Link>
        </nav>
      </div>

      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.titulo}>Tracking en vivo</h1>
            <p style={styles.subtitulo}>Pedido #{id}</p>
          </div>
          <div style={styles.liveBadge}>
            <span style={styles.liveDot}></span> En vivo
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitulo}>Estado del pedido</h3>
          <div style={styles.pasos}>
            {pasos.map((paso, index) => {
              const completado = index <= pasoActual;
              const actual = index === pasoActual;
              return (
                <div key={paso.key} style={styles.pasoWrapper}>
                  <div style={{
                    ...styles.pasoDot,
                    background: completado ? 'linear-gradient(135deg, #6c63ff, #4f46e5)' : '#1e2130',
                    border: actual ? '2px solid #6c63ff' : '2px solid #2d3148',
                    boxShadow: actual ? '0 0 12px rgba(108,99,255,0.5)' : 'none'
                  }}>
                    {completado ? paso.icon : ''}
                  </div>
                  <span style={{ ...styles.pasoLabel, color: completado ? '#f1f5f9' : '#64748b', fontWeight: actual ? '600' : '400' }}>
                    {paso.label}
                  </span>
                  {index < pasos.length - 1 && (
                    <div style={{ ...styles.pasoLinea, background: index < pasoActual ? '#6c63ff' : '#1e2130' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {ubicacion && (
          <div style={styles.card}>
            <h3 style={styles.cardTitulo}>📍 Ubicación del repartidor</h3>
            <div style={styles.ubicacionGrid}>
              <div style={styles.coordCard}>
                <div style={styles.coordLabel}>Latitud</div>
                <div style={styles.coordValor}>{ubicacion.latitud}</div>
              </div>
              <div style={styles.coordCard}>
                <div style={styles.coordLabel}>Longitud</div>
                <div style={styles.coordValor}>{ubicacion.longitud}</div>
              </div>
            </div>
          </div>
        )}

        <div style={styles.card}>
          <h3 style={styles.cardTitulo}>Actividad en tiempo real</h3>
          {eventos.length === 0 ? (
            <div style={styles.sinEventos}>
              <div style={styles.sinEventosIcon}>📡</div>
              <p>Esperando actualizaciones...</p>
            </div>
          ) : (
            <div style={styles.eventos}>
              {eventos.map((evento, index) => (
                <div key={index} style={styles.evento}>
                  <span style={styles.eventoIcon}>{evento.icon}</span>
                  <span style={styles.eventoMensaje}>{evento.mensaje}</span>
                  <span style={styles.eventoHora}>{evento.hora}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', background: '#0f1117' },
  sidebar: { width: '240px', background: '#13151f', borderRight: '1px solid #1e2130', display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0 },
  sidebarBrand: { fontSize: '18px', fontWeight: '700', color: '#f1f5f9', padding: '0 24px 24px', borderBottom: '1px solid #1e2130', marginBottom: '16px' },
  nav: { padding: '0 12px' },
  navItem: { display: 'block', padding: '10px 12px', borderRadius: '8px', color: '#6c63ff', fontSize: '14px', fontWeight: '500' },
  main: { flex: 1, padding: '32px', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' },
  titulo: { fontSize: '24px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' },
  subtitulo: { fontSize: '14px', color: '#64748b' },
  liveBadge: { display: 'flex', alignItems: 'center', gap: '8px', background: '#0a2d0a', border: '1px solid #14532d', color: '#4ade80', padding: '8px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '500' },
  liveDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse 2s infinite' },
  card: { background: '#13151f', border: '1px solid #1e2130', borderRadius: '12px', padding: '24px', marginBottom: '16px' },
  cardTitulo: { fontSize: '15px', fontWeight: '600', color: '#f1f5f9', marginBottom: '20px' },
  pasos: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' },
  pasoWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1, position: 'relative' },
  pasoDot: { width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', zIndex: 1 },
  pasoLabel: { fontSize: '12px', textAlign: 'center' },
  pasoLinea: { position: 'absolute', top: '20px', left: '50%', width: '100%', height: '2px', zIndex: 0 },
  ubicacionGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  coordCard: { background: '#0f1117', border: '1px solid #1e2130', borderRadius: '8px', padding: '16px' },
  coordLabel: { fontSize: '12px', color: '#64748b', marginBottom: '4px' },
  coordValor: { fontSize: '18px', fontWeight: '600', color: '#6c63ff' },
  sinEventos: { textAlign: 'center', padding: '32px', color: '#64748b' },
  sinEventosIcon: { fontSize: '32px', marginBottom: '8px' },
  eventos: { display: 'flex', flexDirection: 'column', gap: '2px' },
  evento: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', background: '#0f1117' },
  eventoIcon: { fontSize: '16px', flexShrink: 0 },
  eventoMensaje: { flex: 1, fontSize: '13px', color: '#94a3b8' },
  eventoHora: { fontSize: '12px', color: '#64748b', flexShrink: 0 }
};

export default Tracking;