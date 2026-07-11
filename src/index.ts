#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { getNetworkInfo } from './utils/network-info';
import { discoverHosts } from './utils/discovery';
import { fullHostScan } from './utils/port-scanner';
import { checkVulnerabilities, printVulnerabilities } from './utils/vulnerability-checker';

const program = new Command();

program
  .name('netlab')
  .description('Network reconnaissance and security lab')
  .version('1.0.0');

program
  .command('info')
  .description('Display local network information')
  .action(async () => {
    console.log(chalk.bold.blue('\n📡 Network Information\n'));
    
    const info = await getNetworkInfo();
    
    console.log(chalk.bold('Interfaces:'));
    for (const iface of info.interfaces) {
      console.log(chalk.cyan(`  ${iface.name}:`) + ` ${iface.address}/${iface.cidr.split('/')[1]}`);
      console.log(chalk.gray(`    MAC: ${iface.mac}`));
    }
    
    console.log(chalk.bold('\nGateway:'), info.gateway || 'Not found');
    console.log(chalk.bold('DNS Servers:'), info.dns.join(', ') || 'Not found');
    console.log(chalk.bold('Subnet:'), info.subnet);
    console.log();
  });

program
  .command('discover')
  .description('Discover hosts on the network')
  .option('-s, --subnet <cidr>', 'Target subnet (CIDR notation)')
  .option('-t, --timeout <ms>', 'Timeout per host', '1000')
  .option('-c, --concurrency <n>', 'Concurrent pings', '50')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    console.log(chalk.bold.blue('\n🔍 Discovering hosts...\n'));
    
    const hosts = await discoverHosts(options.subnet, {
      timeout: parseInt(options.timeout),
      concurrency: parseInt(options.concurrency),
      verbose: options.verbose
    });
    
    console.log(chalk.bold.green(`\n✓ Found ${hosts.length} active hosts:\n`));
    
    for (const host of hosts) {
      console.log(chalk.cyan(`  ${host.ip}`) + chalk.gray(` (${host.responseTime}ms)`));
    }
    console.log();
  });

program
  .command('scan <host>')
  .description('Scan ports on a specific host')
  .option('-p, --ports <ports>', 'Ports to scan (comma-separated or "all")')
  .option('-t, --timeout <ms>', 'Timeout per port', '1000')
  .option('-v, --verbose', 'Verbose output')
  .action(async (host, options) => {
    console.log(chalk.bold.blue(`\n🔌 Scanning ${host}...\n`));
    
    const result = await fullHostScan(host, {
      timeout: parseInt(options.timeout),
      ports: options.ports,
      verbose: options.verbose
    });
    
    if (result.openPorts.length === 0) {
      console.log(chalk.yellow('No open ports found'));
    } else {
      console.log(chalk.bold.green(`Found ${result.openPorts.length} open ports:\n`));
      
      for (const service of result.services) {
        console.log(chalk.cyan(`  ${service.port}/${service.protocol}`) + 
          chalk.gray(` - ${service.service}`));
        if (service.banner) {
          console.log(chalk.gray(`    Banner: ${service.banner.substring(0, 100)}`));
        }
      }
    }
    
    console.log(chalk.bold.blue('\n🛡️  Checking for vulnerabilities...\n'));
    const vulns = checkVulnerabilities(result);
    printVulnerabilities(vulns);
    console.log();
  });

program
  .command('full')
  .description('Full network scan (discover + scan all hosts)')
  .option('-s, --subnet <cidr>', 'Target subnet (CIDR notation)')
  .option('-p, --ports <ports>', 'Ports to scan (comma-separated)')
  .option('-t, --timeout <ms>', 'Timeout', '1000')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    console.log(chalk.bold.blue('\n🚀 Starting full network scan...\n'));
    
    const hosts = await discoverHosts(options.subnet, {
      timeout: parseInt(options.timeout),
      verbose: options.verbose
    });
    
    console.log(chalk.bold.green(`\n✓ Found ${hosts.length} active hosts\n`));
    
    for (const host of hosts) {
      const result = await fullHostScan(host.ip, {
        timeout: parseInt(options.timeout),
        ports: options.ports,
        verbose: options.verbose
      });
      
      console.log(chalk.bold.cyan(`\n📍 ${host.ip}`));
      
      if (result.openPorts.length > 0) {
        for (const service of result.services) {
          console.log(chalk.gray(`  ${service.port}/${service.protocol} - ${service.service}`));
        }
        
        const vulns = checkVulnerabilities(result);
        if (vulns.length > 0) {
          printVulnerabilities(vulns);
        }
      } else {
        console.log(chalk.gray('  No open ports'));
      }
    }
    console.log();
  });

program.parse();