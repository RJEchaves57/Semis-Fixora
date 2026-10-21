export const categories = ['Electrical', 'Plumbing', 'Carpentry', 'IT Equipment', 'Furniture', 'HVAC', 'Cleaning', 'Building & Safety', 'Other'];
export const roleLabel = { user: 'User', admin: 'Admin', maintenance: 'Maintenance Team' } as const;
export const roleHome = { user: '/user', admin: '/admin', maintenance: '/maintenance' } as const;
export const todayLabel = () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
export const initials = (name: string) => name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
