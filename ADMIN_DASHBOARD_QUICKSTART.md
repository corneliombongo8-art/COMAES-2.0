# Quick Start Guide - Admin Dashboard

## Prerequisites
- Node.js installed
- Database configured and running
- Backend and Frontend dependencies installed

## Getting Started

### 1. Start Backend Server
```bash
cd BackEnd
node index.js
```

Expected output:
```
✅ Modelos sincronizados!
🚀 Servidor rodando: http://localhost:3000
```

### 2. Start Frontend Development Server
```bash
cd FrontEnd
npm run dev
```

### 3. Access Admin Dashboard
- Open browser and navigate to: `http://localhost:5173/admin` (or your frontend port)
- Ensure you're logged in with admin credentials

## Key Components

### Backend Routes
- **Base URL**: `http://localhost:3000/api/admin`
- **Authentication**: JWT Bearer token required

### Frontend Pages
- **Admin Dashboard**: `/admin`
- **User Management**: Integrated in dashboard

## API Examples

### Get All Users
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/admin/users
```

### Create User
```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@example.com",
    "senha": "Senha123!",
    "funcao_id": 1
  }' \
  http://localhost:3000/api/admin/users
```

### Update User
```bash
curl -X PUT -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva Updated",
    "email": "joao.updated@example.com"
  }' \
  http://localhost:3000/api/admin/users/1
```

### Delete User
```bash
curl -X DELETE -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/admin/users/1
```

## File Locations

| File | Purpose |
|------|---------|
| `BackEnd/middlewares/isAdmin.js` | JWT authentication middleware |
| `BackEnd/routes/adminRoutes.js` | API route definitions |
| `BackEnd/controllers/UserController.js` | User business logic |
| `FrontEnd/src/Paginas/Secundarias/AdminDashboard.jsx` | Main dashboard page |
| `FrontEnd/src/components/admin/UserManagement.jsx` | User table component |
| `FrontEnd/src/components/admin/UserModal.jsx` | CRUD modals |
| `FrontEnd/src/services/adminService.js` | API client |
| `FrontEnd/src/App.jsx` | Route configuration |

## Common Tasks

### View All Users
1. Navigate to `/admin`
2. Select "Usuários" from sidebar
3. View table of all users

### Add New User
1. Click "+ Adicionar Usuário"
2. Fill form with user details
3. Select user role/function
4. Click "Criar"

### Search Users
1. In user table, use search field
2. Type name or email
3. Results filter in real-time

### Edit User
1. Find user in table
2. Click "Editar" button
3. Modify details (password optional)
4. Click "Atualizar"

### Delete User
1. Find user in table
2. Click "Deletar" button
3. Confirm deletion
4. User removed from system

## Environment Variables

Required in `.env` file:
```
JWT_SECRET=your_secret_key_here
DB_NAME=comaes_db
DB_USER=root
DB_PASSWORD=password
DB_HOST=localhost
PORT=3000
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Token não fornecido" | Check JWT token in localStorage |
| "Acesso negado" | Verify user has admin role |
| API calls failing | Check backend server is running |
| Components not loading | Verify all imports are correct |

## Next Steps

After setup, you can:
1. Create additional admin modules
2. Customize user fields
3. Add tournament management
4. Implement analytics dashboard
5. Set up user activity logging

## Support Resources

- Backend documentation: See `BackEnd/` folder
- Frontend documentation: See `FrontEnd/` folder
- Full docs: `ADMIN_DASHBOARD_README.md`

---

Ready to manage your platform! 🚀
