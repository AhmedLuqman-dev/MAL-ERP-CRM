# MAL ERP/CRM

MAL ERP/CRM is a full-stack Enterprise Resource Planning and Customer Relationship Management application built using React, Express.js, Node.js, Tailwind CSS, and Supabase.

## Features

- **JWT Authentication** with role-based access control (Admin, Sales, Warehouse, Accounts)
- **Customer CRM** — manage customers, search, filter, follow-up notes
- **Product & Inventory** — product catalog, stock movement logs, low-stock alerts
- **Sales Challans** — create delivery challans with product snapshots, auto-generated challan numbers, stock reduction on confirmation

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Tailwind CSS, React Router, Axios, React Hook Form |
| Backend | Node.js, Express.js, JavaScript |
| Database | Supabase PostgreSQL |
| Auth | JWT (bcrypt password hashing) |

## Project Structure

```
.
├── client/ (src/)          # Frontend React application
│   ├── components/          # Reusable UI components
│   ├── constants/           # App constants and config
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Route pages
│   ├── services/            # API service layer (Axios)
│   └── utils/               # Utility functions
├── server/                  # Backend Express application
│   └── src/
│       ├── config/          # App config, Supabase client, constants
│       ├── controllers/     # Route controllers
│       ├── middleware/       # Auth, validation, error handling
│       ├── routes/           # Express routes
│       ├── services/         # Business logic services
│       ├── utils/            # Error classes, helpers
│       └── validators/       # Express-validator schemas
├── postman/                 # Postman collection
└── README.md
```

## Prerequisites

- Node.js 18+
- npm or yarn
- A Supabase project (or use the pre-configured one)

## Installation

### 1. Clone and install dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Environment Variables

#### Frontend (`.env` in project root)

```env
VITE_API_URL=http://localhost:5000/api
```

#### Backend (`server/.env`)

```env
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
CLIENT_URL=http://localhost:5173
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 3. Supabase Setup

The database schema is automatically created via Supabase migrations. The tables created are:

- **users** — Application users with roles
- **customers** — Customer CRM records
- **follow_up_notes** — Customer follow-up notes
- **products** — Product inventory
- **stock_movements** — Stock movement logs
- **sales_challans** — Sales challan records
- **sales_challan_items** — Individual challan line items with product snapshots

Seed users are automatically inserted:

| Email | Password | Role |
|-------|----------|------|
| admin@erp.com | password123 | admin |
| sales@erp.com | password123 | sales |
| warehouse@erp.com | password123 | warehouse |
| accounts@erp.com | password123 | accounts |

## Running the Application

### Development

```bash
# Terminal 1: Start the backend
cd server
npm run dev

# Terminal 2: Start the frontend
npm run dev
```

JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

5. Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm run dev
```

4. Open `http://localhost:5173` in your browser.

## API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with email and password |
| GET | `/api/auth/me` | Get current user profile |

### Customers (CRM)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/customers` | List customers (pagination, search, filter) | Admin, Sales, Accounts |
| GET | `/api/customers/:id` | Get customer details | Admin, Sales, Accounts |
| POST | `/api/customers` | Create new customer | Admin, Sales |
| PUT | `/api/customers/:id` | Update customer | Admin, Sales |
| DELETE | `/api/customers/:id` | Delete customer | Admin |
| POST | `/api/customers/:id/notes` | Add follow-up note | Admin, Sales |
| GET | `/api/customers/:id/notes` | Get customer notes | Admin, Sales, Accounts |

### Products & Inventory
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/products` | List products (pagination, low stock filter) | Admin, Warehouse |
| GET | `/api/products/:id` | Get product details | Admin, Warehouse |
| POST | `/api/products` | Create product | Admin, Warehouse |
| PUT | `/api/products/:id` | Update product | Admin, Warehouse |
| DELETE | `/api/products/:id` | Delete product | Admin |
| GET | `/api/products/inventory/movements` | List stock movements | Admin, Warehouse |
| POST | `/api/products/inventory/movements`| Log stock movement (IN/OUT) | Admin, Warehouse |

### Sales Challans
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/challans` | List challans (pagination, search, filter) | Authenticated |
| GET | `/api/challans/:id` | Get challan details with items | Authenticated |
| POST | `/api/challans` | Create challan (draft) | Admin, Sales, Accounts |
| PATCH | `/api/challans/:id/status` | Update challan status (confirm/cancel) | Admin, Sales, Accounts |

## Deployment

### Frontend (Vercel / Netlify)

1. Set `VITE_API_URL` to your backend URL
2. Build command: `npm run build`
3. Output directory: `dist`

### Backend (Render / Railway / Fly.io)

1. Set all environment variables from `server/.env.example`
2. Start command: `npm start`
3. Health check: `/api/health`

### Database (Supabase)

The Supabase project is pre-provisioned. The schema and seed data are applied via migrations.

## Postman Collection

Import the collection from `postman/Enterprise ERP.postman_collection.json` to test all API endpoints.

## License

MIT
