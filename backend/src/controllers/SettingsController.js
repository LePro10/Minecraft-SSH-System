const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '..', '..', 'config.json');

const getSettings = () => {
    if (fs.existsSync(CONFIG_FILE)) {
        try {
            const data = fs.readFileSync(CONFIG_FILE);
            return JSON.parse(data);
        } catch (e) {
            return {};
        }
    }
    return {};
};

const saveSettings = (settings) => {
    const current = getSettings();
    const updated = { ...current, ...settings };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2));
    return updated;
};

class SettingsController {
    async get(req, res) {
        res.json(getSettings());
    }

    async update(req, res) {
        const updated = saveSettings(req.body);
        res.json(updated);
    }

    async uploadWallpaper(req, res) {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const wallpaperUrl = `/uploads/${req.file.filename}`;
        const updated = saveSettings({ wallpaper: wallpaperUrl });

        res.json({
            message: 'Wallpaper uploaded',
            url: wallpaperUrl,
            settings: updated
        });
    }
}

module.exports = new SettingsController();
