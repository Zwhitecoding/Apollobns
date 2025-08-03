const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb+srv://toshidev0:zcode22107@dbtxt.3dxoaud.mongodb.net/?retryWrites=true&w=majority&appName=DBTXT', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const transactionSchema = new mongoose.Schema({
    caption: String,
    type: String,
    image: String,
    created_at: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.get('/api/transactions', async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ created_at: -1 });
        res.json(transactions);
    } catch {
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

app.post('/api/transactions', upload.single('image'), async (req, res) => {
    try {
        const { caption, type } = req.body;
        const image = req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : null;
        const newTransaction = new Transaction({ caption, type, image });
        await newTransaction.save();
        res.json({ message: 'Transaction added successfully', transaction: newTransaction });
    } catch {
        res.status(500).json({ error: 'Failed to add transaction' });
    }
});

app.delete('/api/transactions/:id', async (req, res) => {
    try {
        await Transaction.findByIdAndDelete(req.params.id);
        res.json({ message: 'Transaction deleted successfully' });
    } catch {
        res.status(500).json({ error: 'Failed to delete transaction' });
    }
});

app.use(express.static('public'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
