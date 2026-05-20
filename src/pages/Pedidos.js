import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Pedidos.css';

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
      const res = await axios.get('https://tiptop-vocalist-scope.ngrok-free.dev/api/pedidos', {
        headers: { authorization: token }
      });
      setPedidos(res.data.pedidos);
    } catch (err) {
      setError('Error al cargar pedidos');
    }
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

  return (
    <div className="pedidos-container">
      <div className="pedidos-sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo">⚡</span>
          <span className="sidebar-nombre">Zippi</span>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-nav-item activo">
            <span>📦</span> Mis Pedidos
          </div>
          <div className="sidebar-nav-item" onClick={() => navigate('/nuevo-pedido')}>
            <span>➕</span> Nuevo Pedido
          </div>
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

      <div className="pedidos-main">
        <div className="pedidos-header">
          <div>
            <h1 className="pedidos-titulo">Mis Pedidos</h1>
            <p className="pedidos-subtitulo">Gestiona y sigue tus pedidos en tiempo real</p>
          </div>
          <Link to="/nuevo-pedido" className="btn-nuevo-pedido">+ Nuevo Pedido</Link>
        </div>

        {error && <div className="pedidos-error">{error}</div>}

        {pedidos.length === 0 ? (
          <div className="pedidos-vacio">
            <div className="pedidos-vacio-icon">📭</div>
            <h3>No tienes pedidos aún</h3>
            <p>Haz tu primer pedido y aparecerá aquí</p>
            <Link to="/nuevo-pedido" className="btn-nuevo-pedido">Hacer mi primer pedido</Link>
          </div>
        ) : (
          <div className="pedidos-grid">
            {pedidos.map(pedido => {
              const color = colores[pedido.estado] || colores.pendiente;
              return (
                <div key={pedido.id} className="pedido-card">
                  <div className="pedido-card-header">
                    <span className="pedido-id">Pedido #{pedido.id}</span>
                    <span className="pedido-estado" style={{ background: color.bg, color: color.text, border: `1px solid ${color.border}` }}>
                      {pedido.estado.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="pedido-card-body">
                    <div className="pedido-info-row">
                      <span>📍</span>
                      <span>{pedido.direccionEntrega}</span>
                    </div>
                    <div className="pedido-info-row">
                      <span>💳</span>
                      <span>{pedido.metodoPago}</span>
                    </div>
                  </div>
                  <div className="pedido-card-footer">
                    <div>
                      <div className="pedido-total">${pedido.total.toLocaleString()}</div>
                      <div className="pedido-fecha">{new Date(pedido.createdAt).toLocaleDateString()}</div>
                    </div>
                    <Link to={`/tracking/${pedido.id}`} className="btn-tracking">
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

export default Pedidos;
