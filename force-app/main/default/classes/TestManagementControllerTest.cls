@IsTest
private class TestManagementControllerTest {
    @TestSetup
    static void setupTestData() {
        // Create test cases
        List<TestCase__c> testCases = new List<TestCase__c>();
        for(Integer i = 0; i < 3; i++) {
            testCases.add(new TestCase__c(
                Name = 'Test Case ' + i,
                Status__c = 'Not Complete',
                Persona__c = 'Test Persona'
            ));
        }
        insert testCases;

        // Create a test user
        Profile p = [SELECT Id FROM Profile WHERE Name='Standard User'];
        User testUser = new User(
            Alias = 'tuser',
            Email = 'testuser@testorg.com',
            EmailEncodingKey = 'UTF-8',
            LastName = 'Testing',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            ProfileId = p.Id,
            TimeZoneSidKey = 'America/Los_Angeles',
            UserName = 'testuser@testorg.com' + System.currentTimeMillis()
        );
        insert testUser;
    }

    @IsTest
    static void testGetOpenTestCases() {
        // Create a completed test case (should not be returned)
        TestCase__c completedCase = new TestCase__c(
            Name = 'Completed Test Case',
            Status__c = 'Complete',
            Persona__c = 'Test Persona'
        );
        insert completedCase;

        Test.startTest();
        List<TestCase__c> openTestCases = TestManagementController.getOpenTestCases();
        Test.stopTest();

        // Verify only non-completed test cases are returned
        System.assertEquals(3, openTestCases.size(), 'Should return only non-completed test cases');
        for(TestCase__c tc : openTestCases) {
            System.assertNotEquals('Complete', tc.Status__c, 'Should not return completed test cases');
        }
    }

    @IsTest
    static void testCreateNewTestRun() {
        User testUser = [SELECT Id FROM User WHERE Email = 'testuser@testorg.com' LIMIT 1];

        Test.startTest();
        Id testRunId = TestManagementController.createNewTestRun(testUser.Id);
        Test.stopTest();

        // Verify test run was created
        TestRun__c createdTestRun = [SELECT Id, Tester__c FROM TestRun__c WHERE Id = :testRunId];
        System.assertNotEquals(null, createdTestRun, 'Test Run should be created');
        System.assertEquals(testUser.Id, createdTestRun.Tester__c, 'Test Run should be assigned to the correct tester');
    }

    @IsTest
    static void testCreateNewTestRunCases() {
        // Get test data
        List<TestCase__c> testCases = [SELECT Id FROM TestCase__c LIMIT 3];
        List<Id> testCaseIds = new List<Id>();
        for(TestCase__c tc : testCases) {
            testCaseIds.add(tc.Id);
        }

        // Create a test run
        TestRun__c testRun = new TestRun__c();
        insert testRun;

        Test.startTest();
        TestManagementController.createNewTestRunCases(testRun.Id, testCaseIds);
        Test.stopTest();

        // Verify test run cases were created
        List<TestRunCase__c> createdTestRunCases = [
            SELECT Id, TestRun__c, TestCase__c, RunOrder__c 
            FROM TestRunCase__c 
            WHERE TestRun__c = :testRun.Id 
            ORDER BY RunOrder__c
        ];

        System.assertEquals(testCaseIds.size(), createdTestRunCases.size(), 'Should create correct number of test run cases');
        
        // Verify run order
        for(Integer i = 0; i < createdTestRunCases.size(); i++) {
            System.assertEquals(i + 1, createdTestRunCases[i].RunOrder__c, 'Run order should be sequential');
            System.assert(testCaseIds.contains(createdTestRunCases[i].TestCase__c), 'Test case should be from the provided list');
        }
    }

    @IsTest
    static void testSearchUsers() {
        User testUser = [SELECT Id, Name FROM User WHERE Email = 'testuser@testorg.com' LIMIT 1];
        String searchKey = testUser.Name.substring(0, 3); // Use first 3 characters of the test user's name

        Test.startTest();
        List<User> foundUsers = TestManagementController.searchUsers(searchKey);
        Test.stopTest();

        System.assert(!foundUsers.isEmpty(), 'Should find at least one user');
        Boolean foundTestUser = false;
        for(User u : foundUsers) {
            if(u.Id == testUser.Id) {
                foundTestUser = true;
                break;
            }
        }
        System.assert(foundTestUser, 'Should find the test user');
    }

    @IsTest
    static void testSearchUsersNoResults() {
        String searchKey = 'XXXXXX'; // Should not match any users

        Test.startTest();
        List<User> foundUsers = TestManagementController.searchUsers(searchKey);
        Test.stopTest();

        System.assertEquals(0, foundUsers.size(), 'Should not find any users with invalid search key');
    }
} 