#!/bin/bash
function usage() {
    local self=$(basename $0)
    cat <<EOF
Usage: $self [-p <tag>] [-t <tag>] [-s]
EOF
}

ORIGINAL_TAG="latest"
TARGET_TAG="latest"
START=n

function images_update() {
    IMAGES="android dg2-streamer manage-android"
    for i in $IMAGES; do
        echo "Pull $i from $REGISTRY"
        docker pull $REGISTRY/$i:$ORIGINAL_TAG
        echo "Save $i"
        docker save $REGISTRY/$i:$ORIGINAL_TAG | gzip > $i.tar.gz
    done

    source ./update-android

    PUSH_IMAGES="android manage-android dg2-streamer"
    for i in $PUSH_IMAGES; do
        file=$i.tar.gz
        new=$REGISTRY/$i:$TARGET_TAG
        echo "load $file"
        old=$(docker load -i $file | sed -n 's/Loaded image[^:]*:\s*//p')
        echo "tag $old as $new"
        docker tag $old $new
        echo "push $new to the registry"
        docker push $new
    done

    echo "End"
}

while [ "$#" -gt 0 ]; do
    case "$1" in
        -p)
            shift
            ORIGINAL_TAG=$1
            shift
            ;;
        -t)
            shift
            TARGET_TAG=$1
            shift
            ;;
        -s)
            START=y
            shift
            ;;
        *)
            usage
            exit 1
            ;;
    esac
done

[[ $START = "y" ]] && images_update && exit
