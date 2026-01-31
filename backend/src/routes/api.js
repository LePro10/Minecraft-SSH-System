const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fileController = require('../controllers/FileController');
const minecraftController = require('../controllers/MinecraftController');
const pluginController = require('../controllers/PluginController');
const settingsController = require('../controllers/SettingsController');

// Multer setup for temporary uploads (files)
const upload = multer({ dest: 'uploads/' });

// Multer setup for wallpapers (with extension preservation)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, 'wallpaper-' + Date.now() + path.extname(file.originalname));
    }
});
const wallpaperUpload = multer({ storage });

// Settings
router.get('/settings', (req, res) => settingsController.get(req, res));
router.post('/settings', (req, res) => settingsController.update(req, res));
router.post('/settings/wallpaper', wallpaperUpload.single('wallpaper'), (req, res) => settingsController.uploadWallpaper(req, res));


// Files
router.get('/files/list', (req, res) => fileController.list(req, res));
router.get('/files/content', (req, res) => fileController.read(req, res));
router.post('/files/write', (req, res) => fileController.write(req, res));
router.get('/files/download', (req, res) => fileController.download(req, res));
router.post('/files/upload', upload.single('file'), (req, res) => fileController.upload(req, res));
router.post('/files/delete', (req, res) => fileController.delete(req, res));
router.post('/files/download-bulk', (req, res) => fileController.downloadBulk(req, res));

// Plugins
router.get('/plugins/search', (req, res) => pluginController.search(req, res));
router.get('/plugins/installed', (req, res) => pluginController.getInstalled(req, res));
router.post('/plugins/install', (req, res) => pluginController.install(req, res));
router.post('/plugins/uninstall', (req, res) => pluginController.uninstall(req, res));

// Minecraft
router.post('/mc/command', (req, res) => minecraftController.sendCommand(req, res));
router.get('/mc/players', (req, res) => minecraftController.getPlayers(req, res));
router.post('/mc/control', (req, res) => minecraftController.controlServer(req, res));
router.get('/mc/properties', (req, res) => minecraftController.getProperties(req, res));
router.post('/mc/properties', (req, res) => minecraftController.saveProperties(req, res));

module.exports = router;
