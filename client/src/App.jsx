import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import Navbar from "./components/Navbar/Navbar"
import HomePage from "./pages/HomePage/HomePage"
import PlayersPage from "./pages/PlayersPage/PlayersPage"
import PlayerPage from "./pages/PlayerPage/PlayerPage"
import LoginPage from "./pages/LoginPage/LoginPage"
import TournamentsPage from "./pages/TournamentsPage/TournamentsPage"
import ProfilePage from "./pages/ProfilePage/ProfilePage"
import LiveChat from "./components/LiveChat/LiveChat"
import LeaderboardPage from "./pages/LeaderBoard/LeaderBoard"


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/players/:id" element={<PlayerPage />} />
          <Route path="/tournaments" element={<TournamentsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Routes>
        <LiveChat />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App