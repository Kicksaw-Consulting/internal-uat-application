import { LightningElement, track, wire } from 'lwc';
import getOpenTestCases from '@salesforce/apex/TestManagementController.getOpenTestCases';
import createNewTestRun from '@salesforce/apex/TestManagementController.createNewTestRun';
import createNewTestRunCases from '@salesforce/apex/TestManagementController.createNewTestRunCases';
import searchUsers from '@salesforce/apex/TestManagementController.searchUsers';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

export default class MultiStepTestRun extends LightningElement {
    @track _step = 1;
    @track testCases = [];
    @track selectedTestCaseIds = [];
    @track selectedTestCases = [];
    @track matchingUsers = [];
    @track assignedUserId = '';
    @track searchTerm = '';
    @track selectedTesters = [];
    @track orderedTestCases = [];
    wiredTestCaseResult;

    columns = [
        { label: 'Name', fieldName: 'Name' },
        { label: 'Persona', fieldName: 'Persona__c' }
    ];

    @wire(getOpenTestCases)
    wiredTestCases(result) {
        this.wiredTestCaseResult = result;
        const { error, data } = result;
        if (data) {
            this.testCases = data;
        } else if (error) {
            console.error('Error fetching test cases:', error);
            this.showToast('Error', 'Failed to load test cases', 'error');
        }
    }

    get step() {
        return this._step;
    }

    set step(value) {
        this._step = value;
    }

    get isStep1() {
        return this.step === 1;
    }

    get isStep2() {
        return this.step === 2;
    }

    get isStep3() {
        return this.step === 3;
    }

    get nextButtonLabel() {
        return this.isStep3 ? 'Create Test Run' : 'Next';
    }

    handleNextClick() {
        if (this.isStep3) {
            this.handleCreateTestRun();
        } else {
            this.handleNext();
        }
    }

    handleNext() {
        if (this.step === 1 && this.selectedTestCaseIds.length === 0) {
            this.showToast('Error', 'Please select at least one test case', 'error');
            return;
        }
        
        if (this.step === 1) {
            this.selectedTestCases = this.testCases.filter(tc => 
                this.selectedTestCaseIds.includes(tc.Id));
        }
        if (this.step === 2) {
            const reorderComponent = this.template.querySelector('c-reorder-test-cases');
            if (!reorderComponent) {
                this.showToast('Error', 'Error saving order', 'error');
                return;
            }
            this.orderedTestCases = reorderComponent.getOrderedTestCases();
        }
        this.step = this.step + 1;
    }

    handleBack() {
        this.step = this.step - 1;
    }

    handleRowSelection(event) {
        this.selectedTestCaseIds = event.detail.selectedRows.map(row => row.Id);
    }

    async handleUserSearch(event) {
        const searchKey = event.target.value;
        if (searchKey.length >= 2) {
            try {
                const users = await searchUsers({ searchKey });
                this.matchingUsers = users.map(user => ({
                    label: user.Name,
                    value: user.Id
                }));
            } catch (error) {
                console.error('Error searching users:', error);
                this.showToast('Error', 'Failed to search users', 'error');
            }
        }
    }

    handleUserSelect(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedUser = this.matchingUsers.find(user => user.value === selectedId);
        if (selectedUser) {
            this.searchTerm = '';
            this.matchingUsers = [];
            if (!this.selectedTesters.some(t => t.value === selectedUser.value)) {
                this.selectedTesters.push(selectedUser);
            }
        }
    }

    handleRemoveTester(event) {
        const testerId = event.target.name;
        this.selectedTesters = this.selectedTesters.filter(t => t.value !== testerId);
    }

    async handleCreateTestRun() {
        if (this.selectedTesters.length === 0) {
            this.showToast('Error', 'Please select at least one tester', 'error');
            return;
        }

        try {
            if (!this.orderedTestCases || this.orderedTestCases.length === 0) {
                throw new Error('No test cases found to create test run');
            }
            
            // Create a test run for each selected tester
            for (const tester of this.selectedTesters) {
                const testRunId = await createNewTestRun({ assignedUserId: tester.value });
                await createNewTestRunCases({ 
                    testRunId, 
                    testCaseIds: this.orderedTestCases.map(tc => tc.Id)
                });
            }

            this.showToast('Success', 'Test Runs created successfully', 'success');
            this.handleReset();
        } catch (error) {
            console.error('Error creating Test Runs:', JSON.stringify(error));
            this.showToast('Error', 'Failed to create Test Runs: ' + error.message, 'error');
        }
    }

    handleReset() {
        this.step = 1;
        this.selectedTestCaseIds = [];
        this.selectedTestCases = [];
        this.selectedTesters = [];
        this.searchTerm = '';
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }

    handleRefresh() {
        return refreshApex(this.wiredTestCaseResult);
    }
}