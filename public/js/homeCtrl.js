angular.module('budget').controller('homeCtrl',
  function($scope, homeSvc) {
    (() => {
        homeSvc.getData().then((data) => {
          console.log(data);
          $scope.incomes = data.incomes;
          $scope.loans = data.loans;
          $scope.expenses = data.expenses;
          $scope.keywords = [];
          data.expenses.forEach((exp, i) => {
            $scope.keywords.push({keyword: exp.keyword, category: exp.category, subcategory: exp.subcategory});
          });
        });
    })();
    $scope.addIncome = (source, amount, length, hours, first, pattern, deduction, percent) => {
      if (source) {
        homeSvc.addIncome(source, amount, length, hours, first, pattern, deduction, percent).then((result) => {
          console.log(result);
          $('.income-form').css('display', 'none');
          $('#add-inc-btn').css('display', 'none');
          $scope.clickedDiv.css('background', 'slategray');
          $scope.incomes.push({
            source: source,
            amount: amount,
            length: length,
            hours: hours,
            first: first,
            pattern: pattern,
            deduction: deduction,
            percent: percent
          });
        });
      }
    }
    $scope.addLoan = (payee, balance, payment, rate, term, first) => {
      if (payee) {
        homeSvc.addLoan(payee, balance, payment, rate, term, first).then((result) => {
          console.log(result);
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
            if ($scope.clickedDiv) {
              $scope.clickedDiv.css('background', 'slategray');
            }
            $scope.incomeId = income._id;
            $scope.incomeSource = income.source;
            $scope.incomeAmount = income.amount;
            $scope.incomeLength = income.length;
            $scope.incomeHours = income.hours;
            $scope.incomeFirst = income.first;
            $scope.incomePattern = income.pattern;
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
            $scope.loanFirst = loan.first;
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
        console.log(result);
        $('.income-form').css('display', 'none');
        $('#update-inc-btn').css('display', 'none');
        $('#remove-inc-btn').css('display', 'none');
        $('#add-inc-btn').css('display', 'none');
        $scope.incomes.forEach((income, i) => {
          if (income.source === source) {
            $scope.incomes.splice(i, 1);
          }
        });
      });
    }
    $scope.removeLoan = (payee) => {
      homeSvc.removeLoan(payee).then((result) => {
        console.log(result);
        $('.loan-form').css('display', 'none');
        $('#update-loan-btn').css('display', 'none');
        $('#remove-loan-btn').css('display', 'none');
        $('#add-loan-btn').css('display', 'none');
        $scope.loans.forEach((loan, i) => {
          if (loan.payee === payee) {
            $scope.loans.splice(i, 1);
          }
        });
      });
    }
    $scope.updateIncome = (source, amount, length, hours, first, pattern, deduction, percent) => {
      homeSvc.updateIncome($scope.incomeId, source, amount, length, hours, first, pattern, deduction, percent).then((result) => {
        console.log(result);
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
              pattern: pattern,
              deduction: deduction,
              percent: percent
            });
          }
        });
      });
    }
    $scope.updateLoan = (payee, balance, payment, rate, term, first) => {
      homeSvc.updateLoan($scope.loanId, payee, balance, payment, rate, term, first).then((result) => {
        console.log(result);
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
        $scope.incomePattern = null;
        $scope.incomeDeduction = null;
        $scope.incomePercent = null;
        $('.income-form').css('display', 'block');
        $('#add-inc-btn').css('display', 'block');
        $('#update-inc-btn').css('display', 'none');
        $('#remove-inc-btn').css('display', 'none');
        $scope.clickedDiv = $('#source-img-1');
        $scope.clickedDiv.css('background', '#2B3151');
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
      console.log(expenses);
      $scope.expenseArray = expenses;
      $scope.curExpense = {
        description: expenses[$scope.expIter+4].replace(/['"]+/g, ''),
        amount: Math.abs(Number(expenses[$scope.expIter+1].replace(/['"]+/g, ''))),
        date: expenses[$scope.expIter].replace(/['"]+/g, ''),
        category: null,
        subcategory: null,
        keyword: null,
        condition: null,
        conditionAmount: null,
        rememberRule: false
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
      $scope.keywords.forEach((key) => {
        if (keyDesc.indexOf(key.keyword.toLowerCase()) >= 0) {
          $scope.curExpense.category = key.category;
          $scope.curExpense.subcategory = key.subcategory;
          $scope.addExpense();
        }
      });
    }
    var newExpenses = [];
    $scope.addExpense = () => {

      if ($scope.selectCategory) {
        $scope.curExpense.category = $scope.selectCategory;
      } else if ($scope.inputCategory) {
        $scope.curExpense.category = $scope.inputCategory;
      } else {
        $scope.curExpense.category = 'Unknown';
      }
      if ($scope.selectSubcategory) {
        $scope.curExpense.subcategory = $scope.selectSubcategory;
      } else if ($scope.inputSubcategory) {
        $scope.curExpense.subcategory = $scope.inputSubcategory;
      } else {
        $scope.curExpense.subcategory = 'Unknown';
      }
      if ($scope.keyword) {
        $scope.curExpense.keyword = $scope.keyword;
      }
      if ($scope.condition) {
        $scope.curExpense.condition = $scope.condition;
      }
      if ($scope.conditionAmount) {
        $scope.curExpense.conditionAmount = $scope.conditionAmount;
      }
      if ($scope.rememberRule) {
        $scope.curExpense.rememberRule = $scope.rememberRule;
      }
      var isDuplicateExp = false;
      $scope.expenses.forEach((exp, i) => {
        if (
          exp.description === $scope.curExpense.description &&
          exp.amount === $scope.curExpense.amount &&
          exp.date.toString() === (new Date($scope.curExpense.date)).toString()
        ) {
          isDuplicateExp = true;
        }
      });
      if (!isDuplicateExp) {
        $scope.curExpense.date = new Date($scope.curExpense.date);
        $scope.expenses.push($scope.curExpense);
        if ($scope.keyword && $scope.rememberRule) {
          $scope.keywords.push($scope.keyword);
        }
        newExpenses.push($scope.curExpense);
      }
      if ($scope.curExpenseCount === $scope.curExpenseTotal) {
        //send to mongodb
        $('.expense-form').css('display', 'none');
        $scope.expIter = 0;
      } else {
        $scope.curExpenseCount++;
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
            exp.date.toString() === (new Date($scope.curExpense.date)).toString()
          ) {
            $scope.addExpense();
          }
        });
        $scope.keywords.forEach((key) => {
          if (keyDesc.indexOf(key.keyword.toLowerCase()) >= 0) {
            $scope.curExpense.category = key.category;
            $scope.curExpense.subcategory = key.subcategory;
            $scope.addExpense();
          }
        });
        
      }

    }
});
