# AgriVet Connect 🐄🌱

## Smart Livestock Health and Farm Management System

AgriVet Connect is a web-based livestock management platform designed to help farmers manage their farms, livestock health, vaccination records, feed information, and connect with veterinary services through a centralized digital system.

The platform provides role-based access for **Farmers, Veterinarians, and Administrators**, ensuring secure and efficient livestock management.

---

## Features

### 👨‍🌾 Farmer Module

* User registration and secure login
* Farm management
* Livestock registration and management
* View livestock health history
* View vaccination records
* Feed information management
* Notification updates
* Government livestock scheme information
* Livestock insurance information
* Personal profile management

---

### 🩺 Veterinarian Module

* Secure veterinarian login
* View livestock directory
* Access livestock information for medical reference
* Create and manage health records
* Create and manage vaccination records
* View veterinarian profile and verification details

---

### 👨‍💼 Admin Module

* User management
* Veterinarian verification
* System monitoring
* Government scheme directory management
* Insurance information management
* Administrative profile management

---

## Main Modules

The system consists of the following modules:

1. User Management
2. Farm Management
3. Livestock Management
4. Health Management
5. Vaccination Management
6. Veterinarian Management
7. Feed Management
8. Notifications
9. Government Schemes Directory
10. Livestock Insurance Directory

---

## Technology Stack

### Frontend

* React.js
* Tailwind CSS
* JavaScript
* Axios
* Vite

### Backend

* Node.js
* Express.js
* REST API

### Database

* MySQL

### Security

* JWT Authentication
* Role-Based Authorization
* Protected API Routes

### Development Tools

* VS Code
* Git
* GitHub
* Postman

---

## System Architecture

```
User
 |
 | HTTPS Requests
 |
React Frontend
 |
 | REST API
 |
Express.js Backend
 |
 |
MySQL Database
```

---

## Role-Based Access Control

### Farmer

Can:

* Manage farms
* Manage livestock
* View health and vaccination information
* Access scheme and insurance information

Cannot:

* Create veterinary health records
* Manage vaccination records

---

### Veterinarian

Can:

* View livestock records
* Create health records
* Manage vaccination records

Cannot:

* Manage farms
* Perform farmer operations

---

### Admin

Can:

* Manage users
* Verify veterinarians
* Monitor system data

---

## Government Schemes & Insurance Directory

AgriVet Connect provides informational access to:

* Government livestock schemes
* Livestock insurance providers
* Eligibility information
* Coverage details
* Official portal links

The platform provides guidance information and redirects users to official authorities for applications and services.

---

## Database Design

Main entities include:

* Users
* Roles
* Farms
* Livestock
* Health Records
* Vaccinations
* Veterinarian Verification
* Feed Records
* Notifications

Relationships are maintained using relational database design and foreign key constraints.

---

## Installation Guide

### Clone Repository

```bash
git clone <repository-url>
cd AgriVet-Connect
```

---

## Backend Setup

Navigate to backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create `.env` file:

```
PORT=5000
DB_HOST=localhost
DB_USER=<your_mysql_username>
DB_PASSWORD=<your_mysql_password>
DB_NAME=smart_livestock_db
JWT_SECRET=<your_secret_key>
```

Start backend:

```bash
npm start
```

---

## Frontend Setup

Navigate to frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run application:

```bash
npm run dev
```

---

## Testing

Completed testing includes:

* Authentication testing
* Role authorization testing
* Livestock management testing
* Health record testing
* Vaccination testing
* Government scheme directory testing
* Insurance directory testing
* Profile module testing
* UI role restriction testing

Quality checks:

* Frontend ESLint: Passed
* Production Build: Passed
* Backend API verification: Passed

---

## Future Enhancements

Possible future improvements:

* Mobile application support
* AI-based livestock disease prediction
* IoT-based animal health monitoring
* Advanced analytics dashboard
* Digital veterinary consultation

---

## Project Information

**Project Name:** AgriVet Connect

**Project Type:** MCA Final Year Project

**Purpose:** Digital livestock health and farm management platform

**Developed Using:** React.js, Node.js, Express.js, MySQL
