    //----------------------Budget Calculator-------------------
//-------------------------Actual Code----------------------
// STORAGE CONTROLLER
const StorageCtrl = (function() {
    // Public Methods
    return {
        storeItem: function(item) {
            let items;
            // Check if any items in local storage
            if(localStorage.getItem('items') === null) {
                items = [];
                // Push new item
                items.push(item);
                // Set Local Storage
                localStorage.setItem('items', JSON.stringify(items));
            } else {
                // Get what exist in Local Storage
                items = JSON.parse(localStorage.getItem('items'));
                // Push new item
                items.push(item);
                // Reset Local Storage
                localStorage.setItem('items', JSON.stringify(items));
            }
            
        },
        getItemsFromLocalStorage: function() {
            if(localStorage.getItem('items') === null) {
                items = [];
            } else {
                items = JSON.parse(localStorage.getItem('item'));
            }
            return items;
        }
    }
})();


// BUDGET CONTROLLER
var budgetController = (function() {

    // Private Function constructor to hold our OBJs
    var Expense = function(id, description, value) { 
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    // Prototype to calculate expense percentages
    Expense.prototype.calPercentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    // Prototype to return percentages
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };
    // Private Function constructor to hold our OBJs
    var Income = function(id, description, value) { 
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(current) {
            sum +=  current.value;
        });

        data.totals[type] = sum;
    };

    // Set up our data for expenses and income
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        }, 
        
        budget: 0,
        percentage: -1
    };

    // We return an OBJ that will contain all of our public methods
    return { 
        addItem: function(type, des, val) {
            var newItem, ID;
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            //Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            // Push it into our data structure
            data.allItems[type].push(newItem);
            // Return the new element
            return newItem;

            
        },
        
        deleteItem: function(type, id) {
            var ids, index;
            // Create an array with all of the ID numbers
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);
            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {

            // Calculate total income and total Expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the % of income that we spent
            if(data.totals.inc > 0 && data.totals.exp > 0) {
              data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);  
            } else {
                data.percentage = -1;
            }
        },
        // Function to calculate our Percentages
        calculatePercentages: function() {
            data.allItems.exp.forEach(function(current)  {
                current.calPercentage(data.totals.inc);
            });
        },

        // We want to call this method to loop over all the items in the array and store it
        getPercentages: function() {
            var allPercentages = data.allItems.exp.map(function(current) {
                return current.getPercentage();
            });
            return allPercentages;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

    };

})();


// UI CONTROLLER
var UIController = (function() {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        inputPress: 'keypress',
        incomeContainer:'.income__list',
        expensesContainer:'.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'

    };

    var formatNumber = function(num, type) {
            var numSplit, int, dec;
            
            num = Math.abs(num);
            num = num.toFixed(2);
            numSplit = num.split('.');

            int = numSplit[0];
            if(int.length > 3) {
                int = int.substr(0, int.length -3) + ',' + int.substr(int.length - 3, 3); 
            } else {

            }

            dec = numSplit[1];

            return (type === 'exp' ?  '-' : '+') + ' ' + int + '.' +dec;
        };
    var nodeListForEach = function(list, callback) {
        for (i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };    

    return {
        getInput: function() {
            return {
               type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)

            };
        },

        // Add listItem
        addListItem: function(obj, type) {
            var html, newHtml, element;
            // create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

               html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'; 
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;

                html =
                '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            // Replace placeholder text with actual data using the replace(). All can be done on one line
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        

        },
        // Remove List Item
        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        

        // Clear fields
        clearFields: function() {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array) {
                current.value = '';
            });

            fieldsArr[0].focus();
        },
        // Display our budget
        displayBudget: function(obj) {
            var type;

            obj.budget > 0 ? type = 'inc' : type = 'exp';
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
        // Display our percentages
        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);
            // forEach function for nodeList
            nodeListForEach(fields, function(current, index) {
                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        // Get the current month and date
        displayMonth: function()  {
            var now, month, months, year; 
            now = new Date();
            months = ['January','Febuary','March','April','May','June','July','August','September','October','November','December',];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        // Function to handle when type is changed
        changedType: function() {
            
            // Select all input fields
            var fields = document.querySelectorAll(DOMstrings.inputType + ',' +
            DOMstrings.inputDescription + ',' +
            DOMstrings.inputValue);

            // returns a nodeList
            nodeListForEach(fields, function(current) {
                // add red class to input fields
                current.classList.toggle('red-focus');
            });

            // add red class to inputBtn
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },

        DOMstrings: function() {
            return DOMstrings;
        } 
    };

})();


//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, StorageCtrl, UICtrl) {

    // Function to hold all eventListeners
    var setEventListeners = function() {
        var DOM = UICtrl.DOMstrings();

        //We add an eventlistener for the button click using querySelector. What we are going to do when someone hits the button or the retern, enter key.
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        // Using the keypress event, we want to get the same information as the click event above
        document.addEventListener(DOM.inputPress, function(event) {
        var key = event.key || event.keyCode || event.which;
        if (key === 'Return' || event.keyCode === 13 || event.which === 13) {
            //console.log('Enter was pressed');
            ctrlAddItem();
            }
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    // Event Listener for changing inputType
    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    };

    var updateBudget = function() {
        //1. Calculate the budget
        budgetCtrl.calculateBudget();
        //2. Return the Budget
        var budget = budgetCtrl.getBudget();
        //3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };
    // Update our percentages
    var updatePercentages = function() {

        // 1. Calculate the precentages
        budgetCtrl.calculatePercentages();
        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
        };
    
    var ctrlAddItem = function() {
        var input, newItem;
        // 1. Get the field input data
        input = UICtrl.getInput();

        if(input.description !== '' && !isNaN(input.value) && input.value > 0) {
            //2. Add item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            //4 Store in Local Storage
            StorageCtrl.storeItem(item);

            //5. Clear the fields
            UICtrl.clearFields();

            //6. Calculate and update budget
            updateBudget();

            // 7. Calculate & update percentages
            updatePercentages();
        } else {

        }
    };

    // Function to 
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);// convert a string to a num with parseInt

            // 1. delete item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            // 3. Update and show the new budget
            updateBudget();

            // 4. Update percentages
            updatePercentages();
        }
    };
    
    return {
        init: function() {
            console.log('App has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setEventListeners();
        }
    };

})(budgetController, StorageCtrl, UIController);

controller.init();













