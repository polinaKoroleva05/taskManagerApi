const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
import {Request, Response} from 'express';

const urlencodedParser = bodyParser.urlencoded({extended: false});
const filePathInScriptDir = path.join(__dirname, 'db.json');
app.use(express.json());
app.use(cors());

let tmpId: number = 6;

type Category = 'Bug' | 'Feature' | 'Documentation' | 'Refactor' | 'Test';
type Status = 'To Do' | 'In Progress' | 'Done';
type Priority = 'Low' | 'Medium' | 'High';

/**
 * @param {number | null} id - The id of task. Id = null, when client send new data to server. Server always send data with correct id.
 * @param {string} title - The title of task.
 * @param {string} [description] - The description of task. May be missing
 * @param {Category} category - The category of task. May be 'Bug' | 'Feature' | 'Documentation' | 'Refactor' | 'Test'
 * @param {Status} status - The status of task. May be 'To Do' | 'In Progress' | 'Done'
 * @param {Priority} priority - The status of task. May be 'Low' | 'Medium' | 'High'
 * @param {number | null} date - The date of creation task. Date = null, when client send new data to server. Server always send data with correct date.
 */
export interface TaskInterface {
    id: number | null;
    title: string;
    description?: string;
    category: Category;
    status: Status;
    priority: Priority;
    date: number | null;
}

/**
 * Get all tasks
 */
app.get('/tasks', (req: Request, res: Response) => {
    let base = require('./db.json');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.json(base);
});
/**
 * Get task by id, if cant fiind - send status 404
 */
app.get('/tasks/:id', (req: Request, res: Response) => {
    let base = require('./db.json');
    const id = +req.params.id;
    let task = base.find((task: TaskInterface) => task.id === id);
    if (task) {
        res.setHeader('Cache-Control', 'no-store, max-age=0');
        res.json(task);
    } else {
        res.sendStatus(404);
    }
});

/**
 * Delete task by id, if cant find - send status 404. 
 * If cause error, send status 500
 */
app.delete('/tasks/:id', (req: Request, res: Response) => {
    let base = require('./db.json');
    const id = +req.params.id;
    const deleteInd = base.findIndex((task: TaskInterface) => task.id === id);
    if (deleteInd !== -1) {
        base.splice(deleteInd, 1);
        try {
            save(base);
            res.setHeader('Cache-Control', 'no-store, max-age=0');
            res.json(base);
        } catch (err: any) {
            console.log(err);
            res.sendStatus(500);
        }
    } else {
        res.sendStatus(404);
    }
});

/**
 * Patch task by id, if cant find - send status 404. 
 * If cause another error, send status 500
 */
app.patch('/tasks/:id', (req: Request, res: Response) => {
    let base = require('./db.json');
    let updatedTask;
    try {
        const id = +req.params.id;
        updatedTask = patchTask(base, id, req.body);
        save(base);
        res.setHeader('Cache-Control', 'no-store, max-age=0');
        res.json(updatedTask);
    } catch (err: any) {
        if (err.message === 'Not found') {
            res.sendStatus(404);
        } else {
            console.log(err);
            res.sendStatus(500);
        }
    }
});

/**
 * Create new task, if client send invalid structure - send status 400.
 * If cause another error, send status 500
 */
app.post('/tasks', urlencodedParser, (req: Request, res: Response) => {
    let base = require('./db.json');
    let createdTask;
    try {
        console.log(req);
        createdTask = createTask(base, req.body);
        save(base);
        res.setHeader('Cache-Control', 'no-store, max-age=0');
        res.json(createdTask);
    } catch (err: any) {
        if (err.message === 'Invalid structure') {
            res.sendStatus(400);
        } else {
            console.log(err);
            res.sendStatus(500);
        }
    }
});

/**
 * Dev function. Delete task by index in array, if cant find - send status 404. 
 * If cause error, send status 500. Needed when an invalid date without ID is added to the array.
 */
app.delete('/tasks/devDelete/:id', (req: Request, res: Response) => {
    let base = require('./db.json');
    const id = +req.params.id;
    if (id < base.length) {
        base.splice(id, 1);
        try {
            save(base);
            res.setHeader('Cache-Control', 'no-store, max-age=0');
            res.json(base);
        } catch (err: any) {
            console.log(err);
            res.sendStatus(500);
        }
    } else {
        res.sendStatus(404);
    }
});

/**
 * Restore data base from backup. Set data to default. Send status 200 when success.
 */
app.get('/restoreDB', (req: Request, res: Response) => {
    try {
        const baseBackup = require('./db_backup.json');
        save(baseBackup);
        res.sendStatus(200);
    } catch (err) {
        res.send(err);
    }
});

/**
 * Function that adds the required fields to the task and adds it to the database. 
 * The function checks that all required fields are passed, otherwise it throws an error 'Invalid structure'
 * @param {TaskInterface[]} base - Data base
 * @param {TaskInterface} newTask - Incomplete task data received from the client
 * @returns 
 */
function createTask(base: TaskInterface[], newTask: TaskInterface) {
    if (
        newTask.title == undefined ||
        newTask.description == undefined ||
        newTask.status == undefined ||
        newTask.category == undefined ||
        newTask.priority == undefined
    ) {
        throw new Error('Invalid structure');
    }
    newTask.id = ++tmpId;
    newTask.date = Date.now();
    base.push(newTask);
    return newTask;
}

/**
 * A function that makes changes to an existing task
 * If taskData is undefined, throws error 'TaskData undefinded'.
 * If there is no task with the specified id in the database, throws error 'Not found'.
 * @param {TaskInterface[]} base - Data base 
 * @param {number} id - Id of task that need to be changed
 * @param {Partial<TaskInterface>} taskData - Contains fields that need to be changed
 * @returns 
 */
function patchTask(
    base: TaskInterface[],
    id: number,
    taskData: Partial<TaskInterface>
) {
    if (taskData == undefined) {
        throw new Error('TaskData undefinded');
    }
    const idInBase = base.findIndex((task: TaskInterface) => task.id === id);
    if (idInBase !== -1) {
        //нашли в базе такой элемент
        if (taskData.title) base[idInBase].title = taskData.title;
        if (taskData.description)
            base[idInBase].description = taskData.description;
        if (taskData.status) base[idInBase].status = taskData.status;
        if (taskData.category) base[idInBase].category = taskData.category;
        if (taskData.priority) base[idInBase].priority = taskData.priority;
        return base[idInBase];
    } else {
        throw new Error('Not found');
    }
}

/**
 * Save data base to file. 
 * (In vercel causes error 'EROFS', that can be ignored. On server this error dont causes.)
 * @param {TaskInterface[]} base - Data base  
 */
function save(base: TaskInterface[]) {
    fs.writeFileSync(filePathInScriptDir, JSON.stringify(base), (err: any) => {
        if (err.code != 'EROFS') throw err;
    });
}

app.listen(3000, () => console.log('Server ready on port 3000.'));
module.exports = app;
