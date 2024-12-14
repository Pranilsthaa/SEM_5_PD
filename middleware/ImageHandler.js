const multer = require('multer')

const path = require('path')

const basePath = path.resolve(__dirname, '..'); // Go up one level from __dirname
const imagePath = path.join(basePath, 'public/images');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, imagePath)
    },
    filename: function (req, file, cb) {
        const filename = Date.now() + file.originalname
        cb(null, filename)
    }
})

const upload = multer({ storage: storage })

module.exports = upload
