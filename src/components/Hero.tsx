import { useEffect, useState } from 'react';

// This is the ONLY component shipped as JS to the browser (an Astro "island").
// It types out a rotating list of roles with a blinking terminal cursor.
const ROLES = ['developer', 'builder', 'tinkerer', 'human'];

export default function Hero({ name = 'bwubbu' }: { name?: string }) {
  const [roleIndex, setRoleIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const full = ROLES[roleIndex];
    const atFull = text === full;
    const atEmpty = text === '';

    let delay = deleting ? 45 : 90;
    if (atFull && !deleting) delay = 1400;   // pause on full word
    if (atEmpty && deleting) delay = 300;

    const t = setTimeout(() => {
      if (!deleting && atFull) {
        setDeleting(true);
      } else if (deleting && atEmpty) {
        setDeleting(false);
        setRoleIndex((i) => (i + 1) % ROLES.length);
      } else {
        setText(full.slice(0, text.length + (deleting ? -1 : 1)));
      }
    }, delay);

    return () => clearTimeout(t);
  }, [text, deleting, roleIndex]);

  return (
    <div className="border border-edge bg-panel p-6 md:p-10">
      <p className="font-mono text-dim text-sm mb-4">
        <span className="text-neon">$</span> whoami
      </p>
      <h1 className="font-pixel text-cyan text-2xl md:text-4xl leading-relaxed">
        {name}
      </h1>
      <p className="font-pixel text-magenta text-sm md:text-base mt-6">
        &gt; a {text}
        <span className="inline-block w-3 bg-magenta ml-1 animate-blink">&nbsp;</span>
      </p>
    </div>
  );
}
