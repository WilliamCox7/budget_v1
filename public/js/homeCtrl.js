angular.module('budget').controller('homeCtrl',
  function($scope, homeSvc, calcSvc) {
    $scope.curYear = new Date().getFullYear();
    (() => {
        homeSvc.getData().then((data) => {
          console.log(data.expenses);
          $scope.incomes = data.incomes;
          $scope.loans = data.loans;
          $scope.expenses = data.expenses;
          $scope.categories = ['Income'];
          $scope.subcategories = [];
          $scope.rules = [];
          $scope.incomes.forEach((inc) => {
            $scope.subcategories.push(inc.source);
          });
          $scope.expenses.forEach((exp) => {
            if (exp.category && !already($scope.categories, exp.category)) { $scope.categories.push(exp.category); }
            if (exp.subcategory && !already($scope.subcategories, exp.subcategory)) { $scope.subcategories.push(exp.subcategory); }
            if (exp.condition || exp.conditionAmount || exp.keyword) {
              $scope.rules.push({
                keyword: exp.keyword,
                category: exp.category,
                subcategory: exp.subcategory,
                condition: exp.condition,
                conditionAmount: exp.conditionAmount
              });
            }
          });

          var calcData = calcSvc.calculate(data.incomes, data.loans, data.expenses);
          $scope.calcData = calcData;

        });
    })();
    $scope.showModal = function() {
      $(".rule-modal").css('display', 'flex');
    }
    $scope.closeModal = function($event) {
      var element = angular.element($event.target);
      var className = element[0].className;
      if (className.indexOf('rule-modal') >= 0) {
        $('.rule-modal').css('display', 'none');
      }
    }
    $scope.removeRule = (key, cond, condAm) => {
      $scope.expenses.forEach((exp) => {
        if (exp.keyword === key && exp.condition === cond && exp.conditionAmount === condAm) {
          exp.keyword = null;
          exp.condition = null;
          exp.conditionAmount = null;
          homeSvc.removeRule(exp._id).then((result) => {
            $scope.rules.forEach((rule, i) => {
              if (rule.keyword === key && rule.condition === cond && rule.conditionAmount === condAm) {
                $scope.rules.splice(i, 1);
              }
            });
          });
        }
      });
    }
    function already(arr, test) {
      var isAlready = false;
      arr.forEach((check) => {
        if (check === test) { isAlready = true; }
      });
      return isAlready;
    }
    $scope.toggleHour = function(incomeLength) {
      if (incomeLength === '/hr') {
        $('#hour-section').css('display', 'table-row');
      } else {
        $('#hour-section').css('display', 'none');
      }
    }
    $scope.addIncome = (source, amount, length, hours, first, deduction, percent) => {
      if (source) {
        homeSvc.addIncome(source, amount, length, hours, first, deduction, percent).then((result) => {
          $('.income-form').css('display', 'none');
          $('#add-inc-btn').css('display', 'none');
          $scope.clickedDiv.css('background', 'slategray');
          $scope.incomes.push({
            source: source,
            amount: amount,
            length: length,
            hours: hours,
            first: first,
            deduction: deduction,
            percent: percent
          });
          var calcData = calcSvc.calculate($scope.incomes, $scope.loans, $scope.expenses);
          $scope.calcData = calcData;
        });
      }
    }
    $scope.addLoan = (payee, balance, payment, rate, term, first) => {
      if (payee) {
        homeSvc.addLoan(payee, balance, payment, rate, term, first).then((result) => {
          $('.loan-form').css('display', 'none');
          $('#add-loan-btn').css('display', 'none');
          $scope.clickedLoan.css('background', 'slategray');
          $scope.loans.push({
            payee: payee,
            balance: balance,
            payment: payment,
            rate: rate,
            term: term,
            first: first
          });
          var calcData = calcSvc.calculate($scope.incomes, $scope.loans, $scope.expenses);
          $scope.calcData = calcData;
        });
      }
    }
    $scope.getIncome = (source, $event) => {
      var clickedDiv = $scope.clickedDiv;
      var targetDiv = $($event.target);
      if ($scope.clickedDiv) {
        clickedDiv = clickedDiv[0].innerText;
        targetDiv = targetDiv[0].innerText;
      }
      if (clickedDiv === targetDiv) {
        $('.income-form').css('display', 'none');
        $('#update-inc-btn').css('display', 'none');
        $('#remove-inc-btn').css('display', 'none');
        $('#add-inc-btn').css('display', 'none');
        $scope.clickedDiv.css('background', 'slategray');
        $scope.clickedDiv = undefined;
      } else {
        $scope.incomes.forEach((income, i) => {
          if (income.source === source) {
            $scope.toggleHour(income.length);
            if ($scope.clickedDiv) {
              $scope.clickedDiv.css('background', 'slategray');
            }
            $scope.incomeId = income._id;
            $scope.incomeSource = income.source;
            $scope.incomeAmount = income.amount;
            $scope.incomeLength = income.length;
            $scope.incomeHours = income.hours;
            $scope.incomeFirst = new Date(income.first);
            $scope.incomeDeduction = income.deduction;
            $scope.incomePercent = income.percent;
            $('.income-form').css('display', 'block');
            $('#update-inc-btn').css('display', 'block');
            $('#remove-inc-btn').css('display', 'block');
            $('#add-inc-btn').css('display', 'none');
            $scope.clickedDiv = $($event.target);
            $scope.clickedDiv.css('background', '#2B3151');
          }
        });
      }
    }
    $scope.getLoan = (payee, $event) => {
      var clickedLoan = $scope.clickedLoan;
      var targetLoan = $($event.target);
      if ($scope.clickedLoan) {
        clickedLoan = clickedLoan[0].innerText;
        targetLoan = targetLoan[0].innerText;
      }
      if (clickedLoan === targetLoan) {
        $('.loan-form').css('display', 'none');
        $('#update-loan-btn').css('display', 'none');
        $('#remove-loan-btn').css('display', 'none');
        $('#add-loan-btn').css('display', 'none');
        $scope.clickedLoan.css('background', 'slategray');
        $scope.clickedLoan = undefined;
      } else {
        $scope.loans.forEach((loan, i) => {
          if (loan.payee === payee) {
            if ($scope.clickedLoan) {
              $scope.clickedLoan.css('background', 'slategray');
            }
            $scope.loanId = loan._id;
            $scope.loanPayee = loan.payee;
            $scope.loanBalance = loan.balance;
            $scope.loanPayment = loan.payment;
            $scope.loanRate = loan.rate;
            $scope.loanTerm = loan.term;
            $scope.loanFirst = new Date(loan.first);
            $('.loan-form').css('display', 'block');
            $('#update-loan-btn').css('display', 'block');
            $('#remove-loan-btn').css('display', 'block');
            $('#add-loan-btn').css('display', 'none');
            $scope.clickedLoan = $($event.target);
            $scope.clickedLoan.css('background', '#2B3151');
          }
        });
      }
    }
    $scope.removeIncome = (source) => {
      homeSvc.removeIncome(source).then((result) => {
        $('.income-form').css('display', 'none');
        $('#update-inc-btn').css('display', 'none');
        $('#remove-inc-btn').css('display', 'none');
        $('#add-inc-btn').css('display', 'none');
        $scope.incomes.forEach((income, i) => {
          if (income.source === source) {
            $scope.incomes.splice(i, 1);
            var calcData = calcSvc.calculate($scope.incomes, $scope.loans, $scope.expenses);
            $scope.calcData = calcData;
          }
        });
      });
    }
    $scope.removeLoan = (payee) => {
      homeSvc.removeLoan(payee).then((result) => {
        $('.loan-form').css('display', 'none');
        $('#update-loan-btn').css('display', 'none');
        $('#remove-loan-btn').css('display', 'none');
        $('#add-loan-btn').css('display', 'none');
        $scope.loans.forEach((loan, i) => {
          if (loan.payee === payee) {
            $scope.loans.splice(i, 1);
            var calcData = calcSvc.calculate($scope.incomes, $scope.loans, $scope.expenses);
            $scope.calcData = calcData;
          }
        });
      });
    }
    $scope.updateIncome = (source, amount, length, hours, first, deduction, percent) => {
      homeSvc.updateIncome($scope.incomeId, source, amount, length, hours, first, deduction, percent).then((result) => {
        $('.income-form').css('display', 'none');
        $('#update-inc-btn').css('display', 'none');
        $('#remove-inc-btn').css('display', 'none');
        $('#add-inc-btn').css('display', 'none');
        $scope.incomes.forEach((income, i) => {
          if (income._id === $scope.incomeId) {
            $scope.incomes.splice(i, 1);
            $scope.incomes.push({
              _id: $scope.incomeId,
              source: source,
              amount: amount,
              length: length,
              hours: hours,
              first: first,
              deduction: deduction,
              percent: percent
            });
            var calcData = calcSvc.calculate($scope.incomes, $scope.loans, $scope.expenses);
            $scope.calcData = calcData;
          }
        });
      });
    }
    $scope.updateLoan = (payee, balance, payment, rate, term, first) => {
      homeSvc.updateLoan($scope.loanId, payee, balance, payment, rate, term, first).then((result) => {
        $('.loan-form').css('display', 'none');
        $('#update-loan-btn').css('display', 'none');
        $('#remove-loan-btn').css('display', 'none');
        $('#add-loan-btn').css('display', 'none');
        $scope.loans.forEach((loan, i) => {
          if (loan._id === $scope.loanId) {
            $scope.loans.splice(i, 1);
            $scope.loans.push({
              _id: $scope.loanId,
              payee: payee,
              balance: balance,
              payment: payment,
              rate: rate,
              term: term,
              first: first
            });
            var calcData = calcSvc.calculate($scope.incomes, $scope.loans, $scope.expenses);
            $scope.calcData = calcData;
          }
        });
      });
    }
    $scope.newIncome = ($event) => {
      var clickedDiv = $scope.clickedDiv;
      var targetDiv = $($event.target);
      if ($scope.clickedDiv) {
        clickedDiv = clickedDiv[0].innerText;
        targetDiv = targetDiv[0].innerText;
      }
      if (clickedDiv === targetDiv) {
        $('.income-form').css('display', 'none');
        $('#update-inc-btn').css('display', 'none');
        $('#remove-inc-btn').css('display', 'none');
        $('#add-inc-btn').css('display', 'none');
        $scope.clickedDiv.css('background', 'slategray');
        $scope.clickedDiv = undefined;
      } else {
        if ($scope.clickedDiv) {
          $scope.clickedDiv.css('background', 'slategray');
        }
        $scope.incomeSource = null;
        $scope.incomeAmount = null;
        $scope.incomeLength = null;
        $scope.incomeHours = null;
        $scope.incomeFirst = null;
        $scope.incomeDeduction = null;
        $scope.incomePercent = null;
        $('.income-form').css('display', 'block');
        $('#add-inc-btn').css('display', 'block');
        $('#update-inc-btn').css('display', 'none');
        $('#remove-inc-btn').css('display', 'none');
        $scope.clickedDiv = $('#source-img-1');
        $scope.clickedDiv.css('background', '#2B3151');
        $scope.toggleHour(null);
      }
    }
    $scope.newLoan = ($event) => {
      var clickedLoan = $scope.clickedLoan;
      var targetLoan = $($event.target);
      if ($scope.clickedLoan) {
        clickedLoan = clickedLoan[0].innerText;
        targetLoan = targetLoan[0].innerText;
      }
      if (clickedLoan === targetLoan) {
        $('.loan-form').css('display', 'none');
        $('#update-loan-btn').css('display', 'none');
        $('#remove-loan-btn').css('display', 'none');
        $('#add-loan-btn').css('display', 'none');
        $scope.clickedLoan.css('background', 'slategray');
        $scope.clickedLoan = undefined;
      } else {
        if ($scope.clickedLoan) {
          $scope.clickedLoan.css('background', 'slategray');
        }
        $scope.loanId = null;
        $scope.loanPayee = null;
        $scope.loanBalance = null;
        $scope.loanPayment = null;
        $scope.loanRate = null;
        $scope.loanTerm = null;
        $scope.loanFirst = null;
        $('.loan-form').css('display', 'block');
        $('#add-loan-btn').css('display', 'block');
        $('#update-loan-btn').css('display', 'none');
        $('#remove-loan-btn').css('display', 'none');
        $scope.clickedLoan = $('#source-img-2');
        $scope.clickedLoan.css('background', '#2B3151');
      }
    }
    $scope.expIter = 0;
    $scope.saveExpenses = (expenses, filename) => {
      var skipExpense = false;
      $scope.expenseArray = expenses;
      $scope.curExpense = {
        description: expenses[$scope.expIter+4].replace(/['"]+/g, ''),
        amount: Math.abs(Number(expenses[$scope.expIter+1].replace(/['"]+/g, ''))),
        date: expenses[$scope.expIter].replace(/['"]+/g, ''),
        category: null,
        subcategory: null,
        keyword: null,
        condition: null,
        conditionAmount: null
      }
      $scope.curExpenseCount = 1;
      $scope.curExpenseTotal = expenses.length /5;
      var keyDesc = $scope.curExpense.description.toLowerCase();
      while (keyDesc.indexOf('online payment') >= 0) {
        $scope.expIter += 5; $scope.curExpenseCount++;
        $scope.curExpense.description = expenseArray[$scope.expIter+4].replace(/['"]+/g, '');
        $scope.curExpense.amount = expenseArray[$scope.expIter+1].replace(/['"]+/g, '');
        $scope.curExpense.date = expenseArray[$scope.expIter].replace(/['"]+/g, '');
        keyDesc = $scope.curExpense.description.toLowerCase();
      }
      $scope.expenses.forEach((exp, i) => {
        if (
          exp.description === $scope.curExpense.description &&
          exp.amount === $scope.curExpense.amount &&
          (new Date(exp.date)).toString() === (new Date($scope.curExpense.date)).toString()
        ) {
          skipExpense = true;
        }
      });
      $scope.rules.forEach((rule) => {
        if (keyDesc.indexOf(rule.keyword.toLowerCase()) >= 0) {
          var saveCategories = false;
          switch (rule.condition) {
            case '>': if ($scope.curExpense.amount > rule.conditionAmount) { saveCategories = true; break; }
            case '<': if ($scope.curExpense.amount < rule.conditionAmount) { saveCategories = true; break; }
            default: saveCategories = true; break;
          }
          if (saveCategories) {
            $scope.curExpense.category = rule.category;
            $scope.curExpense.subcategory = rule.subcategory;
            skipExpense = true;
          }
        }
      });
      if (skipExpense) {
        $scope.addExpense();
      }
    }
    var newExpenses = [];
    $scope.addExpense = () => {

      var skipExpense = false;

      //is it a new category/subcategory or old?
      if ($scope.selectCategory) { $scope.curExpense.category = $scope.selectCategory; }
      else if ($scope.inputCategory) {
        $scope.curExpense.category = $scope.inputCategory;
        if (!already($scope.categories, $scope.inputCategory)) { $scope.categories.push($scope.inputCategory); }
      }
      if ($scope.selectSubcategory) { $scope.curExpense.subcategory = $scope.selectSubcategory; }
      else if ($scope.inputSubcategory) {
        $scope.curExpense.subcategory = $scope.inputSubcategory;
        if (!already($scope.subcategories, $scope.inputSubcategory)) { $scope.subcategories.push($scope.inputSubcategory); }
      }

      //save new rule information if there is any
      if ($scope.newKeyword) { $scope.curExpense.keyword = $scope.newKeyword; }
      if ($scope.newCondition) { $scope.curExpense.condition = $scope.newCondition; }
      if ($scope.newConditionAmount) { $scope.curExpense.conditionAmount = $scope.newConditionAmount; }

      //check if expense is a duplicate
      var isDuplicateExp = false;
      $scope.expenses.forEach((exp, i) => {
        if (
          exp.description === $scope.curExpense.description &&
          exp.amount === $scope.curExpense.amount &&
          (new Date(exp.date)).toString() === (new Date($scope.curExpense.date)).toString()
        ) {
          isDuplicateExp = true;
        }
      });

      //if expense is new
      if (!isDuplicateExp) {
        $scope.curExpense.date = new Date($scope.curExpense.date);
        $scope.expenses.push($scope.curExpense); //save expense
        if ($scope.newKeyword && $scope.rememberRule) {
          $scope.rules.push({ //add new rule if there is one
            keyword: $scope.newKeyword,
            category: $scope.curExpense.category,
            subcategory: $scope.curExpense.subcategory,
            condition: $scope.newCondition,
            conditionAmount: $scope.newConditionAmount
          });
        }

        //save to send to mongodb
        newExpenses.push($scope.curExpense);

        //reset form
        $scope.selectCategory = null;
        $scope.inputCategory = null;
        $scope.selectSubcategory = null;
        $scope.inputSubcategory = null;
        $scope.newKeyword = null;
        $scope.newCondition = null;
        $scope.newConditionAmount = null;
        $scope.rememberRule = false;
      }

      //if it's the end of the expenses
      $scope.curExpenseCount++;
      if ($scope.curExpenseCount > $scope.curExpenseTotal) {
        homeSvc.addExpenses(newExpenses).then((result) => {
          var calcData = calcSvc.calculate($scope.incomes, $scope.loans, $scope.expenses);
          $scope.calcData = calcData;
        });
        $('.expense-form').css('display', 'none');
        $scope.expIter = 0;
      } else { //if there are still more expenses
        //get next expense
        $scope.expIter += 5;
        $scope.curExpense = {
          description: $scope.expenseArray[$scope.expIter+4].replace(/['"]+/g, ''),
          amount: Math.abs(Number($scope.expenseArray[$scope.expIter+1].replace(/['"]+/g, ''))),
          date: $scope.expenseArray[$scope.expIter].replace(/['"]+/g, ''),
          category: null,
          subcategory: null,
          keyword: null,
          condition: null,
          conditionAmount: null,
          rememberRule: false
        }
        //skip online payments
        var keyDesc = $scope.curExpense.description.toLowerCase();
        while (keyDesc.indexOf('online payment') >= 0) {
          $scope.expIter += 5; $scope.curExpenseCount++;
          $scope.curExpense.description = expenseArray[$scope.expIter+4].replace(/['"]+/g, '');
          $scope.curExpense.amount = expenseArray[$scope.expIter+1].replace(/['"]+/g, '');
          $scope.curExpense.date = expenseArray[$scope.expIter].replace(/['"]+/g, '');
          keyDesc = $scope.curExpense.description.toLowerCase();
        }

        //check if duplicate and automatically move forward if so
        $scope.expenses.forEach((exp, i) => {
          if (
            exp.description === $scope.curExpense.description &&
            exp.amount === $scope.curExpense.amount &&
            (new Date(exp.date)).toString() === (new Date($scope.curExpense.date)).toString()
          ) {
            skipExpense = true;
          }
        });

        //check if rule applies to next expense
        $scope.rules.forEach((rule) => {
          if (keyDesc.indexOf(rule.keyword.toLowerCase()) >= 0) {
            var saveCategories = false;
            switch (rule.condition) {
              case '>': if ($scope.curExpense.amount > rule.conditionAmount) { saveCategories = true; break; }
              case '<': if ($scope.curExpense.amount < rule.conditionAmount) { saveCategories = true; break; }
              default: saveCategories = true; break;
            }
            if (saveCategories) {
              $scope.curExpense.category = rule.category;
              $scope.curExpense.subcategory = rule.subcategory;
              skipExpense = true;
            }
          }
        });

        if (skipExpense) {
          $scope.addExpense();
        }

      }

    }
});
