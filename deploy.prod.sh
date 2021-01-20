#!/bin/bash

# 以下都是部署生产环境到阿里云上，仅供参考

# 修改以下两个配置
tag=qu-cms-prod
dockerfile=Dockerfile.prod

branch=${GIT_BRANCH#*/}
imagename=$tag-$branch
container=$tag
containerbak=$tag-bak
host=tcp://47.96.113.110:14567
user=253902456@qq.com
passwd=Xuejiaqi.3
logdir=/var/log/
domain=registry.cn-hangzhou.aliyuncs.com
repo=/prodimg/prodrepo
echo $imagename
echo $containerbak
docker build -t $tag -f $dockerfile .
docker login -u $user -p $passwd $domain
docker tag $tag $domain$repo:$imagename
docker push $domain$repo:$imagename

#远程登录生产机的docker
docker -H $host login -u $user -p $passwd $domain
docker -H $host pull $domain$repo:$imagename
docker -H $host rm $containerbak || true
docker -H $host rename $container $containerbak || true
docker -H $host stop $containerbak || true
##下面的是用于CMS发布的
docker -H $host run -d -p 3113:80 --name $container -v $logdir:$logdir $domain$repo:$imagename
