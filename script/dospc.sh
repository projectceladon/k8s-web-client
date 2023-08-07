#!/bin/bash
#
# Copyright (C) 2018 Intel Corporation.
#
# This software and the related documents are Intel copyrighted materials,
# and your use of them is governed by the express license under which they
# were provided to you (End User License Agreement for the Intel(R) Software
# Development Products (Version September 2018)). Unless the License provides
# otherwise, you may not use, modify, copy, publish, distribute, disclose or
# transmit this software or the related documents without Intel's prior
# written permission.
#
# This software and the related documents are provided as is, with no
# express or implied warranties, other than those that are expressly
# stated in the License.
#

cmd=0
deploy_dir="$(pwd)"
cmd=0
PORT_SIGNALING=${PORT_SIGNALING:-'8095'}
PORT_SIGNALING_HTTPS=${PORT_SIGNALING_HTTPS:-'8096'}
TAG=${TAG:-alpha}
name="owt-server-p2p"
kind=0
port_signaling=8095
port_signaling_https=8096

DOCKER="sudo docker"
if [[ "$(id -u)" == "0" ]] || id -nG | grep -qw docker; then
    DOCKER="docker"
fi

function msg {
    echo "> $@"
}

echo -e "\n$0"
help=$(
    cat <<EOF
$0 Preconditions: None
    -c cmd
        1: Deploy
        2: Uninstall
        4: Stop
    -e deploy_dir E.g: $deploy_dir
    -ps|--port-signaling <port> port_signaling
    -psh|--port-signaling-https <port> port_signaling_https
    -k kind:
        1: owt_server_p2p
        2: coturn
Example:
    Uninstall coturn: $0 -k 2 -c 2
    Uninstall owt_server_p2p: $0 -k 1 -c 2
    Install coturn: $0 -k 2 -c 1
    Install owt_server_p2p for docker deployment: $0 -k 1 -c 1 -ps 8095 -psh 8096
    Install owt_server_p2p for docker deployment: $0 -k 1 -c 1 -ps 30000 -psh 30001
EOF
)

while [ "$#" -gt 0 ]; do
    case "$1" in
    -c)
        shift
        cmd=$1
        echo "$cmd"
        deploy_dir="/work/aic"
        if [ ! -d $deploy_dir ]; then
            deploy_dir="$(pwd)"
        fi
        echo "deploy_dir=$deploy_dir"
        shift
        ;;
    -e)
        shift
        deploy_dir=$1
        echo "$deploy_dir"
        shift
        ;;
    -ps | --port-signaling)
        port_signaling=$1
        if [ ! -n "$port_signaling" ]; then
            echo "port_signaling is null"
            exit 1
        fi

        if [ $port_signaling -lt 1 ]; then
            echo "$port_signaling < 1"
            exit 1
        fi

        if [ $port_signaling -gt 65535 ]; then
            echo "$port_signaling > 65535"
            exit 1
        fi
        PORT_SIGNALING=$port_signaling
        echo "Set PORT_SIGNALING=$port_signaling"
        shift
        ;;
    -psh | --port-signaling-https)
        port_signaling_https=$1
        if [ ! -n "$port_signaling_https" ]; then
            echo "port_signaling_https is null"
            exit 1
        fi

        if [ $port_signaling_https -lt 1 ]; then
            echo "$port_signaling_https < 1"
            exit 1
        fi

        if [ $port_signaling_https -gt 65535 ]; then
            echo "$port_signaling_https > 65535"
            exit 1
        fi
        PORT_SIGNALING_HTTPS=$port_signaling_https
        echo "Set PORT_SIGNALING_HTTPS=$port_signaling_https"
        shift
        ;;
    -k)
        shift
        kind=$1
        echo "$kind"
        if [ $(($kind & 1)) -gt 0 ]; then
            name="owt-server-p2p"
        elif [ $(($kind & 2)) -gt 0 ]; then
            name="coturn"
        else
            echo "Unkonw kind"
            exit 1
        fi
        shift
        ;;
    -h) echo "$help" && exit ;;
    *) echo "no such option: $1" && exit 1 ;;
    esac
done

if [ $cmd -ge 1 ]; then
    if [ $(($cmd & 1)) -gt 0 ]; then

        echo "Deploy $name in ${deploy_dir}:"

        file=${deploy_dir}/${name}.tar.gz
        if [ ! -f "$file" ]; then
            echo "$file is not exsit."
            exit 1
        else
            echo "$file is ready."
        fi
        image=${name}:${TAG}

        msg "load $file"
        old=$($DOCKER load -i $file | sed -n 's/Loaded image[^:]*:\s*//p')
        if [ $? -ne 0 ]; then
            echo "Fail to load $file"
            exit 1
        fi

        msg "tag $old as $image"
        $DOCKER tag $old $image
        if [ $? -ne 0 ]; then
            echo "Fail to $DOCKER tag $old $image"
            exit 1
        fi

        if [ $(($kind & 1)) -gt 0 ]; then
            $DOCKER create --name $name -p $PORT_SIGNALING:8095 -p $PORT_SIGNALING_HTTPS:8096 $image
            if [ $? -ne 0 ]; then
                echo "Fail to $DOCKER create --name $name -p $PORT_SIGNALING:8095 -p $PORT_SIGNALING_HTTPS:8096 $image"
                exit 1
            fi
        elif [ $(($kind & 2)) -gt 0 ]; then
            $DOCKER create --name $name --net host -e http_proxy -e no_proxy $image
            if [ $? -ne 0 ]; then
                echo "$DOCKER create --name $name --net host -e http_proxy -e no_proxy $image"
                exit 1
            fi
        else
            echo "Unkonw kind"
            exit 1
        fi

        $DOCKER start ${name}
        if [ $? -ne 0 ]; then
            echo "Fail to $DOCKER start ${name}"
            exit 1
        fi
    fi

    if [ $(($cmd & 2)) -gt 0 ]; then
        $DOCKER rm -f ${name}
        if [ $? -ne 0 ]; then
            echo "Fail to $DOCKER rm -f ${name}"
            exit 1
        fi

        $DOCKER rmi -f ${name}
        if [ $? -ne 0 ]; then
            echo "Fail to $DOCKER rmi -f ${name}"
            exit 1
        fi
    fi

    if [ $(($cmd & 4)) -gt 0 ]; then
        $DOCKER stop ${name} -t 0
    fi

    docker ps
    if [ $? -ne 0 ]; then
        echo "Fail to docker ps"
        exit 1
    fi
fi
