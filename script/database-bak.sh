#!/usr/bin/env bash
# author: zeng1x.zhang
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

set -e

OPTION_LIST="bak re"
OPTION=bak
MYSQL_SERVICE=$(kubectl get svc |grep mysql|awk '{print $3}')
DATE=$(date +%Y%m%d)
BACK_DIR=$(pwd)
USERNAME=root
PASSWORD=intelotc
PORT_MYSQL=3306
BACK_FILE=androidcloud-$DATE.sql
FULL_FILE=$BACK_DIR/$BACK_FILE
function usage(){
    local self=$(basename $0)
    cat <<EOF
Usage: $self [-e <host>] [-u <username>] [-p <port>] [-P <password>] [-d <dir>] [-h] 
  Backup androidcloud database from k8s
  -o <option>: database option default:$OPTION
  -e | --addr <mysql_clusterip>: Mysql service clusterIP. default: $MYSQL_SERVICE
  -d <dir>:  back directory, default: $BACK_DIR
  -u <username>: mysql connection user, default: $USERNAME
  -P <password>:mysql connection password, defult:$PASSWORD
  -p <port>:  port number, default: $PORT_MYSQL
  -f <sql_file>: backup file name, default:$BAK_FILE
  -h:        print the usage message
EOF

}

function msg() {
  echo -e "> \033[32m $@ \033[0m"
}

function warn() {
  echo -e "> \033[33m $@ \033[0m"
}

function err() {
  echo -e "> \033[31m $@ \033[0m" >&2
}

function check_prerequisites() {
  msg "check prerequisites"
  if [[ -z $(which mysql) ]]; then
    err "mysql client is not available"
    exit 1
  fi
  if [[ -z $(kubectl get svc |grep mysql|awk '{print $3}') ]]; then
    err "mysql service is not available"
    exit 1
  fi
}

while [ "$#" -gt 0 ]; do
    case "$1" in
    -o)
        shift
        OPTION=$1
        if echo $OPTION_LIST|grep -v -w $OPTION >/dev/null 2>&1; then
             err "invalid database option $OPTION"
             usage && exit 1
        fi
        # msg "OPTION: $OPTION"
        shift
        ;;
    -e|--addr)
        shift
        MYSQL_SERVICE=$1
        # msg "MySQL_Service IP: $MYSQL_SERVICE"
        shift
        ;;
     -d)
        shift
        BACK_DIR=$(cd $1 && pwd)
        FULL_FILE=$BACK_DIR/$BACK_FILE
        shift
        ;;
    -u)
        shift
        USERNAME=$1
        shift
        ;;
    -p)
        shift
        PASSWORD=$1
        shift
        ;;
    -P)
        shift
        PORT_MYSQL=$1
        shift
        ;;
    -f)
        shift
        BACK_FILE=$1-$DATE.sql
        FULL_FILE=$BACK_DIR/$BACK_FILE
        shift
        ;;
    -h) usage && exit ;;
    *)
        usage
        exit 1
        ;;
    esac
done

function Check_Env(){
    for v in OPTION MYSQL_SERVICE USERNAME PASSWORD PORT_MYSQL BACK_DIR BACK_FILE FULL_FILE
    do
    eval msg "$v: \${$v}"
    done
}


function Check_File() {
    if [ -f $FULL_FILE ] ;then
        return 0
    else 
        return 1
    fi

}

function Bakup_Data() {
    
    if Check_File ;then
        err "file exist,please remove file and retry"
        exit 1
    fi

    msg "starting database backup"
    mysqldump -h $MYSQL_SERVICE -P$PORT_MYSQL -u$USERNAME -p$PASSWORD --databases androidcloud > $BACK_DIR/$BACK_FILE
    if [ $? -eq 0 ] ;then
        msg "androidcloud database backup sucesss!"
        exit 0
    else
        err "androidcloud database backup failed!"
        exit 1
    fi
}

function Recovery_Data() {
    if ! Check_File ;then
        err "file not exist,please check backup file"
        exit 1
    fi
    msg "starting database recovery"
    mysql -h $MYSQL_SERVICE -P$PORT_MYSQL -u$USERNAME -p$PASSWORD < $BACK_DIR/$BACK_FILE
    if [ $? -eq 0 ] ;then
        msg "androidcloud database recovery sucesss!"
        exit 0
    else
        err "androidcloud database recovery failed!"
        exit 1
    fi
}

function main() {
    check_prerequisites
    Check_Env
    if [ "$OPTION" == "re" ] ;then
       Recovery_Data
    else 
        Bakup_Data
    fi
}

main $@
