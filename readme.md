## Introduction

Welcome to **Event-lify**, your ultimate solution for seamless event management. Whether you're organizing a small meetup, a large conference, or anything in between, EventsManager provides a robust platform to handle all your event needs. Our goal is to simplify the process of creating, managing, and participating in events, making it a breeze for both organizers and attendees.

## Key Features

### User Authentication
- Secure signup, login, and logout functionalities.
- JWT-based authentication for secure and scalable user sessions.

### Event Management
- Create, edit, and delete events with an intuitive interface.
- Upload event images and manage event details effortlessly.

### Event Registration
- Users can register and unregister for events with a single click.
- View a list of registered events and manage your participation.

### Live Event Attendance
- Real-time attendance tracking for live events.
- View live updates on event participation using Socket.io.

### Responsive Design
- Optimized for both desktop and mobile devices.
- Built with Material UI and Tailwind CSS for a modern and responsive user experience.

### Real-time Updates
- Leveraging Socket.io for real-time event updates and notifications.
- Instant feedback and updates for a dynamic user experience.

## Tech Stack

### Frontend

- **React**: A powerful JavaScript library for building user interfaces.
- **React Router**: Declarative routing for seamless navigation.
- **Axios**: Promise-based HTTP client for efficient API communication.
- **Material UI**: A popular React UI framework for beautiful and responsive designs.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **Socket.io-client**: Real-time bidirectional event-based communication.

### Backend

- **Node.js**: JavaScript runtime built on Chrome's V8 JavaScript engine.
- **Express**: Fast, unopinionated, minimalist web framework for Node.js.
- **MongoDB**: NoSQL database for modern applications.
- **Mongoose**: Elegant MongoDB object modeling for Node.js.
- **JWT**: JSON Web Tokens for secure authentication.
- **Multer**: Middleware for handling multipart/form-data, used for file uploads.
- **Cloudinary**: Cloud-based image and video management services.
- **Socket.io**: Enables real-time, bidirectional, and event-based communication.

## Project Structure

The project is divided into two main directories: `backend` and `frontend`.

### Backend

- **Controllers**: Handle the logic for different routes.
- **Middleware**: Custom middleware functions.
- **Models**: Mongoose schemas and models.
- **Routes**: Define the API endpoints.
- **Utils**: Utility functions and constants.

### Frontend

- **Components**: Reusable React components.
- **Context**: Context providers for global state management.
- **Pages**: Different pages of the application.
- **Helpers**: Helper functions for API communication.
- **Styles**: CSS and Tailwind CSS files.

## Installation and Setup

### Prerequisites

- Node.js
- MongoDB
- Cloudinary Account

### Backend Setup

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/EventsManager.git
    cd EventsManager/backend
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file in the [backend](http://_vscodecontentref_/0) directory and add the following:
    ```env
    MongoDBURI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret
    COOKIE_SECRET=your_cookie_secret
    CLOUD_NAME=your_cloudinary_cloud_name
    CLOUD_API_KEY=your_cloudinary_api_key
    CLOUD_API_SECRET=your_cloudinary_api_secret
    ```

4. Start the backend server:
    ```sh
    npm start
    ```

### Frontend Setup

1. Navigate to the [frontend](http://_vscodecontentref_/1) directory:
    ```sh
    cd ../frontend
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Start the frontend development server:
    ```sh
    npm run dev
    ```

## Usage

1. Open your browser and navigate to `http://localhost:5173`.
2. Sign up for a new account or log in with an existing account.
3. Create, edit, and manage events.
4. Register for events and view live attendance.

## API Endpoints

### User Routes

- `POST /api/users/signup` - Sign up a new user
- `POST /api/users/login` - Log in a user
- `GET /api/users/auth-status` - Verify user authentication status
- `POST /api/users/logout` - Log out a user
- `GET /api/users/eventsRegistered` - Get events registered by the user
- `GET /api/users/eventsCreated` - Get events created by the user

### Event Routes

- `POST /api/event/create` - Create a new event
- `GET /api/event` - Get all events
- `GET /api/event/:id` - Get a specific event by ID
- `PATCH /api/event/:id` - Edit an event
- `PUT /api/event/:id` - Register a user for an event
- `DELETE /api/event/:id` - Delete an event
- `DELETE /api/event/:id/unregister` - Unregister a user from an event


## Contributing

We welcome contributions from the community! If you'd like to contribute, please fork the repository and create a pull request with your changes. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contact

For any inquiries or feedback, please contact us at [your-email@example.com](mailto:your-email@example.com).

Thank you for using Event-lify! We hope it makes your event management experience smooth and enjoyable.
