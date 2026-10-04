import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Preview from './pages/Preview.jsx';

// The editor is only needed by the couple, so guests never download it.
const Admin = lazy(() => import('./admin/Admin.jsx'));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/preview" element={<Preview />} />
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<div className="boot" />}>
              <Admin />
            </Suspense>
          }
        />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
