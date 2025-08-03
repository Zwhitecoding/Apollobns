import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb+srv://toshidev0:zcode22107@dbtxt.3dxoaud.mongodb.net/?retryWrites=true&w=majority&appName=DBTXT', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const transactionSchema = new mongoose.Schema({
    caption: String,
    image: String,
    type: { type: String, enum: ['midman', 'buy-sell'], required: true },
    created_at: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

app.get('/api/transactions', async (req, res) => {
    const transactions = await Transaction.find().sort({ created_at: -1 });
    res.json(transactions);
});

app.post('/api/transactions', upload.single('image'), async (req, res) => {
    try {
        const { caption, type } = req.body;
        if (!req.file) return res.status(400).json({ error: 'Image is required' });
        if (!type || !['midman', 'buy-sell'].includes(type)) return res.status(400).json({ error: 'Type must be midman or buy-sell' });

        const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        const transaction = new Transaction({ caption, image: base64Image, type });
        await transaction.save();
        res.json(transaction);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/transactions/:id', async (req, res) => {
    try {
        await Transaction.findByIdAndDelete(req.params.id);
        res.json({ message: 'Transaction deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
