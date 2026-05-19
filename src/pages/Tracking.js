import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/Tracking.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function ActualizarMapa({ posicion }) {
  const map = useMap();
  useEffect(() => {
    if (posicion) map.setView(posicion, 15);
  }, [posicion, map]);
  return null;
}

function Tracking() {
  const { id } = useParams();
  const [estado, setEstado] = useState('pendiente');
  const [ubicacion, setUbicacion] = useState(null);
  const [posicion, setPosicion] = useState([-33.4489, -70.6693]);
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
      const lat = parseFloat(data.latitud);
      const lng = parseFloat(data.longitud);
      setUbicacion({ latitud: lat, longitud: lng });
      setPosicion([lat, lng]);
      agregarEvento(`Repartidor en: ${lat}, ${lng}`, '📍');
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
    <div className="tracking-container">
      <div className="pedidos-sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo">⚡</span>
          <span className="sidebar-nombre">Zippi</span>
        </div>
        <nav className="sidebar-nav">
          <Link to="/pedidos" className="sidebar-nav-item">
            <span>←</span> Mis Pedidos
          </Link>
        </nav>
      </div>

      <div className="tracking-main">
        <div className="tracking-header">
          <div>
            <h1 className="tracking-titulo">Tracking en vivo</h1>
            <p className="tracking-subtitulo">Pedido #{id}</p>
          </div>
          <div className="live-badge">
            <span className="live-dot"></span> En vivo
          </div>
        </div>

        <div className="tracking-card">
          <h3 className="tracking-card-titulo">Estado del pedido</h3>
          <div className="tracking-pasos">
            {pasos.map((paso, index) => {
              const completado = index <= pasoActual;
              const actual = index === pasoActual;
              return (
                <div key={paso.key} className="paso-wrapper">
                  <div className={`paso-dot ${completado ? 'completado' : ''} ${actual ? 'actual' : ''}`}>
                    {completado ? paso.icon : ''}
                  </div>
                  <span className={`paso-label ${completado ? 'completado' : ''} ${actual ? 'actual' : ''}`}>
                    {paso.label}
                  </span>
                  {index < pasos.length - 1 && (
                    <div className={`paso-linea ${index < pasoActual ? 'completado' : ''}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="tracking-card">
          <h3 className="tracking-card-titulo">🗺️ Mapa en tiempo real</h3>
          <div className="mapa-wrapper">
            <MapContainer center={posicion} zoom={15} style={{ height: '100%', width: '100%', borderRadius: '10px' }}>
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={posicion}>
                <Popup>🏍️ Repartidor aquí</Popup>
              </Marker>
              <ActualizarMapa posicion={posicion} />
            </MapContainer>
          </div>
          {ubicacion && (
            <div className="coords-row">
              <span className="coord-item">📍 Lat: {ubicacion.latitud}</span>
              <span className="coord-item">Lng: {ubicacion.longitud}</span>
            </div>
          )}
        </div>

        <div className="tracking-card">
          <h3 className="tracking-card-titulo">Actividad en tiempo real</h3>
          {eventos.length === 0 ? (
            <div className="sin-eventos">
              <div className="sin-eventos-icon">📡</div>
              <p>Esperando actualizaciones...</p>
            </div>
          ) : (
            <div className="eventos-lista">
              {eventos.map((evento, index) => (
                <div key={index} className="evento-item">
                  <span className="evento-icon">{evento.icon}</span>
                  <span className="evento-mensaje">{evento.mensaje}</span>
                  <span className="evento-hora">{evento.hora}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Tracking;