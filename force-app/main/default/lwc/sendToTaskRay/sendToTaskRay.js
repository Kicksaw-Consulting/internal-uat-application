import { LightningElement, api } from 'lwc';
import sendToTaskRay from '@salesforce/apex/sendToTaskRay.sendToTaskRay';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';
import { updateRecord } from 'lightning/uiRecordApi';

export default class SendToTaskRay extends LightningElement {
    loadingSpinner = false;
    @api recordId;
    @api invoke(){
        //this.loadingSpinner = true; 
        sendToTaskRay({recordId : this.recordId}).then(resp => {
            this.showToast("Success",'Item sent to TaskRay',"success");
            this.closeQuickAction;
            this.updateRecordView(this.recordId);   
        })
    }
    showToast(title, message, variant){
        this.dispatchEvent(new ShowToastEvent({
            title, message, variant
        }))
    }
    closeQuickAction() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }
    updateRecordView(recordId) {
        updateRecord({fields: { Id: recordId }});
    }
 
}