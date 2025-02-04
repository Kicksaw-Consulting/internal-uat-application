import { LightningElement, api, track } from 'lwc';
import getTestCases from '@salesforce/apex/TestManagementController.getTestCases';

export default class TestCaseList extends LightningElement {
    @track testCases = [];
    selectedTestCases = [];

    columns = [
        { label: 'Name', fieldName: 'Name', type: 'text' },
        { label: 'Status', fieldName: 'Status__c', type: 'text' },
        { label: 'Persona', fieldName: 'Persona__c', type: 'text' }
    ];

    connectedCallback() {
        this.fetchTestCases();
    }

    fetchTestCases() {
        getTestCases()
            .then((data) => {
                this.testCases = data;
            })
            .catch((error) => {
                console.error('Error fetching test cases:', error);
            });
    }

    handleRowSelection(event) {
        this.selectedTestCases = event.detail.selectedRows;
    }

    handleNext() {
        this.dispatchEvent(
            new CustomEvent('next', {
                detail: { selectedTestCases: this.selectedTestCases },
            })
        );
    }
}