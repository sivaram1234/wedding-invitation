import { useEffect, useState } from 'react';
import Invitation from '../invitation/Invitation.jsx';
import { loadConfig } from '../lib/store.js';

export default function Home() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    loadConfig().then(({ config }) => setConfig(config));
  }, []);

  if (!config) return <Loader />;
  return <Invitation config={config} />;
}

export function Loader() {
  return (
    <div className="boot" aria-label="Loading invitation">
      <span className="boot__ring" />
    </div>
  );
}
