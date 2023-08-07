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
c1_c4_map="c1_c4_map.txt"
c1="c1.txt"
c4="c4.txt"
c1_key_word="atou C1"
c4_key_word="atou C4"
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
        echo -e "   -c cmd \t\t1: Extract C1 C4 log from input file. \r\n\t\t\t2: Adjuest c1.txt or c4.txt. Check the number of line is same for c1.txt and c4.txt. \r\n\t\t\t4: Caculate."
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

        grep atou $log | grep -e C1 -e C4 | grep -e "size: 0" -e "size: [0-9][0-9][0-9][0-9][0-9]" -e "size: [2-9][0-9][0-9][0-9]" >$c1_c4_map
        cat -n $c1_c4_map
    fi

    if [ $(($cmd & 2)) -gt 0 ]; then
        if [ ! -f $c1_c4_map ]; then
            echo "$c1_c4_map is not exist"
            exit 1
        fi

        cat $c1_c4_map | grep "$c1_key_word" >$c1
        cat $c1_c4_map | grep "$c4_key_word" >$c4

        c1_line_num=$(cat $c1 | wc -l)
        c4_line_num=$(cat $c4 | wc -l)
        if [ $c1_line_num -ne $c4_line_num ]; then
            echo "$c1_line_num != $c4_line_num"
            exit 1
        else
            echo "c1_line_num=$c1_line_num c4_line_num=$c4_line_num"
        fi
    fi

    if [ $(($cmd & 4)) -gt 0 ]; then
        if [ ! -f $c1 ]; then
            echo "$c1 is not exist"
            exit 1
        fi

        if [ ! -f $c4 ]; then
            echo "$c4 is not exist"
            exit 1
        fi

        rm -rf $final_ret $ret

        c1_line_num=$(cat $c1 | wc -l)
        c4_line_num=$(cat $c4 | wc -l)
        if [ $c1_line_num -ne $c4_line_num ]; then
            echo "$c1_line_num != $c4_line_num"
            exit 1
        else
            echo "c1_line_num=$c1_line_num c4_line_num=$c4_line_num"
        fi

        echo "C1 Time | C4 Time | Latency(ms)" >>$ret
        echo "C1 Time | C4 Time | Latency(ms)" >>$threshold_down_ret

        n=$c1_line_num
        for ((i = 1; i <= $n; i++)); do
            c1line=$(sed -n "${i}p" ${c1})
            c1t=$(echo "$c1line" | awk '{print $6}' | sed 's/://g')
            c4line=$(sed -n "${i}p" ${c4})
            c4t=$(echo "$c4line" | awk '{print $7}' | sed 's/://g')
            c4s=$(echo "$c4line" | awk '{print $14}' | sed 's/://g')

            if [ $debug -gt 0 ]; then
                echo $c1line
                echo $c4line
                echo $c1t $c4t $c4s
            fi

            if [ $(echo "${c4t} > ${c1t}" | bc) -eq 1 ]; then
                current_time=$(echo "(${c4t} - ${c1t}) * 1000" | bc -l | awk '{printf "%.3f", $0}')

                if [ $(echo "${current_time} > ${long_delay_threshold}" | bc) -eq 1 ]; then
                    echo "i=$i time=${current_time} long_delay_threshold($long_delay_threshold)"
                    echo "i=$i time=${current_time} long_delay_threshold($long_delay_threshold)" >>$long_delay
                    echo -e "\t$c1line" >>$long_delay
                    echo -e "\t$c4line" >>$long_delay
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
                sum_size=$(echo "(${sum_size} + ${c4s})" | bc -l | awk '{printf "%.3f", $0}')
                num=$(echo "(${num} + 1)" | bc -l | awk '{printf "%.3f", $0}')
                echo "$c1t | $c4t | ${current_time} | $c4s" >>$ret

            else
                echo "c4t(${c4t}) <= c1t(${c1t})"
                echo "c4t(${c4t}) <= c1t(${c1t})" >>$exeption
                echo -e "\t$c1line" >>$exeption
                echo -e "\t$c4line" >>$exeption
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
            echo "num=$num sum_time=$sum_time avg_time=$avg_time min=$min max=$max avg_size=$avg_size"
            echo "num=$num sum_time=$sum_time avg_time=$avg_time min=$min max=$max avg_size=$avg_size" >>$ret
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
