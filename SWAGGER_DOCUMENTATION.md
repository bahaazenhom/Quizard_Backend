# Quizard API Documentation

Complete Swagger/OpenAPI documentation has been successfully added to the Quizard Backend project.

## 📋 What Was Implemented

### 1. **Swagger Setup**
- ✅ Installed `swagger-jsdoc` and `swagger-ui-express`
- ✅ Created `src/config/swagger.config.js` with OpenAPI 3.0 specification
- ✅ Integrated Swagger UI at `/api-docs` endpoint
- ✅ Configured Bearer JWT authentication scheme
- ✅ Added reusable error response schemas

### 2. **Model Schemas Documented**
All Mongoose models have been documented with comprehensive Swagger schemas:
- ✅ **User** - User accounts, authentication, profiles
- ✅ **Group** - Course/learning groups
- ✅ **GroupMember** - Group membership records
- ✅ **Plan** - Subscription plans
- ✅ **Subscription** - User subscriptions
- ✅ **Module** - Learning modules within groups
- ✅ **Material** - Learning materials (PDF, video, links)

### 3. **API Endpoints Documented**

#### **Users** (`/api/v1/users`)
- `POST /register` - Register new user
- `GET /confirm-email/:userId` - Confirm email
- `POST /login` - User login
- `GET /` - Get current user profile
- `PUT /` - Update profile
- `PUT /email` - Update email
- `PUT /password` - Change password
- `PUT /photo` - Update profile photo
- `GET /stats` - Get user statistics
- `GET /search` - Search users (Admin only)
- `GET /:id` - Get user by ID (Admin only)

#### **Groups** (`/api/v1/groups`)
- `POST /` - Create new group
- `GET /` - Get all groups (Admin only)
- `GET /me` - Get current user's groups
- `GET /:id` - Get group by ID
- `POST /join` - Join group with invite code
- `PATCH /:id` - Update group
- `DELETE /:id` - Soft delete (archive) group
- `DELETE /:id/hard` - Permanently delete group
- `DELETE /:id/leave` - Leave group (students only)
- `PATCH /:id/restore` - Restore archived group

#### **Plans** (`/api/v1/plans`)
- `POST /` - Create subscription plan
- `GET /` - Get all plans
- `GET /:id` - Get plan by ID
- `PATCH /:id` - Update plan
- `DELETE /:id` - Delete plan

#### **Subscriptions** (`/api/v1/subscriptions`)
- `POST /checkout` - Create Stripe checkout session
- `GET /my-subscription` - Get current user's subscription

#### **Modules** (`/api/v1/modules`)
- `POST /:groupId` - Create module in group
- `GET /group/:groupId` - Get all modules in group
- `GET /:id` - Get module by ID
- `PATCH /:id` - Update module
- `DELETE /:id` - Delete module

#### **Materials** (`/api/v1/materials`)
- `POST /:moduleId` - Create material in module
- `GET /:id` - Get material by ID
- `PUT /:id` - Update material
- `DELETE /:moduleId/:id` - Delete material

## 🚀 How to Use

### Accessing Swagger Documentation

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Open Swagger UI in your browser:**
   ```
   http://localhost:3000/api-docs
   ```

3. **Test endpoints with authentication:**
   - Click the "Authorize" button at the top right
   - Enter your JWT token in the format: `Bearer <your-token>`
   - Click "Authorize" then "Close"
   - Now you can test protected endpoints

### Getting a JWT Token

1. Register or login via Swagger:
   - Use `POST /api/v1/users/register` to create an account
   - Use `POST /api/v1/users/login` to get a token
   - Copy the token from the response

## 📁 Files Modified/Created

### Created:
- `src/config/swagger.config.js` - Swagger configuration

### Modified:
- `src/app.js` - Added Swagger UI middleware and module/material routes
- `src/models/user.model.js` - Added Swagger schema documentation
- `src/models/group.model.js` - Added Swagger schema documentation
- `src/models/groupMember.model.js` - Added Swagger schema documentation
- `src/models/plan.model.js` - Added Swagger schema documentation
- `src/models/subscription.model.js` - Added Swagger schema documentation
- `src/models/module.model.js` - Added Swagger schema documentation
- `src/models/material.model.js` - Added Swagger schema documentation
- `src/modules/user/user.route.js` - Added endpoint documentation
- `src/modules/Group/group.route.js` - Added endpoint documentation
- `src/modules/plan/plan.router.js` - Added endpoint documentation
- `src/modules/subscription/subscription.route.js` - Added endpoint documentation
- `src/modules/Module/module.route.js` - Added endpoint documentation
- `src/modules/Material/material.route.js` - Added endpoint documentation

## 🎯 Features

- **Interactive API Testing** - Test all endpoints directly from browser
- **Bearer Authentication** - Built-in JWT token authentication
- **Request/Response Examples** - Clear examples for all endpoints
- **Schema Validation** - Complete data models with types and constraints
- **Error Responses** - Documented error codes and messages
- **Organized by Tags** - Endpoints grouped by resource type
- **No Topbar** - Clean UI without Swagger's default topbar

## 🔧 Configuration

The Swagger configuration includes:
- **OpenAPI Version:** 3.0.0
- **Servers:** Development (localhost:3000) and Production
- **Security:** Bearer JWT authentication
- **Tags:** Users, Groups, Modules, Materials, Plans, Subscriptions
- **Response Schemas:** Reusable error responses (401, 404, 400, 500)

## 📝 Next Steps

You can further enhance the documentation by:
1. Adding more detailed descriptions for complex endpoints
2. Including more request/response examples
3. Documenting query parameters for search/filter endpoints
4. Adding examples for webhook endpoints
5. Creating Postman collection export from Swagger

## 🐛 Troubleshooting

If Swagger UI doesn't load:
1. Ensure all dependencies are installed: `npm install`
2. Check that the server is running on the correct port
3. Verify no syntax errors in JSDoc comments
4. Check browser console for errors

## 📚 Resources

- [Swagger UI Documentation](https://swagger.io/docs/specification/about/)
- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc)
- [swagger-ui-express](https://github.com/scottie1984/swagger-ui-express)

---

✨ **All API endpoints are now fully documented and ready for testing!**
