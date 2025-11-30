document.addEventListener('DOMContentLoaded', () => {
    // --- DATA ---
    // You can edit this list for your location and season!
    const seasonalProduce = [
        { name: 'Strawberries', category: 'Fruit', tip: 'Look for locally grown, bright red, and fragrant berries.' },
        { name: 'Cherries', category: 'Fruit', tip: 'The season is just beginning! Look for firm, glossy fruit with fresh green stems.' },
        { name: 'Asparagus', category: 'Vegetable', tip: 'Last call for the best asparagus. Tips should be tightly closed.' },
        { name: 'Spinach', category: 'Vegetable', tip: 'Thriving in the mild weather. Perfect for salads.' },
        { name: 'Zucchini', category: 'Vegetable', tip: 'Just starting to become plentiful. Look for small, firm ones.' },
        { name: 'Lettuce & Salad Greens', category: 'Vegetable', tip: 'Abundant and perfect for fresh salads.' },
        { name: 'Raspberries', category: 'Fruit', tip: 'Late spring is a great time. Check for punnets without any mould.' },
        { name: 'Broccoli', category: 'Vegetable', tip: 'Beautiful heads should be available.' },
    ];

    // --- DOM ELEMENTS ---
    const screens = document.querySelectorAll('.screen');
    const navButtons = document.querySelectorAll('.nav-button');
    const seasonalList = document.getElementById('seasonal-list');
    const storeLogList = document.getElementById('store-log-list');
    const fridgeList = document.getElementById('fridge-list');
    const mealPlanOutput = document.getElementById('meal-plan-output');
    const copyButton = document.getElementById('copy-button');
    const storeLogTab = document.getElementById('storeLogTab');
    const fridgeTab = document.getElementById('fridgeTab');
    const tabContents = document.querySelectorAll('.tab-content');

    // --- STATE MANAGEMENT ---
    // Load data from localStorage or initialize
    let appData = JSON.parse(localStorage.getItem('freshFastAppData')) || {};
    if (!appData.log) {
        appData.log = {}; // Initialize log if it doesn't exist
    }

    // --- FUNCTIONS ---

    /**
     * Save the current appData state to localStorage.
     */
    function saveData() {
        localStorage.setItem('freshFastAppData', JSON.stringify(appData));
    }

    /**
     * Switch between the main screens.
     */
    function showScreen(screenId) {
        screens.forEach(screen => screen.classList.remove('active'));
        navButtons.forEach(button => button.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        document.querySelector(`[data-screen="${screenId}"]`).classList.add('active');
    }

    /**
     * Render the list of seasonal produce.
     */
    function renderSeasonalList() {
        seasonalList.innerHTML = '';
        seasonalProduce.forEach(item => {
            const produceEl = createProduceElement(item, 'seasonal');
            seasonalList.appendChild(produceEl);
        });
    }

    /**
     * Render the Store Log and My Fridge lists.
     */
    function renderLogAndFridge() {
        storeLogList.innerHTML = '';
        fridgeList.innerHTML = '';
        let fridgeItems = [];

        seasonalProduce.forEach(item => {
            const logData = appData.log[item.name] || { found: false, inFridge: false, notes: '' };
            const produceEl = createProduceElement(item, 'log', logData);
            storeLogList.appendChild(produceEl);

            if (logData.inFridge) {
                fridgeItems.push(item.name);
                const fridgeEl = createProduceElement(item, 'fridge', logData);
                fridgeList.appendChild(fridgeEl);
            }
        });

        // Update Meal Planner output
        if (fridgeItems.length > 0) {
            mealPlanOutput.textContent = `I have ${fridgeItems.join(', ')} in my fridge. Can you create a 3-day meal plan for me?`;
        } else {
            mealPlanOutput.textContent = 'Go to the "My Fridge" tab and add some items first!';
        }
    }

    /**
     * Create a DOM element for a single produce item.
     */
    function createProduceElement(item, context, logData = {}) {
        const div = document.createElement('div');
        div.className = 'produce-item';
        div.innerHTML = `
            <h3>${item.name} <small>(${item.category})</small></h3>
            <p>${item.tip}</p>
            <div class="actions">
                ${context === 'seasonal' ? `<button class="add-to-log-btn">Add to Log</button>` : ''}
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

        // Add event listeners
        if (context === 'seasonal') {
            div.querySelector('.add-to-log-btn').addEventListener('click', () => {
                showScreen('screen2');
            });
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
                renderLogAndFridge(); // Re-render to update both lists
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

    copyButton.addEventListener('click', () => {
        const textToCopy = mealPlanOutput.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
            copyButton.textContent = 'Copied!';
            setTimeout(() => {
                copyButton.textContent = 'Copy to Clipboard';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    });

    // Tab switching
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
    renderSeasonalList();
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
            if (outcome === 'accepted') {
                console.log('User accepted the install prompt.');
            } else {
                console.log('User dismissed the install prompt.');
            }
            deferredPrompt = null;
            installPrompt.style.display = 'none';
        }
    });
});
