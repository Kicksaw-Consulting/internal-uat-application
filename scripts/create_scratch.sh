#!/bin/sh
# Creates a new scratch org

set -e

alias=${1-default} 

# we wrap this in a loop because sometimes it just fails for no reason...
n=0
until [ $n -ge 3 ]
do
    sfdx force:org:create -s -f config/project-scratch-def.json -a $alias -d 30 && break
    n=$[$n+1]
    sleep 15
done


