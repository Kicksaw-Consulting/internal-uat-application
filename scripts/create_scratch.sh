#!/bin/sh
# Creates a new scratch org

set -e

alias=${1-default} 

# we wrap this in a loop because sometimes it just fails for no reason...
n=0
until [ $n -ge 3 ]
do
    sfdx org create scratch -d -f config/scratch-org-def.json -a $alias --duration-days 30 -w 30 && break
    n=$[$n+1]
    sleep 15
done


