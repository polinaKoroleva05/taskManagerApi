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

let tmpId: number = 7;

type Category = 'Bug' | 'Feature' | 'Documentation' | 'Refactor' | 'Test';
type Status = 'To Do' | 'In Progress' | 'Done';
type Priority = 'Low' | 'Medium' | 'High';

export interface TaskInterface {
    id: number | null;
    title: string;
    description?: string;
    category: Category;
    status: Status;
    priority: Priority;
    date: number | null;
}

app.get('/tasks', (req: Request, res: Response) => {
    let base = require('./db.json');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.json(base);
});

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
app.delete('/tasks/:id', (req: Request, res: Response) => {
    let base = require('./db.json');
    const id = +req.params.id;
    const deleteInd = base.findIndex((task: TaskInterface) => task.id === id);
    if (deleteInd !== -1) {
        base.splice(deleteInd, 1);
        save(base)
        res.setHeader('Cache-Control', 'no-store, max-age=0');
        res.json(base);
    } else {
        res.sendStatus(404);
    }
});
app.patch('/tasks/:id', (req: Request, res: Response) => {
    let base = require('./db.json');
    try {
        const id = +req.params.id;
        const updatedTask = patchTask(base, id, req.body);
        save(base)
        res.setHeader('Cache-Control', 'no-store, max-age=0');
        res.json(updatedTask);
    } catch (err) {
        res.send(err);
    }
});
app.post('/tasks', urlencodedParser, (req: Request, res: Response) => {
    let base = require('./db.json');
    try {
        console.log(req);
        const createdTask = createTask(base, req.body);
        save(base)
        res.setHeader('Cache-Control', 'no-store, max-age=0');
        res.json(createdTask);
    } catch (err) {
        res.send(err);
    }
});

app.delete('/tasks/devDelete/:id', (req: Request, res: Response) => {
    let base = require('./db.json');
    const id = +req.params.id;
    if (id < base.length) {
        base.splice(id, 1);
        save(base)
        res.setHeader('Cache-Control', 'no-store, max-age=0');
        res.json(base);
    } else {
        res.sendStatus(404);
    }
});

app.get('/restoreDB', (req: Request, res: Response) => {
    try {
        const baseBackup = require('./db_backup.json');
        save(baseBackup);
        res.sendStatus(200);
    } catch (err) {
        res.send(err);
    }
});

function createTask(base: TaskInterface[], newTask: TaskInterface) {
    if (
        newTask.title == undefined ||
        newTask.description == undefined ||
        newTask.status == undefined ||
        newTask.category == undefined ||
        newTask.priority == undefined
    ) {
        throw new Error('invalid structure');
    }
    newTask.id = ++tmpId;
    newTask.date = Date.now();
    base.push(newTask);
    return newTask;
}

function patchTask(base: TaskInterface[], id: number, taskData: Partial<TaskInterface>) {
    const idInBase = base.findIndex((task: TaskInterface) => task.id === id);
    if (idInBase !== -1) {
        //нашли в базе такой элемент
        if(taskData.title) base[idInBase].title = taskData.title;
        if(taskData.description) base[idInBase].description = taskData.description;
        if(taskData.status) base[idInBase].status = taskData.status;
        if(taskData.category) base[idInBase].category = taskData.category;
        if(taskData.priority) base[idInBase].priority = taskData.priority;
        return base[idInBase];
    } else {
        throw new Error('not found');
    }
}

function save(base: TaskInterface[]) {
    fs.writeFileSync(filePathInScriptDir, JSON.stringify(base), (err: any) => {
        if (err) throw err;
    });
    // fs.writeFileSync('db.json', JSON.stringify(base), (err: any) => {
    //     if (err) throw err;
    // });
    // fs.writeFileSync('./db.json', JSON.stringify(base), (err: any) => {
    //     if (err) throw err;
    // });
    // fs.writeFileSync('./dist/db.json', JSON.stringify(base), (err: any) => {
    //     if (err) throw err;
    // });
    // fs.writeFileSync('dist/db.json', JSON.stringify(base), (err: any) => {
    //     if (err) throw err;
    // });
    // fs.writeFileSync('./api/db.json', JSON.stringify(base), (err: any) => {
    //     if (err) throw err;
    // });
    // fs.writeFileSync('/api/db.json', JSON.stringify(base), (err: any) => {
    //     if (err) throw err;
    // });
}


app.listen(3000, () => console.log('Server ready on port 3000.'));
module.exports = app;
