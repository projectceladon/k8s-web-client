#!/usr/bin/python
#python version 3.8 and above
#pip3 install requests
#Usage: python client.py -p Program -i IP -d DialogId -x XResolution -y YResolution -v VideoFormat
#Example: python3.8 client.py -p aic_linux_client -i 10.112.240.98 -d dialog_601568 -x 1280 -y 720 -v h264
#Input number :
# a                Start the instance which number is a
# a,b,c,...        Start the instance of the listed numbers
# a->b             start the instance from number a to b

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

import requests
import json
import sys
import os
import subprocess
import multiprocessing
import atexit
import time
import argparse
import textwrap

dictInstance = {}
programLinux = 'aic_linux_client'

class INSTANCE(object):
    def __init__(self, program, url, serverId, clientId, xResolution, yResolution, videoFormat, windowSize, deviceCodec):
        self.program = program
        self.url = url
        self.serverId = serverId
        self.clientId = clientId
        self.xResolution = xResolution
        self.yResolution = yResolution
        self.videoFormat = videoFormat
        self.windowSize = windowSize
        self.deviceCodec = deviceCodec

def startProgram(program, url, serverId, clientId, xResolution, yResolution, videoFormat, windowSize, deviceCodec):
    if os.name == 'nt':
        command = '%s --peer_server_url %s --sessionid %s --clientsessionid %s' %(program, url, serverId, clientId)
    elif os.name == 'posix':
        command = '%s -u %s -s %s -c %s -r %sx%s -v %s -w %s -d %s >/dev/null 2>&1' %(program, url, serverId, clientId, xResolution, yResolution, videoFormat, windowSize, deviceCodec)
    os.system(command)
    return 0

def startProcess(number):
    if number in dictInstance:
        instance = dictInstance[number]
        print('Number: %d url: %s serverId: %s clientId: %s' %(number, instance.url, instance.serverId, instance.clientId))
        childProcess = multiprocessing.Process(target=startProgram, args=(instance.program, instance.url,
                                                                          instance.serverId, instance.clientId, instance.xResolution, instance.yResolution, instance.videoFormat, instance.windowSize, instance.deviceCodec))
        childProcess.daemon = True
        childProcess.start()
        atexit.register(childProcess.terminate)
        print('Started number: %d' %(number))
    else:
        print('The number %d is not in the list!' %(number))
    return 0

def startAutoTest():
    global startedProgram
    global startedNumbers
    global numbers
    if startedProgram:
        if os.name == 'posix':
            os.system('killall %s' %(programLinux))
    dictCount = len(dictInstance)
    if dictCount < 1:
        print("Please check the android clound!")
        exit()
    newStartedNumbers = startedNumbers + numbers
    if dictCount > newStartedNumbers:
        for item in range(startedNumbers + 1, newStartedNumbers + 1):
            startProcess(item)
        startedNumbers = newStartedNumbers
    else:
        for item in range(startedNumbers + 1, dictCount + 1):
            startProcess(item)
        startedNumbers = 0
    startedProgram = True

def exitProgram():
    if os.name == 'posix':
        os.system('killall %s' %(programLinux))
    exit()

if __name__ == '__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('-p', '--Program', help='Example: ./owt_linux_client', required=True)
    parser.add_argument('-i', '--IP', help='Example: 10.112.240.98', required=True)
    parser.add_argument('-d', '--DialogId', help='Example: dialog_601568', required=True)
    parser.add_argument('-x', '--XResolution', help='Example: 1280', required=True)
    parser.add_argument('-y', '--YResolution', help='Example: 720', required=True)
    parser.add_argument('-v', '--VideoFormat', help='Example: h265 or h264', required=True)
    parser.add_argument('-a', '--Auto', type=bool , default=False, help='Example: False or True')
    parser.add_argument('-m', '--Interval', type=int, default=60, help='Example: 5 : 5 minutes by one queue')
    parser.add_argument('-n', '--Number', type=int, default=20, help='Example: 20 : 20 sessions in one queue')
    parser.add_argument('-w', '--WindowSize', type=str, default='352x288', help='Window size, default: 352x288')
    parser.add_argument('-D', '--DeviceCodec', type=str, default='hw', help='<sw/hw>: Software decoding or hardware decoding, default: hw')
    args = parser.parse_args()
    print(sys.argv)

    program = args.Program
    ip = args.IP
    dialog = args.DialogId
    xRes = args.XResolution
    yRes = args.YResolution
    videoFormat = args.VideoFormat
    windowSize = args.WindowSize
    deviceCodec = args.DeviceCodec
    auto = args.Auto
    global startedNumbers
    global startedProgram
    interval = args.Interval
    global numbers
    numbers = args.Number
    startedProgram = False

    url = 'http://%s/test-sessions/%s' %(ip, dialog)
    startNumber = 0
    endNumber = 0
    port = 30000
    print('Request url: %s' % url)
    if '/' in program and os.name == 'posix':
        programSplit = program.split('/')
        programLinux = programSplit[len(programSplit) -1]
    response = requests.get(url).json()
    keyResponse = 'serverUrl'
    if keyResponse in response:
        urlIp = response[keyResponse]
        url
        if os.name == 'nt':
            url = 'https://%s:30001' %(urlIp)
        elif os.name == 'posix':
            url = 'http://%s:30000' %(urlIp)

    else:
        print('There is no server URL')
        exit()
    keyResponse = 'sessions'
    if keyResponse in response:
        sesssions = response[keyResponse]
        key = 0
        lenSessions = len(sesssions)
        if lenSessions > 0:
            for item in sesssions:
                serverId = item["serverId"]
                clientId = item["ClientId"]
                instance = INSTANCE(program, url, serverId, clientId, xRes, yRes, videoFormat, windowSize, deviceCodec)
                key = key + 1
                dictInstance[key] = instance
    else:
        print('There is no session')
        exit()
    print('URL: %s' %(url))
#    multiprocessing.set_start_method('spawn')
    for key in dictInstance:
        print('Number: %d serverId: %s clientId: %s' %(key, dictInstance[key].serverId, dictInstance[key].clientId))
    if auto is True:
        startedNumbers = 0
        try:
            while True:
                startAutoTest()
                time.sleep(60 * interval)
        except KeyboardInterrupt:
            exitProgram()

    while 1:
        inputType = 1
        inputString = input('Please input the numbers:')
        if inputString == 'q':
            if os.name == 'posix':
                os.system('killall %s' %(programLinux))
            sys.exit()
        elif not inputString:
            print('Please input a number!')
            continue
        if ',' in inputString:
            inputSplit = inputString.split(',')
            inputType = 2
            allItemWell = True
            for item in inputSplit:
                intItem = int(item)
                if not intItem in dictInstance:
                    print('The number %d is not in the list!' %(number))
                    allItemWell = False
                    continue
            if not allItemWell:
                continue
        elif '->' in inputString:
            inputSplit = inputString.split('->')
            startNumberStr = inputSplit[0]
            endNumberStr = inputSplit[1]
            startNumber = int(startNumberStr)
            endNumber = int(endNumberStr)
            if startNumber >= endNumber:
                print('Start number must be less than end!')
                continue
            inputType = 3
            if not startNumber in dictInstance:
                print('The number %d is not in the list!' %(startNumber))
                continue
            if not endNumber in dictInstance:
                print('The number %d is not in the list!' %(startNumber))
                continue

        if inputType == 1:
            if not inputString.isdigit():
                print('Please input a number!')
                continue
            inputNumber = int(inputString)
            startProcess(inputNumber)
        elif inputType == 2:
            for item in inputSplit:
                inputNumber = int(item)
                startProcess(inputNumber)
        elif inputType == 3:
            for item in range(startNumber, endNumber + 1):
                startProcess(item)


