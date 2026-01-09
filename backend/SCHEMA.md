# ProLink Database Schema

This document describes the database schema for the ProLink application. All collections are stored in MongoDB and defined using Mongoose schemas.

## Collections Overview

### 1. Statistics Collection
Stores company statistics and metrics displayed on the home page.

**Fields:**
- `_id` (ObjectId) - Unique identifier
- `label` (String, required) - Display name (e.g., "Inception", "Zambian Owned")
- `value` (String, required) - Statistical value (e.g., "Est. 2023", "100%")
- `description` (String, required) - Description of the statistic
- `category` (String, enum: ['company', 'service', 'achievement'], required) - Category for grouping
- `order` (Number, default: 0) - Display order
- `createdAt` (Date, default: Date.now) - Creation timestamp
- `updatedAt` (Date, default: Date.now) - Last update timestamp

**Example Document:**
```json
{
  "_id": "60f7b3b3c3d9a40015a1f3a1",
  "label": "Inception",
  "value": "Est. 2023",
  "description": "Company founded",
  "category": "company",
  "order": 1,
  "createdAt": "2023-07-21T10:30:00.000Z",
  "updatedAt": "2023-07-21T10:30:00.000Z"
}
```

### 2. Cargos Collection
Stores information about cargo commodities the company transports.

**Fields:**
- `_id` (ObjectId) - Unique identifier
- `name` (String, required, unique) - Cargo commodity name (e.g., "Wheat", "Cement")
- `description` (String, optional) - Detailed description
- `category` (String, optional) - Cargo category (e.g., "Agricultural", "Construction")
- `isActive` (Boolean, default: true) - Whether cargo type is currently offered
- `order` (Number, default: 0) - Display order
- `createdAt` (Date, default: Date.now) - Creation timestamp
- `updatedAt` (Date, default: Date.now) - Last update timestamp

**Example Document:**
```json
{
  "_id": "60f7b3b3c3d9a40015a1f3a2",
  "name": "Wheat",
  "description": "Premium quality wheat for food processing",
  "category": "Agricultural",
  "isActive": true,
  "order": 1,
  "createdAt": "2023-07-21T10:30:00.000Z",
  "updatedAt": "2023-07-21T10:30:00.000Z"
}
```

### 3. Features Collection
Stores company features, values, and services displayed on the home page.

**Fields:**
- `_id` (ObjectId) - Unique identifier
- `title` (String, required) - Feature title (e.g., "Integrity", "Excellence")
- `description` (String, required) - Detailed description of the feature
- `icon` (String, optional) - Icon identifier for display
- `category` (String, enum: ['core-value', 'service', 'benefit'], default: 'core-value') - Feature category
- `isActive` (Boolean, default: true) - Whether feature is currently displayed
- `order` (Number, default: 0) - Display order
- `createdAt` (Date, default: Date.now) - Creation timestamp
- `updatedAt` (Date, default: Date.now) - Last update timestamp

**Example Document:**
```json
{
  "_id": "60f7b3b3c3d9a40015a1f3a3",
  "title": "Integrity",
  "description": "We operate with absolute transparency and honesty, ensuring every transaction is authentic and accountable.",
  "icon": "Shield",
  "category": "core-value",
  "isActive": true,
  "order": 1,
  "createdAt": "2023-07-21T10:30:00.000Z",
  "updatedAt": "2023-07-21T10:30:00.000Z"
}
```

### 4. Users Collection
Stores user information (already existed in the application).

**Fields:**
- `_id` (ObjectId) - Unique identifier
- `name` (String, required) - User's full name
- `email` (String, required, unique) - Email address
- `password` (String, required) - Hashed password
- `role` (String, enum: ['driver', 'owner', 'broker'], default: 'owner') - User role
- `status` (String, enum: ['available', 'busy', 'offline'], default: 'offline') - Driver status
- `vehicleType` (String, optional) - Vehicle type
- `vehiclePlate` (String, optional) - Vehicle plate number
- `vehicleModel` (String, optional) - Vehicle model
- `vehicleCategory` (String, optional) - Vehicle category
- `trailerPlate` (String, optional) - Trailer plate number
- `currentLocation` (String, optional) - Current location
- `phone` (String, optional) - Phone number
- `isApproved` (Boolean, default: false) - Approval status
- `createdAt` (Date, default: Date.now) - Creation timestamp

### 5. Conversations Collection
Stores conversation information between users (already existed).

### 6. Messages Collection
Stores individual messages within conversations (already existed).

## Relationships

- **Users** can have multiple **Conversations**
- **Conversations** contain multiple **Messages**
- **Users** can send multiple **Messages**
- **Statistics**, **Cargos**, and **Features** are independent collections used for content management

## API Endpoints

### Statistics
- `GET /api/statistics` - Get all active statistics
- `GET /api/statistics/:id` - Get statistic by ID
- `POST /api/statistics` - Create a new statistic
- `PUT /api/statistics/:id` - Update a statistic
- `DELETE /api/statistics/:id` - Delete a statistic

### Cargos
- `GET /api/cargos` - Get all active cargos
- `GET /api/cargos/:id` - Get cargo by ID
- `POST /api/cargos` - Create a new cargo
- `PUT /api/cargos/:id` - Update a cargo
- `DELETE /api/cargos/:id` - Delete a cargo

### Features
- `GET /api/features` - Get all active features
- `GET /api/features/:id` - Get feature by ID
- `POST /api/features` - Create a new feature
- `PUT /api/features/:id` - Update a feature
- `DELETE /api/features/:id` - Delete a feature

## Data Persistence

All data is persisted in MongoDB Atlas cloud database. The application uses Mongoose ODM to interact with the database, ensuring data validation and proper schema enforcement.