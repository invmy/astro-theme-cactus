---
title: DNS64服务器列表
description: 记录可用的DNS64服务器列表以及含有NAT64功能
publishDate: 2025-03-16T17:59:00.000Z
tags:
  - iPv6
---
## Only IPv6

纯IPv6的无法访问v4的资源，需要带Nat64功能才能访问资源。

Nat64相当于经过Nat64服务器的出口来访问。大部分都在欧洲地区。提供商也会注明不可用于流媒体
```
+------------------+          +------------------+            +------------------+
| IPv6-only Client |  ---->   |      DNS64       |   ---->    |    NAT64         |
| (IPv6 Requests)  |   请求    | (Resolve IPv4 -> |   转换    | (Translate IPv6  |
|                  |          |   IPv6 Address)  |           |   to IPv4)       |
+------------------+          +------------------+            +------------------+
          |                         |                             |
          |        <-----------------+--------------------------> |
          |         响应 (响应IPv6)     转换结果 (IPv6 -> IPv4)        |
          +--------------------------------------------------------+
                        <---------------------->           
                         Target IPv4 Server
```

## 公共项目

https://nat64.net/public-providers

| Provider                                 | Location      | DNS64 Address                | NAT64 Prefixes |
|------------------------------------------|---------------|------------------------------|----------------|
| [nat64.net](https://nat64.net/)          | Amsterdam     | 2a00:1098:2b::1              | 3              |
| [nat64.net](https://nat64.net/)          | Ashburn       | 2a01:4ff:f0:9876::1          | 3              |
| [nat64.net](https://nat64.net/)          | Helsinki      | 2a01:4f9:c010:3f02::1        | 3              |
| [nat64.net](https://nat64.net/)          | London        | 2a00:1098:2c::1              | 3              |
| [nat64.net](https://nat64.net/)          | Nuremberg     | 2a01:4f8:c2c:123f::1         | 3              |
| [IPng](https://ipng.ch/s/articles/2024/05/25/nat64-1.html) | Amsterdam     | 2a02:898:146:64::64         | 1              |
| [Trex](http://www.trex.fi/2011/dns64.html) | Tampere       | 2001:67c:2b0::4              | 1              |
| [Trex](http://www.trex.fi/2011/dns64.html) | Tampere       | 2001:67c:2b0::6              | 1              |
| [level66](https://noc.level66.network/services/nat64/) | Germany       | 2001:67c:2960::64           | 1              |
| [level66](https://noc.level66.network/services/nat64/) | Germany       | 2001:67c:2960::6464         | 1              |
| [Cloudflare](https://developers.cloudflare.com/1.1.1.1/ipv6-networks/) | Global anycast | 2606:4700:4700::6400       | 0              |
| [Cloudflare](https://developers.cloudflare.com/1.1.1.1/ipv6-networks/) | Global anycast | 2606:4700:4700::64         | 0              |
| [Google](https://developers.google.com/speed/public-dns/docs/dns64) | Global anycast | 2001:4860:4860::64         | 0              |
| [Google](https://developers.google.com/speed/public-dns/docs/dns64) | Global anycast | 2001:4860:4860::6464       | 0              |

## 如何使用

编辑`/etc/resolv.conf` 修改成你想要的服务器，离你服务器越近效果越好

清空内容并快速写入

```
echo "nameserver 2a00:1098:2c::1" | sudo tee /etc/resolv.conf > /dev/null
```