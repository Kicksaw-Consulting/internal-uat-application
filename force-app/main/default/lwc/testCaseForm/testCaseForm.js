import { LightningElement, track, wire } from 'lwc'; // Correct import of @wire
import createTestCase from '@salesforce/apex/TestManagementController.createTestCase';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { publish, MessageContext } from 'lightning/messageService';
import TestCaseMessageChannel from '@salesforce/messageChannel/TestCaseMessageChannel__c';

export default class TestCaseForm extends LightningElement {
    @track testCaseFields = {
        Name: '', // Updated field
        Persona__c: '',
        Pre_Condition__c: '',
        StepsToComplete__c: '',
        ExpectedResult__c: ''
    };

    @wire(MessageContext) // Proper use of the @wire decorator
    messageContext;

    handleInputChange(event) {
        const field = event.target.dataset.field;
        this.testCaseFields[field] = event.target.value;
    }

    handleRichTextChange(event) {
        const field = event.target.dataset.field;
        this.testCaseFields[field] = event.detail.value;
    }

    async handleCreate() {
        try {
            const testCaseId = await createTestCase({ testCaseFields: this.testCaseFields });
            console.log('Test Case created with ID:', testCaseId);
            this.showToast('Success', 'Test Case Created Successfully', 'success');
            this.publishUpdate();
            this.handleClear();
        } catch (error) {
            console.error('Error creating Test Case:', error);
            this.showToast('Error', error.body.message, 'error');
        }
    }

    publishUpdate() {
        console.log('Publishing refresh message');
        publish(this.messageContext, TestCaseMessageChannel, { action: 'refresh' });
    }

    handleClear() {
        this.testCaseFields = {
            Name: '', // Updated field
            Persona__c: '',
            Pre_Condition__c: '',
            StepsToComplete__c: '',
            ExpectedResult__c: ''
        };
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