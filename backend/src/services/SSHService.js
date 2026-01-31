const { Client } = require('ssh2');
const { EventEmitter } = require('events');

class SSHService extends EventEmitter {
    constructor() {
        super();
        this.client = new Client();
        this.connected = false;
        this.sftp = null;

        this.client.on('error', (err) => {
            console.error('SSH Client Error:', err.message);
            this.connected = false;
            this.sftp = null;
            this.emit('error', err);
        });

        this.client.on('end', () => {
            console.log('SSH Client End');
            this.connected = false;
            this.sftp = null;
            this.emit('close');
        });

        this.client.on('close', () => {
            console.log('SSH Client Closed');
            this.connected = false;
            this.sftp = null;
            this.emit('close');
        });
    }

    connect(config) {
        return new Promise((resolve, reject) => {
            try {
                this.client.removeAllListeners('ready');

                const connOptions = {
                    readyTimeout: 30000,
                    keepaliveInterval: 10000,
                    keepaliveCountMax: 3,
                    ...config
                };

                this.client.once('ready', () => {
                    this.connected = true;
                    console.log('SSH Connection established');
                    resolve(true);
                });

                this.client.once('error', (err) => {
                    this.connected = false;
                    reject(err);
                });

                console.log(`SSH: Connecting to ${config.host}...`);
                this.client.connect(connOptions);

            } catch (err) {
                reject(err);
            }
        });
    }

    disconnect() {
        if (this.connected) {
            this.client.end();
            this.connected = false;
            this.sftp = null;
        }
    }

    exec(command) {
        return new Promise((resolve, reject) => {
            if (!this.connected) return reject(new Error('SSH not connected'));

            this.client.exec(command, (err, stream) => {
                if (err) return reject(err);

                let output = '';
                let errorOutput = '';

                stream.on('close', (code, signal) => {
                    if (code === 0) resolve(output.trim());
                    else reject(new Error(errorOutput.trim() || `Command failed with code ${code}`));
                }).on('data', (data) => {
                    output += data;
                }).stderr.on('data', (data) => {
                    errorOutput += data;
                });
            });
        });
    }

    getSftp() {
        return new Promise((resolve, reject) => {
            if (!this.connected) return reject(new Error('SSH not connected'));

            // Re-use SFTP session if possible to prevent "Channel open failure"
            if (this.sftp) return resolve(this.sftp);

            this.client.sftp((err, sftp) => {
                if (err) return reject(err);
                this.sftp = sftp;
                sftp.on('close', () => { this.sftp = null; });
                resolve(sftp);
            });
        });
    }

    spawn(command) {
        return new Promise((resolve, reject) => {
            if (!this.connected) return reject(new Error('SSH not connected'));

            this.client.exec(command, (err, stream) => {
                if (err) return reject(err);
                resolve(stream);
            });
        });
    }

    async getSystemUsage() {
        if (!this.connected) throw new Error('Not connected');
        try {
            // Consolidated command for efficiency (one channel instead of 3)
            // free -m: memory
            // top -bn1: cpu and load average
            // uptime: uptime
            // df -h /: disk usage
            const combinedCmd = `
                free -m | awk 'NR==2{printf "RAM:%.2f%%\\t%s\\t%s\\t%s\\n", $3*100/$2, $3, $2, $6}';
                top -bn1 | grep "Cpu(s)" | awk '{print "CPU:"100-$8"%"}' | head -1;
                top -bn1 | head -1 | awk '{print "LOAD:" $10" "$11" "$12}';
                (uptime -p || uptime) | awk '{print "UPTIME:"$0}';
                df -h / | tail -1 | awk '{print "DISK:"$5"\\t"$3"\\t"$2}'
            `.replace(/\s+/g, ' ').trim();

            const raw = await this.exec(combinedCmd);
            const lines = raw.split('\n');

            let ramPercent = 0, usedRam = 0, totalRam = 0, cacheRam = 0;
            let cpu = 0, disk = '0%', diskUsed = '0', diskTotal = '0';
            let load = '0 0 0', uptime = 'unknown';

            lines.forEach(line => {
                if (line.startsWith('RAM:')) {
                    const parts = line.replace('RAM:', '').split('\t');
                    ramPercent = parseFloat(parts[0]);
                    usedRam = parseInt(parts[1]);
                    totalRam = parseInt(parts[2]);
                    cacheRam = parseInt(parts[3]);
                } else if (line.startsWith('CPU:')) {
                    cpu = parseFloat(line.replace('CPU:', ''));
                } else if (line.startsWith('DISK:')) {
                    const parts = line.replace('DISK:', '').split('\t');
                    disk = parts[0];
                    diskUsed = parts[1];
                    diskTotal = parts[2];
                } else if (line.startsWith('LOAD:')) {
                    load = line.replace('LOAD:', '').replace(/,/g, '');
                } else if (line.startsWith('UPTIME:')) {
                    let val = line.replace('UPTIME:', '').trim();
                    const upMatch = val.match(/up\s+(.*?)(?:,|\d+\s+user| \d+ min|$)/i);
                    uptime = upMatch ? `up ${upMatch[1].trim()}` : val.replace('uptime ', '');
                }
            });

            return {
                cpu: cpu || 0,
                ram: ramPercent || 0,
                ramUsed: usedRam || 0,
                ramTotal: totalRam || 0,
                ramCache: cacheRam || 0,
                disk: disk || '0%',
                diskUsed: diskUsed || '0',
                diskTotal: diskTotal || '0',
                load: load || '0 0 0',
                uptime: uptime || 'unknown'
            };
        } catch (error) {
            console.error('Metrics failed:', error.message);
            return { cpu: 0, ram: 0, ramUsed: 0, ramTotal: 0, ramCache: 0, disk: '0%', load: '0 0 0', uptime: 'unknown' };
        }
    }
}

module.exports = new SSHService();
