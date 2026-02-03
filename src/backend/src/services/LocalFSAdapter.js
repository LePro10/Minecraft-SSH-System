const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { Readable, Writable } = require('stream');

/**
 * LocalFSAdapter - Mimics SFTP interface for local filesystem operations
 * 
 * This adapter provides an SFTP-like interface for local filesystem operations,
 * allowing the same code to work for both SSH and local connections.
 */
class LocalFSAdapter {
    /**
     * Read directory contents
     */
    readdir(remotePath, callback) {
        fs.readdir(remotePath, { withFileTypes: true })
            .then(entries => {
                const result = entries.map(entry => ({
                    filename: entry.name,
                    longname: '', // Not used in our implementation
                    attrs: {
                        mode: 0,
                        size: 0,
                        isDirectory: () => entry.isDirectory(),
                        isFile: () => entry.isFile()
                    }
                }));
                callback(null, result);
            })
            .catch(err => callback(err));
    }

    /**
     * Get file/directory stats
     */
    stat(remotePath, callback) {
        fs.stat(remotePath)
            .then(stats => {
                callback(null, {
                    mode: stats.mode,
                    size: stats.size,
                    mtime: stats.mtime,
                    isDirectory: () => stats.isDirectory(),
                    isFile: () => stats.isFile()
                });
            })
            .catch(err => callback(err));
    }

    /**
     * Read file content
     */
    readFile(remotePath, encoding, callback) {
        if (typeof encoding === 'function') {
            callback = encoding;
            encoding = 'utf8';
        }

        fs.readFile(remotePath, encoding)
            .then(data => callback(null, data))
            .catch(err => callback(err));
    }

    /**
     * Write file content
     */
    writeFile(remotePath, data, callback) {
        fs.writeFile(remotePath, data)
            .then(() => callback(null))
            .catch(err => callback(err));
    }

    /**
     * Create read stream
     */
    createReadStream(remotePath, options = {}) {
        return fsSync.createReadStream(remotePath, options);
    }

    /**
     * Create write stream
     */
    createWriteStream(remotePath, options = {}) {
        return fsSync.createWriteStream(remotePath, options);
    }

    /**
     * Delete file
     */
    unlink(remotePath, callback) {
        fs.unlink(remotePath)
            .then(() => callback(null))
            .catch(err => callback(err));
    }

    /**
     * Delete directory
     */
    rmdir(remotePath, callback) {
        fs.rmdir(remotePath, { recursive: true })
            .then(() => callback(null))
            .catch(err => callback(err));
    }

    /**
     * Create directory
     */
    mkdir(remotePath, callback) {
        fs.mkdir(remotePath, { recursive: true })
            .then(() => callback(null))
            .catch(err => callback(err));
    }

    /**
     * Rename/move file or directory
     */
    rename(oldPath, newPath, callback) {
        fs.rename(oldPath, newPath)
            .then(() => callback(null))
            .catch(err => callback(err));
    }

    /**
     * Fast put (upload file)
     */
    fastPut(localPath, remotePath, callback) {
        fs.copyFile(localPath, remotePath)
            .then(() => callback(null))
            .catch(err => callback(err));
    }

    /**
     * Fast get (download file)
     */
    fastGet(remotePath, localPath, callback) {
        fs.copyFile(remotePath, localPath)
            .then(() => callback(null))
            .catch(err => callback(err));
    }

    /**
     * Check if path exists
     */
    exists(remotePath, callback) {
        fs.access(remotePath)
            .then(() => callback(true))
            .catch(() => callback(false));
    }
}

module.exports = new LocalFSAdapter();
