import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Simulator from './pages/Simulator';
import ResourceGraph from './pages/ResourceGraph';
import DetectionEngine from './pages/DetectionEngine';
import RecoveryCenter from './pages/RecoveryCenter';
import Analytics from './pages/Analytics';
import ChallengeMode from './pages/ChallengeMode';
import LearningCenter from './pages/LearningCenter';
import About from './pages/About';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/graph" element={<ResourceGraph />} />
          <Route path="/detection" element={<DetectionEngine />} />
          <Route path="/recovery" element={<RecoveryCenter />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/challenge" element={<ChallengeMode />} />
          <Route path="/learning" element={<LearningCenter />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
