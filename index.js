const express = require('express');
const multer = require('multer');
const bodyparser = require('body-parser');
const path = require('path');
const mongodb = require('mongodb');
const fs = require('fs')
const app = express();


/*const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, "uploads");
        },
        filename: function (req, file, callback) {
            callback(null, file.filename + "-" + Date.now() + ".jpg");
        }
    })
}).array("demo_file");

// app.post("/uploads", upload, (req, resp) => {
//     resp.send("File Uploaded");
// });

*/

//use middleware of Body parser
app.use(bodyparser.urlencoded({ extended: true }));

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'uploads');
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});

var upload = multer({
    storage: storage
});

//configuring MongoDB
const MongoClient = mongodb.MongoClient;
const url = 'mongodb://localhost:27017';

MongoClient.connect(url, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}, (err, client) => {
    if (err)
        return console.log(err);

    db = client.db('Images');

    app.listen(5000, () => {
        console.log("MongoDB");
    })
})


//configuring route
app.get('/', (req, resp) => {
    resp.sendFile(__dirname + '/index.html');
});

//Configuring the upload file route 
app.post('/uploadfile', upload.single('myFile'), (req, resp, next) => {
    const file = req.file;
    if (!file) {
        const error = new Error("Please upload File");
        error.httpStatusCode = 400;
        return next(error);
    }
    resp.send(file);
});

//Configuring Multiple File route
app.post('/uploadmultiple', upload.array('myFiles', 12), (req, resp, next) => {
    const files = req.files;
    if (!files) {
        const error = new Error("Please Upload Files");
        error.httpStatusCode = 400;
        return next(error);
    }
    resp.send(files);
});

//Configuring Images route
app.post('/uploadimage', upload.single('myImage'), (req, resp) => {
    var img = fs.readFileSync(req.file.path);
    var encode_img = img.toString('base64');

    //Define a JSON Object for image

    var finalImg = {
        contentType: req.file.mimetype,
        path: req.file.path,
        image: new Buffer(encode_img, 'base64')
    };

    //insert Img to DB
    db.collection('imageup').insertOne(finalImg,(err,result)=>{
        console.log(result);
        if(err){
            return console.log(err);
        }
        console.log("Saved to DB");
        resp.contentType(finalImg.contentType);
        resp.send(finalImg.image);
    })
})

app.listen(3000, () => {
    console.log("Html");
}); 