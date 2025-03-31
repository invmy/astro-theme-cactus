---
title: 天邑光猫开启IPv6入站
description: 电信天邑TEWA-750/708/768/800/1000等超级密码破解方法和工具，并开启ipv6防火墙转发达成光猫拨号公网访问IPv6
publishDate: 2025-03-21T13:41:00.000Z
tags:
  - 光猫
---


## 获取超级密码

参考资料：

- https://post.smzdm.com/p/ag8lgqn3/
- https://www.right.com.cn/forum/thread-5128686-1-1.html

## 开启Telnet

使用超级密码登陆后

访问：http://192.168.1.1:8080/enableTelnet.html

即可启用 telnet，同时页面也有用户名和密码

## 无视SU密码,进入ROOT

`telnet 192.168.1.1` 链接到光猫

用户名和密码均是 `telnetuser`

然后输入英文符号 `;` 回车

这时 `$` 符号消失就进入root用户了

```bash
Login: telnetuser
Password:
$;
sh: syntax error: unexpected ";"
echo $USER
root
```

## 开启IPv6入站

默认规则在转发 `FORWARD` 表中加入了 `DROP` 丢弃了所有入站请求 

是光猫将流量转发给下级路由的，通配 DROP 的规则删掉即可

### 查看FORWARD表
```bash
# 查看所有表
ip6tables -nvL --line-number

#查看FORWARD表
ip6tables -nvL FORWARD --line-numbers

Chain FORWARD (policy ACCEPT 65441 packets, 5616K bytes)
num   pkts bytes target     prot opt in     out     source               destination
1     6546  521K TCPMSS     tcp      any    ppp1.3  anywhere             anywhere             tcp flags:SYN,RST/SYN TCPMSS clamp to PMTU
2     6387  492K TCPMSS     tcp      ppp1.3 any     anywhere             anywhere             tcp flags:SYN,RST/SYN TCPMSS clamp to PMTU
3    4021K  770M rtchain    all      any    any     anywhere             anywhere
4        0     0 DROP       all      veip0.1 any     anywhere             anywhere
5        0     0 DROP       all      veip0.2 any     anywhere             anywhere
6    4018K  769M forward_npt  all      any    any     anywhere             anywhere
7     5476 1857K SKIPLOG    icmpv6    any    br0     anywhere             anywhere             ipv6-icmp destination-unreachable
8      399  137K SKIPLOG    icmpv6    any    ppp1.3  anywhere             anywhere             ipv6-icmp destination-unreachable
9    53521   19M ACCEPT     all      ppp1.3 any     anywhere             anywhere             ctstate RELATED,ESTABLISHED
10       0     0 LOG        tcp      ppp1.3 any     anywhere             anywhere             tcp flags:FIN,SYN,RST,ACK/SYN limit: avg 6/hour burst 5 LOG level alert prefix "Intrusion -> "
11    1801  209K DROP       all      ppp1.3 any     anywhere             anywhere
```

### 删除DROP规则

我这里规则是第11条所以删除11条，以自己标号为准

```bash
#删除规则11
ip6tables -D FORWARD 11

ip6tables -nvL FORWARD --line-numbers
Chain FORWARD (policy ACCEPT 8 packets, 524 bytes)
num   pkts bytes target     prot opt in     out     source               destination
1     6730  535K TCPMSS     tcp      *      ppp1.3  ::/0                 ::/0                 tcp flags:0x06/0x02 TCPMSS clamp to PMTU
2     7023  542K TCPMSS     tcp      ppp1.3 *       ::/0                 ::/0                 tcp flags:0x06/0x02 TCPMSS clamp to PMTU
3    4024K  770M rtchain    all      *      *       ::/0                 ::/0
4        0     0 DROP       all      veip0.1 *       ::/0                 ::/0
5        0     0 DROP       all      veip0.2 *       ::/0                 ::/0
6    4020K  770M forward_npt  all      *      *       ::/0                 ::/0
7     5496 1860K SKIPLOG    icmpv6    *      br0     ::/0                 ::/0                 ipv6-icmptype 1
8      405  139K SKIPLOG    icmpv6    *      ppp1.3  ::/0                 ::/0                 ipv6-icmptype 1
9    54396   19M ACCEPT     all      ppp1.3 *       ::/0                 ::/0                 ctstate RELATED,ESTABLISHED
10       5   400 LOG        tcp      ppp1.3 *       ::/0                 ::/0                 tcp flags:0x17/0x02 limit: avg 6/hour 

```
### 放行高级规则

在drop之前加入有效

```
放行指定网段设备的出站流量
ip6tables -I FORWARD 1 -s 240e:240e::/64 -j ACCEPT

放行设备的入站流量（防止返回数据被 DROP）
ip6tables -I FORWARD 2 -d 240e:3b1::/64 -j ACCEPT
```

### 恢复DROP规则

在第11条加入DROP规则

```bash
ip6tables -I FORWARD 11 -i ppp1.3 -j DROP
```

## 持久化

暂未找到能持久化的方法

使用 `ip6tables-save` 保存的值无变化
