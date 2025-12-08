import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { TripsPage } from './pages/trips/TripsPage';
import { TripDetailPage } from './pages/trips/TripDetailPage';
import { TripPrintPage } from './pages/trips/TripPrintPage';
import { SharePage } from './pages/share/SharePage';
import { ProfilePage } from './pages/profile/ProfilePage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/trips" replace />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />

          <Route path="/share/:publicId" element={<SharePage />} />

          <Route
            path="/trips"
            element={
              <ProtectedRoute>
                <TripsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips/:tripId"
            element={
              <ProtectedRoute>
                <TripDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips/:tripId/print"
            element={
              <ProtectedRoute>
                <TripPrintPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
