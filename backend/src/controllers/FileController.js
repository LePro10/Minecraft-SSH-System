const sshService = require('../services/SSHService');
const fs = require('fs');
const path = require('path');

class FileController {

    async list(req, res) {
        const { path: dirPath } = req.query;
        if (!dirPath) return res.status(400).json({ error: 'Path is required' });

        try {
            const sftp = await sshService.getSftp();
            sftp.readdir(dirPath, (err, list) => {
                if (err) return res.status(500).json({ error: `SFTP Error: ${err.message}` });

                const files = list.map(item => {
                    const stats = item.attrs;
                    // Standard bitmask check for directory (0o040000)
                    let isDirectory = (stats.mode & 0o170000) === 0o040000;

                    // Fallback to longname if mode is zero or ambiguous
                    // Longnames in SFTP usually start with 'd' for directories
                    if (item.longname && item.longname.startsWith('d')) {
                        isDirectory = true;
                    }

                    // Log findings for debugging
                    console.log(`Backend -> Item: ${item.filename}, isDir: ${isDirectory}, mode: ${stats.mode.toString(8)}, long: ${item.longname ? item.longname[0] : '?'}`);

                    return {
                        name: item.filename,
                        isDirectory: !!isDirectory,
                        size: stats.size || 0,
                        mtime: (stats.mtime || 0) * 1000
                    };
                });

                // Remove . and .. breadcrumbs as the UI handles navigation
                const filtered = files.filter(f => f.name !== '.' && f.name !== '..');

                // Sort: Folders first, then alphabetically
                filtered.sort((a, b) => {
                    if (a.isDirectory && !b.isDirectory) return -1;
                    if (!a.isDirectory && b.isDirectory) return 1;
                    return a.name.localeCompare(b.name);
                });

                console.log(`Listed ${filtered.length} items for ${dirPath}`);
                res.json(filtered);
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async read(req, res) {
        const { path: filePath } = req.query;
        try {
            const sftp = await sshService.getSftp();
            const stream = sftp.createReadStream(filePath);
            stream.on('error', (err) => { if (!res.headersSent) res.status(500).json({ error: err.message }); });
            stream.pipe(res);
        } catch (err) {
            if (!res.headersSent) res.status(500).json({ error: err.message });
        }
    }

    async download(req, res) {
        const { path: filePath } = req.query;
        if (!filePath) return res.status(400).json({ error: 'Path is required' });
        const fileName = path.basename(filePath);

        try {
            const sftp = await sshService.getSftp();
            sftp.stat(filePath, async (err, stats) => {
                if (err) return res.status(500).json({ error: err.message });

                if (stats.isDirectory()) {
                    res.setHeader('Content-disposition', `attachment; filename="${fileName}.tar.gz"`);
                    res.setHeader('Content-type', 'application/gzip');
                    const parentDir = path.posix.dirname(filePath);
                    const dirName = path.posix.basename(filePath);

                    try {
                        const stream = await sshService.spawn(`cd "${parentDir}" && tar -cz "${dirName}"`);
                        stream.on('error', (err) => { if (!res.headersSent) res.status(500).send(err.message); });
                        stream.pipe(res);
                    } catch (e) {
                        if (!res.headersSent) res.status(500).json({ error: e.message });
                    }
                } else {
                    res.setHeader('Content-disposition', `attachment; filename="${fileName}"`);
                    res.setHeader('Content-type', 'application/octet-stream');
                    const stream = sftp.createReadStream(filePath);
                    stream.on('error', (err) => { if (!res.headersSent) res.status(500).json({ error: err.message }); });
                    stream.pipe(res);
                }
            });
        } catch (err) {
            if (!res.headersSent) res.status(500).json({ error: err.message });
        }
    }

    async downloadBulk(req, res) {
        const { paths: targetPaths, currentDir } = req.body;
        if (!targetPaths || !Array.isArray(targetPaths) || targetPaths.length === 0) {
            return res.status(400).json({ error: 'Paths array is required' });
        }

        try {
            const folderName = path.basename(currentDir) || 'minecraft-selection';
            res.setHeader('Content-disposition', `attachment; filename="${folderName}.tar.gz"`);
            res.setHeader('Content-type', 'application/gzip');

            const quotedPaths = targetPaths.map(p => `"${p}"`).join(' ');
            const command = `cd "${currentDir}" && tar -cz ${quotedPaths}`;

            const stream = await sshService.spawn(command);
            stream.on('error', (err) => {
                console.error('Bulk Tar Error:', err);
                if (!res.headersSent) res.status(500).send(err.message);
            });
            stream.pipe(res);
        } catch (err) {
            console.error('DownloadBulk Catch:', err);
            if (!res.headersSent) res.status(500).json({ error: err.message });
        }
    }

    async write(req, res) {
        const { path: filePath, content } = req.body;
        try {
            const sftp = await sshService.getSftp();
            const stream = sftp.createWriteStream(filePath);
            stream.on('error', (err) => res.status(500).json({ error: err.message }));
            stream.on('finish', () => res.json({ success: true }));
            stream.write(content);
            stream.end();
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async upload(req, res) {
        if (!req.file) return res.status(400).json({ error: 'No file' });
        const { targetDir } = req.body;
        const remotePath = path.posix.join(targetDir, req.file.originalname);

        try {
            const sftp = await sshService.getSftp();
            sftp.fastPut(req.file.path, remotePath, (err) => {
                if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true });
            });
        } catch (err) {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            res.status(500).json({ error: err.message });
        }
    }

    async delete(req, res) {
        const { path: targetPath, type } = req.body;
        try {
            const sftp = await sshService.getSftp();
            if (type === 'd') {
                // Recursive delete is complex with SFTP, using remote rm -rf
                await sshService.exec(`rm -rf "${targetPath}"`);
                res.json({ success: true });
            } else {
                sftp.unlink(targetPath, (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ success: true });
                });
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new FileController();
