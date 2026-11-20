export type Role = 'user' | 'admin' | 'maintenance';
export type Status = 'Pending' | 'Approved' | 'Declined' | 'Assigned' | 'In Progress' | 'Resolved';
export type Priority = 'Low' | 'Medium' | 'High';
export type Media = { name: string; url: string; key?: string; file?: File };

export type Account = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  title: string;
  specialty?: string;
};
export type Session = Omit<Account, 'password'>;

export type RequestItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  requesterId: string;
  requester: string;
  date: string;
  priority: Priority;
  status: Status;
  assigneeId?: string;
  assignee: string;
  images: Media[];
  video?: Media;
  declineReason?: string;
};
