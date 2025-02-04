import { LightningElement, track, wire } from 'lwc';
import getTestCases from '@salesforce/apex/TestManagementController.getTestCases';
import createTestRun from '@salesforce/apex/TestManagementController.createTestRun';
import createTestRunCases from '@salesforce/apex/TestManagementController.createTestRunCases';
import { refreshApex } from '@salesforce/apex';
import { publish, MessageContext } from 'lightning/messageService';
import TestCaseMessageChannel from '@salesforce/messageChannel/TestCaseMessageChannel__c';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class TestCaseTable extends LightningElement {
    @track testCases = [];
    @track selectedTestCases = [];
    @track columns = [
        { label: 'Name', fieldName: 'Name', type: 'text' },
        { label: 'Persona', fieldName: 'Persona__c', type: 'text' }
    ];
    wiredTestCaseData;

    @wire(MessageContext)
    messageContext;

    @wire(getTestCases)
    wiredTestCases(result) {
        this.wiredTestCaseData = result;
        if (result.data) {
            this.testCases = result.data;
        } else if (result.error) {
            console.error('Error fetching test cases:', result.error);
            this.showToast('Error', 'Failed to load test cases.', 'error');
        }
    }

    handleRowSelection(event) {
        try {
            const selectedRows = event.detail.selectedRows || [];
            this.selectedTestCases = selectedRows.map(row => row.Id);
            console.log('Selected rows:', this.selectedTestCases);
        } catch (error) {
            console.error('Error handling row selection:', error);
            this.showToast('Error', 'An error occurred while selecting rows.', 'error');
        }
    }

    async handleCreateTestRun() {
        if (!this.selectedTestCases || this.selectedTestCases.length === 0) {
            this.showToast('Warning', 'No Test Cases Selected', 'warning');
            return;
        }

        try {
            const testRunId = await createTestRun();
            console.log('Test Run created with ID:', testRunId);

            await createTestRunCases({ testRunId, testCaseIds: this.selectedTestCases });
            console.log('Test Run Cases created successfully');

            // Notify other components about the new Test Run
            publish(this.messageContext, TestCaseMessageChannel, {
                action: 'refreshTestRun',
                testRunId: testRunId
                
            });

            console.log('Published refreshTestRun message:', testRunId);
            this.showToast('Success', 'Test Run and Cases Created Successfully', 'success');

            // Refresh the table to reflect any changes
            refreshApex(this.wiredTestCaseData);
        } catch (error) {
            console.error('Error creating Test Run or Cases:', error);
            let errorMessage = 'An unexpected error occurred.';
            if (error.body && error.body.message) {
                errorMessage = error.body.message;
            }
            this.showToast('Error', errorMessage, 'error');
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