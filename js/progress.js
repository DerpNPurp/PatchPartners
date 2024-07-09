// progress.js
class Progress {
    constructor() {
        this.steps = [];
        this.currentStep = 0;
    }

    addStep(step) {
        this.steps.push(step);
    }

    nextStep() {
        if (this.currentStep < this.steps.length) {
            this.currentStep++;
        }
    }

    getCurrentStep() {
        return this.steps[this.currentStep];
    }

    isComplete() {
        return this.currentStep >= this.steps.length;
    }

    reset() {
        this.currentStep = 0;
    }
}

export default Progress;
