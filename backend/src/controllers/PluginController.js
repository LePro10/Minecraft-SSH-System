const axios = require('axios');
const sshService = require('../services/SSHService');
const path = require('path');

class PluginController {
    async search(req, res) {
        const { query = '', page = 1 } = req.query;
        try {
            // Spiget API can be flaky with complex queries, let's simplify
            let url = '';
            if (query) {
                url = `https://api.spiget.org/v2/search/resources/${encodeURIComponent(query)}?size=24&page=${page}`;
            } else {
                url = `https://api.spiget.org/v2/resources/free?size=24&page=${page}&sort=-downloads`;
            }

            console.log(`[Plugins] Fetching: ${url}`);

            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Antigravity-MC/1.0',
                    'Accept': 'application/json'
                },
                timeout: 5000 // 5 second timeout
            });

            if (!Array.isArray(response.data)) {
                console.warn('[Plugins] Spiget returned non-array:', typeof response.data);
                return res.json([]);
            }

            res.json(response.data);
        } catch (error) {
            console.error('[Plugins] Fetch failed:', error.message);
            // Return empty array instead of error to keep frontend stable, but log it
            res.status(500).json({ error: 'Plugin store is currently slow or unreachable. Please try again later.' });
        }
    }

    async getInstalled(req, res) {
        const { serverPath } = req.query;
        if (!serverPath) return res.status(400).json({ error: 'Path required' });

        try {
            if (!sshService.connected) return res.json([]);

            const pluginsDir = path.posix.join(serverPath, 'plugins');
            const output = await sshService.exec(`ls -m "${pluginsDir}"`).catch(() => "");

            const files = output.split(',')
                .map(f => f.trim().toLowerCase())
                .filter(f => f.endsWith('.jar'));

            res.json(files);
        } catch (error) {
            res.json([]);
        }
    }

    async install(req, res) {
        const { resourceId, resourceName, serverPath } = req.body;
        if (!resourceId || !serverPath) return res.status(400).json({ error: 'Missing data' });

        try {
            if (!sshService.connected) throw new Error('SSH disconnected');

            const downloadUrl = `https://api.spiget.org/v2/resources/${resourceId}/download`;
            const pluginsDir = path.posix.join(serverPath, 'plugins');

            await sshService.exec(`mkdir -p "${pluginsDir}"`);
            const safeName = resourceName.replace(/[^a-z0-9]/gi, '_').substring(0, 30);
            const targetPath = path.posix.join(pluginsDir, `${safeName}.jar`);

            console.log(`[Plugins] Installing ${resourceName} to ${targetPath}`);
            await sshService.exec(`curl -L -s "${downloadUrl}" -o "${targetPath}"`);

            res.json({ success: true, message: `${resourceName} installed.` });
        } catch (error) {
            console.error('[Plugins] Install failed:', error.message);
            res.status(500).json({ error: error.message });
        }
    }

    async uninstall(req, res) {
        const { resourceName, serverPath } = req.body;
        if (!resourceName || !serverPath) return res.status(400).json({ error: 'Missing data' });

        try {
            if (!sshService.connected) throw new Error('SSH disconnected');

            const pluginsDir = path.posix.join(serverPath, 'plugins');
            const safeName = resourceName.replace(/[^a-z0-9]/gi, '_').substring(0, 30);

            const jarPath = path.posix.join(pluginsDir, `${safeName}.jar`);
            const folderPath = path.posix.join(pluginsDir, safeName);

            console.log(`[Plugins] Uninstalling ${resourceName}: Deleting ${jarPath} and ${folderPath}`);

            // Delete the jar and its data folder
            await sshService.exec(`rm -f "${jarPath}" && rm -rf "${folderPath}"`);

            res.json({ success: true, message: `${resourceName} uninstalled.` });
        } catch (error) {
            console.error('[Plugins] Uninstall failed:', error.message);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new PluginController();
