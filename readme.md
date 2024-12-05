### Structure générale du code

Le code repose sur trois concepts fondamentaux :
1. **Les classes pour organiser les responsabilités :**
   - **`TaskManager` :** Gère la liste des tâches.
   - **`LogManager` :** Gère les logs des actions.
   - **`UI` :** Relie les gestionnaires (`TaskManager` et `LogManager`) à l'interface utilisateur.

2. **Le localStorage :**
   - Permet de stocker les tâches et les logs de manière persistante même après un rechargement de la page.

3. **Le pattern Observer :**
   - Permet aux gestionnaires de tâches et logs d’informer l’interface utilisateur des changements (ajouts/suppressions).

---

### Explication détaillée

#### 1. **Gestionnaire de tâches (`TaskManager`)**

##### Objectif
Gérer la liste des tâches, permettre leur ajout/suppression et sauvegarder ces modifications dans le `localStorage`.

##### Analyse de la classe

```javascript
class TaskManager {
    constructor() {
        this.tasks = this.loadTasksFromStorage(); // Charger les tâches depuis le localStorage
        this.taskAdded = new Observer(); // Observer pour signaler un ajout
        this.taskRemoved = new Observer(); // Observer pour signaler une suppression
    }
```

- **`tasks` :** Contient la liste des tâches.
- **`taskAdded` et `taskRemoved` :** Observers pour notifier l’interface d’un changement.

```javascript
    addTask(task) {
        this.tasks.push(task);
        this.saveTasksToStorage(); // Sauvegarder les tâches
        this.taskAdded.notify(task); // Notifier l’interface
    }
```

- **`addTask` :** Ajoute une tâche, met à jour le stockage et déclenche une notification.

```javascript
    removeTask(task) {
        this.tasks = this.tasks.filter(t => t !== task);
        this.saveTasksToStorage(); // Sauvegarder les tâches mises à jour
        this.taskRemoved.notify(task); // Notifier l’interface
    }
```

- **`removeTask` :** Supprime une tâche par filtrage, met à jour le stockage et déclenche une notification.

```javascript
    loadTasksFromStorage() {
        const tasks = localStorage.getItem('tasks');
        return tasks ? JSON.parse(tasks) : []; // Charger ou initialiser une liste vide
    }

    saveTasksToStorage() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks)); // Sauvegarder la liste des tâches
    }
}
```

- **`loadTasksFromStorage` :** Charge les tâches depuis le `localStorage` (ou retourne une liste vide si aucune tâche n’est sauvegardée).
- **`saveTasksToStorage` :** Sauvegarde la liste actuelle des tâches.

---

#### 2. **Gestionnaire de logs (`LogManager`)**

##### Objectif
Gérer les logs des actions (ajout/suppression) et les sauvegarder de manière persistante.

##### Analyse de la classe

La structure est similaire au `TaskManager` :

```javascript
class LogManager {
    constructor() {
        this.logs = this.loadLogsFromStorage();
    }

    addLog(log) {
        this.logs.push(log);
        this.saveLogsToStorage();
    }

    removeLog(log) {
        this.logs = this.logs.filter(l => l !== log);
        this.saveLogsToStorage();
    }

    loadLogsFromStorage() {
        const logs = localStorage.getItem('logs');
        return logs ? JSON.parse(logs) : [];
    }

    saveLogsToStorage() {
        localStorage.setItem('logs', JSON.stringify(this.logs));
    }
}
```

---

#### 3. **Observer**

##### Objectif
Gérer les notifications entre les gestionnaires (TaskManager, LogManager) et l'interface.

##### Analyse de la classe

```javascript
class Observer {
    constructor() {
        this.subscribers = [];
    }

    subscribe(fn) {
        this.subscribers.push(fn); // Ajouter une fonction de callback
    }

    notify(data) {
        this.subscribers.forEach(fn => fn(data)); // Appeler toutes les fonctions inscrites
    }
}
```

- **`subscribe` :** Permet d’ajouter une fonction à appeler lors d’un changement.
- **`notify` :** Appelle toutes les fonctions inscrites avec les données du changement.

---

#### 4. **Interface utilisateur (`UI`)**

##### Objectif
Relier le gestionnaire des tâches et des logs avec l’interface. Responsable des interactions utilisateur.

##### Analyse de la classe

```javascript
class UI {
    constructor(taskManager, logManager) {
        this.taskManager = taskManager;
        this.logManager = logManager;
        this.taskList = document.getElementById('taskList');
        this.logList = document.getElementById('logList');
        this.init();
    }
```

- **`taskManager` et `logManager` :** Références vers les gestionnaires.
- **`taskList` et `logList` :** Liens vers les éléments HTML des listes de tâches et des logs.

```javascript
    init() {
        const taskInput = document.getElementById('taskInput');
        const addTaskButton = document.getElementById('addTaskButton');

        // Restaurer les tâches et logs existants
        this.taskManager.tasks.forEach(task => this.addTaskToUI(task));
        this.logManager.logs.forEach(log => this.addLogToUI(log));

        // Ajouter une tâche
        addTaskButton.addEventListener('click', () => this.handleAddTask(taskInput));
        taskInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') this.handleAddTask(taskInput);
        });

        // Réagir aux notifications
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
```

- **`init` :** Initialise les événements, restaure les données et inscrit les callbacks pour les notifications.

```javascript
    addTaskToUI(task) {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
            <span>${task}</span>
            <button class="btn btn-danger btn-sm">
                <i class="bi bi-trash"></i>
            </button>
        `;
        li.querySelector('button').addEventListener('click', () => {
            this.taskManager.removeTask(task);
            li.remove();
        });
        this.taskList.appendChild(li);
    }
```

- **`addTaskToUI` :** Affiche une tâche dans l’interface avec un bouton pour la supprimer.

---

#### 5. **Lien entre toutes les classes**

À la fin, nous initialisons tout et connectons les gestionnaires à l'interface :

```javascript
const taskManager = new TaskManager();
const logManager = new LogManager();
new UI(taskManager, logManager);
```

---

### Résumé des étapes clés

1. **Gestion des données (Tâches & Logs) :** Les gestionnaires s'occupent de la logique métier et du stockage.
2. **Notifications via Observer :** Permet à l’interface de se mettre à jour automatiquement.
3. **Interaction utilisateur :** La classe `UI` relie l’interface et les gestionnaires.
