document.addEventListener('DOMContentLoaded', () => {
    // Module Observer
    class Observer {
        constructor() {
            this.subscribers = [];
        }

        subscribe(fn) {
            this.subscribers.push(fn);
        }

        notify(data) {
            this.subscribers.forEach(fn => fn(data));
        }
    }

    // Gestionnaire de tâches
    class TaskManager {
        constructor() {
            this.tasks = this.loadTasksFromStorage(); // Charger les tâches depuis localStorage
            this.taskAdded = new Observer();
            this.taskRemoved = new Observer();
        }

        addTask(task) {
            this.tasks.push(task);
            this.saveTasksToStorage(); // Sauvegarder après ajout
            this.taskAdded.notify(task);
        }

        removeTask(task) {
            this.tasks = this.tasks.filter(t => t !== task);
            this.saveTasksToStorage(); // Sauvegarder après suppression
            this.taskRemoved.notify(task);
        }

        loadTasksFromStorage() {
            const tasks = localStorage.getItem('tasks');
            return tasks ? JSON.parse(tasks) : [];
        }

        saveTasksToStorage() {
            localStorage.setItem('tasks', JSON.stringify(this.tasks));
        }
    }

    // Gestionnaire des logs
    class LogManager {
        constructor() {
            this.logs = this.loadLogsFromStorage(); // Charger les logs depuis localStorage
        }

        addLog(log) {
            this.logs.push(log);
            this.saveLogsToStorage(); // Sauvegarder après ajout
        }

        removeLog(log) {
            this.logs = this.logs.filter(l => l !== log);
            this.saveLogsToStorage(); // Sauvegarder après suppression
        }

        loadLogsFromStorage() {
            const logs = localStorage.getItem('logs');
            return logs ? JSON.parse(logs) : [];
        }

        saveLogsToStorage() {
            localStorage.setItem('logs', JSON.stringify(this.logs));
        }
    }

    // Gestionnaire d'interface utilisateur
    class UI {
        constructor(taskManager, logManager) {
            this.taskManager = taskManager;
            this.logManager = logManager;
            this.taskList = document.getElementById('taskList');
            this.logList = document.getElementById('logList');
            this.init();
        }

        init() {
            const taskInput = document.getElementById('taskInput');
            const addTaskButton = document.getElementById('addTaskButton');

            // Restaurer les tâches existantes
            this.taskManager.tasks.forEach(task => this.addTaskToUI(task));

            // Restaurer les logs existants
            this.logManager.logs.forEach(log => this.addLogToUI(log));

            // Ajouter une tâche au clic
            addTaskButton.addEventListener('click', () => this.handleAddTask(taskInput));

            // Ajouter une tâche avec la touche "Entrée"
            taskInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault(); // Empêcher la soumission du formulaire
                    this.handleAddTask(taskInput);
                }
            });

            // Observer : mise à jour UI
            this.taskManager.taskAdded.subscribe(task => {
                this.addTaskToUI(task);
                this.addLogToUI(`Tâche ajoutée: "${task}"`);
                this.logManager.addLog(`Tâche ajoutée: "${task}"`);
            });

            this.taskManager.taskRemoved.subscribe(task => {
                this.addLogToUI(`Tâche supprimée: "${task}"`);
                this.logManager.addLog(`Tâche supprimée: "${task}"`);
            });
        }

        handleAddTask(taskInput) {
            const task = taskInput.value.trim();
            if (task) {
                this.taskManager.addTask(task);
                taskInput.value = ''; // Réinitialiser le champ de saisie
            } else {
                alert("Veuillez saisir une tâche !");
            }
        }

        addTaskToUI(task) {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `
                <span>${task}</span>
                <button class="btn btn-danger btn-sm">
                    <i class="bi bi-trash"></i>
                </button>
            `;
            const deleteButton = li.querySelector('button');
            deleteButton.addEventListener('click', () => {
                this.taskManager.removeTask(task);
                li.remove();
            });
            this.taskList.appendChild(li);
        }

        addLogToUI(log) {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `
                <span>${log}</span>
                <button class="btn btn-danger btn-sm">
                    <i class="bi bi-trash"></i>
                </button>
            `;
            const deleteButton = li.querySelector('button');
            deleteButton.addEventListener('click', () => {
                this.logManager.removeLog(log); // Supprime le log du localStorage
                li.remove(); // Supprime la ligne de log
            });
            this.logList.appendChild(li);
        }
    }

    // Initialisation
    const taskManager = new TaskManager();
    const logManager = new LogManager();
    new UI(taskManager, logManager);
});
