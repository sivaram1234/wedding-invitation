import { useEffect, useState } from 'react';
import Invitation from '../invitation/Invitation.jsx';
import { Loader } from './Home.jsx';

// Rendered inside the admin's iframe; receives the draft config via postMessage
// so the preview reflects real mobile/desktop breakpoints.
export default function Preview() {
  const [state, setState] = useState(null);

  useEffect(() => {
    const onMessage = (e) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === 'invitation-preview') {
        setState({ config: e.data.config, showCover: Boolean(e.data.showCover) });
      }
      if (e.data?.type === 'invitation-scroll') {
        const el = document.getElementById(e.data.id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('message', onMessage);
    window.parent?.postMessage({ type: 'invitation-preview-ready' }, window.location.origin);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  if (!state) return <Loader />;
  return <Invitation key={state.showCover ? 'cover' : 'open'} config={state.config} preview showCover={state.showCover} />;
}
