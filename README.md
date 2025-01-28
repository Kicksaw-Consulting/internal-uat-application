# Kicksaw UAT Testing Application
## Components 

* UAT Feedback Custom Object 
* Kicksaw UAT Application 
* UAT Reports
* UAT Dashboard 
* Kicksaw_UAT_App permission set
* Create UAT Feedback Item Flow 

# Scratch Org/Development 

## Setup 
* Install [VSCode](https://code.visualstudio.com/) and the  [Salesforce CLI](https://developer.salesforce.com/docs/atlas.en-us.208.0.sfdx_setup.meta/sfdx_setup/sfdx_setup_install_cli.htm) if you haven't already done so

 * Git Clone this repo

 * Spin up new scratch org and deploy metadata by running the following in terminal: 

    ```sh scripts/Initial_Deploy.sh```

Wait for the prompt and then enter the alias of the scratch org you want to create and press ```Enter```

The Kicksaw_UAT_Permission set should automatically be assigned to the scratch org user. 

# Client Installation
Use the following instructions for using this application in client orgs for UAT testing. 
 ### Instructions 
 * Click the install button below below. 
 * Assign the Kicksaw_UAT_App permission set to the users who should have access to objects/application
 * Add the Create UAT Feedback Item flow as a utility item in the customers primary App
 


<a href="https://githubsfdeploy-sandbox.herokuapp.com/app/githubdeploy/Kicksaw-Consulting/internal-uat-application">
  Deploy to Sandbox
</a>


