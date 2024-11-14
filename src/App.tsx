import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import ExperienceDetailPage from './pages/ExperienceDetailPage';
import CreateExperiencePage from './pages/CreateExperiencePage';
import EditExperiencePage from './pages/EditExperiencePage';
import ProfilePage from './pages/ProfilePage';
import HostProfilePage from './pages/HostProfilePage';
import MessagesPage from './pages/MessagesPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="experience/:id" element={<ExperienceDetailPage />} />
          <Route path="create-experience" element={<CreateExperiencePage />} />
          <Route path="edit-experience/:id" element={<EditExperiencePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="host/:hostId" element={<HostProfilePage />} />
          <Route path="messages" element={<MessagesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;