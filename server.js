require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const app = express();
const path = require('path');

// MongoDB Connection
mongoose.connect('mongodb+srv://pierrelouisyvette6:MgGnTtvVvQ3DVvFI@clusteinconnu-kawaii-st.ltt1hkm.mongodb.net/INCONNU?retryWrites=true&w=majority&appName=ClusteINCONNU-KAWAII-STREAMS')
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Comment Schema
const commentSchema = new mongoose.Schema({
  devName: { type: String, required: true },
  contact: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});
const Comment = mongoose.model('Comment', commentSchema);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routes
app.get('/', async (req, res) => {
  const comments = await Comment.find().sort({ timestamp: -1 }).limit(50);
  res.render('index', { comments });
});

app.post('/comment', async (req, res) => {
  try {
    const { devName, contact, message } = req.body;
    const newComment = new Comment({ devName, contact, message });
    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/obfuscate', (req, res) => {
  if (!req.files || !req.files.jsFile) {
    return res.status(400).send('No file uploaded.');
  }
  
  const jsFile = req.files.jsFile;
  const method = req.body.method || 'base64';
  let obfuscatedCode = jsFile.data.toString('utf8');
  
  // Apply obfuscation based on selected method
  obfuscatedCode = applyObfuscation(obfuscatedCode, method);
  
  res.setHeader('Content-Disposition', 'attachment; filename=obfuscated.js');
  res.send(obfuscatedCode);
});

function applyObfuscation(code, method) {
  const watermark = `/* OBFUSCATED WITH INCONNU OBFUSCATOR WEB - Method: ${method} */\n`;
  
  switch(method) {
    case 'base64':
      return watermark + Buffer.from(code).toString('base64');
    case 'reverse':
      return watermark + code.split('').reverse().join('');
    case 'hex':
      return watermark + code.split('').map(c => c.charCodeAt(0).toString(16)).join('');
    case 'binary':
      return watermark + code.split('').map(c => c.charCodeAt(0).toString(2)).join(' ');
    case 'rot13':
      return watermark + code.replace(/[a-zA-Z]/g, c => 
        String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13 ? c + 13 : c - 13));
    case 'charCode':
      return watermark + 'eval(String.fromCharCode(' + 
        code.split('').map(c => c.charCodeAt(0)).join(',') + '))';
    case 'unicode':
      return watermark + code.split('').map(c => '\\u' + ('000' + c.charCodeAt(0).toString(16)).slice(-4)).join('');
    case 'custom1':
      return watermark + code.split('').map(c => {
        const code = c.charCodeAt(0);
        return String.fromCharCode(code ^ 0x55);
      }).join('');
    case 'custom2':
      return watermark + code.split('').map(c => {
        const code = c.charCodeAt(0);
        return String.fromCharCode((code + 13) % 256);
      }).join('');
    case 'custom3':
      return watermark + code.split('').map((c, i) => {
        const code = c.charCodeAt(0);
        return String.fromCharCode(code ^ (i % 256));
      }).join('');
    default:
      return watermark + code;
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
