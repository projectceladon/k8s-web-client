#!/bin/bash
# Author: Binly Deng (bing.deng@intel.com)
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

debug=0
n=129
exeption_n=0
log="./trace.html"
exeption="exeption.txt"
long_delay="long_delay.txt"
long_delay_n=0
long_delay_threshold=120
S1_S3_map="S1_S3_map.txt"
S1="S1.txt"
S3="S3.txt"
S1_key_word="atou S1"
S3_key_word="atou S3"
num=0
max=0
min=999999
sum_time=0
sum_size=0
avg_time=0
avg_size=0
ret="ret.txt"
final_ret="final_ret.txt"

echo -e "\n$0"
echo "OPTIND starts at $OPTIND"
while getopts "c:i:h" optname; do
    case "$optname" in
    "c")
        echo "Option $optname has value $OPTARG"
        cmd=$OPTARG
        echo "$cmd"
        ;;
    "i")
        echo "Option $optname has value $OPTARG"
        log=$OPTARG
        echo "$log"
        ;;
    "h")
        echo "Option $optname has value $OPTARG"
        echo "$0 Preconditions: None"
        echo -e "   -c cmd \t\t1: Extract S1 S3 log from input file. \r\n\t\t\t2: Adjuest S1.txt or S3.txt. Check the number of line is same for S1.txt and S3.txt. \r\n\t\t\t4: Caculate."
        echo -e "   -i input file"
        echo -e "   Example: $0 -b \"/work/misc/aic/aic_external/aic_external.log\" -c 1"
        exit 0
        ;;
    "?")
        echo "Unknown option $OPTARG"
        ;;
    ":")
        echo "No argument value for option $OPTARG"
        ;;
    *)
        # Should not occur
        echo "Unknown error while processing options"
        ;;
    esac
    echo "OPTIND is now $OPTIND"
done
if [ $cmd -ge 1 ]; then

    if [ $(($cmd & 1)) -gt 0 ]; then
        if [ ! -f $log ]; then
            echo "$log is not exist"
            exit 1
        fi

        grep atou $log | grep -e S1 -e "size: [2-9][0-9][0-9][0-9]" -e "size: [0-9][0-9][0-9][0-9][0-9]" >$S1_S3_map
        cat -n $S1_S3_map
    fi

    if [ $(($cmd & 2)) -gt 0 ]; then
        if [ ! -f $S1_S3_map ]; then
            echo "$S1_S3_map is not exist"
            exit 1
        fi

        cat $S1_S3_map | grep "$S1_key_word" >$S1
        cat $S1_S3_map | grep "$S3_key_word" >$S3

        S1_line_num=$(cat $S1 | wc -l)
        S3_line_num=$(cat $S3 | wc -l)
        if [ $S1_line_num -ne $S3_line_num ]; then
            echo "$S1_line_num != $S3_line_num"
            exit 1
        else
            echo "S1_line_num=$S1_line_num S3_line_num=$S3_line_num"
        fi
    fi

    if [ $(($cmd & 4)) -gt 0 ]; then
        if [ ! -f $S1 ]; then
            echo "$S1 is not exist"
            exit 1
        fi

        if [ ! -f $S3 ]; then
            echo "$S3 is not exist"
            exit 1
        fi

        rm -rf $final_ret $ret

        S1_line_num=$(cat $S1 | wc -l)
        S3_line_num=$(cat $S3 | wc -l)
        if [ $S1_line_num -ne $S3_line_num ]; then
            echo "$S1_line_num != $S3_line_num"
            exit 1
        else
            echo "S1_line_num=$S1_line_num S3_line_num=$S3_line_num"
        fi

        echo "S1 Time | S3 Time | Latency(ms)" >>$ret
        echo "S1 Time | S3 Time | Latency(ms)" >>$threshold_down_ret

        n=$S1_line_num
        for ((i = 1; i <= $n; i++)); do
            S1line=$(sed -n "${i}p" ${S1})
            S1t=$(echo "$S1line" | awk '{print $4}' | sed 's/://g')
            S3line=$(sed -n "${i}p" ${S3})
            S3t=$(echo "$S3line" | awk '{print $4}' | sed 's/://g')
            S3s=$(echo "$S3line" | awk '{print $11}' | sed 's/://g')

            if [ $debug -gt 0 ]; then
                echo $S1line
                echo $S3line
                echo $S1t $S3t $S3s
            fi

            if [ $(echo "${S3t} > ${S1t}" | bc) -eq 1 ]; then
                current_time=$(echo "(${S3t} - ${S1t}) * 1000" | bc -l | awk '{printf "%.3f", $0}')

                if [ $(echo "${current_time} > ${long_delay_threshold}" | bc) -eq 1 ]; then
                    echo "i=$i time=${current_time} long_delay_threshold($long_delay_threshold)"
                    echo "i=$i time=${current_time} long_delay_threshold($long_delay_threshold)" >>$long_delay
                    echo -e "\t$S1line" >>$long_delay
                    echo -e "\t$S3line" >>$long_delay
                    echo -e " " >>$long_delay
                    long_delay_n=$(echo "(${long_delay_n} + 1)" | bc -l | awk '{printf "%.3f", $0}')
                else
                    echo "i=$i time=${current_time}"
                fi

                if [ $(echo "${current_time} > ${max}" | bc) -eq 1 ]; then
                    max=${current_time}
                fi
                if [ $(echo "${current_time} < ${min}" | bc) -eq 1 ]; then
                    min=${current_time}
                fi
                sum_time=$(echo "(${sum_time} + ${current_time})" | bc -l | awk '{printf "%.3f", $0}')
                sum_size=$(echo "(${sum_size} + ${S3s})" | bc -l | awk '{printf "%.3f", $0}')
                num=$(echo "(${num} + 1)" | bc -l | awk '{printf "%.3f", $0}')
                echo "$S1t | $S3t | ${current_time} | $S3s" >>$ret

            else
                echo "S3t(${S3t}) <= S1t(${S1t})"
                echo "S3t(${S3t}) <= S1t(${S1t})" >>$exeption
                echo -e "\t$S1line" >>$exeption
                echo -e "\t$S3line" >>$exeption
                echo -e " " >>$exeption
                exeption_n=$(echo "(${exeption_n} + 1)" | bc -l | awk '{printf "%.3f", $0}')
            fi

        done

        if [ $(echo "${exeption_n} > 0" | bc) -eq 1 ]; then
            echo "---- exeption_n=$exeption_n"
            cat -n $exeption
            echo "----"
        fi

        echo " "

        if [ $(echo "${long_delay_n} > 0" | bc) -eq 1 ]; then
            echo "==== long_delay_n=$long_delay_n"
            cat -n $long_delay
            echo "===="
        fi

        echo " "
        if [ $(echo "${exeption_n} > 0" | bc) -eq 1 ]; then
            echo "n=$n exeption_n=$exeption_n effective_n=$(echo "($n - ${exeption_n})" | bc -l) effective_%=$(echo "($n - ${exeption_n}) *100 / $n" | bc -l | awk '{printf "%.2f", $0}')% threshold=$threshold"
        fi

        if [ $(echo "${long_delay_n} > 0" | bc) -eq 1 ]; then
            echo "n=$n long_delay_n=$long_delay_n long_delay_%=$(echo "$long_delay_n *100 / $n" | bc -l | awk '{printf "%.2f", $0}')% long_delay_threshold=$long_delay_threshold"
        fi

        if [ $(echo "${num} > 0" | bc) -eq 1 ]; then
            avg_time=$(echo "(${sum_time} / $num)" | bc -l | awk '{printf "%.3f", $0}')
            avg_size=$(echo "(${sum_size} / $num)" | bc -l | awk '{printf "%.3f", $0}')
            echo "num=$num sum_time=$sum_time avg_time=$avg_time min=$min max=$max $avg_size"
            echo "num=$num sum_time=$sum_time avg_time=$avg_time min=$min max=$max $avg_size" >>$ret
        fi

        echo " "
        echo -e "Max(ms)"
        echo -e "$max"
        echo -e "Min(ms)"
        echo -e "$min"
        echo -e "Average(ms)"
        echo -e "$avg_time"
        echo -e "Average Size(Byte)"
        echo -e "$avg_size"

        echo -e "Max(ms)" >>$final_ret
        echo -e "$max" >>$final_ret
        echo -e "Min(ms)" >>$final_ret
        echo -e "$min" >>$final_ret
        echo -e "Average(ms)" >>$final_ret
        echo -e "$avg_time" >>$final_ret
        echo -e "Average Size(Byte)" >>$final_ret
        echo -e "$avg_size" >>$final_ret

    fi
fi
