# WebFlare Back End

Welcome to the WebFlare Back End repository. This back end server is built to support the WebFlare web application, which simulates a marketplace for digital assets.

## Overview

The WebFlare Back End is responsible for handling requests from the [WebFlare Front End](https://github.com/RRFayad/Personal-Project__WebFlare--FrontEnd). It includes various API endpoints for user registration, login, profile updates, managing businesses, and handling offers. The back end interacts with a MongoDB database to store user, business, and offer information.

## Technologies Used

The back end is built using the following technologies and dependencies:

- Node.js and Express.js for the server.
- MongoDB for the database.
- Express Validator for request validation.
- Bcrypt.js for password hashing.
- JSON Web Tokens (JWT) for authentication.
- Multer for handling file uploads.

These technologies work together to create a secure and efficient back end for the WebFlare application.

## Getting Started

To set up the WebFlare Back End locally, follow these steps:

1. Clone this repository to your local machine.
2. Install the required dependencies using `npm install`.
3. Set up a MongoDB database and add the connection string to your environment variables.
4. Create a `.env` file and add the following variables:

- PORT=5000
- MONGO_URI=your-mongodb-connection-string
- JWT_SECRET=your-secret-key

## Running the Server

To run the server locally, use the following command:

npm start

The back end should now be running locally.

## API Endpoints

The back end provides the following API endpoints for different functionalities:

### Users Routes

- `GET /api/users/:uid`: Get user data by user ID.
- `GET /api/users/business/:bid`: Get user data by business ID.
- `POST /api/users/signup`: User registration and profile creation.
- `POST /api/users/login`: User login.
- `PATCH /api/users/update-password/:uid`: Update user password by user ID.
- `PATCH /api/users/:uid`: Update user profile by user ID.

### Business Routes

- `GET /api/businesses`: Get all businesses.
- `GET /api/businesses/:bid`: Get business data by business ID.
- `GET /api/businesses/user/:uid`: Get businesses by user ID.
- `POST /api/businesses`: Create a new business.
- `PATCH /api/businesses/:bid`: Update a business by business ID.
- `DELETE /api/businesses/:bid`: Delete a business by business ID.

### Offers Routes

- `GET /api/offers/user/:uid`: Get offers by user ID.
- `GET /api/offers/:oid`: Get offer data by offer ID.
- `POST /api/offers`: Create a new offer.
- `PATCH /api/offers/:oid`: Accept an offer by offer ID.
- `DELETE /api/offers/:oid`: Delete an offer by offer ID.

These endpoints are used for user management, business-related actions, and handling offers in the WebFlare application.

## Controllers

The controllers in the back end are responsible for handling requests from the API endpoints. They implement the business logic for the WebFlare application.

## Authentication

WebFlare uses JSON Web Tokens (JWT) for user authentication. When a user registers or logs in, a JWT is generated and sent to the client. The client includes this token in its requests to authenticated routes. The back end validates and decodes the token to verify the user's identity.
