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

FROM ubuntu:bionic

RUN apt-get update && apt-get install -y \
    curl iproute2 \
 && rm -rf /var/lib/apt/lists/*

COPY resAllocClient /bin/
COPY manage-android /

ENTRYPOINT [ "/manage-android" ]
