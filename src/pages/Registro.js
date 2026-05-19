import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Registro() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegistro = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3000/api/auth/registro', {
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
    <div style={styles.container}>
      <div style={styles.left}>
        <div style={styles.brand}>
          <div style={styles.logo}>🚀</div>
          <h1 style={styles.brandName}>DeliveryApp</h1>
          <p style={styles.brandDesc}>Únete y empieza a recibir tus pedidos donde estés.</p>
        </div>
      </div>
      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.titulo}>Crear cuenta</h2>
          <p style={styles.subtitulo}>Regístrate gratis en segundos</p>
          {error && <div style={styles.error}>{error}</div>}
          <form onSubmit={handleRegistro}>
            <div style={styles.grupo}>
              <label style={styles.label}>Nombre completo</label>
              <input
                style={styles.input}
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                required
              />
            </div>
            <div style={styles.grupo}>
              <label style={styles.label}>Email</label>
              <input
                style={styles.input}
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div style={styles.grupo}>
              <label style={styles.label}>Contraseña</label>
              <input
                style={styles.input}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button style={loading ? styles.botonLoading : styles.boton} type="submit" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
          <p style={styles.link}>
            ¿Ya tienes cuenta? <Link to="/">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh' },
  left: { flex: 1, background: 'linear-gradient(135deg, #1a1d2e 0%, #16213e 50%, #0f3460 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' },
  brand: { textAlign: 'center' },
  logo: { fontSize: '64px', marginBottom: '20px' },
  brandName: { fontSize: '36px', fontWeight: '700', color: '#ffffff', marginBottom: '16px' },
  brandDesc: { fontSize: '16px', color: '#94a3b8', lineHeight: '1.7', maxWidth: '300px', margin: '0 auto' },
  right: { width: '480px', background: '#13151f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' },
  card: { width: '100%' },
  titulo: { fontSize: '28px', fontWeight: '700', color: '#f1f5f9', marginBottom: '8px' },
  subtitulo: { fontSize: '15px', color: '#64748b', marginBottom: '32px' },
  error: { background: '#2d1b1b', border: '1px solid #ef4444', color: '#fca5a5', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' },
  grupo: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '500', color: '#94a3b8', marginBottom: '8px' },
  input: { width: '100%', padding: '12px 16px', background: '#1e2130', border: '1px solid #2d3148', borderRadius: '8px', color: '#f1f5f9', fontSize: '15px', outline: 'none' },
  boton: { width: '100%', padding: '13px', background: 'linear-gradient(135deg, #6c63ff, #4f46e5)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', marginTop: '8px' },
  botonLoading: { width: '100%', padding: '13px', background: '#2d3148', color: '#64748b', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', marginTop: '8px' },
  link: { textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748b' }
};

export default Registro;