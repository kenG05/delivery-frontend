import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';

function Tracking() {
  const { id } = useParams();
  const [estado, setEstado] = useState('pendiente');
  const [ubicacion, setUbicacion] = useState(null);
  const [eventos, setEventos] = useState([]);

  const pasos = ['pendiente', 'confirmado', 'preparando', 'en_camino', 'entregado'];

  useEffect(() => {
    const socket = io('http://localhost:3000');

    socket.on('connect', () => {
      socket.emit('unirse_pedido', parseInt(id));
      agregarEvento('Conectado al tracking del pedido');
    });

    socket.on('ubicacion_actualizada', (data) => {
      setUbicacion({ latitud: data.latitud, longitud: data.longitud });
      agregarEvento(`Repartidor en: ${data.latitud}, ${data.longitud}`);
    });

    socket.on('estado_actualizado', (data) => {
      setEstado(data.estado);
      agregarEvento(`Estado actualizado: ${data.estado.replace('_', ' ')}`);
    });

    return () => socket.disconnect();
  }, [id]);

  const agregarEvento = (mensaje) => {
    setEventos(prev => [{
      mensaje,
      hora: new Date().toLocaleTimeString()
    }, ...prev]);
  };

  const porcentaje = () => {
    const index = pasos.indexOf(estado);
    return ((index + 1) / pasos.length) * 100;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Link to="/pedidos" style={styles.volver}>← Mis pedidos</Link>
        <h2 style={styles.titulo}>Tracking — Pedido #{id}</h2>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitulo}>Estado del pedido</h3>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${porcentaje()}%` }} />
        </div>
        <div style={styles.pasos}>
          {pasos.map((paso, index) => (
            <div key={paso} style={styles.paso}>
              <div style={{
                ...styles.pasoDot,
                background: pasos.indexOf(estado) >= index ? '#ff6b35' : '#ddd'
              }} />
              <span style={{
                ...styles.pasoLabel,
                color: pasos.indexOf(estado) >= index ? '#ff6b35' : '#aaa',
                fontWeight: estado === paso ? 'bold' : 'normal'
              }}>
                {paso.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {ubicacion && (
        <div style={styles.card}>
          <h3 style={styles.cardTitulo}>Ubicación del repartidor</h3>
          <p style={styles.coordenadas}>
            Latitud: {ubicacion.latitud} · Longitud: {ubicacion.longitud}
          </p>
        </div>
      )}

      <div style={styles.card}>
        <h3 style={styles.cardTitulo}>Actividad en tiempo real</h3>
        {eventos.length === 0 ? (
          <p style={styles.sinEventos}>Esperando actualizaciones...</p>
        ) : (
          <div style={styles.eventos}>
            {eventos.map((evento, index) => (
              <div key={index} style={styles.evento}>
                <span style={styles.eventoHora}>{evento.hora}</span>
                <span style={styles.eventoMensaje}>{evento.mensaje}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '700px', margin: '0 auto', padding: '20px' },
  header: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' },
  volver: { color: '#ff6b35', textDecoration: 'none', fontSize: '15px' },
  titulo: { color: '#333', margin: 0 },
  card: { background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardTitulo: { color: '#333', marginTop: 0, marginBottom: '16px' },
  progressBar: { height: '8px', background: '#f0f0f0', borderRadius: '4px', marginBottom: '16px' },
  progressFill: { height: '100%', background: '#ff6b35', borderRadius: '4px', transition: 'width 0.5s ease' },
  pasos: { display: 'flex', justifyContent: 'space-between' },
  paso: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
  pasoDot: { width: '12px', height: '12px', borderRadius: '50%' },
  pasoLabel: { fontSize: '12px', textTransform: 'capitalize' },
  coordenadas: { color: '#666', fontSize: '14px' },
  sinEventos: { color: '#aaa', textAlign: 'center', padding: '20px 0' },
  eventos: { display: 'flex', flexDirection: 'column', gap: '8px' },
  evento: { display: 'flex', gap: '12px', padding: '8px 0', borderBottom: '1px solid #f5f5f5' },
  eventoHora: { color: '#aaa', fontSize: '13px', minWidth: '80px' },
  eventoMensaje: { color: '#555', fontSize: '13px' }
};

export default Tracking;