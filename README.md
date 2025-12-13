# 🚀 Express MVC Starter

A professional **Express.js starter boilerplate** with **MVC architecture**, security, logging, ORM/DB options, file upload utilities, mailing, API documentation, and scalable architecture — ideal for enterprise-grade Node.js applications.
---

## 📦 Features

✅ **Express.js** – Fast, minimalist web framework  
✅ **MVC Architecture** – Organized Models, Views, Controllers  
✅ **dotenv** – Environment variable management  
✅ **CORS** – Cross-origin resource sharing  
✅ **Helmet** – Secure your app with HTTP headers  
✅ **express-rate-limit** – Protect APIs from abuse  
✅ **Logger** — Professional logging with levels & transports  
✅ *(Optional)* **EJS** – Embedded JavaScript templates for views  
✅ *(Optional)* **Validation** – Input validation using `express-validator` or `joi`  
✅ *(Optional)* **Multer** — File uploads handler  
✅ *(Optional)* **Nodemailer** — Email sending support  
✅ *(Optional)* **Swagger** (OpenAPI 3) — Auto-generated API docs at /api-docs  
✅ *(Optional)* **Testing Tool** - Jest & Supertest with coverage reports  

### 🛢 Database Support
Choose any database you want:  
✅ Mongoose  
✅ MySQL via Sequelize ORM (Eloquent-style)  

---

## 🧩 Folder Structure

```

my-express-app/
│
├── src/
│   ├── controllers/
│   │   └── userController.js
│   ├── models/
│   │   └── userModel.js
│   ├── routes/
│   │   └── userRoutes.js
│   ├── middlewares/
│   │   └── rateLimit.js
│   ├── config/
│   │   └── app.js
│   ├── public/
│   │   └── logo.png
│   ├── utils/
│   │   └── multer.js
│   ├── tests/
│   │   └── user.test.js
│   ├── views/
│   │   └── index.ejs
│   └── app.js
│
├── .env.example
├── package.json
├── README.md

````

---

## ⚙️ Installation

You can use this boilerplate with `npx`:

```bash
npx create-new-express-project my-express-app
cd my-express-app
npm install
````

---

## 🔧 Configuration

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development

# config databse
```

---

## 🚦 Run the App

```bash
# Development mode
npm run dev

# Production mode
npm start

# Testing mode
npm run test
```

Server runs at:
👉 [http://localhost:3000](http://localhost:3000)

---

## 🧠 Scripts

| Command              | Description                            |
| -------------------- | -------------------------------------- |
| `npm run dev`        | Start with nodemon                     |
| `npm start`          | Run app in production                  |
| `npm run test`       | Run unit tests with Jest               |
| `npm run test:coverage` | Run tests with coverage reports     |

### Database Migrations (Sequelize)

| Command               | Description                                                  |
| --------------------- | ------------------------------------------------------------ |
| `npm run db:migrate`  | Create database tables based on model files                  |
| `npm run db:refresh`  | Drop all tables and recreate from model files                |
| `npm run db:seed`     | Populate database with seed data                             |

---

## 📖 API Documentation

Swagger UI is available at:
👉 [http://localhost:3000/api-docs/](http://localhost:3000/api-docs/)

---

## 🛡️ Security Middlewares

* **Helmet**: Secures app by setting various HTTP headers
* **CORS**: Enables cross-origin resource sharing
* **express-rate-limit**: Limits repeated requests to public APIs

---

## 🧰 Tech Stack

* **Node.js**
* **Express.js**
* **EJS** (optional)
* **Joi / express-validator** (optional)
* **Mongoose / MySQL via Sequelize**
* **Multer**
* **Nodemailer**
* **Winston**
* **Swagger**
* **Jest**

---

## 🧾 License

This project is licensed under the **MIT License** – free to use and modify.

---

## 🌟 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to open a pull request.

---

## 💡 Author

**Karthikeyan M**
👨‍💻 [GitHub](https://github.com/mkk-karthi)
