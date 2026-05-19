import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verPassword, setVerPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
      const rol = res.data.usuario.rol;
      navigate(rol === 'admin' ? '/admin' : '/pedidos');
    } catch (err) {
      setError('Email o contraseña incorrectos');
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
          <p className="login-tagline">Tu delivery más rápido.<br/>Donde quieras, cuando quieras.</p>
          <div className="login-features">
            <div className="login-feature"><span>🚀</span> Entrega en minutos</div>
            <div className="login-feature"><span>📍</span> Tracking en tiempo real</div>
            <div className="login-feature"><span>💳</span> Pago fácil y seguro</div>
          </div>
        </div>
      </div>
      <div className="login-right">
        <div className="login-card">
          <h2 className="login-titulo">¡Bienvenido a Zippi!</h2>
          <p className="login-subtitulo">Inicia sesión para hacer tu pedido</p>
          {error && <div className="login-error">{error}</div>}
          <form onSubmit={handleLogin}>
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
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
          <p className="login-link">
            ¿No tienes cuenta? <Link to="/registro">Regístrate gratis</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;