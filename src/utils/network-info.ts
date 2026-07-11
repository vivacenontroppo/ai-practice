import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { NetworkInterface, NetworkInfo } from '../types';

const execAsync = promisify(exec);

export async function getNetworkInterfaces(): Promise<NetworkInterface[]> {
  const interfaces = os.networkInterfaces();
  const result: NetworkInterface[] = [];

  for (const [name, nets] of Object.entries(interfaces)) {
    if (!nets) continue;
    
    for (const net of nets) {
      if (net.family === 'IPv4' && !net.internal) {
        result.push({
          name,
          address: net.address,
          netmask: net.netmask,
          mac: net.mac,
          family: net.family,
          cidr: net.cidr || `${net.address}/${calculateCIDR(net.netmask)}`
        });
      }
    }
  }

  return result;
}

export async function getDefaultGateway(): Promise<string | undefined> {
  try {
    const { stdout } = await execAsync('netstat -rn | grep default');
    const match = stdout.match(/default\s+(\d+\.\d+\.\d+\.\d+)/);
    return match ? match[1] : undefined;
  } catch {
    return undefined;
  }
}

export async function getDNSServers(): Promise<string[]> {
  try {
    const { stdout } = await execAsync('scutil --dns | grep nameserver');
    const servers = stdout
      .split('\n')
      .map(line => line.match(/nameserver\[\d+\]\s*:\s*(\S+)/)?.[1])
      .filter((s): s is string => !!s);
    return [...new Set(servers)];
  } catch {
    return [];
  }
}

export async function getNetworkInfo(): Promise<NetworkInfo> {
  const interfaces = await getNetworkInterfaces();
  const gateway = await getDefaultGateway();
  const dns = await getDNSServers();
  
  const subnet = interfaces.length > 0 ? interfaces[0].cidr : 'unknown';

  return {
    interfaces,
    gateway,
    dns,
    subnet
  };
}

function calculateCIDR(netmask: string): number {
  return netmask
    .split('.')
    .map(part => parseInt(part))
    .map(part => (part >>> 0).toString(2))
    .join('')
    .split('1').length - 1;
}

export function getSubnetHosts(cidr: string): string[] {
  const [ip, maskBits] = cidr.split('/');
  const mask = parseInt(maskBits);
  const ipParts = ip.split('.').map(p => parseInt(p));
  const ipNum = (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3];
  const networkNum = ipNum & (-1 << (32 - mask));
  const broadcastNum = networkNum | ((1 << (32 - mask)) - 1);
  
  const hosts: string[] = [];
  for (let i = networkNum + 1; i < broadcastNum; i++) {
    hosts.push(`${(i >> 24) & 255}.${(i >> 16) & 255}.${(i >> 8) & 255}.${i & 255}`);
  }
  
  return hosts;
}