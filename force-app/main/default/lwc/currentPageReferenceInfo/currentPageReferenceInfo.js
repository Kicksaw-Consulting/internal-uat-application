import { LightningElement, wire, api } from 'lwc';
import { FlowAttributeChangeEvent } from 'lightning/flowSupport';
import { CurrentPageReference } from 'lightning/navigation';
 
export default class CurrentPageReferenceInfo extends LightningElement {

    @api recordId;
    @api objectApiName;
    @api jsonInfo;

    currentPageReference; 
 
    @wire(CurrentPageReference)
    getCurrentPageReferenceInfo(currentPageReference) {
        if (currentPageReference) {

            console.log(currentPageReference);

            this.dispatchEvent(new FlowAttributeChangeEvent('recordId',currentPageReference.attributes.recordId));

            this.dispatchEvent(new FlowAttributeChangeEvent('objectApiName',currentPageReference.attributes.objectApiName));

            this.dispatchEvent(new FlowAttributeChangeEvent('jsonInfo',JSON.stringify(currentPageReference)));

        }
    }
 
}