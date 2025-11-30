document.addEventListener('DOMContentLoaded', () => {
    // --- DATA ---
    // You can edit this list! Add your own items.
    // 'type' can be 'seasonal', 'pantry', or 'regular'
    const allProduce = [
        // SEASONAL (Adelaide Hills, Late Spring)
        { name: 'Strawberries', category: 'Fruit', type: 'seasonal', tip: 'Look for locally grown, bright red, and fragrant berries.' },
        { name: 'Cherries', category: 'Fruit', type: 'seasonal', tip: 'The season is just beginning! Look for firm, glossy fruit with fresh green stems.' },
        { name: 'Asparagus', category: 'Vegetable', type: 'seasonal', tip: 'Last call for the best asparagus. Tips should be tightly closed.' },
        { name: 'Spinach', category: 'Vegetable', type: 'seasonal', tip: 'Thriving in the mild weather. Perfect for salads.' },
        { name: 'Zucchini', category: 'Vegetable', type: 'seasonal', tip: 'Just starting to become plentiful. Look for small, firm ones.' },
        { name: 'Lettuce & Salad Greens', category: 'Vegetable', type: 'seasonal', tip: 'Abundant and perfect for fresh salads.' },
        { name: 'Raspberries', category: 'Fruit', type: 'seasonal', tip: 'Late spring is a great time. Check for punnets without any mould.' },
        { name: 'Broccoli', category: 'Vegetable', type: 'seasonal', tip: 'Beautiful heads should be available.' },
        
        // PANTRY STAPLES (Generally good year-round)
        { name: 'Carrots', category: 'Vegetable', type: 'pantry', tip: 'Look for firm, bright orange carrots. Store in the crisper drawer.' },
        { name: 'Onions', category: 'Vegetable', type: 'pantry', tip: 'Should feel firm and have dry, papery skin.' },
        { name: 'Garlic', category: 'Vegetable', type: 'pantry', tip: 'Choose heads that are firm to the touch with no soft spots.' },
        { name: 'Potatoes', category: 'Vegetable', type: 'pantry', tip: 'Avoid any with green spots or sprouts.' },
        { name: 'Lemons', category: 'Fruit', type: 'pantry', tip: 'Should feel heavy for their size and have a bright, glossy skin.' },
        { name: 'Ginger', category: 'Vegetable', type: 'pantry', tip: 'Look for firm, smooth skin. Can be frozen to last longer.' },

        // REGULAR BUYS (Things you buy often)
        { name: 'Bananas', category: 'Fruit', type: 'regular', tip: 'Buy slightly green if you don\'t plan to eat them immediately.' },
        { name: 'Apples', category: 'Fruit', type: 'regular', tip: 'A great year-round snack. Many varieties available.' },
        { name: 'Avocado', category: 'Fruit', type: 'regular', tip: 'Check for ripeness by gently pressing near the stem. It should yield slightly.' },
        { name: 'Tomatoes', category: 'Fruit', type: 'regular', tip: 'For best flavor, store at room temperature out of direct sunlight.' },
        { name: 'Mushrooms', category: 'Vegetable', type: 'regular', tip: 'Look for caps that are smooth and unbruised.' },
        { name: 'Bell Peppers', category: 'Vegetable', type: 'regular', tip: 'Available in many colors. Should feel firm and have a glossy skin.' },
    ];

    // --- DOM ELEMENTS ---
    const screens = document.querySelectorAll('.screen');
    const navButtons = document.querySelectorAll('.nav-button');
    const produceList = document.getElementById('produce-list');
    const storeLogList = document.getElementById('store-log-list');
    const fridgeList = document.getElementById('fridge-list');
    const mealPlanOutput = document.getElementById('meal-plan-output');
    const copyButton = document.getElementById('copy-button');
    const storeLogTab = document.getElementById('storeLogTab');
    const fridgeTab = document.getElementById('fridgeTab');
    const tabContents = document.querySelectorAll('.tab-content');
    const filterButtons = document.querySelectorAll('.filter-btn');

    // --- STATE MANAGEMENT ---
    let appData = JSON.parse(localStorage.getItem('freshFastAppData')) || {};
    if (!appData.log) {
        appData.log = {};
    }
    let currentFilter = 'all'; // The active filter for the produce list

    // --- FUNCTIONS ---

    function saveData() {
        localStorage.setItem('freshFastAppData', JSON.stringify(appData));
    }

    function showScreen(screenId) {
        screens.forEach(screen => screen.classList.remove('active'));
        navButtons.forEach(button => button.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        document.querySelector(`[data-screen="${screenId}"]`).classList.add('active');
    }

    function getFilteredProduce() {
        if (currentFilter === 'all') {
            return allProduce;
        }
        return allProduce.filter(item => item.type === currentFilter);
    }

    function renderProduceList() {
        produceList.innerHTML = '';
        const filteredItems = getFilteredProduce();
        filteredItems.forEach(item => {
            const produceEl = createProduceElement(item, 'guide');
            produceList.appendChild(produceEl);
        });
    }

    function renderLogAndFridge() {
        storeLogList.innerHTML = '';
        fridgeList.innerHTML = '';
        let fridgeItems = [];

        allProduce.forEach(item => {
            const logData = appData.log[item.name] || { found: false, inFridge: false, notes: '' };
            const produceEl = createProduceElement(item, 'log', logData);
            storeLogList.appendChild(produceEl);

            if (logData.inFridge) {
                fridgeItems.push(item.name);
                const fridgeEl = createProduceElement(item, 'fridge', logData);
                fridgeList.appendChild(fridgeEl);
            }
        });

        if (fridgeItems.length > 0) {
            mealPlanOutput.textContent = `I have ${fridgeItems.join(', ')} in my fridge. Can you create a 3-day meal plan for me?`;
        } else {
            mealPlanOutput.textContent = 'Go to the "My Fridge" tab and add some items first!';
        }
    }

    function createProduceElement(item, context, logData = {}) {
        const div = document.createElement('div');
        div.className = 'produce-item';
        div.innerHTML = `
            <h3>${item.name} <small>(${item.category})</small></h3>
            <p>${item.tip}</p>
            <div class="actions">
                ${context === 'guide' ? `<button class="add-to-log-btn">Add to Log</button>` : ''}
                ${context === 'log' ? `
                    <label><input type="checkbox" class="found-checkbox" ${logData.found ? 'checked' : ''}> Found</label>
                    <label><input type="checkbox" class="fridge-checkbox" ${logData.inFridge ? 'checked' : ''}> In Fridge</label>
                ` : ''}
                ${context === 'fridge' ? `
                    <span style="color: var(--success-color);">✓ In Fridge</span>
                    <button class="remove-from-fridge-btn">Remove</button>
                ` : ''}
            </div>
            ${context === 'log' ? `<input type="text" class="notes-input" placeholder="Quality notes..." value="${logData.notes}">` : ''}
        `;

        if (context === 'guide') {
            div.querySelector('.add-to-log-btn').addEventListener('click', () => showScreen('screen2'));
        } else if (context === 'log') {
            const foundCb = div.querySelector('.found-checkbox');
            const fridgeCb = div.querySelector('.fridge-checkbox');
            const notesInput = div.querySelector('.notes-input');

            foundCb.addEventListener('change', (e) => {
                appData.log[item.name] = { ...appData.log[item.name], found: e.target.checked };
                saveData();
            });
            fridgeCb.addEventListener('change', (e) => {
                appData.log[item.name] = { ...appData.log[item.name], inFridge: e.target.checked };
                saveData();
                renderLogAndFridge();
            });
            notesInput.addEventListener('input', (e) => {
                appData.log[item.name] = { ...appData.log[item.name], notes: e.target.value };
                saveData();
            });
        } else if (context === 'fridge') {
            div.querySelector('.remove-from-fridge-btn').addEventListener('click', () => {
                appData.log[item.name].inFridge = false;
                saveData();
                renderLogAndFridge();
            });
        }

        return div;
    }

    // --- EVENT LISTENERS ---
    navButtons.forEach(button => {
        button.addEventListener('click', () => showScreen(button.dataset.screen));
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            renderProduceList();
        });
    });

    copyButton.addEventListener('click', () => {
        const textToCopy = mealPlanOutput.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
            copyButton.textContent = 'Copied!';
            setTimeout(() => { copyButton.textContent = 'Copy to Clipboard'; }, 2000);
        }).catch(err => console.error('Failed to copy: ', err));
    });

    storeLogTab.addEventListener('click', () => {
        storeLogTab.classList.add('active');
        fridgeTab.classList.remove('active');
        document.getElementById('store-log-list').classList.add('active');
        document.getElementById('fridge-list').classList.remove('active');
    });

    fridgeTab.addEventListener('click', () => {
        fridgeTab.classList.add('active');
        storeLogTab.classList.remove('active');
        document.getElementById('fridge-list').classList.add('active');
        document.getElementById('store-log-list').classList.remove('active');
    });

    // --- INITIALIZATION ---
    renderProduceList();
    renderLogAndFridge();

    // --- PWA INSTALL PROMPT ---
    let deferredPrompt;
    const installPrompt = document.getElementById('install-prompt');
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installPrompt.style.display = 'block';
    });
    installPrompt.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            deferredPrompt = null;
            installPrompt.style.display = 'none';
        }
    });
});
