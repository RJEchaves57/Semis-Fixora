export type Status = 'Pending' | 'In Progress' | 'Resolved' | 'Urgent';
export type RequestItem = { id: string; title: string; category: string; location: string; requester: string; date: string; priority: 'Low' | 'Medium' | 'High'; status: Status; assignee: string };
