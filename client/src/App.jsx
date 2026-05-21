import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import Navbar from "./components/NavBar/NavBar"
import HomePage from "./pages/HomePage/HomePage"
import PlayersPage from "./pages/PlayersPage/PlayersPage"
import PlayerPage from "./pages/PlayerPage/PlayerPage"
import LoginPage from "./pages/LoginPage/LoginPage"
import TournamentsPage from "./pages/TournamentsPage/TournamentsPage"
import ProfilePage from "./pages/ProfilePage/ProfilePage"
import LiveChat from "./components/LiveChat/LiveChat"
import LeaderboardPage from "./pages/LeaderBoard/LeaderBoard"
import MatchesPage from "./pages/MatchesPage/MatchesPage"
import MatchDetailPage from "./pages/MatchDetailPage/MatchDetailPage"


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
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/matches/:id" element={<MatchDetailPage />} />
        </Routes>
        <LiveChat />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App