---
title: Rclone配置Cloudflare-R2
description: Alpine Linux配置S3使用Rclone快速备份到CloudflareR2存储桶
publishDate: 2025-03-16T16:19:00.000Z
tags:
  - cloudflare
---
## R2

创建一个Cloudflare R2存储

并获取创建API配置

## 安装与配置

### Alpine系统 安装 rclone

```
apk add rclone
```

### 编辑rclone配置文件

```
vi ~/.config/rclone/rclone.conf
```

粘贴并修改以下内容

```
[r2]
type = s3
provider = Cloudflare
access_key_id = 0----------------------------8
secret_access_key = 8----------------------------d
region = auto
endpoint = https://3b0----------------------------4.r2.cloudflarestorage.com/桶名
```

变量解释，按要求修改并保存。

```

[配置名]
type = s3存储
provider = 提供商
access_key_id = API的key_id
secret_access_key = API的key_密钥
region = 位置 可填auto
endpoint = 端点，桶的设置--存储桶详细信息--S3 API：
```

### 测试rclone配置

使用 tree 列出文件测试配置，没有报错即成功

```

rclone tree r2:

```

## 上传文件

```
rclone -P -v copy file.txt r2:/dir
```

- -P 显示速度
- -v 详情
- file.txt 文件或文件夹
- r2:/dir 配置:/存储文件夹

将会保存在 /dir/file.txt目录下

可能会出现一个与文件夹同名的0kb文件，

因为不允许空文件夹，手动删除0kb文件即可

## 备份脚本
使用tar.gz备份并保留权限
```bash
#!/bin/bash

server="r2"
save_dir="/bak"

# 获取当前日期，格式: yyyy-mm-dd_HH:MM
CURRENT_DATE=$(date +"%Y-%m-%d_%H:%M")

sh /root/sh/fcm.sh "Backup Starting" "$CURRENT_DATE"

# 需要备份的目录和文件
BACKUP_DIR="/etc/caddy/Caddyfile /etc/conf.d/vaultwarden/"
BACKUP_TAR_NAME="backup_$CURRENT_DATE.tar.gz"

# 创建 tar.gz 备份文件
tar -czpf "$BACKUP_TAR_NAME" $BACKUP_DIR

# 获取 tar.gz 文件大小（KB）
TAR_FILE_SIZE=$(stat -c %s "$BACKUP_TAR_NAME")
TAR_FILE_SIZE_KB=$(echo "scale=2; $TAR_FILE_SIZE / 1024" | bc)

# 上传到 rclone 远程存储
rclone copy ./$BACKUP_TAR_NAME $server:$save_dir -vv --log-file=/var/log/rclone.log

if [ $? -eq 0 ]; then 
    sh /sh/fcm.sh "Backup Done" "$CURRENT_DATE 大小 $TAR_FILE_SIZE_KB KB"
else
    last_log=$(tail -n 20 /var/log/rclone.log) 
    sh /sh/fcm.sh "Backup Error" "$last_log"
fi

# 删除本地备份文件
rm "$BACKUP_TAR_NAME"

```

## 还原备份
使用tar.gz的备份使用的相对路径，

指定解压在 / 根目录下

```
tar -xzf backup.tar.gz -C /
```

## FCM.sh

安卓机使用fcm进行推送

项目：https://fcm-toolbox-public.web.app/#send-ping

android端下载：https://github.com/SimonMarquis/FCM-toolbox/releases

脚本中 `your-token` 修改为自己设备的token。

使用方法 `sh fcm.sh "title" "conent"`

```bash
#!/bin/bash

# 发送 FCM 消息
send_fcm_message() {
    local title="$(echo "$1" | iconv -f UTF-8 -t UTF-8)"
    local message="$(echo "$2" | iconv -f UTF-8 -t UTF-8)"

    json_payload=$(jq -n --arg title "$title" --arg message "$message" '{
      data: {
        to: "your-token",
        ttl: 60,
        priority: "high",
        data: {
          text: {
            title: $title,
            message: $message,
            clipboard: false
          },
          hide: false
        }
      }
    }')

    curl -s -X POST "https://us-central1-fir-cloudmessaging-4e2cd.cloudfunctions.net/send" \
      -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1" \
      -H "Content-Type: application/json; charset=UTF-8" \
      -H "Accept-Charset: UTF-8" \
      -H "Referer: https://fcm-toolbox-public.web.app/" \
      --data "$json_payload"
}

# 检查是否有参数
if [ $# -ne 2 ]; then
    echo "Usage: $0 \"title\" \"message\""
    exit 1
fi

# 发送通知
send_fcm_message "$1" "$2"
```