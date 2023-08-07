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

#set -v on

USERNAME=${1:-virt02}
HOST=${2:-$(ip route get 1 | head -1 | awk '{print $7}')}
docker_proxy_dir=/etc/systemd/system/docker.service.d

if [ ! -d $docker_proxy_dir ];then
    sudo mkdir $docker_proxy_dir
fi
cat << EOF | sudo tee $docker_proxy_dir/http-proxy.conf
[Service]
Environment="HTTP_PROXY=http://child-prc.intel.com:913"
Environment="HTTPS_PROXY=http://child-prc.intel.com:913"
Environment="NO_PROXY=127.0.0.1,aosp-aic-dockerserver.sh.intel.com,aosp-dev.sh.intel.com"
EOF
cat << EOF | sudo tee /etc/docker/daemon.json
{
    "insecure-registries": [
        "aosp-aic-dockerserver.sh.intel.com:5000",
        "aosp-dev.sh.intel.com:5000"
    ]
}
EOF

echo "Restart docker"
sudo systemctl daemon-reload
sudo systemctl restart docker

echo $#
if [ $# -eq 1 ]; then
    echo "HOST IP: $HOST"
else
    if [ $# -nq 3 ]; then
        echo "Need host IP"
        exit
    fi
fi

tee -a ./environment << EOF
$(head -n1 /etc/environment)
HTTP_PROXY=http://child-prc.intel.com:913
HTTPS_PROXY=http://child-prc.intel.com:913
NO_PROXY=127.0.0.1,aosp-aic-dockerserver.sh.intel.com,aosp-dev.sh.intel.com,10.96.0.0/12,10.244.0.0/16,$HOST
EOF
sudo mv ./environment /etc/environment
source /etc/environment

if [ $# -eq 0 ]; then
    echo "Create master node"
    sudo kubeadm reset -f
    sudo swapoff -a
    sudo kubeadm init --apiserver-advertise-address=$HOST --pod-network-cidr=10.244.0.0/16 | tee result.log

#export KUBECONFIG=/etc/kubernetes/admin.conf
#For regular user
    if [ ! -d $HOME/.kube ];then
        mkdir $HOME/.kube
    fi
    sudo cp -f /etc/kubernetes/admin.conf $HOME/.kube/config
    sudo chown $(id -u):$(id -g) $HOME/.kube/config

    #Allow k8s pods running on master node
    kubectl taint nodes --all node-role.kubernetes.io/master-

    echo "wait 5s to apply kube-flannel.yml"
    sleep 5
    #Install Flannel plugin that manages k8s networking
    kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/2140ac876ef134e0ed5af15c65e414cf26827915/Documentation/kube-flannel.yml

    echo "wait 5s to refresh pods"
    sleep 5
    kubectl get pods --all-namespaces

    # For rs_stf.yaml
    sudo sed -i '/- --service-cluster-ip-range/a\    - --service-node-port-range=1-65535' /etc/kubernetes/manifests/kube-apiserver.yaml
cat << EOF
It will list all system pods and 'STATUS' columns must be all 'Running'
If you find core-dns pods in "CrashLoopBackOff" state, run below commands and check again.
sudo vim /etc/resolv.conf
delete line "nameserver 127.0.1.1", and add the following lines:
nameserver 8.8.8.8
nameserver 8.8.4.4

get coredns pod name
    kubectl get pods --all-namespaces -o wide
restart coredns
    kubectl delete pod <coredns pod name> -n kube-system
repeat above for all coredns pods
EOF
else
    echo "Create work node"
    sudo kubeadm reset -f
    sudo swapoff -a
    scp $USERNAME@$HOST:~/.kube/config $HOME/
    scp $USERNAME@$HOST:~/result.log $HOME/
    join_cmd=`tail -n2 $HOME/result.log | sed ':a;N;s/\\\\\n//g;ba'`
    echo $join_cmd
    eval "sudo $join_cmd"
    if [ ! -d $HOME/.kube ];then
        mkdir $HOME/.kube
    fi
    mv $HOME/config $HOME/.kube/config
    #kubectl apply -f rancher-local-path-storage.yaml -f ds-fbset.yaml -f aic.yaml -f rs-stf.yaml
fi
