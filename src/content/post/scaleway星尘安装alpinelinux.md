---
title: Scaleway星尘安装AlpineLinux
description: 最便宜每月0.14欧元的纯IPv6欧洲VPS主机Scaleway Stardust Learning实例安装AlpineLinux 无硬盘启动救援模式？！
  进入救援模式使用DD方式安装 支持救砖
publishDate: 2025-03-16T18:07:00.000Z
tags:
  - AlpineLinux
  - VPS
---
## 添加SSH-key

按照官方文档创建或者添加一个公钥

ssh-key 添加：https://console.scaleway.com/project/ssh-keys

文档：https://www.scaleway.com/en/docs/identity-and-access-management/organizations-and-projects/how-to/create-ssh-key/

## 创建实例

控制台或者CLI创建一个实例，只能创建10g开机，待会才能修改 1GB硬盘


不要使用CLI强开！机子缺货的话会卡在ing状态，无法开机也无法关机
```
法国：scw instance server create zone=fr-par-1 root-volume=block:10GB name=fr type=STARDUST1-S ipv6=true ip=none
 
荷兰：scw instance server create zone=nl-ams-1 root-volume=block:10GB name=nl type=STARDUST1-S ipv6=true ip=none
 
波兰：scw instance server create zone=pl-waw-2 root-volume=block:10GB name=pl type=STARDUST1-S ipv6=true ip=none
 
##返回服务器信息表示命令执行成功。如果返回各种乱七八糟参数，表示命令输入有误，需重新执行。
```

## 安装实例

#### 常用命令

使用命令行操作减少扣费，通过面板操作开关机都会收取0.01费用

```
##重启
scw instance server reboot <实例的InstanceID>

##启动
scw instance server start <实例的InstanceID>

##关机
scw instance server stop <实例的InstanceID>
```

#### 更改 1GB 硬盘

* 左侧 Instances，进入实例管理面板，输入命令关机
* 分离 10GB 硬盘：实例管理面板，Attached volumes 选项卡，在硬盘右侧三个点选 Detach 解绑
* 创建 1GB 硬盘：点击 Create Volume 创建 Local Storage，大小 1GB
* 删除 10GB 硬盘：左侧 Instances，Volumes 选项卡，旧 10GB 硬盘右侧三个点选 Delete 删除

#### 救援恢复模式启动

* 在实例管理面板的 Advanced settings 选项卡中，选中 Use rescue image，保存
* 面板关机：左侧 Instances，进入实例管理面板，右上角开关，开机
* 重启后耐心等待 10 分钟，通过创建的 SSH Key 连接实例，执行命令：

`我不想要硬盘呢？直接启动救援模式后在block storage中解绑硬盘并删除即可！只有block能在启动后解绑 Local不行，最低每月0.11欧运行，cloud-init可能不起作用`

```
parted /dev/vda mklabel gpt

wget -qO- https://dl-cdn.alpinelinux.org/alpine/v3.21/releases/x86_64/alpine-virt-3.21.3-x86_64.iso | dd of=/dev/vda
```

使用最新镜像到官网获取

https://alpinelinux.org/downloads/

Virtual - x86_64

#### 改硬盘启动

* 面板关机：左侧 Instances，进入实例管理面板，右上角开关，关机
* 更改硬盘启动：实例管理面板，Advanced settings 选项卡
* 选中 Use local boot，保存，Boot volume 选择 1GB 硬盘，保存，开机


## 安装 Alpine Linux

### 进入Console

实例 overview 选项卡 的右上方 进入 console，再进行开机, 用户名 root  密码无


### 前置配置

```
mkdir /media/setup
cp -a /media/vda/* /media/setup
mkdir /lib/setup
cp -a /.modloop/* /lib/setup
/etc/init.d/modloop stop
umount /dev/vda
mv /media/setup/* /media/vda/
mv /lib/setup/* /.modloop/

export BOOT_SIZE=33
## 配置efi分区为33mb
```

### set 配置

```
setup-alpine
```

#### 主机名
```
ALPINE LINUX INSTALL
----------------------
Hostname
----------
Enter system hostname (fully qualified form, e.g. 'foo.example.org') [localhost] NL
Hostname must only contain letters (a-z), digits (0-9), '.' or '-'
Enter system hostname (fully qualified form, e.g. 'foo.example.org') [localhost] nl
```

#### 网口
```
Interface
-----------
Available interfaces are: eth0.
Enter '?' for help on bridges, bonding and vlans.
Which one do you want to initialize? (or '?' or 'done') [eth0]done   [输入done]
Do you want to do any manual network configuration? (y/n) [n] y      [输入y进入配置]
```

[进入配置按i输入内容,在后面追加，ip和网关改成自己的]
```
auto eth0
iface eth0 inet6 static
        address 2001:bc8:1640:3962:dc00:ff:fe48:1d91/64
        gateway fe80::dc00:ff:fe48:1d92
```

#### DNS本地域名

回车跳过

```
DNS domain name? (e.g 'bar.com') 
DNS nameserver(s)? 
```

#### ROOT密码

```
Root Password
---------------
Changing password for root
New password: 
Bad password: too weak
Retype password: 
passwd: password for root changed by root
```

#### 时区

随意填写。回车跳过

巴黎 Europe/Paris

阿姆斯特丹 Europe/Amsterdam

华沙 Europe/Warsaw

```
Timezone
----------
Africa/            Egypt              Iran               Poland
America/           Eire               Israel             Portugal
Antarctica/        Etc/               Jamaica            ROC
Arctic/            Europe/            Japan              ROK
Asia/              Factory            Kwajalein          Singapore
Atlantic/          GB                 Libya              Turkey
Australia/         GB-Eire            MET                UCT
Brazil/            GMT                MST                US/
CET                GMT+0              MST7MDT            UTC
CST6CDT            GMT-0              Mexico/            Universal
Canada/            GMT0               NZ                 W-SU
Chile/             Greenwich          NZ-CHAT            WET
Cuba               HST                Navajo             Zulu
EET                Hongkong           PRC                leap-seconds.list
EST                Iceland            PST8PDT            posixrules
EST5EDT            Indian/            Pacific/

Which timezone are you in? (or '?' or 'none') [UTC] 
```

#### Proxy

不设置代理，回车跳过

```
Proxy
-------
HTTP/FTP proxy URL? (e.g. 'http://proxy:8080', or 'none') [none] 
```

#### 软件源


输入 `skip` 跳过稍后设置CDN的源

```
APK Mirror
------------
wget: bad address 'mirrors.alpinelinux.org'
wget: bad address 'mirrors.alpinelinux.org'
(f)    Find and use fastest mirror
(s)    Show mirrorlist
(r)    Use random mirror
(e)    Edit /etc/apk/repositories with text editor
(c)    Community repo enable
(skip) Skip setting up apk repositories

Enter mirror number or URL: [1] skip
```

#### 用户

设置用户与公钥


```
User
------
Setup a user? (enter a lower-case loginname, or 'no') [no] 
Which ssh server? ('openssh', 'dropbear' or 'none') [openssh] 
Allow root ssh login? ('?' for help) [prohibit-password] 
Enter ssh key or URL for root (or 'none') [none] 这里粘贴公钥，不显示
* service sshd added to runlevel default
* Caching service dependencies ...
[ ok ]
ssh-keygen: generating new host keys: RSA ECDSA ED25519 
* Starting sshd ...
[ ok ]
```

#### 安装到硬盘

因为没安装引导，随便填填跳过即可

```
Disk & Install
----------------
Available disks are:
vda   (1.0 GB 0x1af4 )

Which disk(s) would you like to use? (or '?' for help or 'none') [none] vda

The following disk is selected:
vda   (1.0 GB 0x1af4 )

How would you like to use it? ('sys', 'data', 'crypt', 'lvm' or '?' for help) [?] sys
ERROR: unable to select packages:
dosfstools (no such package):
required by: world[dosfstools]
grub-efi (no such package):
required by: world[grub-efi]
```

### 配置DNS64服务器以访问ipv4资源

输入下面命令配置DNS64服务器
`echo "nameserver 2a00:1098:2c::1" | tee /etc/resolv.conf > /dev/null`

### 配置CDN软件源

```
echo "http://dl-cdn.alpinelinux.org/alpine/latest-stable/main" >> /etc/apk/repositories
echo "http://dl-cdn.alpinelinux.org/alpine/latest-stable/community" >> /etc/apk/repositories
echo "##http://dl-cdn.alpinelinux.org/alpine/edge/main" >> /etc/apk/repositories
echo "##http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories
echo "##http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories
```

### 安装引导并安装到硬盘
```
apk update
apk add dosfstools
apk add grub-efi
```


```
setup-disk -s 0
```
正式安装并关闭swap
```
setup-disk -s 0
Available disks are:
  vda   (1.0 GB 0x1af4 )

Which disk(s) would you like to use? (or '?' for help or 'none') [vda] vda

The following disk is selected:
  vda   (1.0 GB 0x1af4 )

How would you like to use it? ('sys', 'data', 'crypt', 'lvm' or '?' for help) [?] sys

WARNING: The following disk(s) will be erased:
  vda   (1.0 GB 0x1af4 )

WARNING: Erase the above disk(s) and continue? (y/n) [n] y
Creating file systems...
mkfs.fat 4.2 (2021-01-31)
Installing system on /dev/vda2:
Installing for x86_64-efi platform.
Installation finished. No error reported.

Installation is complete. Please reboot.
```
看到最后面即安装成功


## 必须要的安全措施

### SSH

因为之前设置了公钥登陆，禁用密码也会一起启用。修改ssh22端口改为1w端口往后即可，

```
vi /etc/ssh/sshd_config
 
//找到 ##Port 22 去掉 ##

改成想要的端口号保存

service sshd restart
重启服务
```

### 常用命令

安装并更新常用软件

```
apk update

apk add wget curl unzip zip jq bash htop

apk del 删除软件名
rc-update add 添加开机自启的服务名
rc-update del 删除开机自启的服务名

#查看服务状态
rc-status

#服务管理start stop restart
service sshd restart
```


### 开启BBR

```
echo "tcp_bbr" >> /etc/modules-load.d/bbr.conf
modprobe tcp_bbr
echo "net.core.default_qdisc=fq_pie" >> /etc/sysctl.conf
echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf
sysctl -p
```

重启生效 reboot

验证

```
lsmod | grep bbr
 
//出现以下内容表示成功：tcp_bbr
```

## IPV4出口 

### (选择1) 安装warp

https://gitlab.com/fscarmen/warp

ipv6可能无法访问部分资源，需要提前设置ipv4出口
```
安装bash
apk add bash

下载并运行脚本
wget -N https://gitlab.com/fscarmen/warp/-/raw/main/menu.sh && bash menu.sh

选择为 IPv6 only 添加 WARP IPv4 网络接口 (bash menu.sh 4)

```

### (选择2) DNS64

https://nat64.xyz/ 这里查看更多

探针列表 https://stats.uptimerobot.com/GQ5RyTJLKZ

修改 /etc/resolv.conf



```
nameserver 2a00:1098:2c::1
nameserver 2a01:4f9:c010:3f02::1
nameserver 2a00:1098:2b::1
```


## 参考文章

* https://yushum.com/archives/1118
* https://blog.akebinukui.eu.org/2023/09/19/%e6%95%99%e7%a8%8b%e6%96%b0%e7%89%88scaleway%e6%98%9f%e5%b0%98%f0%9f%a4%a11c1g1g%e9%b8%a1alpine-linux%e7%8e%a9%e6%b3%95/
* https://www.hupan.li/111.html
