// const express = require("express");
// const session = require("express-session");
// const path = require("path");
// require("dotenv").config();





// const app = express();

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(
//   session({
//     secret: process.env.SECRET_KEY || "your-secret-key",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       sameSite: "lax",
//       secure: false, // Set to true in production with HTTPS
//       httpOnly: true,
//     },
//   })
// );

// const connectToDatabase = require("./config/db");
// connectToDatabase()
//   .then(() => console.log("MongoDB Atlas connected"))
//   .catch((error) => {
//     console.error("DB connection error:", error);
//     process.exit(1);
//   });

// // Routes
// app.use("/api/auth", require("./routes/authRoutes"));
// app.use("/api", require("./routes/dashboardRoutes"));
// app.use("/api/projects", require("./routes/projectRoutes"));
// app.use("/api/bugs", require("./routes/bugRoutes"));


// code 0
// // backend/server.js (assumed, based on previous responses)
const express = require("express");
const session = require("express-session");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SECRET_KEY || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: "lax",
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
    },
  })
);

const connectToDatabase = require("./config/db");
connectToDatabase()
  .then(() => console.log("MongoDB Atlas connected"))
  .catch((error) => {
    console.error("DB connection error:", error);
    process.exit(1);
  });

  // Add this at the top of server.js, before route mounting
app.use((req, res, next) => {
  console.log("Route Hit:", req.method, req.url);
  next();
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api", require("./routes/dashboardRoutes")); // Could intercept /api/qa-dashboard
app.use("/api/projects", require("./routes/projectRoutes")); // Could intercept /api/qa-dashboard
app.use("/api/bugs", require("./routes/bugRoutes"));

// Serve uploads directory for images
app.use("/uploads", express.static("uploads"));

// Serve React frontend
app.use(express.static(path.join(__dirname, "../../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/build", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



// new
// backend/server.js (update route mounting order)
// const express = require("express");
// const session = require("express-session");
// const path = require("path");
// require("dotenv").config();

// const app = express();

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(
//   session({
//     secret: process.env.SECRET_KEY || "your-secret-key",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       sameSite: "lax",
//       secure: false, // Set to true in production with HTTPS
//       httpOnly: true,
//     },
//   })
// );

// const connectToDatabase = require("./config/db");
// connectToDatabase()
//   .then(() => console.log("MongoDB Atlas connected"))
//   .catch((error) => {
//     console.error("DB connection error:", error);
//     process.exit(1);
//   });

// // Routes (reorder to prioritize bugRoutes before dashboardRoutes)
// app.use("/api/auth", require("./routes/authRoutes"));
// app.use("/api/bugs", require("./routes/bugRoutes")); // Mount bugs routes first
// app.use("/api/projects", require("./routes/projectRoutes"));
// app.use("/api", require("./routes/dashboardRoutes")); // Mount dashboard routes last

// // Serve uploads directory for images
// app.use("/uploads", express.static("uploads"));

// // Serve React frontend
// app.use(express.static(path.join(__dirname, "../../frontend/build")));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../../frontend/build", "index.html"));
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// cnhges 1.0
// const express = require("express");
// const session = require("express-session");
// const path = require("path");
// require("dotenv").config();

// const app = express();

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(
//   session({
//     secret: process.env.SECRET_KEY || "your-secret-key",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       sameSite: "lax",
//       secure: false, // Set to true in production with HTTPS
//       httpOnly: true,
//     },
//   })
// );

// const connectToDatabase = require("./config/db");
// connectToDatabase()
//   .then(() => console.log("MongoDB Atlas connected"))
//   .catch((error) => {
//     console.error("DB connection error:", error);
//     process.exit(1);
//   });

// // Routes (ensure bugRoutes is mounted before dashboardRoutes)
// app.use("/api/auth", require("./routes/authRoutes"));
// app.use("/api/bugs", require("./routes/bugRoutes")); // Mount bugs routes first
// app.use("/api/projects", require("./routes/projectRoutes"));
// app.use("/api", require("./routes/dashboardRoutes")); // Mount dashboard routes last

// // Serve uploads directory for images
// app.use("/uploads", express.static("uploads"));

// // Serve React frontend (update to correct dist folder path)
// app.use(express.static(path.join(__dirname, "../frontend/dist")));
// app.get("*", (req, res) => {
//   console.log("Serving index.html from:", path.join(__dirname, "../frontend/dist", "index.html")); // Debug: Log file path
//   try {
//     res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
//   } catch (error) {
//     console.error("Error serving index.html:", error.message);
//     res.status(500).json({ error: "Failed to serve frontend" });
//   }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));