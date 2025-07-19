const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
import {Request, Response} from 'express';

const urlencodedParser = bodyParser.urlencoded({extended: false});
app.use(express.json());
app.use(cors());
let base = require('./db.json');
const filePathInScriptDir = path.join(__dirname, 'base.json');
console.log(filePathInScriptDir);
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
    res.json(base);
});

app.get('/tasks/:id', (req: Request, res: Response) => {
    const id = +req.params.id;
    let task = base.find((task: TaskInterface) => task.id === id);
    if (task) {
        res.json(task);
    } else {
        res.sendStatus(404);
    }
});
app.delete('/tasks/:id', (req: Request, res: Response) => {
    const id = +req.params.id;
    const deleteInd = base.findIndex((task: TaskInterface) => task.id === id);
    if (deleteInd !== -1) {
        base.splice(deleteInd, 1);
        save();
        res.json(base);
    } else {
        res.sendStatus(404);
    }
});
app.patch('/tasks/:id', (req: Request, res: Response) => {
    try {
        const id = +req.params.id;
        const updatedTask = patchTask(id, req.body);
        save();
        res.json(updatedTask);
    } catch (err) {
        res.send(err);
    }
});
app.post('/tasks', urlencodedParser, (req: Request, res: Response) => {
    try {
        console.log(req);
        const createdTask = createTask(req.body);
        save();
        res.json(createdTask);
    } catch (err) {
        res.send(err);
    }
});

app.delete('/tasks/devDelete/:id', (req: Request, res: Response) => {
    const id = +req.params.id;
    if (id < base.length) {
        base.splice(id, 1);
        save();
        res.json(base);
    } else {
        res.sendStatus(404);
    }
});

app.get('/restoreDB', (res: Response) => {
    try{
        const baseBackup = require('./db_backup.json');
        base = baseBackup
        save();
        res.sendStatus(200);
    }catch(err){
        res.send(err);
    }

});

function createTask(newTask: TaskInterface) {
    if (
        newTask.title == undefined ||
        newTask.description == undefined ||
        newTask.status == undefined ||
        newTask.category == undefined ||
        newTask.priority == undefined
    ) {
        throw new Error('invalid structure');
    }
    newTask.id = tmpId++;
    newTask.date = Date.now();
    base.push(newTask);
    return newTask;
}

function patchTask(id: number, taskData: TaskInterface) {
    if (
        taskData.title == undefined ||
        taskData.description == undefined ||
        taskData.status == undefined ||
        taskData.category == undefined ||
        taskData.priority == undefined
    ) {
        throw new Error('invalid structure');
    }
    const idInBase = base.findIndex((task: TaskInterface) => task.id === id);
    if (idInBase !== -1) {
        //нашли в базе такой элемент
        base[idInBase].title = taskData.title;
        base[idInBase].description = taskData.description;
        base[idInBase].status = taskData.status;
        base[idInBase].category = taskData.category;
        base[idInBase].priority = taskData.priority;
        return base[idInBase]
    } else {
        throw new Error('not found');
    }
}

function save() {
    // fs.writeFileSync(filePathInScriptDir, JSON.stringify(base), (err: any) => {
    //     if (err) throw err;
    // });
    // fs.writeFileSync('db.json', JSON.stringify(base), (err: any) => {
    //     if (err) throw err;
    // });
    // fs.writeFileSync('./db.json', JSON.stringify(base), (err: any) => {
    //     if (err) throw err;
    // });
    fs.writeFileSync('./dist/db.json', JSON.stringify(base), (err: any) => {
        if (err) throw err;
    });
    fs.writeFileSync('dist/db.json', JSON.stringify(base), (err: any) => {
        if (err) throw err;
    });
    fs.writeFileSync('./api/db.json', JSON.stringify(base), (err: any) => {
        if (err) throw err;
    });
    fs.writeFileSync('/api/db.json', JSON.stringify(base), (err: any) => {
        if (err) throw err;
    });
}

app.listen(3000, () => console.log('Server ready on port 3000.'));
module.exports = app;
