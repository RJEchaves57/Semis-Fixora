# FIXORA — School Maintenance System

React + TypeScript + Vite front end with three separate role areas: **User**, **Admin** and **Maintenance Team**.

## Run locally
```bash
npm install
npm run dev
```
Checks: `npm run lint` · `npm run build`

## Demo accounts (frontend demo only)
| Role | Email | Password |
|---|---|---|
| User | user@fixora.edu | user123 |
| Admin | admin@fixora.edu | admin123 |
| Maintenance Team | rafael@fixora.edu (also michelle@, james@, andrea@) | team123 |

## Request workflow
1. **User** creates a request (photos + video are required).
2. **Admin** approves or declines (a reason is required to decline).
3. **Admin** assigns approved requests to a maintenance team member.
4. **Maintenance Team** starts work, then marks it resolved.
5. **User** tracks progress on their dashboard.

Only the User role can create requests; Admin and Maintenance have no "new request" action.

## Structure
```
src/
  context/      AuthContext.tsx, RequestsContext.tsx
  components/   Brand, ProtectedRoute, Badges, StatusTracker, RequestDetail
  data/         users.ts, requests.ts, constants.ts
  pages/
    Login.tsx
    admin/        AdminLayout, AdminDashboard, AdminRequests, AdminReviewModal, Sections
    user/         UserLayout, UserDashboard, MyRequests, NewRequest
    maintenance/  MaintenanceLayout, MaintenanceDashboard, MyTasks
  styles/       admin.css, admin-extra.css, shared.css, auth.css, user.css, maintenance.css
```

## Important
Accounts, requests and uploaded media live in the browser only (uploads reset on refresh). Route guards are
**not** real security. For the final capstone, move authentication, authorization and file storage to your backend
(e.g. Laravel) and have the API enforce who can approve, assign and create requests.

Upload limits are set at the top of `src/pages/user/NewRequest.tsx` (min 1 photo, max 6 photos at 5 MB, 1 video up to 50 MB).
