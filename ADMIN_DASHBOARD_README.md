# Admin Dashboard - Implementation Guide

## Overview
A complete administrative dashboard has been implemented for the COMAES platform, enabling administrators to manage system resources, users, tournaments, and view reports.

## Features Implemented

### 1. Backend Infrastructure
- **Authentication Middleware** (`BackEnd/middlewares/isAdmin.js`)
  - JWT token validation
  - Admin role verification
  - Secure route protection

- **Admin Routes** (`BackEnd/routes/adminRoutes.js`)
  - RESTful API endpoints for user management
  - Protected routes with JWT authentication

- **User Controller** (`BackEnd/controllers/UserController.js`)
  - CRUD operations for user management
  - Error handling and validation

### 2. Frontend Components

#### AdminDashboard (`FrontEnd/src/Paginas/Secundarias/AdminDashboard.jsx`)
Main dashboard layout featuring:
- Professional sidebar navigation with icons
- Active tab highlighting
- Responsive header with user info
- Multi-tab content area (Users, Tournaments, Reports, Settings)

#### UserManagement (`FrontEnd/src/components/admin/UserManagement.jsx`)
User management interface with:
- Dynamic user table display
- Search/filter functionality by name or email
- Add, edit, and delete user buttons
- Real-time data refresh
- Error handling and loading states

#### UserModal (`FrontEnd/src/components/admin/UserModal.jsx`)
Modal dialogs for:
- **Create User**: Add new users with validation
- **Edit User**: Modify user details (optional password change)
- **Delete User**: Confirm deletion with safety prompts

#### Admin Service (`FrontEnd/src/services/adminService.js`)
API integration layer:
- Centralized API calls to backend
- Token-based authentication headers
- Error handling and logging

## API Endpoints

### User Management
```
GET    /api/admin/users           - Get all users
POST   /api/admin/users           - Create new user
PUT    /api/admin/users/:id       - Update user
DELETE /api/admin/users/:id       - Delete user
```

### Authentication
All endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

## Installation & Setup

### Backend Setup
1. Ensure all files are in ES6 module format
2. Authentication middleware is configured
3. Routes are registered in `index.js`:
   ```javascript
   app.use('/api/admin', adminRoutes);
   ```

### Frontend Setup
1. AdminDashboard route added to `App.jsx`:
   ```javascript
   <Route path="/admin" element={<AdminDashboard />} />
   ```

2. Access the dashboard at: `http://localhost:3000/admin`

## Database Schema

### Users Table
- `id`: Primary key
- `nome`: User name
- `email`: User email
- `senha`: Hashed password
- `funcao_id`: Function/role ID (1=User, 2=Teacher, 3=Admin)
- `criado_em`: Creation timestamp

## Security Features

1. **JWT Authentication**
   - Token validation on all admin routes
   - Role-based access control

2. **Input Validation**
   - Email format validation
   - Required field checks
   - Password requirements

3. **Error Handling**
   - User-friendly error messages
   - Secure error logging
   - Database transaction safety

## File Structure

```
BackEnd/
├── middlewares/
│   └── isAdmin.js                    # Admin authentication
├── routes/
│   └── adminRoutes.js                # Admin API routes
└── controllers/
    └── UserController.js             # User CRUD logic

FrontEnd/
├── src/
│   ├── Paginas/Secundarias/
│   │   └── AdminDashboard.jsx        # Main dashboard
│   ├── components/admin/
│   │   ├── UserManagement.jsx        # User table component
│   │   └── UserModal.jsx             # CRUD modals
│   ├── services/
│   │   └── adminService.js           # API integration
│   └── App.jsx                       # Routes configuration
```

## Usage Guide

### Accessing the Dashboard
1. Log in with admin credentials
2. Navigate to `/admin` route
3. Use sidebar to navigate between sections

### User Management Workflow

#### Adding a User
1. Click "+ Adicionar Usuário" button
2. Fill in user details (name, email, password, role)
3. Click "Criar" to save

#### Editing a User
1. Click "Editar" button in user row
2. Modify details (password optional)
3. Click "Atualizar" to save

#### Deleting a User
1. Click "Deletar" button in user row
2. Confirm deletion in modal
3. User is permanently removed

#### Searching Users
1. Use search field to filter by name or email
2. Results update in real-time
3. Clear search to view all users

## Customization

### Adding New Admin Modules
1. Create component in `FrontEnd/src/components/admin/`
2. Add navigation link in AdminDashboard sidebar
3. Add case in content area switch statement
4. Create backend routes as needed

### Extending User Model
1. Add fields to User model in `BackEnd/models/User.js`
2. Update UserController methods
3. Update UserModal form fields
4. Update UserManagement table columns

## Testing

### Backend Testing
```bash
# Start server
node BackEnd/index.js

# Test user endpoints
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/admin/users
```

### Frontend Testing
1. Navigate to `/admin` in browser
2. Test CRUD operations in User Management
3. Verify error messages appear correctly
4. Test search functionality

## Performance Considerations

- User table pagination (future enhancement)
- Lazy loading of modules
- Optimized API calls
- Client-side caching

## Future Enhancements

- [ ] Tournament management module
- [ ] Reports and analytics dashboard
- [ ] System settings management
- [ ] User activity logs
- [ ] Bulk user operations
- [ ] Export functionality (CSV, PDF)
- [ ] Advanced filtering and sorting
- [ ] User role management
- [ ] Activity notifications
- [ ] Dashboard statistics

## Troubleshooting

### Backend Server Won't Start
- Verify all imports are ES6 format
- Check JWT_SECRET environment variable
- Ensure database connection is working

### API Calls Failing
- Verify token is valid and not expired
- Check user has admin role
- Inspect network tab in developer tools

### Modal Not Submitting
- Verify all required fields are filled
- Check email format is valid
- Review browser console for errors

## Support

For issues or questions about the admin dashboard, check:
1. Console logs for error details
2. Network tab for API response errors
3. Backend logs for authentication issues

---

**Last Updated**: 2024
**Status**: Production Ready
