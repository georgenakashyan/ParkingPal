# ParkingPal

A web-based parking management system that connects customers looking for parking spots with garage owners/managers.

## Overview

ParkingPal is a Firebase-hosted web application that allows customers to find and reserve parking spots in nearby garages. The platform features separate interfaces for customers searching for parking and managers overseeing their parking facilities.

## Features

### Customer Features
- **Interactive Map**: Find parking garages using Google Maps integration
- **Vehicle Management**: Add and manage multiple vehicles
- **Spot Reservation**: Reserve parking spots with date/time selection
- **Payment Integration**: Manage billing information and payment methods
- **Real-time Search**: Filter garages by vehicle type, spot availability, price, and location

### Manager Features
- **Garage Management**: Oversee multiple parking facilities
- **Reservation Tracking**: View and manage customer reservations
- **Billing Management**: Handle payment processing and billing information
- **Real-time Updates**: Monitor garage capacity and availability

### Authentication
- Email/password login
- Google Sign-In integration
- Password reset functionality
- Account setup and profile management

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Hosting)
- **Maps**: Google Maps API
- **Build Tools**: Node.js, npm

## Project Structure

```
ParkingPal/
├── public/
│   ├── images/
│   │   └── ParkingPal.png          # App logo
│   ├── 404.html                    # Error page
│   ├── Authentication.js           # Auth handling
│   ├── CustomerView.html           # Customer dashboard
│   ├── CustomerView.js             # Customer functionality
│   ├── Firebase.js                 # Firebase configuration
│   ├── ManagerView.html            # Manager dashboard
│   ├── ManagerView.js              # Manager functionality
│   ├── Reservation.js              # Reservation logic
│   ├── SettingsPage.js             # Settings functionality
│   ├── SignUp.html                 # Registration page
│   ├── index.html                  # Login page
│   ├── app.js                      # Main app logic
│   ├── output.css                  # Compiled Tailwind CSS
│   └── style.css                   # Custom styles
├── firebase.json                   # Firebase configuration
├── package.json                    # Dependencies
└── tailwind.config.js              # Tailwind configuration
```

## Setup and Installation

### Prerequisites
- Node.js and npm
- Firebase CLI
- Google Maps API key
- Firebase project with Authentication and Firestore enabled

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ParkingPal
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Create a Firebase project
   - Enable Authentication (Email/Password and Google)
   - Set up Firestore database
   - Update Firebase configuration in `Firebase.js`

4. Set up Google Maps:
   - Obtain a Google Maps API key
   - Enable Maps JavaScript API and Geocoding API
   - Add the API key to your HTML files

5. Build CSS (if modifying styles):
```bash
npx tailwindcss -i ./public/style.css -o ./public/output.css --watch
```

### Development

1. Start Firebase emulator (optional):
```bash
firebase emulators:start
```

2. Serve the application:
```bash
firebase serve
```

3. Open your browser to `http://localhost:5000`

### Deployment

Deploy to Firebase Hosting:
```bash
firebase deploy
```

## Database Schema

### Collections
- **Account**: User profile information
- **Manager**: Manager-specific data and garage associations  
- **Garage**: Parking facility details and availability
- **Reservations**: Booking information and status

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and support, please create an issue in the repository or contact the development team.
