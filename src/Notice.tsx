import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { Check, X } from 'lucide-react';

export default function Notice({ notice, aboveTray, onDismiss }: { notice: { text: string; error?: boolean }; aboveTray: boolean; onDismiss: () => void }) {
  const [target, setTarget] = useState<Element>(document.body);
  useEffect(() => {
    const update = () => setTarget([...document.querySelectorAll('dialog[open]')].at(-1) || document.body);
    update();
    // Native modal dialogs make the rest of the document inert. Keep notices
    // inside the active dialog so feedback remains visible and accessible.
    const observer = new MutationObserver(update);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['open'] });
    return () => observer.disconnect();
  }, []);
  return createPortal(<motion.div className={`toast ${notice.error ? 'toast-error' : ''} ${aboveTray && target === document.body ? 'toast-above-tray' : ''}`} role={notice.error ? 'alert' : 'status'} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 14 }}>{notice.error ? <span>!</span> : <Check size={18} />}<span>{notice.text}</span><button onClick={onDismiss} aria-label="Dismiss message"><X size={16} /></button></motion.div>, target);
}
