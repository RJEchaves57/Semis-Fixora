import type { Account } from "../../types";

// DEMO ACCOUNTS ONLY. Replace with real server-side authentication (e.g. your Laravel API).
export const accounts: Account[] = [
  {
    id: "u-maria",
    name: "Maria Santos",
    email: "user@fixora.edu",
    password: "user123",
    role: "user",
    title: "Teacher",
  },
  {
    id: "a-admin",
    name: "Admin User",
    email: "admin@fixora.edu",
    password: "admin123",
    role: "admin",
    title: "System administrator",
  },
  {
    id: "m-rafael",
    name: "Rafael Dela Cruz",
    email: "rafael@fixora.edu",
    password: "team123",
    role: "maintenance",
    title: "Electrical technician",
    specialty: "Electrical",
  },
  {
    id: "m-michelle",
    name: "Michelle Garcia",
    email: "michelle@fixora.edu",
    password: "team123",
    role: "maintenance",
    title: "Maintenance technician",
    specialty: "Plumbing",
  },
  {
    id: "m-james",
    name: "James Lim",
    email: "james@fixora.edu",
    password: "team123",
    role: "maintenance",
    title: "Facilities specialist",
    specialty: "HVAC",
  },
  {
    id: "m-andrea",
    name: "Andrea Perez",
    email: "andrea@fixora.edu",
    password: "team123",
    role: "maintenance",
    title: "General maintenance",
    specialty: "Carpentry",
  },
];

export const maintenanceStaff = accounts.filter(
  (a) => a.role === "maintenance",
);
