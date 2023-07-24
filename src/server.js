// server.js

const express = require("express");
const http = require("http");
const cors = require("cors");
const {
    fetchPage
} = require("./services/chat")

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "*" }));
app.options("*", cors());

// Import routes
const router = require("./routes");


app.use("/", router);

app.use(express.json());

const server = http.createServer(app);

// setInterval(fetchPage, 1000 * 60 * 60 * 24);
// fetchPage();

module.exports = {
    start: () => {
        server.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
    },
};

