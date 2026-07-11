import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import { DiscoveredHost, ScanOptions } from '../types';
import { getSubnetHosts, getNetworkInfo } from './network-info';

const execAsync = promisify(exec);

export async function pingHost(ip: string, timeout: number = 1000): Promise<boolean> {
  try {
    await execAsync(`ping -c 1 -W ${Math.ceil(timeout / 1000)} ${ip}`, { timeout });
    return true;
  } catch {
    return false;
  }
}

export async function discoverHosts(
  cidr?: string,
  options: ScanOptions = {}
): Promise<DiscoveredHost[]> {
  const { timeout = 1000, concurrency = 50, verbose = false } = options;
  
  let targetCidr = cidr;
  if (!targetCidr) {
    const networkInfo = await getNetworkInfo();
    targetCidr = networkInfo.subnet;
    if (verbose) {
      console.log(chalk.blue(`Using local subnet: ${targetCidr}`));
    }
  }

  const hosts = getSubnetHosts(targetCidr);
  const discovered: DiscoveredHost[] = [];
  
  if (verbose) {
    console.log(chalk.blue(`Scanning ${hosts.length} hosts...`));
  }

  const chunks = chunkArray(hosts, concurrency);
  
  for (const chunk of chunks) {
    const results = await Promise.all(
      chunk.map(async (ip) => {
        const startTime = Date.now();
        const isUp = await pingHost(ip, timeout);
        const responseTime = Date.now() - startTime;
        
        if (isUp) {
          if (verbose) {
            console.log(chalk.green(`✓ ${ip} is up (${responseTime}ms)`));
          }
          return {
            ip,
            isUp,
            responseTime
          };
        }
        return null;
      })
    );
    
    discovered.push(...results.filter((r): r is DiscoveredHost => r !== null));
  }

  return discovered;
}

export async function resolveHostname(ip: string): Promise<string | undefined> {
  try {
    const { stdout } = await execAsync(`host ${ip}`);
    const match = stdout.match(/domain name pointer ([\w.-]+)/);
    return match ? match[1] : undefined;
  } catch {
    return undefined;
  }
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}