import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-800">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}
