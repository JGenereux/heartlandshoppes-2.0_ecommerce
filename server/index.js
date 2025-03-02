"use strict";
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});
