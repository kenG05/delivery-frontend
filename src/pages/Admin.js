import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Admin.css';

function Admin() {
  const [pedidos, setPedidos] = useState([]);
  const [repartidores, setRepartidores] = useState([]);
  const [vista, setVista] = useState('pedidos');
  const [mostrarFormRep, setMostrarFormRep] = useState(false);
  const [nuevoRep, setNuevoRep] = useState({ nombre: '', email: '', password: '', telefono: '', vehiculo: 'moto' });
  const [errorRep, setErrorRep] = useState('');
  const [loadingRep, setLoadingRep] = useState(false);
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

  const registrarRepartidor = async (e) => {
    e.preventDefault();
    setLoadingRep(true);
    try {
      await axios.post('http://localhost:3000/api/auth/registro', {
        nombre: nuevoRep.nombre,
        email: nuevoRep.email,
        password: nuevoRep.password,
        rol: 'repartidor'
      }, { headers: { authorization: token } });

      await axios.post('http://localhost:3000/api/repartidores', {
        nombre: nuevoRep.nombre,
        email: nuevoRep.email,
        telefono: nuevoRep.telefono,
        vehiculo: nuevoRep.vehiculo
      }, { headers: { authorization: token } });

      setNuevoRep({ nombre: '', email: '', password: '', telefono: '', vehiculo: 'moto' });
      setMostrarFormRep(false);
      setErrorRep('');
      cargarDatos();
    } catch (err) {
      setErrorRep('Error al registrar repartidor');
    } finally {
      setLoadingRep(false);
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

  const statsConfig = [
    { label: 'Total pedidos', valor: stats.total,     icon: '📦', color: '#00A896' },
    { label: 'Pendientes',    valor: stats.pendientes, icon: '⏳', color: '#D97706' },
    { label: 'En camino',     valor: stats.enCamino,   icon: '🚀', color: '#2563EB' },
    { label: 'Entregados',    valor: stats.entregados, icon: '✅', color: '#16A34A' }
  ];

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo">⚡</span>
          <span className="sidebar-nombre">Zippi</span>
        </div>
        <div className="admin-sidebar-label">Panel Admin</div>
        <nav className="sidebar-nav">
          <div className={`sidebar-nav-item ${vista === 'pedidos' ? 'activo' : ''}`} onClick={() => setVista('pedidos')}>
            <span>📦</span> Pedidos
          </div>
          <div className={`sidebar-nav-item ${vista === 'repartidores' ? 'activo' : ''}`} onClick={() => setVista('repartidores')}>
            <span>🏍️</span> Repartidores
          </div>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-usuario">
            <div className="sidebar-avatar">{usuario.nombre?.charAt(0).toUpperCase()}</div>
            <div>
              <div className="sidebar-usuario-nombre">{usuario.nombre}</div>
              <div className="sidebar-usuario-rol">Administrador</div>
            </div>
          </div>
          <button className="sidebar-salir" onClick={cerrarSesion}>Cerrar sesión</button>
        </div>
      </div>

      <div className="admin-main">
        <div className="admin-header">
          <div>
            <h1 className="admin-titulo">{vista === 'pedidos' ? 'Gestión de Pedidos' : 'Gestión de Repartidores'}</h1>
            <p className="admin-subtitulo">Panel de control en tiempo real</p>
          </div>
          <button className="btn-refresh" onClick={cargarDatos}>↻ Actualizar</button>
        </div>

        <div className="admin-stats">
          {statsConfig.map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-valor" style={{ color: s.color }}>{s.valor}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {vista === 'pedidos' && (
          <div className="admin-tabla">
            <div className="tabla-header">
              <span>ID</span>
              <span>Cliente</span>
              <span>Dirección</span>
              <span>Total</span>
              <span>Estado</span>
              <span>Cambiar estado</span>
            </div>
            {pedidos.length === 0 && <p className="tabla-vacio">No hay pedidos aún</p>}
            {pedidos.map(pedido => {
              const color = colores[pedido.estado] || colores.pendiente;
              return (
                <div key={pedido.id} className="tabla-fila">
                  <span className="tabla-id">#{pedido.id}</span>
                  <span className="tabla-celda">Cliente {pedido.clienteId}</span>
                  <span className="tabla-celda tabla-direccion">{pedido.direccionEntrega}</span>
                  <span className="tabla-celda tabla-total">${pedido.total.toLocaleString()}</span>
                  <span className="tabla-estado" style={{ background: color.bg, color: color.text, border: `1px solid ${color.border}` }}>
                    {pedido.estado.replace('_', ' ')}
                  </span>
                  <select className="tabla-select" value={pedido.estado} onChange={e => cambiarEstado(pedido.id, e.target.value)}>
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
          <>
            <div className="rep-acciones">
              <button className="btn-nuevo-rep" onClick={() => setMostrarFormRep(!mostrarFormRep)}>
                {mostrarFormRep ? '✕ Cancelar' : '+ Agregar repartidor'}
              </button>
            </div>

            {mostrarFormRep && (
              <div className="form-rep-card">
                <h3 className="form-rep-titulo">Registrar nuevo repartidor</h3>
                {errorRep && <div className="form-rep-error">{errorRep}</div>}
                <form onSubmit={registrarRepartidor}>
                  <div className="form-rep-grid">
                    <div className="form-grupo">
                      <label className="form-label">Nombre completo</label>
                      <input className="form-input" placeholder="Nombre" value={nuevoRep.nombre} onChange={e => setNuevoRep({...nuevoRep, nombre: e.target.value})} required />
                    </div>
                    <div className="form-grupo">
                      <label className="form-label">Email</label>
                      <input className="form-input" type="email" placeholder="email@zippi.com" value={nuevoRep.email} onChange={e => setNuevoRep({...nuevoRep, email: e.target.value})} required />
                    </div>
                    <div className="form-grupo">
                      <label className="form-label">Contraseña</label>
                      <input className="form-input" type="password" placeholder="••••••••" value={nuevoRep.password} onChange={e => setNuevoRep({...nuevoRep, password: e.target.value})} required />
                    </div>
                    <div className="form-grupo">
                      <label className="form-label">Teléfono</label>
                      <input className="form-input" placeholder="+56912345678" value={nuevoRep.telefono} onChange={e => setNuevoRep({...nuevoRep, telefono: e.target.value})} required />
                    </div>
                    <div className="form-grupo">
                      <label className="form-label">Vehículo</label>
                      <select className="form-input" value={nuevoRep.vehiculo} onChange={e => setNuevoRep({...nuevoRep, vehiculo: e.target.value})}>
                        <option value="moto">🏍️ Moto</option>
                        <option value="bicicleta">🚲 Bicicleta</option>
                        <option value="auto">🚗 Auto</option>
                        <option value="a pie">🚶 A pie</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className={loadingRep ? 'btn-loading' : 'btn-confirmar-rep'} disabled={loadingRep}>
                    {loadingRep ? 'Registrando...' : '✓ Registrar repartidor'}
                  </button>
                </form>
              </div>
            )}

            <div className="admin-tabla">
              <div className="tabla-header tabla-header-rep">
                <span>ID</span>
                <span>Nombre</span>
                <span>Teléfono</span>
                <span>Vehículo</span>
                <span>Estado</span>
              </div>
              {repartidores.length === 0 && <p className="tabla-vacio">No hay repartidores registrados</p>}
              {repartidores.map(r => (
                <div key={r.id} className="tabla-fila tabla-fila-rep">
                  <span className="tabla-id">#{r.id}</span>
                  <span className="tabla-celda">{r.nombre}</span>
                  <span className="tabla-celda">{r.telefono}</span>
                  <span className="tabla-celda">{r.vehiculo}</span>
                  <span className="tabla-estado" style={{
                    background: r.disponible ? '#F0FDF4' : '#FEF2F2',
                    color: r.disponible ? '#16A34A' : '#DC2626',
                    border: `1px solid ${r.disponible ? '#BBF7D0' : '#FECACA'}`
                  }}>
                    {r.disponible ? '✅ Disponible' : '🔴 Ocupado'}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Admin;