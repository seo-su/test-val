import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ChaptersPage from './pages/ChaptersPage';
import SynthesizePage from './pages/SynthesizePage';
import TemplatesPage from './pages/TemplatesPage';
import SessionsPage from './pages/SessionsPage';
import SessionEditorPage from './pages/SessionEditorPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="chapters" element={<ChaptersPage />} />
        <Route path="synthesize" element={<SynthesizePage />} />
        <Route path="templates" element={<TemplatesPage />} />
        <Route path="sessions" element={<SessionsPage />} />
        <Route path="sessions/:id" element={<SessionEditorPage />} />
      </Route>
    </Routes>
  );
}

export default App;
