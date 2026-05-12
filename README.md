# ResidentPro - Smart Residential Governance System for Gated Communities

## Project Overview

ResidentPro is a smart web-based residential governance system designed to digitally manage the daily operations of gated communities. It provides a centralized platform where residents, administrators, and workers can interact efficiently for complaint management, worker allocation, billing, visitor management, voting, announcements, and community coordination.

The main goal of this project is to replace manual community management methods such as WhatsApp groups, phone calls, and paper-based tracking with a structured, transparent, and intelligent digital workflow.

ResidentPro also uses Natural Language Processing (NLP) to validate complaint categories, detect duplicate or repeated issues, identify community-level problems, and prioritize urgent cases.

## Tech Stack

### Frontend

- React.js
- HTML5
- CSS3
- JavaScript

### Backend

- Node.js
- Express.js

### AI Service

- Python
- FastAPI
- Natural Language Processing (NLP)

### Database

- MySQL

## Key Features

### Resident Features

- Resident registration and login
- Raise personal or community complaints
- Track complaint status and progress
- View assigned worker details
- Receive real-time notifications
- View community announcements and events
- Participate in community voting
- View billing and payment details

### Admin Features

- Admin login and dashboard
- Manage residents and workers
- View and monitor all complaints
- Assign complaints to workers
- Track complaint status and resolution progress
- Manage visitor details
- Create community announcements and events
- Create and manage voting polls
- Monitor analytics through dashboard
- Handle billing and payment records

### Worker Features

- Worker login and dashboard
- View assigned complaints
- Accept assigned work
- Propose arrival time
- Update work progress
- Submit billing details after completion
- Close resolved complaints

### Intelligent Features

- NLP-based complaint category validation
- Duplicate complaint detection
- Community-level issue identification
- Priority detection for urgent complaints
- Smart worker allocation based on issue type and availability
- Real-time notifications for important updates

## Application Flow

- Resident logs into the system
- Resident raises a new complaint as a personal issue or community issue
- Complaint details are stored in the database
- NLP service validates the complaint category and checks for repeated issues
- System identifies priority and issue type
- Admin views and manages the complaint
- Worker is assigned based on the complaint category
- Worker accepts the task and updates the progress
- Billing details are generated after work completion
- Resident and admin can track the status until the complaint is resolved

## Project Structure

### Frontend

- React components for login, dashboard, complaint creation, complaint tracking, billing, voting, visitor management, and notifications
- Role-based UI for Admin, Resident, and Worker
- API integration with backend services
- Form validation and UI state handling
- Dashboard charts and analytics view

### Backend

- REST APIs for user authentication and role-based access
- Complaint management APIs
- Worker allocation logic
- Billing and payment handling APIs
- Visitor management APIs
- Voting and announcement management APIs
- Database interaction using MySQL

### AI / NLP Service

- Complaint category validation
- Duplicate complaint detection
- Priority identification
- Community issue detection
- Keyword-based emergency identification
- NLP-based similarity checking

### Database

- User details
- Resident details
- Worker details
- Complaint records
- Billing records
- Voting logs
- Visitor logs
- Community events
- Payment transaction records

## Main Modules

- Login and Authentication Module
- Complaint Management Module
- NLP Processing Module
- Worker Allocation Module
- Billing Module
- Payment Handling Module
- Visitor Management Module
- Notification Module
- Events and Announcement Module
- Voting System Module
- Dashboard and Analytics Module
- Cancellation Management Module
- Community Issue Detection Module

## Testing

- Backend APIs tested using Postman
- Frontend tested by validating role-based login and user flow
- Complaint creation and status tracking tested through UI
- NLP-based complaint validation tested with different complaint inputs
- Worker assignment and billing flow tested using sample records
- Dashboard data verified with database records

## How to Run the Project

### Frontend

- Navigate to the frontend folder
- Install dependencies using npm install
- Start the application using npm start

### Backend

- Navigate to the backend folder
- Install dependencies using npm install
- Configure database connection details
- Start the backend server using npm start

### AI Service

- Navigate to the AI service folder
- Install required Python packages
- Run the FastAPI server
- Ensure the backend is connected to the AI service API

### Database

- Create a MySQL database
- Import or create the required tables
- Update database credentials in the backend configuration file

## Conclusion

ResidentPro helped us design a practical and intelligent residential governance system for gated communities. The project improves complaint handling, worker coordination, billing, visitor management, notifications, voting, and community-level decision-making.

It also enhanced our understanding of full-stack development, role-based access control, database management, API integration, NLP-based automation, and real-world residential community problem solving.
