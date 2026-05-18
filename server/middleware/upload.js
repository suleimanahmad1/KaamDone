const multer = require("multer");
const { MAX_FILE_BYTES } = require("../utils/attachments");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_BYTES,
    files: 5,
    fieldSize: 2 * 1024 * 1024,
  },
});

const taskFilesMiddleware = upload.array("files", 5);

module.exports = { taskFilesMiddleware };
