class AsyncRequestQueue {
    constructor(max_connections = 3) {
        this.queue = [];
        this.active_connections = 0;
        this.max_connections = max_connections;
    }
    addTask(taskFactory) {
        return new Promise((resolve, reject) => {
            const wrappedTask = async () => {
                try {
                    const result = await taskFactory();
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };

            this.queue.push(wrappedTask);
            this.runNext();
        });
    }
    async runNext() {
        if (this.active_connections >= this.max_connections || this.queue.length === 0) return;

        this.active_connections++;
        const taskFactory = this.queue.shift();

        try {
            await taskFactory();
        } catch (error) {
            console.error("Task failed:", error);
        } finally {
            this.active_connections--;
            this.runNext();
        }
    }
}

const queue = new AsyncRequestQueue(3)
const asyncTask = (id, delay = 2000) => () =>
    new Promise((resolve) => {
        console.log(`🟡 Task ${id} started...`);
        setTimeout(() => {
            console.log(`✅ Task ${id} finished after ${delay} delay...`);
            resolve(id);
        }, delay);
    });

queue.addTask(asyncTask(1, 2000));
queue.addTask(asyncTask(2, 7000));
queue.addTask(asyncTask(3, 1500));
queue.addTask(asyncTask(4, 200));
queue.addTask(asyncTask(5, 0));
queue.addTask(asyncTask(6, 4000));
queue.addTask(asyncTask(7, 1400));
