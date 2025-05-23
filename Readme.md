# 🎬 Backend-V: Scalable Backend for a Video Streaming Platform

**Backend-YT** is a Node.js-powered backend service built for a video streaming platform. It includes core features like secure user authentication, video uploads with cloud storage, category-wise video management, and JWT-based session handling. Built with Express and MongoDB, it reflects real-world development practices ideal for scalable applications.

---

## 🚀 Features

- 🔐 **Authentication System**  
  Signup/login functionality with password encryption using **bcrypt** and session management with **JWT**.

- 🎬 **Video Upload & Cloud Storage**  
  Upload videos using **Multer** and store them securely via **Cloudinary** integration.

- 🧾 **Category and Metadata Support**  
  Organize videos into categories and manage associated metadata.

- 🍪 **Secure Cookies**  
  Use **cookie-parser** for managing authentication cookies.

- 🌐 **CORS Enabled API**  
  Handle cross-origin requests smoothly using **cors**.

- 📦 **Paginated Queries**  
  Efficient video listing with **mongoose-aggregate-paginate-v2** for MongoDB aggregation-based pagination.

- ⚙️ **Environment-Based Config**  
  Secure secrets and variables using **dotenv**.


---

## 🧰 Tech Stack

| Area              | Tool/Library                       |
|-------------------|------------------------------------|
| Runtime           | Node.js                            |
| Framework         | Express.js                         |
| Database          | MongoDB + Mongoose                 |
| Authentication    | JWT + bcrypt                       |
| File Upload       | Multer                             |
| Cloud Media       | Cloudinary                         |
| Cookie Handling   | cookie-parser                      |
| CORS Handling     | cors                               |
| Pagination        | mongoose-aggregate-paginate-v2     |
| Dev Tools         | nodemon, prettier, dotenv          |

---

## 📁 Project Structure
```
Backend-V/
├── public/ # Static files and assets
├── src/
│ ├── controllers/ # Controllers (Dashboard, User, Likes, Comments, Tweets, Playlist, Subscription, Video)
│ ├── db/ # Manages database connections and requests.
│ ├── middlewares/ # Authorisation and File Upload middlewares(Multer).
│ ├── models/ # Mongoose schemas
│ ├── routes/ # Express route definitions
│ ├── utils/ # Api response, Api error response wrappers 
│ └── index.js # Entry point of the application
├── .gitignore # Git ignore file
├── package.json # Project metadata and dependencies
└── README.md # Project documentation
```

---

## ⚙️ Setup and Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Gajendra1092/Backend-V.git
cd Backend-V
```
### 2. Install Dependencies
```bash
npm install
```
### 3. Configure Environment Variables
Create a .env file in the root directory and add:
```
PORT = 8000
MONGODB_URI = Your MongoDB URI
CORS_ORIGIN = * // Accept every origin
ACCESS_TOKEN_SECRET = Your Access Token Secret
ACCESS_TOKEN_EXPIRY = Your Access Token Expiry
REFRESH_TOKEN_SECRET = Your Refresh Token Secret
REFRESH_TOKEN_EXPIRY = Your Refresh Token Expiry
CLOUDINARY_SECRET_KEY = Your Cloudinary Key
CLOUDINARY_URL = Your Cloudinary URL
```
4. Run the Server
```bash
npm run dev
```
The server will be running at http://localhost:8000/api/v1.

---

### 📬 Postman Collection
👉 Postman Collection Link For This Project:
```
https://.postman.co/workspace/My-Workspace~819dae2e-4eb2-41f2-8d5b-365e3cb0e87a/collection/43125246-a4a7e23a-6a79-4c68-9556-e8330822725b?action=share&creator=43125246&active-environment=43125246-fb4e3aeb-e8d6-490b-9887-9f20e4538a87
```
You can test all endpoints including user auth, video uploads, and video retrieval with the shared Postman link.

---

🧑‍💻 Author
:Gajendra Nehra

GitHub: @Gajendra1092

LinkedIn: www.linkedin.com/in/gajendra-nehra-968019269

---

### 💼 Recruiter Note
This project showcases my proficiency in building scalable backend systems using Node.js and MongoDB. It reflects my understanding of RESTful API design, authentication mechanisms, and database management. I am eager to bring these skills to a dynamic development team.

---
