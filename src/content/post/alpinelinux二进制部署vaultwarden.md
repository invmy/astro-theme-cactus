---
title: AlpineLinux二进制部署vaultwarden
description: 适合低配置的主机使用二进制部署而非docker，不用安装docker，占用资源更低。磁盘内存要求更小
publishDate: 2025-03-16T17:26:00.000Z
tags:
  - AlpineLinux
---
## 需要的东西
- Alpine Linux
- 域名 (Vaultwarden仅支持Https访问，需要证书)
- cloudflare? 应该不是必须

## 域名 证书

使用A或者AAAA，将域名指向你的服务器IP
cloudflare的SSL设置成`完全`

自动生成证书可能会失效，SSL/TLS -> 源服务器 
前往cloudflare生成15年有效期的证书，分别存为crt.pem，key.pem备用，

## 部署 Vaultwarden

 `apk add vaultwarden` 

可直接部署到系统

`rc-update add vaultwarden`  

添加程序项

##  Vaultwarden - web

这个部署是不带web文件的，

`/usr/share/webapps/vaultwarden-web` 

里面只有一些样板文件，无法使用。先删除，使用命令

`rm -r /usr/share/webapps/vaultwarden-web/*`


需要前往获取最新的web文件
https://github.com/czyt/vaultwarden-binary/releases

```
mkdir va
cd va
##链接会过期，自行替换成最新版链接
wget https://github.com/czyt/vaultwarden-binary/releases/download/1.33.1-extracted/vaultwarden-linux-amd64-extracted.zip

##解压
unzip *.zip

##复制web
cp -r web-vault/* /usr/share/webapps/vaultwarden-web/
```

## 配置 Vaultwarden

官方文档 https://github.com/dani-garcia/vaultwarden/wiki/Configuration-overview
更多变量请查看文档。现在只设置主要变量

本文推荐使用`/etc/conf.d/vaultwarden`来进行配置，也就是系统变量。不经过网页，并屏蔽/admin的访问

```
vi /etc/conf.d/vaultwarden 
##编辑文件

输入i进入编辑模式

## safe
export SHOW_PASSWORD_HINT=false

## export DOMAIN=https://aa.bb.cc:443

## 注册类
export SIGNUPS_ALLOWED=false
export INVITATIONS_ALLOWED=false

## 禁止admin token
export DISABLE_ADMIN_TOKEN=false

## push 推送 https://github.com/dani-garcia/vaultwarden/wiki/Enabling-Mobile-Client-push-notification

## export PUSH_ENABLED=true

## export PUSH_INSTALLATION_ID=

## export PUSH_INSTALLATION_KEY=

## export PUSH_RELAY_URI=https://push.bitwarden.eu

## export PUSH_IDENTITY_URI=https://identity.bitwarden.eu

## limit限制

export ROCKET_LIMITS={json=10485760

按esc退出编辑，输入 :wq 保存并退出
```

接下来就可以启动了

`rc-service vaultwarden start`  支持 start/restart/stop

使用`rc-status` 检查是否crashed
使用curl 检测是否成功运行输入 `curl 127.1:8000`

如果不生效，请检测/var/lib/vaultwarden/目录下是否有config.json或.env 请删除


## caddy反代并自动https证书

```
apk add caddy
##安装caddy

apk add libcap
## 需要端口管理

rc-update add caddy
##添加至服务项

sudo setcap cap_net_bind_service=+ep $(which caddy)
## 让caddy支持端口管理
```

安装完成后 编辑配置文件`vi /etc/caddy/Caddyfile`

```
a.bb.cc:443 {
        reverse_proxy :8000 {
                header_up X-Real-IP {remote_host}
        }

        tls /crt.pem /key.pem
}
```

- 将`a.bb.cc`改为你的域名。

- tls 改为自己证书文件地址

- 如果非标端口且套cloudflare 请看官方文档支持的端口
cloudflare只支持部分端口，参见 [cloudflare](https://developers.cloudflare.com/fundamentals/reference/network-ports/)

修改完保存

再执行`caddy fmt --overwrite /etc/caddy/Caddyfile` 格式化一下caddyfile config

重启 caddy `service caddy restart`

`cat /var/log/messages`查看系统log。开机检查`rc-status`



## 备份

`/var/lib/vaultwarden/db.sqlite3` 备份数据库

`/etc/conf.d/vaultwarden` 系统配置文件 重新部署不用再次配置

## 恢复

新系统先安装会自动创建

配置文件`/etc/conf.d/vaultwarden` 恢复并覆盖

数据库`/var/lib/vaultwarden/db.sqlite3` 恢复并赋予权限

```bash
chown vaultwarden:vaultwarden db.sqlite3
chmod 600 db.sqlite3
chown vaultwarden:vaultwarden db.sqlite3-*
chmod 600 db.sqlite3-*
```
然后重启服务 `service vaultwarden restart`

错误log查看 `cat /var/log/vaultwarden/access.log`

没有权限更多的会提示 `"Unable to open the database file"`
