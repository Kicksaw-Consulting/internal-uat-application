import { LightningElement, track, wire } from 'lwc';
import getTestRunsWithCasesWhereTesterIsNull from '@salesforce/apex/TestManagementController.getTestRunsWithCasesWhereTesterIsNull';
import { subscribe, MessageContext } from 'lightning/messageService';
import TestCaseMessageChannel from '@salesforce/messageChannel/TestCaseMessageChannel__c';
import updateTestRunCaseRunOrder from '@salesforce/apex/TestManagementController.updateTestRunCaseRunOrder';
import searchUsers from '@salesforce/apex/TestManagementController.searchUsers';
import assignTesterToTestRun from '@salesforce/apex/TestManagementController.assignTesterToTestRun';
import cloneTestRun from '@salesforce/apex/TestManagementController.cloneTestRun';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class TestRunDetails extends LightningElement {
    @track testRuns = [];
    isLoading = true;

    @track columns = [
        { label: 'Name', fieldName: 'testCaseName', type: 'text' },
        { label: 'Run Order', fieldName: 'rowOrder', type: 'number' }
    ];

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        console.log('Component initialized.');
        this.subscribeToMessageChannel();
        this.loadTestRuns();
    }

    subscribeToMessageChannel() {
        try {
            subscribe(this.messageContext, TestCaseMessageChannel, (message) => {
                console.log('Message received from TestCaseMessageChannel:', message);
                if (message && message.action === 'refreshTestRun') {
                    console.log('Refreshing test runs...');
                    this.loadTestRuns();
                }
            });
        } catch (error) {
            console.error('Error subscribing to message channel:', error);
        }
    }

    async loadTestRuns() {
        this.isLoading = true;
        console.log('Loading test runs...');
        try {
            const data = await getTestRunsWithCasesWhereTesterIsNull();
            console.log('Test runs loaded:', JSON.stringify(data, null, 2));
            this.testRuns = data.map(testRun => ({
                ...testRun,
                testRunCases: testRun.TestRunCases__r.map((caseRec, index) => ({
                    ...caseRec,
                    rowOrder: index + 1, // Temporary row order for display
                    testCaseName: caseRec.TestCase__r ? caseRec.TestCase__r.Name : 'N/A'
                }))
            }));
            console.log('Processed Test Runs:', JSON.stringify(this.testRuns, null, 2));
        } catch (error) {
            console.error('Error loading test runs:', error);
            this.showToast('Error', 'Failed to load Test Runs.', 'error');
        } finally {
            this.isLoading = false;
        }
    }
    async handleSearchTester(event) {
        const testRunId = event.target.dataset.id;
        const searchKey = event.target.value;

        try {
            const users = await searchUsers({ searchKey });
            const runToUpdate = this.testRuns.find(run => run.Id === testRunId);
            if (runToUpdate) {
                runToUpdate.matchingUsers = users.map(user => ({
                    label: user.Name,
                    value: user.Id
                }));
                this.testRuns = [...this.testRuns]; // Trigger reactivity
            }
        } catch (error) {
            console.error('Error searching users:', error);
            this.showToast('Error', 'Failed to search for users.', 'error');
        }
    }

    handleSelectTester(event) {
        const testRunId = event.target.dataset.id;
        const selectedUserId = event.detail.value;

        const runToUpdate = this.testRuns.find(run => run.Id === testRunId);
        if (runToUpdate) {
            runToUpdate.selectedTester = selectedUserId;
            this.testRuns = [...this.testRuns]; // Trigger reactivity
        }
    }

    async handleSaveTester(event) {
        const testRunId = event.target.dataset.id;
        const runToSave = this.testRuns.find(run => run.Id === testRunId);

        if (!runToSave || !runToSave.selectedTester) {
            this.showToast('Error', 'Please select a tester before saving.', 'error');
            return;
        }

        try {
            await assignTesterToTestRun({ testRunId, testerId: runToSave.selectedTester });
            this.showToast('Success', 'Tester assigned successfully.', 'success');
            this.loadTestRuns(); // Refresh Test Runs
        } catch (error) {
            console.error('Error saving tester:', error);
            this.showToast('Error', 'Failed to assign tester.', 'error');
        }
    }

    handleDragStart(event) {
        event.dataTransfer.setData('text/plain', event.target.dataset.id);
    }

    handleDrop(event) {
        event.preventDefault();
        const draggedId = event.dataTransfer.getData('text/plain');
        const targetId = event.target.closest('tr').dataset.id;

        const draggedIndex = this.testRuns.findIndex(caseRec => caseRec.Id === draggedId);
        const targetIndex = this.testRuns.findIndex(caseRec => caseRec.Id === targetId);

        const [draggedCase] = this.testRuns.splice(draggedIndex, 1);
        this.testRuns.splice(targetIndex, 0, draggedCase);

        // Update rowOrder based on the new order
        this.testRuns = this.testRuns.map((caseRec, index) => ({
            ...caseRec,
            rowOrder: index + 1
        }));
    }

    handleDragOver(event) {
        event.preventDefault();
    }

    async handleSaveRunOrder(event) {
        // Get the Test Run ID from the button's data-id attribute
        const testRunId = event.target.dataset.id;
    
        const runToSave = this.testRuns.find(run => run.Id === testRunId);
        if (!runToSave) {
            this.showToast('Error', 'Failed to find Test Run for saving.', 'error');
            return;
        }
    
        try {
            const updatedCases = runToSave.testRunCases.map((caseRec, index) => ({
                Id: caseRec.Id,
                RunOrder__c: index + 1
            }));
            await updateTestRunCaseRunOrder({ testRunCases: updatedCases });
            this.showToast('Success', `Run order for ${runToSave.Name} updated successfully.`, 'success');
        } catch (error) {
            console.error('Error saving run order:', error);
            this.showToast('Error', 'Failed to update run order.', 'error');
        }
    }
    async handleCloneTestRun(event) {
        const testRunId = event.target.dataset.id;
        try {
            console.log(`Cloning Test Run with ID: ${testRunId}`);
            const clonedTestRun = await cloneTestRun({ testRunId });
            this.showToast('Success', `Cloned Test Run: ${clonedTestRun.Name}`, 'success');
            this.loadTestRuns(); // Refresh the test runs to include the cloned one
        } catch (error) {
            console.error('Error cloning Test Run:', error);
            this.showToast('Error', 'Failed to clone Test Run.', 'error');
        }
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }
}