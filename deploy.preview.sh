#!/bin/bash

# 部署测试环境在物理机上

#########
# 根据项目的不同只需要修改以下右侧变量
#----------------------------------------------
# 指定构建镜像的文件
dockerfile=Dockerfile.preview
# 指定镜像名，不要和以前项目重名
image=test/bmp-preview
# 指定容器名，不要和以前项目重名
container=bmp-preview
# 宿主机监听的端口，不要和以前项目端口冲突。 eg: test.yuxisoft.cn:3555
port=22200
#----------------------------------------------
# 在镜像文件dockerfile的暴露的EXPOSE端口，可不修改
dockerPort=80

# 以下内容应为固定，可以不需要再修改
# 以指定的dockerfile为基础构建出docker镜像

docker build -t $image -f $dockerfile .
# 当再次构建时，需要将之前的容器停止和删除
docker container stop $container || true && docker container rm $container || true
# 启动容器
docker run -v /var/run/docker.sock:/var/run/docker.sock --name $container -d -p $port:$dockerPort $image

# docker入门推荐文档  https://yeasy.gitbook.io/docker_practice
