#!/bin/bash
# author: zeng1x.zhang

set -e

function msg() {
  echo -e "> \033[32m $@ \033[0m"
}

function warn() {
  echo -e "> \033[33m $@ \033[0m"
}

function err() {
  echo -e "> \033[31m $@ \033[0m" >&2
}

function usage(){
    local self=$(basename $0)
    cat <<EOF
Usage: $self [install|uninstall] [-h] 
  manage devops by helm
  install : helm install devops 
  uninstall : helm uninstall devops
  -h:        print the usage message
  
EOF
}

function check_prerequisites() {
  msg "check prerequisites"
  if [[ -z $(which helm) ]]; then
    err "helm is not available!"
    exit 1
  fi
  if [[ $(kubectl get sc| tail -n +2 |wc -l) -eq 0 ]]; then
    err "storeclass is not available!"
    exit 1
  fi
  if [[ $(kubectl get pod -A | grep ingress | wc -l) -eq 0 ]]; then
    err "ingress controller is not available!"
    exit 1
  fi
}


function deploy() {
    check_prerequisites
    msg "helm install devops!"
    helm install mysql ./mysql/
    helm install owt ./owt/
    helm install coturn ./coturn/
    helm install coordinator ./coordinator/
    helm install webrtc ./webrtc/
    helm install adb-forward ./adb-forward/
    helm install aic-manager ./aic-manager/
    helm list |grep -E "mysql|owt|coturn|coordinator|webrtc|adb-forward|aic-manager"
    msg "helm install sucess!"  
}

function undeploy() {
    msg "helm uninstall devops"
    helm uninstall  coordinator coturn mysql owt webrtc adb-forward aic-manager
    #kubectl delete pvc $(kubectl get pvc |tail -n +2|awk '{print $1}')
    helm list |grep -E "mysql|owt|coturn|coordinator|webrtc|adb-forward|aic-manager"
    msg "helm uninstall sucess"
}

function main() {
   case "$1" in
    install)
        deploy
    ;;
    uninstall)
        undeploy
    ;;
    *)
        usage && exit 1
    ;;
   esac
}

main $@
