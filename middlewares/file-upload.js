const multer = require('multer');
const { v4: uuid } = require('uuid');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
};

const fileUpload = multer({
  limits: 500000,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (req.baseUrl === '/api/users') {
        cb(null, 'images/users');
      }
      if (req.baseUrl === 'api/businesses') {
        cb(null, 'images/businesses');
      }
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      if (req.baseUrl === '/api/users') {
        const formattedUserName = `${req.body.name.replace(
          / /g,
          '-',
        )}__${Date.now()}`;
        cb(null, `${formattedUserName}.${ext}`);
      }
      if (req.baseUrl === '/api/business') {
        const formattedTitle = `${req.body.title.replace(
          / /g,
          '-',
        )}__${Date.now()}`;
        cb(null, `${formattedTitle}.${ext}`);
      }
    },
    fileFilter: (req, file, cb) => {
      // the  validation
      const isValid = !!MIME_TYPE_MAP[file.mimetype];
      const error = isValid ? null : new Error('Invalid mime type!');
      cb(error, isValid);
    },
  }),
});

module.exports = fileUpload;
