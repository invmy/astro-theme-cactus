---
title: AlpineLinux安装哪吒探针-Argo版
description: 在AlpineLinux安装哪吒探针-Argo版支持无公网坏境 无公网暴漏 使用argo tunnel
publishDate: 2025-03-21T19:35:00.000Z
tags:
  - AlpinLinux
---
项目地址：https://github.com/fscarmen2/Argo-Nezha-Service-Container

原版宿主机VPS安装在AlpineLinux下存在问题，无法创建守护程序

找chatgpt写了一个使用grpcwebproxy方式的守护程序。

隧道面板设置
数据传输：proto.NezhaService
https://localhost:5000

面板：*
http://localhost:5001
```
#!/sbin/openrc-run

name="nezha"
description="Nezha Monitoring Dashboard"
command="/opt/nezha/dashboard/app"
command_background="yes"

depend() {
    use net
}

start() {
    ebegin "Starting Nezha services"

    cd /opt/nezha/dashboard

    nohup /opt/nezha/dashboard/grpcwebproxy --run_http_server=false --server_tls_cert_file=/opt/nezha/dashboard/nezha.pem --server_tls_key_file=/opt/nezha/dashboard/nezha.key --server_http_tls_port=5000 --backend_addr=localhost:5002 --backend_tls_noverify --server_http_max_read_timeout

    start-stop-daemon --start --exec /opt/nezha/dashboard/app --background --quiet --make-pidfile --pidfile /var/run/nezha.pid

    nohup /opt/nezha/dashboard/cloudflared tunnel --edge-ip-version auto --protocol http2 run --token 替换我成隧道token

    eend $?
}

stop() {
    ebegin "Stopping Nezha services"
    pkill -f "/opt/nezha/dashboard/(cloudflared|grpcwebproxy|caddy|app)"
    eend $?
}

```
