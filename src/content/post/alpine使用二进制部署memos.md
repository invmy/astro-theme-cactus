---
title: Alpine使用二进制部署Memos
publishDate: 2025-02-25T06:44:52.380Z
description: 使用最小的空间安装memos并链接cloudflare R2桶
tags:
  - 折腾
---
## 开始

本来程序就小，非要装docker。

硬盘都不够下镜像，官网更是只有docker部署教程。

记录一下二进制部署。

所需材料

memos : https://github.com/usememos/memos

cloudflare R2 [需要绑卡] : https://developers.cloudflare.com/r2/

## 下载memos二进制

https://github.com/usememos/memos/releases

这是官方项目的发布页，找到自己的架构下载下来。

```
# 创建 /var/lib/memos/data 目录
mkdir -p /var/lib/Memos/data/

# 解压 tar.gz 文件到 /var/lib/memos
tar -xzvf memos*.tar.gz -C /var/lib/Memos

# 给权限
chmod +x /var/lib/Memos/memos
```

## 创建memos rc服务

```
touch /etc/init.d/memos

vi /etc/init.d/memos
```

粘贴以下内容进去
```
#!/sbin/openrc-run

name="memos"
command="/var/lib/Memos/memos"
command_args="--data /var/lib/Memos/data/ --mode prod --port 5230 --addr 127.0.0.1"
pidfile="/run/${name}.pid"

# 指定用户和组
command_user="memos:memos"

depend() {
    need net
}

start_pre() {
    checkpath --directory --mode 0755 /var/lib/Memos/data/
}

start() {
    ebegin "Starting ${name}"
    # 使用 --user 来确保以 memos 用户身份启动
    start-stop-daemon --start --background --make-pidfile --pidfile ${pidfile} --exec ${command} -- ${command_args}
    eend $?
}

stop() {
    ebegin "Stopping ${name}"
    start-stop-daemon --stop --pidfile ${pidfile}
    eend $?
}

```

## 开机启动
```
rc-update add memos
```

## 创建反代

因为监听 127.0.0.1本地地址不能端口直接访问。不需要反代删除rc服务中` --addr 127.0.0.1 `

```
#caddy 示例，没有证书删除tls。证书可以通过cloudflare申请15年的
:443 {
        reverse_proxy :5230
        tls /ssl/pem /ssl/key
}
```

## Cloudflare R2
部署完成后。创建一个桶 前往设置，存储设置
```
#文件名存储方式
Filepath template
详解https://www.usememos.com/docs/advanced-settings/local-storage

#创建Api与R2会出现，对着填
Access key id
访问密钥 ID

Access key secret
机密访问密钥

Endpoint
上传端点即入口

Region
桶地区可填auto

Bucket
桶名

Use Path Style
不清楚啥意思
```

## 打开跨域 Cloudflare R2 设置 CORS 策略

域名修改成自己的，修复无法访问桶资源
```
[
  {
    "AllowedOrigins": ["https://memos.me"],
    "AllowedMethods": ["GET"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["x-amz-request-id"],
    "MaxAgeSeconds": 3000
  }
]
```
