import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Home } from '@/pages/Home';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { CompleteProfile } from '@/pages/CompleteProfile';
import { Explore } from '@/pages/Explore';
import { Publicar } from '@/pages/Publicar';
import { ObjetoDetail } from '@/pages/ObjetoDetail';
import { Ofertas } from '@/pages/Ofertas';
import { Perfil } from '@/pages/Perfil';
import { MisObjetos } from '@/pages/MisObjetos';
import { RecuperarPassword } from '@/pages/RecuperarPassword';
import { Chat } from '@/pages/Chat';
import { NotFound } from '@/pages/NotFound';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth routes without layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/completar-perfil" element={<CompleteProfile />} />
          <Route path="/recuperar-password" element={<RecuperarPassword />} />
          
          {/* Routes with layout */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/explorar" element={<Layout><Explore /></Layout>} />
          <Route path="/publicar" element={<Layout><Publicar /></Layout>} />
          <Route path="/objeto/:id" element={<Layout><ObjetoDetail /></Layout>} />
          <Route path="/ofertas" element={<Layout><Ofertas /></Layout>} />
          <Route path="/perfil" element={<Layout><Perfil /></Layout>} />
          <Route path="/mis-objetos" element={<Layout><MisObjetos /></Layout>} />
          <Route path="/chat/:ofertaId" element={<Layout><Chat /></Layout>} />
          
          {/* 404 */}
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
