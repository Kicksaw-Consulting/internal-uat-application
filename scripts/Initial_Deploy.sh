#!/bin/sh
# Creates a new scratch org with dummy data and dependencies installed


set -e

#scratchAlias=${1-default}

echo "Set Alias for scratch org..."
read scratchAlias

echo "Creating the scratch org... \n"
sh ./scripts/create_scratch.sh $scratchAlias

#echo "Updating organization time zone... \n"
#sfdx force:data:record:update -s Organization -w "Name=Kicksaw" -v "TimeZoneSidKey=America/Chicago"

# echo "Deleting Sample Data... \n"
# sfdx force:apex:execute -f scripts/apex/delete_sample_data

echo "Opening new org...\n"
sfdx force:org:open 

#echo "Installing dependencies... \n"
#echo "File Upload Improved... \n"
#sfdx force:package:install --package 04t5G000003rUtjQAE --wait 1000
#echo "Navigate Everywhere... \n"
#sfdx force:package:install --package 04t5G000003rUhrQAE --wait 1000

echo "Pushing source metadata...\n"
sfdx force:source:push 

echo "Assign Admin Permission set..."
sfdx force:user:permset:assign -n Kicksaw_UAT_App
sf data import tree --files data/TestCase__c.json

osascript -e 'display notification "Build is complete" with title "Build Status" sound name "Glass"'

