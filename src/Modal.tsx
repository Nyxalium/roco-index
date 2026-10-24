import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

export default function Modal({ children, className = '', labelledBy, onClose, closeLabel = 'Close dialog' }: { children: ReactNode; className?: string; labelledBy: string; onClose: () => void; closeLabel?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = overflow; if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, []);
  return <motion.dialog ref={ref} className={`modal ${className}`} aria-labelledby={labelledBy} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }} initial={{ opacity: 0, y: 14, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }}>
    <div className="modal-close-wrap"><button className="modal-close circle-button" aria-label={closeLabel} onClick={onClose}><X size={19} /></button></div>{children}
  </motion.dialog>;
}
