const express = require('express');
const multer = require('multer');
const app = express();

const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, "uploads");
        },
        filename: function (req, file, callback) {
            callback(null, file.filename + "-" + Date.now() + ".jpg");
        }
    })
}).array("demo_file");

app.post("/uploads", upload, (req, resp) => {
    resp.send("File Uploaded");
});

app.listen(3000); 