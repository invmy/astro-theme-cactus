---
title: Scaleway星尘安装AlpineLinux
description: 最便宜每月0.14欧元的纯IPv6欧洲VPS主机Scaleway Stardust Learning实例安装AlpineLinux
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

```
法国：scw instance server create zone=fr-par-1 root-volume=local:10GB name=fr type=STARDUST1-S ipv6=true ip=none
 
荷兰：scw instance server create zone=nl-ams-1 root-volume=local:10GB name=nl type=STARDUST1-S ipv6=true ip=none
 
波兰：scw instance server create zone=pl-waw-2 root-volume=local:10GB name=pl type=STARDUST1-S ipv6=true ip=none
 
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

```
parted /dev/vda mklabel gpt

wget -qO- https://dl-cdn.alpinelinux.org/alpine/v3.20/releases/x86_64/alpine-virt-3.20.1-x86_64.iso | dd of=/dev/vda

## 使用最新镜像到官网获取
## https://alpinelinux.org/downloads/
## Virtual - x86_64
```

#### 改硬盘启动

* 面板关机：左侧 Instances，进入实例管理面板，右上角开关，关机
* 更改硬盘启动：实例管理面板，Advanced settings 选项卡
* 选中 Use local boot，保存，Boot volume 选择 1GB 硬盘，保存，开机


## 安装 Alpine Linux

#### 进入Console

实例 overview 选项卡 的右上方 进入 console，再进行开机


#### 前置配置

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

#### set 安装

```
setup-alpine
```

#### 交互式安装过程

不懂可以问一下chatgpt
这是我的过程，列出大概的问题，版本更新可能会出现不同的问题

* 输入主机名
* done
* 按Y进配置网络，按  i  进入编辑配置 

```
auto lo
iface lo inet loopback
auto eth0
iface eth0 inet6 static
        address <ipv6_address>/64
        gateway <ipv6_gateway>
```

可能会出现 DNS domain name? (e.g 'bar.com')，关于dns配置相关的，直接按回车跳过即可

* 配置ROOT 密码
* 配置时区 巴黎 `Europe/Paris`，阿姆斯特丹 `Europe/Amsterdam`，华沙 `Europe/Warsaw`
* none
* skip
* no
* openssh
* 当提示 Allow root ssh login? ('?' for help) \[prohibit-password] 这是禁用密码登录并启用公钥登录按回车，然后会Enter ssh key or URL for root (or 'none') \[none]，这时输入你的公钥
* vda
* sys

#### 报错之后

`vi /etc/resolv.conf`

输入以下内容并保存

`nameserver 2001:4860:4860::6464`

#### 输入命令启用官方源

```
echo "http://dl-cdn.alpinelinux.org/alpine/latest-stable/main" >> /etc/apk/repositories
echo "http://dl-cdn.alpinelinux.org/alpine/latest-stable/community" >> /etc/apk/repositories
echo "##http://dl-cdn.alpinelinux.org/alpine/edge/main" >> /etc/apk/repositories
echo "##http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories
echo "##http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories
```

#### 安装启动项

```
apk update
apk add dosfstools
apk add grub-efi
```

#### 关闭 swap

```
setup-disk -s 0
```

1. vda
2. sys
3. y

`输入reboot重启`

## 安装完成之后...

使用ssh软件并添加密钥登录到你的服务器

#### 常用安装

```
apk add sudo curl wget bash tar unzip jq
```

#### ssh安全配置

如果之前禁用密码登录并配置了密钥修改成1024后面的端口即可

```
vi /etc/ssh/sshd_config
 
//找到 ##Port 22 行，去掉 ##，改成想要的端口号，保存
```

#### 开启BBR

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
