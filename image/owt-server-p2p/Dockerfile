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

FROM node:10

COPY package*.json /opt/app/
WORKDIR /opt/app
RUN npm config set proxy $http_proxy \
    && npm install \
    && npm config delete proxy

COPY . /opt/app

EXPOSE 8095
CMD [ "node", "peerserver.js" ]
