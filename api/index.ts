const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const cors = require('cors')
import {Request, Response} from 'express';

const urlencodedParser = bodyParser.urlencoded({extended: false});
app.use(express.json());
app.use(cors())
let base = require('./db.json');
const filePathInScriptDir = path.join(__dirname, 'base.json');
console.log(filePathInScriptDir)
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
    if(task){
        res.json(task);
    }else{
        res.sendStatus(404)
    }
});
app.delete('/tasks/:id', (req: Request, res: Response) => {
    const id = +req.params.id;
    const deleteInd = base.findIndex((task: TaskInterface) => task.id === id);
    if(deleteInd !== -1){
        base.splice(deleteInd, 1);
        res.json(base);
        save();
    }
    else{
        res.sendStatus(404)
    }
});
app.patch('/tasks/:id', (req: Request, res: Response) => {
    const id = +req.params.id;
    patchTask(id, req.body);
    res.sendStatus(201);
    save();
});
app.post('/tasks', urlencodedParser, (req: Request, res: Response) => {
    try{
        console.log(req)
        createTask(req.body);
        save();
        res.sendStatus(201);
    }catch(err){
        res.send(err)
    }
});

function createTask(newTask: TaskInterface) {
    newTask.id = tmpId++;
    newTask.date = Date.now();
    base.push(newTask);
    return newTask.id;
}

function patchTask(id: number, taskData: TaskInterface) {
    const idInBase = base.findIndex((task: TaskInterface) => task.id === id);
    base[idInBase] = taskData;
}

function save() {
    fs.writeFileSync(filePathInScriptDir, JSON.stringify(base), (err: any) => {
        if (err) throw err;
    });
}

app.listen(3000, () => console.log('Server ready on port 3000.'));
module.exports = app;
