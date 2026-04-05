const fs = require('fs');
const path = require('path');
const os = require('os');

const HOSTS_PATH = os.platform() === 'win32'
  ? 'C:\\Windows\\System32\\drivers\\etc\\hosts'
  : '/etc/hosts';

const START_TAG = '# BLOCKER_START';
const END_TAG = '# BLOCKER_END';

class HostsService {
  /**
   * Updates the hosts file based on blocked URLs and access status.
   * @param {Array} urls - Array of site objects with .url property
   * @param {Boolean} canAccess - If true, websites are UNBLOCKED
   */
  static async syncHosts(urls, canAccess) {
    try {
      let content = fs.readFileSync(HOSTS_PATH, 'utf8');
      const startIdx = content.indexOf(START_TAG);
      const endIdx = content.indexOf(END_TAG);

      let cleanContent = content;
      if (startIdx !== -1 && endIdx !== -1) {
        // Remove existing block
        cleanContent = content.substring(0, startIdx) + content.substring(endIdx + END_TAG.length);
      }

      let newBlock = '';
      if (!canAccess && urls && urls.length > 0) {
        newBlock = `\n${START_TAG}\n`;
        urls.forEach(site => {
          const domain = this.extractDomain(site.url);
          if (domain) {
            newBlock += `127.0.0.1 ${domain}\n`;
            newBlock += `127.0.0.1 www.${domain}\n`;
          }
        });
        newBlock += `${END_TAG}\n`;
      }

      const finalContent = cleanContent.trimEnd() + newBlock;
      fs.writeFileSync(HOSTS_PATH, finalContent, 'utf8');
      console.log(`[HostsService] Synced: ${canAccess ? 'UNBLOCKED' : 'BLOCKED'} ${urls.length} sites`);
    } catch (err) {
      if (err.code === 'EPERM' || err.code === 'EACCES') {
        console.error('[HostsService] Error: PERMISSION DENIED. Run as Administrator!');
      } else {
        console.error('[HostsService] Error:', err.message);
      }
    }
  }

  static extractDomain(url) {
    if (!url) return null;
    let domain = url.replace('http://', '').replace('https://', '');
    domain = domain.split('/')[0].split('?')[0];
    // Remove 'www.' if it exists to normalize
    return domain.startsWith('www.') ? domain.substring(4) : domain;
  }

  static async clear() {
    await this.syncHosts([], true);
  }
}

module.exports = HostsService;
