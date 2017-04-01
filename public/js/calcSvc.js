angular.module('budget').service('calcSvc',
  function() {
    var self = calc = this;
    this.calculate = function(incomes, loans, expenses) {
      var cInc = self.calcInc(incomes);
      var cLoan = self.calcLoan(loans);
      var expTemp = self.calcExp(expenses);
      var cExp = expTemp.expCalculations;
      var expTotals = expTemp.expTotals;
      // var cProj = self.calcProj(cInc, cLoan, cExp);
      return {cInc, cLoan, cExp, expTotals};
    }

    this.calcInc = function(incomes) {
      var incTemplate = {
        GI: { B: 0, M: 0, Y: 0 },
        PD: { B: 0, M: 0, Y: 0 },
        SS: { B: 0, M: 0, Y: 0 },
         M: { B: 0, M: 0, Y: 0 },
         W: { B: 0, M: 0, Y: 0 },
        ST: { B: 0, M: 0, Y: 0 },
         N: { B: 0, M: 0, Y: 0 }
      }
      var incCalculations = Object.assign({}, incTemplate);
      incomes.forEach((income) => {
        var source = income.source.split(" ").join("");
        incCalculations[source] = Object.assign({}, incTemplate);
        incCalculations[source].GI = calc.gross(Number(income.amount), Number(income.hours), income.length);
        incCalculations[source].PD = calc.deduction(incCalculations[source].GI.Y, Number(income.percent));
        incCalculations[source].SS = calc.social(incCalculations[source].GI.Y);
        incCalculations[source].M  = calc.medicare(incCalculations[source].GI.Y);
        incCalculations[source].W  = calc.withholding(incCalculations[source].GI.Y, incCalculations[source].PD.Y);
        incCalculations[source].ST = calc.state(incCalculations[source].GI.Y, incCalculations[source].PD.Y);
        incCalculations[source].N  = calc.net(incCalculations[source]);
        incCalculations.GI.B += incCalculations[source].GI.B;
        incCalculations.GI.M += incCalculations[source].GI.M;
        incCalculations.GI.Y += incCalculations[source].GI.Y;
        incCalculations.PD.B += incCalculations[source].PD.B;
        incCalculations.PD.M += incCalculations[source].PD.M;
        incCalculations.PD.Y += incCalculations[source].PD.Y;
        incCalculations.SS.B += incCalculations[source].SS.B;
        incCalculations.SS.M += incCalculations[source].SS.M;
        incCalculations.SS.Y += incCalculations[source].SS.Y;
        incCalculations.M.B  += incCalculations[source].M.B;
        incCalculations.M.M  += incCalculations[source].M.M;
        incCalculations.M.Y  += incCalculations[source].M.Y;
        incCalculations.W.B  += incCalculations[source].W.B;
        incCalculations.W.M  += incCalculations[source].W.M;
        incCalculations.W.Y  += incCalculations[source].W.Y;
        incCalculations.ST.B += incCalculations[source].ST.B;
        incCalculations.ST.M += incCalculations[source].ST.M;
        incCalculations.ST.Y += incCalculations[source].ST.Y;
        incCalculations.N.B  += incCalculations[source].N.B;
        incCalculations.N.M  += incCalculations[source].N.M;
        incCalculations.N.Y  += incCalculations[source].N.Y;
      });
      return incCalculations;
    }

    this.gross = function(amount, hours, length) {
      var gross = { B: 0, M: 0, Y: 0 };
      if (length === '/yr') {
        gross.Y = amount;
        gross.M = amount / 12;
        gross.B = amount / 26;
      } else if (length === '/hr') {
        gross.Y = amount * hours * 52;
        gross.M = gross.Y / 12;
        gross.B = gross.Y / 26;
      }
      return gross;
    }

    this.deduction = function(yearly, percent) {
      var deduction = { B: 0, M: 0, Y: 0 };
      deduction.Y = yearly * (percent / 100);
      deduction.M = deduction.Y / 12;
      deduction.B = deduction.Y / 26;
      return deduction;
    }

    this.social = function(yearly) {
      var social = { B: 0, M: 0, Y: 0 };
      social.Y = yearly * .062;
      if (social.Y > 7347) { social.Y = 7347; }
      social.M = social.Y / 12;
      social.B = social.Y / 26;
      return social;
    }

    this.medicare = function(yearly) {
      var medicare = { B: 0, M: 0, Y: 0 };
      medicare.Y = yearly * .0145;
      medicare.M = medicare.Y / 12;
      medicare.B = medicare.Y / 26;
      return medicare;
    }

    this.withholding = function(yearly, preTax) {
      preTax = yearly - preTax;
      var deduction = 6300;
      var exemption = 4050;
      var taxable = preTax - deduction - exemption;
      if (taxable < 0) { taxable = 0; }
      var withholding = { B: 0, M: 0, Y: 0 };
      withholding.Y = calc.federalTaxBracket(taxable);
      withholding.M = withholding.Y / 12;
      withholding.B = withholding.Y / 26;
      return withholding;
    }

    this.federalTaxBracket = function(taxable) {
      if (taxable > 418400) { return (taxable - 418400) * .396 + 121505.25; }
      else if (taxable > 416700) { return (taxable - 416700) * .35 + 120910.25; }
      else if (taxable > 191650) { return (taxable - 191650) * .33 + 46643.75; }
      else if (taxable > 91900) { return (taxable - 91900) * .28 + 18713.75; }
      else if (taxable > 37950) { return (taxable - 37950) * .25 + 5226.25; }
      else if (taxable > 9325) { return (taxable - 9325) * .15 + 932.5; }
      else { return taxable * .1; }
    }

    this.state = function(yearly, preTax) {
      preTax = yearly - preTax;
      var deduction = 2850;
      var taxable = preTax - deduction;
      if (taxable < 0) { taxable = 0; }
      var state = { B: 0, M: 0, Y: 0 };
      state.Y = taxable * .05;
      state.M = state.Y / 12;
      state.B = state.Y / 26;
      return state;
    }

    this.net = function(c) {
      var net = { B: 0, M: 0, Y: 0 };
      net.Y = c.GI.Y - c.PD.Y - c.SS.Y - c.M.Y - c.W.Y - c.ST.Y;
      net.M = net.Y / 12;
      net.B = net.Y / 26;
      return net;
    }

    this.calcLoan = function(loans) {
      var loanTemplate = { P: 0, I: 0, After: 0, Rem: 0 }
      var loanCalculations = Object.assign({}, loanTemplate);
      var today = new Date();
      loans.forEach((loan) => {
        if (loan.payee) {
          var payee = loan.payee.split(" ").join("");
          var first = new Date(loan.first);
          var months = calc.monthDiff(first, today);
          var balance = Number(loan.balance);
          var payment = Number(loan.payment);
          var rate = Number(loan.rate);
          var interest, principal;
          for (var i = 0; i <= months; i++) {
            interest = (balance * (rate/100)) / 12;
            principal = payment - interest;
            balance = balance - principal;
          }
          loanCalculations[payee] = Object.assign({}, loanTemplate);
          loanCalculations[payee].P = principal;
          loanCalculations[payee].I = interest;
          loanCalculations[payee].After = principal + interest;
          loanCalculations[payee].Rem = balance;
          loanCalculations.P += principal;
          loanCalculations.I += interest;
          loanCalculations.After += principal + interest;
          loanCalculations.Rem += balance;
        }
      });
      return loanCalculations;
    }

    this.monthDiff = function(d1, d2) {
      var months = (d2.getFullYear() - d1.getFullYear()) * 12;
      months -= d1.getMonth() + 1; months += d2.getMonth();
      return months <= 0 ? 0 : months;
    }

    this.calcExp = function(expenses) {
      var expTemplate = { N: '', T: 0, D: 0, M: 0, Y: 0, subs: {} }
      var expSubTemplate = { N: '', H: 0, T: 0, D: 0, M: 0, Y: 0 }
      var expCalculations = {};
      var expTotals = { D: 0, M: 0, Y: 0 }
      var maxDate, minDate;
      var totalExp = 0;
      expenses.forEach((expense) => {
        if (maxDate && minDate) {
          var nDate = new Date(expense.date);
          if (maxDate - nDate < 0) { maxDate = nDate; }
          if (nDate - minDate < 0) { minDate = nDate; }
        } else {
          maxDate = new Date(expense.date);
          minDate = new Date(expense.date);
        }
      });
      var totalDays = (maxDate - minDate) / (100*60*60*24);
      expenses.forEach((expense) => {
        if (expense.category) {
          totalExp += expense.amount;
          var catKey = expense.category.split(" ").join("");
          var subKey = expense.subcategory.split(" ").join("");
          if (!expCalculations[catKey]) {
            expCalculations[catKey] = Object.assign({}, expTemplate);
          }
          expCalculations[catKey].T += expense.amount;

          if (!expCalculations[catKey].subs[subKey]) {
            expCalculations[catKey].subs[subKey] = Object.assign({}, expSubTemplate);
          }
          expCalculations[catKey].subs[subKey].T += expense.amount;
          expCalculations[catKey].N = catKey;
          expCalculations[catKey].subs[subKey].N = subKey;


          if (!totalDays) { totalDays = 1; }
          expCalculations[catKey].D = expCalculations[catKey].T / totalDays;
          expCalculations[catKey].subs[subKey].D = expCalculations[catKey].subs[subKey].T / totalDays;
          expCalculations[catKey].M = (expCalculations[catKey].D * 365) / 12;
          expCalculations[catKey].subs[subKey].M = (expCalculations[catKey].subs[subKey].D * 365) / 12;
          expCalculations[catKey].Y = expCalculations[catKey].D * 365;
          expCalculations[catKey].subs[subKey].Y = expCalculations[catKey].subs[subKey].D * 365;
        }
      });
      expTotals.D = totalExp / totalDays
      expTotals.M = (expTotals.D * 365) / 12;
      expTotals.Y = expTotals.D * 365;
      expenses.forEach((expense) => {
        var catKey = expense.category.split(" ").join("");
        var subKey = expense.subcategory.split(" ").join("");

        expCalculations[catKey].subs[subKey].H = (expCalculations[catKey].subs[subKey].T / expCalculations[catKey].T) * 100;
      });
      return {expCalculations, expTotals};
    }

    this.calcProj = function(cData) {

    }

});
