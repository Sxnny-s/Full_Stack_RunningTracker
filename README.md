# Workout Tracker App

A web-based application to track workouts and races. This app allows users to securely log in, register, add, view, and delete their workouts and race results.

## Features

- **Track Workouts**: Log details about your workouts (pace, distance) and view recent workouts.
- **Track Races**: Log race results including date, event, and time.
- **Authentication**: Secure login/logout with Passport.js and local strategy.
- **User Dashboard**: View total distance and recent activity in a user-friendly dashboard.
- **Responsive Design**: Works across mobile, tablet, and desktop devices.
- **Persistent Storage**: All data is saved in MongoDB for persistence.

## Technologies Used

- **Frontend**: EJS (Embedded JavaScript) for rendering views
- **Backend**: Node.js with Express
- **Database**: MongoDB (using Mongoose)
- **Authentication**: Passport.js for secure login
- **Session Management**: express-session for handling user sessions
- **Password Hashing**: bcrypt for password security

## Live Demo

Check out the live version of the app here: [APP](https://fullstack-run-production.up.railway.app/)

## Installation

### Prerequisites

Before you begin, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (or MongoDB Atlas for cloud database)

### Steps to Install

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Sxnny-s/Personal-auth-expense
   cd personal-auth-expence

2. **Install dependencies**:
   ```bash
    npm install


3. **Set up environment variables**:
   
      3a. Create a .env file in the root directory of the project.
    
      3b. Add your MongoDB connection string and other environment variables:
    
   ```env
   url=your_mongodb_connection_string
   SECRET_KEY=your_secret_key


5. **To run the app locally:**:
   ```bash
   npm start
