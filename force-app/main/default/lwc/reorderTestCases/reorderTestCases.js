import { LightningElement, api, track } from 'lwc';
import updateRunOrder from '@salesforce/apex/TestManagementController.updateRunOrder';

export default class ReorderTestCases extends LightningElement {
    @api testCases;
    @track orderedTestCases = [];

    connectedCallback() {
        if (this.testCases) {
            this.orderedTestCases = this.testCases.map((testCase, index) => ({
                ...testCase,
                RunOrder__c: index + 1
            }));
        }
    }

    handleDragStart(event) {
        event.dataTransfer.setData('text/plain', event.target.dataset.id);
    }

    handleDrop(event) {
        event.preventDefault();
        const draggedId = event.dataTransfer.getData('text/plain');
        const targetId = event.target.closest('tr').dataset.id;
        
        const draggedIndex = this.orderedTestCases.findIndex(tc => tc.Id === draggedId);
        const targetIndex = this.orderedTestCases.findIndex(tc => tc.Id === targetId);
        
        const [removed] = this.orderedTestCases.splice(draggedIndex, 1);
        this.orderedTestCases.splice(targetIndex, 0, removed);
        
        // Update run order
        this.orderedTestCases = this.orderedTestCases.map((testCase, index) => ({
            ...testCase,
            RunOrder__c: index + 1
        }));
    }

    handleDragOver(event) {
        event.preventDefault();
    }

    @api
    async saveRunOrder(testRunId) {
        try {
            const testRunCases = this.orderedTestCases.map((testCase, index) => ({
                TestRun__c: testRunId,
                TestCase__c: testCase.Id,
                RunOrder__c: index + 1
            }));
            await updateRunOrder({ testCases: testRunCases });
            return true;
        } catch (error) {
            console.error('Error updating run order:', error);
            return false;
        }
    }

    @api
    getOrderedTestCases() {
        return this.orderedTestCases;
    }
}