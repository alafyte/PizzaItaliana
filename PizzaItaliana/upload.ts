import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const storage_disk = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join('public', 'images'))
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + file.originalname;
        cb(null, uniqueSuffix)
    }
})

const upload_disk = multer({ storage: storage_disk })

export default {
    upload: upload,
    upload_disk: upload_disk,
    upload_path:  path.join('/', 'images')
}
