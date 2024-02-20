import DnsOverHttpResolver from 'dns-over-http-resolver';

const resolver = new DnsOverHttpResolver();
resolver.setServers(['https://cloudflare-dns.com/dns-query']);

export async function resolve(domain) {
  // heck; whichever's faster.
  const ips = await Promise.race([
    resolver.resolve6(domain),
    resolver.resolve4(domain),
  ]);

  const ip = ips[Math.floor(ips.length * Math.random())];

  console.log(ip);

  return ip;
}
