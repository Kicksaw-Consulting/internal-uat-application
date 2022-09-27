public with sharing class sendToTaskRay {
    // @AuraEnabled
    // public static string methodName(){
    //     try {
            
    //     } catch (Exception e) {
    //         throw new AuraHandledException(e.getMessage());
    //     }
    // }
    @AuraEnabled
    @future (callout = true)
    //first thing we need to do is get the authorization token so we can use that in the next request
    public static void sendToTaskRay(Id recordId){
        //for reference so I don't lose it -> https://salesforce.stackexchange.com/questions/25021/how-can-i-integrate-one-sfdc-org-to-another-sfdc-using-rest-api
        UAT_Feedback__c uat = [Select Name, Description__c FROM UAT_Feedback__c where Id = :recordId];
        String s = JSON.serialize(uat);
        system.debug('>>>>>>' + s);
        system.debug('>>>>>>>' + recordId);
        string taskRayId;
        string returnString; 
        String clientId = '3MVG9E8TNx7FN9y5Ya68W5HNajzC.q9hPwZVKN5JXGt9gMGLR60IAVzPqjohEYfs.1rx8ky9HQAeyzMlCEHAC';
        String clientSecret = '3EDBE2AA2FAC123CB9C3BAFA99A48576C7E779466CFF12F76B89DE0F70334B55';
        string userName = 'brandon@kicksaw.com.projrisks';
        string password = 'YRxs1e0YwJ2cjUaoC7aK3TSVfGebnAiHvapBULgfcc'; //this is password & token
        String reqBod = 'grant_type=password&client_id='+clientId+'&client_secret='+clientSecret+'&username='+username+'&password='+password;

        Http http = new Http();
        HttpRequest req = new HttpRequest();
        req.setBody(reqbod);
        req.setMethod('POST');
        req.setEndpoint ('https://kicksaw--projrisks.sandbox.my.salesforce.com/services/oauth2/token');
        HttpResponse res = http.send(req);

        OAuth2 objAuthenticationInfo = (OAuth2)JSON.deserialize(res.getbody(), OAuth2.class);
        //RequestWrapper reqst=new RequestWrapper();


        if (objAuthenticationInfo.access_token!=null){
            //now lets send some shit
            http h1 = new http();
            HttpRequest req1 = new HttpRequest();
            req1.setHeader('Authorization','Bearer '+objAuthenticationInfo.access_token);
            req1.setHeader('Content-Type','application/json');
            req1.setHeader('accept','application/json');
            
            req1.setBody('{"newTask":{"Name":"' + recordId + '", "TASKRAY__Description__c":"' + recordId + '", "TASKRAY__Project__c": "a0u590000017UhTAAU"}}');//Send JSON body
            system.debug('>>>>REQUEST BODY'+ req1.getBody());
            req1.setMethod('POST');
            req1.setEndpoint('https://kicksaw--projrisks.sandbox.my.salesforce.com/services/apexrest/ProjectService');//URL will be your Salesforce REST API end point where you will do POST,PUT,DELETE orGET
            HttpResponse res1 = h1.send(req1);
            system.debug('RESPONSE_BODY'+res1.getbody());
            taskRayId = res1.getBody().remove('"');
            updateUATItem(recordId, taskRayId);
        }
        //return res.getBody();

    }

    public static void updateUATItem (Id recordId, string taskRayId){
        UAT_Feedback__c  uat = [Select Id from UAT_Feedback__c where Id = :recordId];
        uat.TaskRayTicket__c = 'https://kicksaw--projrisks.sandbox.lightning.force.com/lightning/r/TASKRAY__Project_Task__c/' + taskRayId +'/view';
        update uat;
    }
    public class OAuth2{
        public String id{get;set;}
        public String issued_at{get;set;}
        public String instance_url{get;set;}
        public String signature{get;set;}
        public String access_token{get;set;}    
       }

    // public static HttpRequest makeTaskRayCallout(){
    //     http Http = new Http(); 
    //     HttpRequest request = new HttpRequest();
    //     request.setEndpoint ('https://kicksaw--projrisks.sandbox.my.salesforce.com/services/apexrest/ProjectService');
    // }
}
