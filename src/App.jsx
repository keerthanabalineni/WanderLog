import { Navigate, Route, Routes } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import AuthPage from "./components/AuthPage";
import ExplorePage from "./components/ExplorePage";
import CountryDetail from "./components/CountryDetail";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/country/:code" element={<CountryDetail />} />
        </Route>
        <Route path="/" element={<Navigate to="/explore" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppProvider>
  );
}

export default App;
