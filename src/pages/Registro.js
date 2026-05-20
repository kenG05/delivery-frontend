import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Registro.css';

function Registro() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegistro = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('https://tiptop-vocalist-scope.ngrok-free.dev/api/auth/registro', {
        nombre, email, password, rol: 'cliente'
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
      navigate('/pedidos');
    } catch (err) {
      setError('Error al registrarse, intenta de nuevo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-hero">
          <div className="login-logo-circle">⚡</div>
          <h1 className="login-brand">Zippi</h1>
          <p className="login-tagline">Únete y empieza a recibir<br/>tus pedidos donde estés.</p>
          <div className="login-features">
            <div className="login-feature"><span>🎁</span> Registro gratis</div>
            <div className="login-feature"><span>⚡</span> Pedidos en segundos</div>
            <div className="login-feature"><span>🔒</span> Datos seguros</div>
          </div>
        </div>
      </div>
      <div className="login-right">
        <div className="login-card">
          <h2 className="login-titulo">Crear cuenta en Zippi</h2>
          <p className="login-subtitulo">Regístrate gratis y empieza a pedir</p>
          {error && <div className="login-error">{error}</div>}
          <form onSubmit={handleRegistro}>
            <div className="form-grupo">
              <label className="form-label">Nombre completo</label>
              <input
                className="form-input"
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                required
              />
            </div>
            <div className="form-grupo">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-grupo">
              <label className="form-label">Contraseña</label>
              <div className="input-password-wrapper">
                <input
                  className="form-input"
                  type={verPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn-ver-password"
                  onClick={() => setVerPassword(!verPassword)}
                >
                  {verPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button className={loading ? 'btn-loading' : 'btn-primary'} type="submit" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>
          </form>
          <p className="login-link">
            ¿Ya tienes cuenta? <Link to="/">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Registro;
