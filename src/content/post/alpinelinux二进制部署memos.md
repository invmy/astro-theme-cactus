---
title: AlpineLinux二进制部署Memos
description: AlpineLinux使用二进制方式部署Memos，不安装docker坏境。适合低配置主机。最快方式部署
publishDate: 2025-03-16T17:22:00.000Z
tags:
  - AlpineLinux
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

更多构建

https://github.com/k0baya/memos-binary/releases

https://github.com/memospot/memos-builds

版本选择请看 https://blog.memos.ee/archives/227.html

注意 如果你R2需要自定义域名而并非直接使用 预签名的url 请使用0.21.0及更旧的版本。 从22开始强制使用预签名的url也就是不支持自定义域名

```
# 创建 /opt/memos/memos/data 目录
mkdir -p /opt/memos/data/

# 解压 tar.gz 文件到 /opt/memos/memos
tar -xzvf memos*.tar.gz -C /opt/memos/

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
description="memos daemon"
supervisor="supervise-daemon"

command="/opt/memos/memos"
command_user="memos:memos"
directory="${DATA_FOLDER:-/opt/memos/}"
pidfile="/run/${RC_SVCNAME}.pid"

command_args="--data ${directory}data/ --mode prod --port 5230 --addr 127.0.0.1"

depend() {
    need net
}

start_pre() {
    checkpath -d -m 0755 -o memos:memos "${directory}"
}

```

## 权限
```
#非root用户运行更安全，添加用户memos
adduser -D memos

chmod +x /etc/init.d/memos

chmod +x /opt/memos/memos
chown -R memos:memos /opt/memos/
chown -R memos:memos /opt/memos/data/
chown -R memos:memos /opt/memos/memos
chmod -R 755 /opt/memos/
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

URL 前缀
自定义的桶链接。
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
