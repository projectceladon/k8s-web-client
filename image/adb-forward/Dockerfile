FROM ubuntu:bionic

RUN apt-get update && apt-get install -y \
    iptables iproute2 \
 && rm -rf /var/lib/apt/lists/*

COPY ./adb-forward /

ENTRYPOINT ["/adb-forward"]
