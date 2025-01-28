import { LightningElement, track, api } from 'lwc';
import searchUsers from '@salesforce/apex/TestManagementController.searchUsers';
import assignTesters from '@salesforce/apex/TestManagementController.assignTesters';

export default class AssignTesters extends LightningElement {
    @track matchingUsers = [];
    @track selectedTesters = [];
    @api testRunId;

    async handleSearch(event) {
        const searchKey = event.target.value;
        if (searchKey.length < 2) {
            this.matchingUsers = [];
            return;
        }

        try {
            const users = await searchUsers({ searchKey });
            this.matchingUsers = users.map((user) => ({
                label: user.Name,
                value: user.Id,
            }));
        } catch (error) {
            console.error('Error searching users:', error);
        }
    }

    handleSelectUser(event) {
        const selectedUserId = event.detail.value;
        const selectedUser = this.matchingUsers.find((user) => user.value === selectedUserId);
        if (selectedUser && !this.selectedTesters.some((tester) => tester.value === selectedUserId)) {
            this.selectedTesters.push(selectedUser);
        }
    }

    async handleNext() {
        try {
            const testerIds = this.selectedTesters.map((tester) => tester.value);
            await assignTesters({ testRunId: this.testRunId, testerIds });
            this.dispatchEvent(new CustomEvent('next', { detail: { assignedTesters: this.selectedTesters } }));
        } catch (error) {
            console.error('Error assigning testers:', error);
        }
    }

    handleBack() {
        this.dispatchEvent(new CustomEvent('back'));
    }
}