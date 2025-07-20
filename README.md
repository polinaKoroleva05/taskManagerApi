## TaskManagerApi

Api для проекта TaskManager [https://github.com/polinaKoroleva05/taskManager](https://github.com/polinaKoroleva05/taskManager)

Использованые технологии:

-   Фреймворк Express.js
-   Сохранение данных в json-файл
-   Деплой на vercel
-   Документация кода на основе JSDoc

Сервер предоставляет следующие ручки:

-   Get `/tasks` получение всех задач
-   Get `/tasks/:id` получение задачи по id
-   Delete `/tasks/:id` удаление задачи по id
-   Patch `/tasks/:id` обновление задачи по id
    Параметры: поля задачи, которые подлежат изменению.
    Пример тела запроса: 
    `{title: "Add server logic"}`
    Пример ответа: 
    `{
    "id": 2,
    "title": "Add server logic",
    "category": "Documentation",
    "status": "Done",
    "priority": "High",
    "date": 1702600936342
    }`
-   Post `/tasks` создание задачи.
    Параметры: все поля новой задачи, кроме id и date.
    Пример тела запроса:
    `{
    "title": "New task title",
    "description": "Task description",
    "category": "Documentation",
    "status": "In Progress",
    "priority": "High",
    "id": null,
    "date": null
}`
    Пример ответа: 
`{
    
    "title": "New task title",

    "description": "Task description",

    "category": "Documentation",

    "status": "In Progress",

    "priority": "High",

    "id": 7,

    "date": 1753019989017

}`
