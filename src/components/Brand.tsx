import { Wrench } from 'lucide-react';
export default function Brand({ sub = 'SCHOOL MAINTENANCE' }: { sub?: string }) {
  return <div className="brand"><span className="brand-mark"><Wrench size={20} /></span><span><b>FIXORA</b><small>{sub}</small></span></div>;
}
