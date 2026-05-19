import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Pedidos from './pages/Pedidos';
import NuevoPedido from './pages/NuevoPedido';
import Tracking from './pages/Tracking';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/pedidos" element={<Pedidos />} />
        <Route path="/nuevo-pedido" element={<NuevoPedido />} />
        <Route path="/tracking/:id" element={<Tracking />} />
      </Routes>
    </Router>
  );
}

export default App;