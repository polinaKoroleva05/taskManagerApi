"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(express.json());
app.use(cors());
let base = require('./db.json');
let tmpId = 7;
app.get('/tasks', (req, res) => {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.json(base);
});
app.get('/tasks/:id', (req, res) => {
    const id = +req.params.id;
    let task = base.find((task) => task.id === id);
    if (task) {
        res.setHeader('Cache-Control', 'no-store, max-age=0');
        res.json(task);
    }
    else {
        res.sendStatus(404);
    }
});
app.delete('/tasks/:id', (req, res) => {
    const id = +req.params.id;
    const deleteInd = base.findIndex((task) => task.id === id);
    if (deleteInd !== -1) {
        base.splice(deleteInd, 1);
        res.setHeader('Cache-Control', 'no-store, max-age=0');
        res.json(base);
    }
    else {
        res.sendStatus(404);
    }
});
app.patch('/tasks/:id', (req, res) => {
    try {
        const id = +req.params.id;
        const updatedTask = patchTask(id, req.body);
        res.setHeader('Cache-Control', 'no-store, max-age=0');
        res.json(updatedTask);
    }
    catch (err) {
        res.send(err);
    }
});
app.post('/tasks', urlencodedParser, (req, res) => {
    try {
        console.log(req);
        const createdTask = createTask(req.body);
        res.setHeader('Cache-Control', 'no-store, max-age=0');
        res.json(createdTask);
    }
    catch (err) {
        res.send(err);
    }
});
app.delete('/tasks/devDelete/:id', (req, res) => {
    const id = +req.params.id;
    if (id < base.length) {
        base.splice(id, 1);
        res.setHeader('Cache-Control', 'no-store, max-age=0');
        res.json(base);
    }
    else {
        res.sendStatus(404);
    }
});
app.get('/restoreDB', (req, res) => {
    try {
        const baseBackup = require('./db.json');
        base = baseBackup;
        res.sendStatus(200);
    }
    catch (err) {
        res.send(err);
    }
});
function createTask(newTask) {
    if (newTask.title == undefined ||
        newTask.description == undefined ||
        newTask.status == undefined ||
        newTask.category == undefined ||
        newTask.priority == undefined) {
        throw new Error('invalid structure');
    }
    newTask.id = ++tmpId;
    newTask.date = Date.now();
    base.push(newTask);
    return newTask;
}
function patchTask(id, taskData) {
    const idInBase = base.findIndex((task) => task.id === id);
    if (idInBase !== -1) {
        //нашли в базе такой элемент
        if (taskData.title)
            base[idInBase].title = taskData.title;
        if (taskData.description)
            base[idInBase].description = taskData.description;
        if (taskData.status)
            base[idInBase].status = taskData.status;
        if (taskData.category)
            base[idInBase].category = taskData.category;
        if (taskData.priority)
            base[idInBase].priority = taskData.priority;
        return base[idInBase];
    }
    else {
        throw new Error('not found');
    }
}
app.listen(3000, () => console.log('Server ready on port 3000.'));
module.exports = app;
