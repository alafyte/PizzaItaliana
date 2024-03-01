import express from "express";
import path from "path";

const router = express.Router()
router.get('/data', (req, res) => {
    let filePath = path.join(process.cwd(), 'data_dir', 'data.json');
    res.sendFile(filePath);
});

export default router;