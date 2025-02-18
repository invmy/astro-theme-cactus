---
title: "Alpine Linux 手动部署xray程序 支持更新core和dat"
publishDate: "2025-2-13"
description: "Alpine Linux 手动部署xray程序 支持更新core和dat"
tags: ["AlpineLinux","折腾"]
---

# 介绍

xray项目：https://github.com/XTLS/Xray-core

适用于已有config配置，但不想使用脚本/ui面板的用户。

其他参考

config大全 https://github.com/lxhao61/integrated-examples

一键脚本 https://github.com/zxcvos/Xray-script

x-ui https://github.com/MHSanaei/3x-ui


本文使用路径为/root/xray

```
# 创建文件夹xray
mkdir /root/xray

```

# Warp 实现ipv4出口


https://gitlab.com/fscarmen/warp

ipv6可能无法访问部分资源，需要提前设置ipv4出口
```
安装bash
apk add bash

下载并运行脚本
wget -N https://gitlab.com/fscarmen/warp/-/raw/main/menu.sh && bash menu.sh

选择为 IPv6 only 添加 WARP IPv4 网络接口 (bash menu.sh 4)
```

# 添加一个xray服务

touch /etc/init.d/xray

vi /etc/init.d/xray

<details>

<summary>xray 服务</summary>

```bash
#!/sbin/openrc-run

name="Xray"
description="Xray with XTLS support"

: ${env:="XRAY_LOCATION_ASSET=/root/xray"}
: ${confdir:="/root/xray"}

command="/root/xray/xray"
command_args="run -confdir $confdir >> /var/log/xray.log 2>&1"
command_user="root"
pidfile="/run/xray.pid"
command_background=true

extra_commands="update_geo update_core help"
depend() {
    need net
}

update_geo() {
    GEOIP_URL="https://github.com/Loyalsoldier/v2ray-rules-dat/raw/release/geoip.dat"
    GEOSITE_URL="https://github.com/Loyalsoldier/v2ray-rules-dat/raw/release/geosite.dat"

    [ -d $confdir ] || mkdir -p $confdir
    cd $confdir

    curl -L -o geoip.dat.new $GEOIP_URL || return 1
    curl -L -o geosite.dat.new $GEOSITE_URL || return 1

    rm -f geoip.dat geosite.dat
    mv geoip.dat.new geoip.dat
    mv geosite.dat.new geosite.dat
}

update_core() {
    REPO="XTLS/Xray-core"
    LATEST_RELEASE_URL="https://api.github.com/repos/$REPO/releases?per_page=1"
    LATEST_RELEASE=$(curl -s $LATEST_RELEASE_URL | jq -r '.[0].tag_name')

    if [ "$LATEST_RELEASE" == "null" ]; then
        echo "无法获取最新的版本信息。"
        exit 1
    fi

    DOWNLOAD_URL="https://github.com/XTLS/Xray-core/releases/download/$LATEST_RELEASE/Xray-linux-64.zip"
    DOWNLOAD_DIR="$confdir/"
    ZIP_FILE="${DOWNLOAD_DIR}Xray-linux-64.zip"

    curl -L -o "$ZIP_FILE" "$DOWNLOAD_URL" || exit 1
    unzip -o "$ZIP_FILE" -d "$DOWNLOAD_DIR" || exit 1
}

help() {
    echo "start  - Start the Xray service"
    echo "stop   - Stop the Xray service"
    echo "restart   - restart the Xray service"
    echo "update_geo    - Update the GeoIP and Geosite data"
    echo "update_core   - Update the Xray core version"
}

start() {
    ebegin "Starting $name"
    $command version || return 1
    start-stop-daemon --start --background --exec $command -- $command_args
    eend $?
}

stop() {
    ebegin "Stopping $name"
    start-stop-daemon --stop --exec $command
    eend $?
}
```
</details>

# 启动xray

将config.json放入/root/xray的文件夹内使用

```
#设置服务权限
chmod +x /etc/init.d/xray


# 获取最新的xray内容
rc-service xray update_core

# 更新最新的geo dat
rc-service xray update_geo

# 设置内核权限
chmod +x /root/xray/xray

#启动
rc-service xray start

#可以查看运行状态
rc-status
```
## 其他命令

```
Enable
# rc-update add xray

Disable
# rc-update del xray

安装包
apk add ...

启动/停止/重启 已有服务
rc-service 服务名 start/stop/restart

列出所有可用服务
rc-service --list

服务状态
rc-status
```

# 自动更新

```
crontab -e 

编辑定时任务

*       *       5       *       *       rc-service xray update_geo &rc-service xray restart
*       *       10      *       *       rc-service xray update_core &rc-service xray restart

```

# 参考

* https://tabsp.com/posts/vless-reality-vision/
* https://linux.do/t/topic/151670
* https://blog.passall.us/archives/1300