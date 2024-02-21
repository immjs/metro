import DnsOverHttpResolver from 'dns-over-http-resolver';
import net from 'net';

const resolver = new DnsOverHttpResolver();
resolver.setServers(['https://cloudflare-dns.com/dns-query']);

export async function resolve(domain) {
  // heck; whichever's faster.
  return new Promise((res) => {
    let settled = false;
  
    const promises = [
      // resolver.resolve6(domain),
      resolver.resolve4(domain),
    ];
    for (let promise of promises) {
      promise
        .then((v) => {
          if (!settled) res(v);
          settled = true;
        })
        .catch(() => {});
    }
  })
    .then((ips) => {
      const ip = ips[Math.floor(ips.length * Math.random())];
    
      if (!net.isIP(ip)) {
        return resolve(ip);
      }
    
      return ip;
    });
}
