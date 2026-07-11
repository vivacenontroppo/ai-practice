export interface NetworkInterface {
  name: string;
  address: string;
  netmask: string;
  mac: string;
  family: string;
  cidr: string;
}

export interface DiscoveredHost {
  ip: string;
  mac?: string;
  hostname?: string;
  vendor?: string;
  isUp: boolean;
  responseTime?: number;
}

export interface PortScanResult {
  port: number;
  status: 'open' | 'closed' | 'filtered';
  service?: string;
  banner?: string;
}

export interface HostScanResult {
  ip: string;
  hostname?: string;
  openPorts: PortScanResult[];
  os?: string;
  services: ServiceInfo[];
}

export interface ServiceInfo {
  port: number;
  protocol: string;
  service: string;
  version?: string;
  banner?: string;
}

export interface VulnerabilityCheck {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affected: {
    ip: string;
    port?: number;
    service?: string;
  };
  recommendation: string;
}

export interface ScanOptions {
  timeout?: number;
  concurrency?: number;
  ports?: number[] | string;
  verbose?: boolean;
}

export interface NetworkInfo {
  interfaces: NetworkInterface[];
  gateway?: string;
  dns: string[];
  subnet: string;
}