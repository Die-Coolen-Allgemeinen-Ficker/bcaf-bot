export class TimedEvent {
    protected timeout?: NodeJS.Timeout;

    start: Date;
    run: () => Promise<void>;

    constructor (start: Date, run: () => Promise<void>) {
        this.start = start;
        this.run = run;
    }

    schedule () {
        const timeUntil = this.start.getTime() - Date.now();
        if (timeUntil < 0)
            return -1;
        this.timeout = setTimeout(this.run.bind(this), timeUntil);
        return timeUntil;
    }

    cancel () {
        clearTimeout(this.timeout);
    }
}