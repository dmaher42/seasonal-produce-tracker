document.addEventListener('DOMContentLoaded', () => {
    // --- DATA ---
    const allProduce = [
        { name: 'Strawberries', category: 'Fruit', type: 'seasonal', tip: 'Look for locally grown, bright red, and fragrant berries.' },
        { name: 'Cherries', category: 'Fruit', type: 'seasonal', tip: 'The season is just beginning! Look for firm, glossy fruit with fresh green stems.' },
        { name: 'Asparagus', category: 'Vegetable', type: 'seasonal', tip: 'Last call for the best asparagus. Tips should be tightly closed.' },
        { name: 'Spinach', category: 'Vegetable', type: 'seasonal', tip: 'Thriving in the mild weather. Perfect for salads.' },
        { name: 'Zucchini', category: 'Vegetable', type: 'seasonal', tip: 'Just starting to become plentiful. Look for small, firm ones.' },
        { name: 'Lettuce & Salad Greens', category: 'Vegetable', type: 'seasonal', tip: 'Abundant and perfect for fresh salads.' },
        { name: 'Raspberries', category: 'Fruit', type: 'seasonal', tip: 'Late spring is a great time. Check for punnets without any mould.' },
        { name: 'Broccoli', category: 'Vegetable', type: 'seasonal', tip: 'Beautiful heads should be available.' },
        { name: 'Carrots', category: 'Vegetable', type: 'pantry', tip: 'Look for firm, bright orange carrots.' },
        { name: 'Onions', category: 'Vegetable', type: 'pantry', tip: 'Should feel firm and have dry, papery skin.' },
        { name: 'Lemons', category: 'Fruit', type: 'pantry', tip: 'Should feel heavy for their size.' },
        { name: 'Bananas', category: 'Fruit', type: 'regular', tip: 'Buy slightly green if you don\'t plan to eat them immediately.' },
        { name: 'Avocado', category: 'Fruit', type: 'regular', tip: 'Check for ripeness by gently pressing near the stem.' },
    ];

    // --- DOM ELEMENTS ---
    const screens = document.querySelectorAll('.screen');
    const navButtons = document.querySelectorAll('.nav-button');
    const produceList = document.getElementById('produce-list');
    const storeLogList = document.getElementById('store-log-list');
    const fridgeList = document.getElementById('fridge-list');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const storeLogTab = document.getElementById('storeLogTab');
    const fridgeTab = document.getElementById('fridgeTab');
    const tabContents = document.querySelectorAll('.tab-content');

    // New elements for meal plan generation
    const generatePlanBtn = document.getElementById('generate-plan-btn');
    const generateModal = document.getElementById('generate-modal');
    const modalCloseBtns = document.querySelectorAll('.close-btn');
    const modalOutputText = document.getElementById('modal-output-text');
    const modalCopyBtn = document.getElementById('modal-copy-btn');
    const fridgeIngredientsDisplay = document.getElementById('fridge-ingredients-display');
    
    // New elements for meal plan display
    const planTabButtons = document.querySelectorAll('.plan-tab-button');
    const planContent = document.getElementById('plan-content');
    const recipeModal = document.getElementById('recipe-modal');
    const recipeTitle = document.getElementById('recipe-title');
    const recipeBody = document.getElementById('recipe-body');


    // --- STATE MANAGEMENT ---
    let appData = JSON.parse(localStorage.getItem('freshFastAppData')) || {};
    if (!appData.log) appData.log = {};
    if (!appData.mealPlan) appData.mealPlan = null;
    let currentFilter = 'all';

    // --- FUNCTIONS ---
    function saveData() { localStorage.setItem('freshFastAppData', JSON.stringify(appData)); }
    function showScreen(screenId) {
        screens.forEach(s => s.classList.remove('active'));
        navButtons.forEach(b => b.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        document.querySelector(`[data-screen="${screenId}"]`).classList.add('active');
    }
    function getFilteredProduce() {
        if (currentFilter === 'all') return allProduce;
        return allProduce.filter(item => item.type === currentFilter);
    }
    function toggleGroup(groupElement) { groupElement.classList.toggle('collapsed'); }

    function renderProduceList() {
        produceList.innerHTML = '';
        const filteredItems = getFilteredProduce();
        const groupedItems = filteredItems.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
        }, {});
        Object.keys(groupedItems).forEach(category => {
            const group = document.createElement('div');
            group.className = 'produce-group';
            const header = document.createElement('div');
            header.className = 'group-header';
            header.innerHTML = `${category} <span class="arrow">▼</span>`;
            header.addEventListener('click', () => toggleGroup(group));
            const itemsContainer = document.createElement('div');
            itemsContainer.className = 'group-items';
            groupedItems[category].forEach(item => itemsContainer.appendChild(createProduceElement(item, 'guide')));
            group.appendChild(header); group.appendChild(itemsContainer);
            produceList.appendChild(group);
        });
    }

    function renderLogAndFridge() {
        storeLogList.innerHTML = ''; fridgeList.innerHTML = ''; let fridgeItems = [];
        allProduce.forEach(item => {
            const logData = appData.log[item.name] || { found: false, inFridge: false, notes: '' };
            storeLogList.appendChild(createProduceElement(item, 'log', logData));
            if (logData.inFridge) { fridgeItems.push(item.name); fridgeList.appendChild(createProduceElement(item, 'fridge', logData)); }
        });
        updateFridgeDisplay(fridgeItems);
    }
    
    function updateFridgeDisplay(fridgeItems) {
        if (fridgeItems.length > 0) {
            fridgeIngredientsDisplay.textContent = fridgeItems.join(', ');
            generatePlanBtn.disabled = false;
        } else {
            fridgeIngredientsDisplay.textContent = "You haven't added anything to your fridge yet.";
            generatePlanBtn.disabled = true;
        }
    }

    function createProduceElement(item, context, logData = {}) {
        const div = document.createElement('div'); div.className = 'produce-item';
        div.innerHTML = `
            <div class="info"><h3>${item.name}</h3></div>
            <div class="actions">
                ${context === 'guide' ? `<button class="add-to-log-btn" title="Add to Log">+</button>` : ''}
                ${context === 'log' ? `<label><input type="checkbox" class="found-checkbox" ${logData.found ? 'checked' : ''} title="Found"></label><label><input type="checkbox" class="fridge-checkbox" ${logData.inFridge ? 'checked' : ''} title="In Fridge"></label>` : ''}
                ${context === 'fridge' ? `<span style="color: var(--success-color);" title="In Fridge">✓</span><button class="remove-from-fridge-btn" title="Remove">−</button>` : ''}
            </div>`;
        if (context === 'guide') div.querySelector('.add-to-log-btn').addEventListener('click', () => showScreen('screen2'));
        else if (context === 'log') {
            div.querySelector('.found-checkbox').addEventListener('change', (e) => { appData.log[item.name] = { ...appData.log[item.name], found: e.target.checked }; saveData(); });
            div.querySelector('.fridge-checkbox').addEventListener('change', (e) => { appData.log[item.name] = { ...appData.log[item.name], inFridge: e.target.checked }; saveData(); renderLogAndFridge(); });
        } else if (context === 'fridge') {
            div.querySelector('.remove-from-fridge-btn').addEventListener('click', () => { appData.log[item.name].inFridge = false; saveData(); renderLogAndFridge(); });
        }
        return div;
    }
    
    // --- MEAL PLAN FUNCTIONS ---
    function openGenerateModal() {
        const fridgeItems = Object.keys(appData.log).filter(key => appData.log[key].inFridge);
        if (fridgeItems.length === 0) return;
        const promptText = `I have ${fridgeItems.join(', ')} in my fridge. Can you create a 3-day meal plan for me?`;
        modalOutputText.textContent = promptText;
        generateModal.style.display = 'block';
    }

    function displayMealPlan(plan) {
        planContent.innerHTML = '';
        const days = ['Day 1', 'Day 2', 'Day 3'];
        days.forEach((day, index) => {
            const dayDiv = document.createElement('div');
            dayDiv.className = `meal-day ${index === 0 ? 'active' : ''}`;
            dayDiv.id = `day-${index + 1}`;
            
            if (plan[day]) {
                Object.entries(plan[day]).forEach(([mealType, mealData]) => {
                    const mealItem = document.createElement('div');
                    mealItem.className = 'meal-item';
                    mealItem.innerHTML = `<h4>${mealType}</h4><p>${mealData.name}</p>`;
                    mealItem.addEventListener('click', () => openRecipeModal(mealData));
                    dayDiv.appendChild(mealItem);
                });
            }
            planContent.appendChild(dayDiv);
        });
        showScreen('screen4');
    }

    function openRecipeModal(mealData) {
        recipeTitle.textContent = mealData.name;
        recipeBody.innerHTML = `
            <h4>Ingredients</h4>
            <p>${mealData.ingredients || 'Ingredients not specified.'}</p>
            <h4>Instructions</h4>
            <p>${mealData.instructions || 'Instructions not specified.'}</p>
        `;
        recipeModal.style.display = 'block';
    }

    // --- EVENT LISTENERS ---
    navButtons.forEach(button => button.addEventListener('click', () => showScreen(button.dataset.screen)));
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            renderProduceList();
        });
    });
    storeLogTab.addEventListener('click', () => { storeLogTab.classList.add('active'); fridgeTab.classList.remove('active'); document.getElementById('store-log-list').classList.add('active'); document.getElementById('fridge-list').classList.remove('active'); });
    fridgeTab.addEventListener('click', () => { fridgeTab.classList.add('active'); storeLogTab.classList.remove('active'); document.getElementById('fridge-list').classList.add('active'); document.getElementById('store-log-list').classList.remove('active'); });
    
    generatePlanBtn.addEventListener('click', openGenerateModal);
    modalCopyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(modalOutputText.textContent).then(() => { modalCopyBtn.textContent = 'Copied!'; setTimeout(() => { modalCopyBtn.textContent = 'Copy to Clipboard'; }, 2000); });
    });
    
    modalCloseBtns.forEach(btn => btn.addEventListener('click', () => {
        btn.closest('.modal').style.display = 'none';
    }));
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });

    planTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            planTabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            document.querySelectorAll('.meal-day').forEach(day => day.classList.remove('active'));
            document.getElementById(`day-${button.dataset.day}`).classList.add('active');
        });
    });

    // --- INITIALIZATION ---
    renderProduceList();
    renderLogAndFridge();
    if (appData.mealPlan) {
        displayMealPlan(appData.mealPlan);
    }

    // --- PWA INSTALL PROMPT ---
    let deferredPrompt; const installPrompt = document.getElementById('install-prompt');
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; installPrompt.style.display = 'block'; });
    installPrompt.addEventListener('click', async () => { if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt = null; installPrompt.style.display = 'none'; } });
});
