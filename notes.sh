fun deploy

fun local start
fun local start -d 3000 -c vscode


#################################################################################
# 在 fc 环境与进行 puppeter
# 1. 在 fc docker linux 安装 puppeteer
# 2. 因为 fc linux 缺少 chrome dep's so 文件，需要手动安装

# 1. go into sandbox: 
# 本来可以用 fcli shell sbox -d . -t nodejs10，但是 fcli 竟然不支持 nodejs10，用下面的命令替换
docker run --rm -i -t -v $(pwd):/code registry.cn-beijing.aliyuncs.com/aliyunfc/runtime-nodejs10:build /bin/bash

# 2. install puppeteer for docker linxu env
yarn add

# 3. install chrome Debian (e.g. Ubuntu) Dependencies
# https://developer.aliyun.com/article/601753，这篇文章中编译好的 headless chrome 太老了，跑起来后 waitForSelector 会一直 timeout
# install chrome deps
cd /code

mkdir debs
#下面的命令参数 -d 是让 apt-get 只下载安装包，不进行安装
apt-get install -d -o=dir::cache=/code/debs gconf-service libasound2 libatk1.0-0 libatk-bridge2.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
#创建 lib 目录，用于安装 chrome headless 依赖的动态链接库
mkdir lib
#安装上面下载的库文件到指定目录
for file in $(ls /code/debs/archives/*.deb)
do
    echo "install: $file"
    dpkg -x  $file /code/lib/
done
r​m -rf debs

# 测试
LD_LIBRARY_PATH=./lib/usr/lib/x86_64-linux-gnu/ node test.js