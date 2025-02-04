public with sharing class TestManagementController {
    @AuraEnabled(cacheable=true)
    public static List<TestCase__c> getTestCases() {
        return [SELECT Id, Name, Persona__c FROM TestCase__c WHERE Status__c != 'Complete'];
    }

    @AuraEnabled(cacheable=true)
    public static List<TestCase__c> getOpenTestCases() {
        return [SELECT Id, Name,Persona__c FROM TestCase__c WHERE Status__c != 'Complete'];
    }

    @AuraEnabled
    public static Id createTestCase(Map<String, Object> testCaseFields) {
        TestCase__c testCase = new TestCase__c();
        for (String fieldName : testCaseFields.keySet()) {
            testCase.put(fieldName, testCaseFields.get(fieldName));
        }
        insert testCase;
        return testCase.Id;
    }

    @AuraEnabled
    public static Id createTestRun() {
        try {
            TestRun__c testRun = new TestRun__c();
            testRun.Status__c = 'Not Complete';
            insert testRun;
            System.debug('TestRun created with ID: ' + testRun.Id);
            return testRun.Id;
        } catch (Exception e) {
            System.debug('Error creating TestRun: ' + e.getMessage());
            throw new AuraHandledException('Error creating TestRun: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static Id createNewTestRun(String assignedUserId) {
        TestRun__c testRun = new TestRun__c(Tester__c = assignedUserId);
        insert testRun;
        return testRun.Id;
    }

    @AuraEnabled
    public static void createTestRunCases(Id testRunId, List<Id> testCaseIds) {
        try {
            List<TestRunCase__c> testRunCasesList = new List<TestRunCase__c>();
            for (Id testCaseId : testCaseIds) {
                TestRunCase__c testRunCase = new TestRunCase__c(
                    TestCase__c = testCaseId,
                    TestRun__c = testRunId
                );
                testRunCasesList.add(testRunCase);
            }
            insert testRunCasesList;
            System.debug('TestRunCases created: ' + testRunCasesList);
        } catch (Exception e) {
            System.debug('Error creating TestRunCases: ' + e.getMessage());
            throw new AuraHandledException('Error creating TestRunCases: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static void createNewTestRunCases(Id testRunId, List<Id> testCaseIds) {
        List<TestRunCase__c> testRunCases = new List<TestRunCase__c>();
        for (Integer i = 0; i < testCaseIds.size(); i++) {
            testRunCases.add(new TestRunCase__c(
                TestRun__c = testRunId, 
                TestCase__c = testCaseIds[i],
                RunOrder__c = i + 1
            ));
        }
        insert testRunCases;
    }

    @AuraEnabled(cacheable=true)
    public static TestRun__c getTestRunWithCases(Id testRunId) {
        return [
            SELECT Id, Name, Status__c, 
                   (SELECT Id, TestCase__c, TestCase__r.Name, RunOrder__c 
                    FROM TestRunCases__r 
                    ORDER BY RunOrder__c)
            FROM TestRun__c
            WHERE Id = :testRunId
        ];
    }

    @AuraEnabled
    public static void updateTestRunCaseRunOrder(List<TestRunCase__c> testRunCases) {
        update testRunCases;
    }

    @AuraEnabled
    public static void updateTestRunCaseOrder(Map<Id, Integer> testRunCaseOrder) {
        List<TestRunCase__c> testRunCases = new List<TestRunCase__c>();
        for (Id testRunCaseId : testRunCaseOrder.keySet()) {
            testRunCases.add(new TestRunCase__c(Id = testRunCaseId, RunOrder__c = testRunCaseOrder.get(testRunCaseId)));
        }
        update testRunCases;
    }

    @AuraEnabled(cacheable=true)
    public static List<TestRun__c> getTestRunsWithCasesWhereTesterIsNull() {
        return [
            SELECT Id, Name, Status__c, 
                   (SELECT Id, TestCase__c, TestCase__r.Name, RunOrder__c 
                    FROM TestRunCases__r 
                    ORDER BY RunOrder__c)
            FROM TestRun__c
            WHERE Tester__c = NULL
        ];
    }

    @AuraEnabled
    public static TestRun__c cloneTestRun(Id testRunId) {
        try {
            // Fetch the Test Run to clone
            TestRun__c testRun = [SELECT Id, Name, Status__c
                                  FROM TestRun__c
                                  WHERE Id = :testRunId];

            // Create the new Test Run
            TestRun__c clonedTestRun = testRun.clone(false, true);
            insert clonedTestRun;

            // Fetch associated Test Run Cases
            List<TestRunCase__c> testRunCases = [SELECT TestCase__c, RunOrder__c
                                                 FROM TestRunCase__c
                                                 WHERE TestRun__c = :testRunId];

            // Clone the Test Run Cases for the new Test Run
            List<TestRunCase__c> clonedTestRunCases = new List<TestRunCase__c>();
            for (TestRunCase__c trc : testRunCases) {
                TestRunCase__c clonedCase = trc.clone(false, true);
                clonedCase.TestRun__c = clonedTestRun.Id;
                clonedTestRunCases.add(clonedCase);
            }

            if (!clonedTestRunCases.isEmpty()) {
                insert clonedTestRunCases;
            }

            return clonedTestRun;
        } catch (Exception e) {
            System.debug('Error cloning Test Run: ' + e.getMessage());
            throw new AuraHandledException('Error cloning Test Run: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static List<User> searchUsers(String searchKey) {
        String searchPattern = '%' + searchKey + '%';
        return [
            SELECT Id, Name 
            FROM User 
            WHERE IsActive = true 
            AND Name LIKE :searchPattern 
            ORDER BY Name 
            LIMIT 10
        ];
    }

    @AuraEnabled
    public static void assignTesterToTestRun(Id testRunId, Id testerId) {
        TestRun__c testRun = [SELECT Id FROM TestRun__c WHERE Id = :testRunId LIMIT 1];
        testRun.Tester__c = testerId;
        update testRun;
    }

    @AuraEnabled
    public static void updateRunOrder(List<TestRunCase__c> testCases) {
        // Query existing TestRunCases to update
        List<TestRunCase__c> existingCases = [
            SELECT Id, TestRun__c, TestCase__c 
            FROM TestRunCase__c 
            WHERE TestRun__c = :testCases[0].TestRun__c
        ];
        
        // Create a map of TestCase Id to TestRunCase Id
        Map<Id, Id> testCaseToRunCaseId = new Map<Id, Id>();
        for(TestRunCase__c trc : existingCases) {
            testCaseToRunCaseId.put(trc.TestCase__c, trc.Id);
        }
        
        // Update the Ids of the cases to update
        for(TestRunCase__c trc : testCases) {
            trc.Id = testCaseToRunCaseId.get(trc.TestCase__c);
        }
        
        update testCases;
    }

    @AuraEnabled
    public static void assignTesters(Id testRunId, List<Id> testerIds) {
        List<TestRun__c> testRuns = [SELECT Id FROM TestRun__c WHERE Id = :testRunId];
        if (testRuns.isEmpty()) {
            throw new AuraHandledException('Test Run not found.');
        }

        for (Id testerId : testerIds) {
            TestRun__c newRun = testRuns[0].clone(false, true);
            newRun.Tester__c = testerId;
            insert newRun;
        }
    }
}