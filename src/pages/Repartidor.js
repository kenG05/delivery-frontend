import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import '../styles/Repartidor.css';

function Repartidor() {
  const [pedidos, setPedidos] = useState([]);
  const [disponible, setDisponible] = useState(true);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  useEffect(() => {
    if (!token || usuario.rol !== 'repartidor') { navigate('/'); return; }
    cargarPedidos();

    const s = io('https://tiptop-vocalist-scope.ngrok-free.dev');
    s.on('connect', () => console.log('Repartidor conectado'));
    setSocket(s);
    return () => s.disconnect();
  }, []);

  const cargarPedidos = async () => {
    try {
      const res = await axios.get('https://tiptop-vocalist-scope.ngrok-free.dev/api/pedidos', {
        headers: { authorization: token }
      });
      setPedidos(res.data.pedidos);
    } catch (err) {
      console.error(err);
    }
  };

  const cambiarEstado = async (pedidoId, estado) => {
    try {
      await axios.put(`https://tiptop-vocalist-scope.ngrok-free.dev/api/pedidos/${pedidoId}/estado`,
        { estado },
        { headers: { authorization: token } }
      );
      if (socket) {
        socket.emit('cambiar_estado_pedido', { pedidoId, estado });
      }
      cargarPedidos();
    } catch (err) {
      console.error(err);
    }
  };

  const actualizarUbicacion = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      const pedidoActivo = pedidos.find(p => p.estado === 'en_camino');
      if (pedidoActivo && socket) {
        socket.emit('actualizar_ubicacion', {
          pedidoId: pedidoActivo.id,
          latitud: latitude,
          longitud: longitude
        });
      }
    });
  };

  const cerrarSesion = () => { localStorage.clear(); navigate('/'); };

  const colores = {
    pendiente:  { bg: '#FFF8E7', text: '#D97706', border: '#FDE68A' },
    confirmado: { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
    preparando: { bg: '#F5F3FF', text: '#7C3AED', border: '#DDD6FE' },
    en_camino:  { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' },
    entregado:  { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
    cancelado:  { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' }
  };

  const acciones = {
    confirmado: { siguiente: 'preparando', label: '👨‍🍳 Empezar preparación' },
    preparando: { siguiente: 'en_camino',  label: '🚀 Salir a entregar' },
    en_camino:  { siguiente: 'entregado',  label: '✅ Marcar entregado' }
  };

  const pedidosActivos = pedidos.filter(p => !['entregado', 'cancelado'].includes(p.estado));
  const pedidosCompletados = pedidos.filter(p => p.estado === 'entregado');

  return (
    <div className="rep-container">
      <div className="pedidos-sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo">⚡</span>
          <span className="sidebar-nombre">Zippi</span>
        </div>
        <div className="rep-sidebar-label">Repartidor</div>
        <nav className="sidebar-nav">
          <div className="sidebar-nav-item activo">
            <span>🏍️</span> Mis Entregas
          </div>
        </nav>
        <div className="rep-disponibilidad">
          <p className="rep-disp-label">Mi disponibilidad</p>
          <div
            className={`rep-disp-toggle ${disponible ? 'activo' : ''}`}
            onClick={async () => {
            const nuevoEstado = !disponible;
            setDisponible(nuevoEstado);
            try {
                await axios.put(`https://tiptop-vocalist-scope.ngrok-free.dev/api/repartidores/${usuario.id}/disponibilidad`,
                { disponible: nuevoEstado },
                { headers: { authorization: token } }
                );
            } catch (err) {
                console.error('Error actualizando disponibilidad');
            }
            }}
          >
            <div className="rep-disp-dot"></div>
          </div>
          <p className="rep-disp-estado">{disponible ? 'Disponible' : 'No disponible'}</p>
        </div>
        <div className="sidebar-footer">
          <div className="sidebar-usuario">
            <div className="sidebar-avatar">{usuario.nombre?.charAt(0).toUpperCase()}</div>
            <div>
              <div className="sidebar-usuario-nombre">{usuario.nombre}</div>
              <div className="sidebar-usuario-rol">Repartidor</div>
            </div>
          </div>
          <button className="sidebar-salir" onClick={cerrarSesion}>Cerrar sesión</button>
        </div>
      </div>

      <div className="rep-main">
        <div className="rep-header">
          <div>
            <h1 className="rep-titulo">Mis Entregas</h1>
            <p className="rep-subtitulo">Gestiona tus pedidos asignados</p>
          </div>
          <button className="btn-ubicacion" onClick={actualizarUbicacion}>
            📍 Compartir ubicación
          </button>
        </div>

        <div className="rep-stats">
          <div className="rep-stat">
            <div className="rep-stat-num">{pedidosActivos.length}</div>
            <div className="rep-stat-label">Activos</div>
          </div>
          <div className="rep-stat">
            <div className="rep-stat-num" style={{ color: '#16A34A' }}>{pedidosCompletados.length}</div>
            <div className="rep-stat-label">Entregados hoy</div>
          </div>
          <div className="rep-stat">
            <div className="rep-stat-num" style={{ color: disponible ? '#00A896' : '#DC2626' }}>
              {disponible ? '🟢' : '🔴'}
            </div>
            <div className="rep-stat-label">Estado</div>
          </div>
        </div>

        <h2 className="rep-seccion-titulo">Pedidos activos</h2>
        {pedidosActivos.length === 0 ? (
          <div className="rep-vacio">
            <div className="rep-vacio-icon">🏍️</div>
            <h3>No tienes pedidos asignados</h3>
            <p>Cuando el admin te asigne un pedido aparecerá aquí</p>
          </div>
        ) : (
          <div className="rep-grid">
            {pedidosActivos.map(pedido => {
              const color = colores[pedido.estado] || colores.pendiente;
              const accion = acciones[pedido.estado];
              return (
                <div key={pedido.id} className="rep-card">
                  <div className="rep-card-header">
                    <span className="rep-card-id">Pedido #{pedido.id}</span>
                    <span className="rep-card-estado" style={{ background: color.bg, color: color.text, border: `1px solid ${color.border}` }}>
                      {pedido.estado.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="rep-card-body">
                    <div className="rep-info-row">
                      <span>📍</span>
                      <span>{pedido.direccionEntrega}</span>
                    </div>
                    <div className="rep-info-row">
                      <span>💰</span>
                      <span>${pedido.total.toLocaleString()}</span>
                    </div>
                    <div className="rep-info-row">
                      <span>💳</span>
                      <span>{pedido.metodoPago}</span>
                    </div>
                  </div>
                  {accion && (
                    <button
                      className="btn-accion"
                      onClick={() => cambiarEstado(pedido.id, accion.siguiente)}
                    >
                      {accion.label}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {pedidosCompletados.length > 0 && (
          <>
            <h2 className="rep-seccion-titulo" style={{ marginTop: '32px' }}>Entregados hoy</h2>
            <div className="rep-grid">
              {pedidosCompletados.map(pedido => (
                <div key={pedido.id} className="rep-card rep-card-completado">
                  <div className="rep-card-header">
                    <span className="rep-card-id">Pedido #{pedido.id}</span>
                    <span className="rep-card-estado" style={{ background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}>
                      ✅ Entregado
                    </span>
                  </div>
                  <div className="rep-card-body">
                    <div className="rep-info-row">
                      <span>📍</span>
                      <span>{pedido.direccionEntrega}</span>
                    </div>
                    <div className="rep-info-row">
                      <span>💰</span>
                      <span>${pedido.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Repartidor;
