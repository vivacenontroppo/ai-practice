import * as net from 'net';
import chalk from 'chalk';
import { PortScanResult, HostScanResult, ScanOptions, ServiceInfo } from '../types';

const COMMON_PORTS: Record<number, string> = {
  21: 'FTP',
  22: 'SSH',
  23: 'Telnet',
  25: 'SMTP',
  53: 'DNS',
  80: 'HTTP',
  110: 'POP3',
  143: 'IMAP',
  443: 'HTTPS',
  445: 'SMB',
  993: 'IMAPS',
  995: 'POP3S',
  3306: 'MySQL',
  3389: 'RDP',
  5432: 'PostgreSQL',
  5900: 'VNC',
  6379: 'Redis',
  8080: 'HTTP-Alt',
  8443: 'HTTPS-Alt',
  27017: 'MongoDB'
};

const DEFAULT_PORTS = [21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 993, 995, 3306, 3389, 5432, 5900, 6379, 8080, 8443, 27017];

export async function scanPort(
  host: string,
  port: number,
  timeout: number = 1000
): Promise<PortScanResult> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let status: 'open' | 'closed' | 'filtered' = 'closed';
    let banner = '';

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      status = 'open';
      socket.destroy();
    });

    socket.on('timeout', () => {
      status = 'filtered';
      socket.destroy();
    });

    socket.on('error', () => {
      status = 'closed';
    });

    socket.on('close', () => {
      resolve({
        port,
        status,
        service: COMMON_PORTS[port] || 'unknown',
        banner: banner || undefined
      });
    });

    socket.connect(port, host);
  });
}

export async function scanPorts(
  host: string,
  options: ScanOptions = {}
): Promise<PortScanResult[]> {
  const { timeout = 1000, ports = DEFAULT_PORTS, concurrency = 100, verbose = false } = options;
  
  let portList: number[];
  if (typeof ports === 'string') {
    if (ports === 'all') {
      portList = Array.from({ length: 65535 }, (_, i) => i + 1);
    } else {
      portList = ports.split(',').map(p => parseInt(p.trim()));
    }
  } else {
    portList = ports;
  }

  if (verbose) {
    console.log(chalk.blue(`Scanning ${portList.length} ports on ${host}...`));
  }

  const results: PortScanResult[] = [];
  const chunks = chunkArray(portList, concurrency);

  for (const chunk of chunks) {
    const chunkResults = await Promise.all(
      chunk.map(port => scanPort(host, port, timeout))
    );
    results.push(...chunkResults);
  }

  const openPorts = results.filter(r => r.status === 'open');
  
  if (verbose) {
    console.log(chalk.green(`Found ${openPorts.length} open ports`));
  }

  return results.filter(r => r.status === 'open' || r.status === 'filtered');
}

export async function grabBanner(
  host: string,
  port: number,
  timeout: number = 2000
): Promise<string> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let banner = '';

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      if (port === 80 || port === 8080) {
        socket.write('HEAD / HTTP/1.0\r\nHost: ' + host + '\r\n\r\n');
      } else if (port === 443 || port === 8443) {
        socket.destroy();
        resolve('');
        return;
      }
    });

    socket.on('data', (data) => {
      banner += data.toString();
      socket.destroy();
    });

    socket.on('timeout', () => {
      socket.destroy();
    });

    socket.on('error', () => {
      socket.destroy();
    });

    socket.on('close', () => {
      resolve(banner.trim().substring(0, 200));
    });

    socket.connect(port, host);
  });
}

export async function fullHostScan(
  host: string,
  options: ScanOptions = {}
): Promise<HostScanResult> {
  const { verbose = false } = options;
  
  if (verbose) {
    console.log(chalk.blue(`\nScanning host: ${host}`));
  }

  const portResults = await scanPorts(host, options);
  const services: ServiceInfo[] = [];

  for (const result of portResults) {
    if (result.status === 'open') {
      const banner = await grabBanner(host, result.port);
      services.push({
        port: result.port,
        protocol: 'tcp',
        service: result.service || 'unknown',
        banner: banner || undefined
      });
    }
  }

  return {
    ip: host,
    openPorts: portResults.filter(r => r.status === 'open'),
    services
  };
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}