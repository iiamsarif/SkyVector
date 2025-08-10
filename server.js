// server.js
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3000;

// Serve static frontend files
app.use(express.static(path.join(__dirname, "uploads")));
app.use(express.json({ limit: "50mb" }));
app.use("/img", express.static(path.join(__dirname, "img")));
// Multer setup for file upload
const uploadFolder = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadFolder),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.get("/",(req,res)=>{
    res.sendFile(__dirname+"/index.html");
})
app.get("/convert",(req,res)=>{
    res.sendFile(__dirname+"/convert.html");
})
app.get("/encrypt",(req,res)=>{
    res.sendFile(__dirname+"/encrypt.html");
})


// Handle file upload
app.post("/upload", upload.single("image"), (req, res) => {
    try {
        const filePath = req.file.path;
        const base64Data = fs.readFileSync(filePath, { encoding: "base64" });
        const mimeType = req.file.mimetype;
        const base64Url = `data:${mimeType};base64,${base64Data}`;
        res.json({ data: base64Url });
    } catch (error) {
        res.status(500).json({ error: "Failed to process image" });
    }
});


app.post("/convert", (req, res) => {
  try {
    let base64 = req.body.base64;

    // Remove prefix if exists
    const matches = base64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (matches) base64 = matches[2];

    // Convert Base64 to image file
    const imgPath = path.join(__dirname, "uploads", `converted_${Date.now()}.png`);
    fs.writeFileSync(imgPath, Buffer.from(base64, "base64"));

    // Send back image URL
    res.json({ imageUrl: `https://skyvector.onrender.com/${path.basename(imgPath)}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Conversion failed." });
  }
});


app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));

