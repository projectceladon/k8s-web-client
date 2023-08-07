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

function build_static_web_source() {
    cd /opt/app/web_src
    npm run build
    rm -rf /opt/app/www/web
    cp -r build /opt/app/www/web
}

sed -i "s/COTURN_IP/$COTURN_IP/g" /opt/app/www/original/js/gaming.js
sed -i "s/OWT_SERVER_P2P_IP/$OWT_SERVER_P2P_IP/g" /opt/app/www/original/js/gaming.js
sed -i "s/ANDROID_HOST_IP/$BACKEND_HOST_IP/g" /opt/app/web_src/.env*
if [ "$HTTPS_ENABLE" == "true" ]; then
    sed -i "s/SIGNAL_PORT/$PORT_SIGNALING_HTTPS/g" /opt/app/www/original/js/gaming.js
else
    sed -i "s/SIGNAL_PORT/$PORT_SIGNALING/g" /opt/app/www/original/js/gaming.js
fi

if [[ $K8S_ENV_STATELESS = "true" ]]; then
    build_static_web_source
    service docker start
fi

cd /opt/app/www
service docker restart

./web-backend-entry
