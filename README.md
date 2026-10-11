# Node.js Jest Testing

A beginner-friendly project focused on learning and implementing unit testing for Node.js and Express.js controllers using Jest. This project tests signup functionality, request validation, mocked database operations, password hashing, JWT token generation, and error handling.

## 🚀 Tech Stack

- JavaScript
- Node.js
- Express.js
- Jest
- MongoDB / Mongoose
- bcrypt
- JSON Web Token (JWT)

## 📂 Project Structure

```text
testing/
├── src/
│   ├── controllers/
│   │   └── user.controllers.js
│   ├── models/
│   │   └── user.models.js
│   └── test/
│       └── auth.controller.test.js
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## 🧪 What I'm Learning

- Writing unit tests with Jest
- Testing Express controller functions
- Mocking database model methods
- Testing request validation
- Mocking password hashing with bcrypt
- Testing JWT token generation
- Handling asynchronous errors with `mockRejectedValue()`
- Verifying HTTP status codes and JSON responses
- Using Jest mock functions such as `jest.fn()` and `mockImplementation()`

## ✅ Test Scenarios

- Missing required signup fields
- Password hashing failure
- User save failure
- JWT token generation failure
- Successful user signup
- Unexpected errors and HTTP 500 responses

## ⚙️ Installation

**1. Clone the repository**

```bash
git clone https://github.com/pranitaaeer/nodejs-jest-testing.git
```

**2. Navigate to the project directory**

```bash
cd nodejs-jest-testing
```

**3. Install dependencies**

```bash
npm install
```

## ▶️ Run Tests

Run all Jest tests:

```bash
npm test
```

If Jest is not configured as the test script in `package.json`, add:

```json
"scripts": {
  "test": "jest"
}
```

## 🎯 Project Goal

The goal of this project is to build a strong foundation in unit testing, understand mocking and assertions, and improve testing skills for Node.js and Express.js applications.

## 👩‍💻 Author

**Pranita Aeer**


---

⭐ This repository documents my learning journey in backend testing with Jest.
