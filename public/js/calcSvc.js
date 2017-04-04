angular.module('budget').service('calcSvc',
  function() {
    var self = calc = this;
    this.calculate = function(incomes, loans, expenses) {
      var cInc = self.calcInc(incomes);
      var cLoan = self.calcLoan(loans);
      var expTemp = self.calcExp(expenses);
      var cExp = expTemp.expCalculations;
      var expTotals = expTemp.expTotals;
      var cProj = self.calcProj(cInc, incomes, cLoan, loans, expTotals);
      return {cInc, cLoan, cExp, expTotals, cProj};
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
      var today = new Date();
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
        if (new Date(income.first) < today) {
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
        }
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
          if (new Date(loan.first) < today) {
            loanCalculations.P += principal;
            loanCalculations.I += interest;
            loanCalculations.After += principal + interest;
            loanCalculations.Rem += balance;
          }
        }
      });
      return loanCalculations;
    }

    this.monthDiff = function(d1, d2) {
      var months = (d2.getFullYear() - d1.getFullYear()) * 12;
      months -= d1.getMonth() + 1; months += d2.getMonth();
      return months <= 0 ? 0 : months;
    }
    var projInfo = {
      Jan: 0, Feb: 0, Mar: 0,
      Apr: 0, May: 0, Jun: 0,
      Jul: 0, Aug: 0, Sep: 0,
      Oct: 0, Nov: 0, Dec: 0
    }
    this.calcExp = function(expenses) {
      var expCalculations = {};
      var expTotals = { D: 0, M: 0, Y: 0 }
      var maxDate, minDate;
      var totalExp = 0;
      expenses.forEach((expense) => {
        var nDate = new Date(expense.date);
        var thisYear = new Date().getFullYear();
        if (nDate <= new Date(thisYear, 0, 31)) {
          if (expense.category === 'Income') {
            projInfo.Jan += expense.amount;
          } else { projInfo.Jan -= expense.amount; }
        }
        else if (nDate > new Date(thisYear, 0, 31) && nDate <= new Date(thisYear, 1, 28)) {
          if (expense.category === 'Income') {
            projInfo.Feb += expense.amount;
          } else { projInfo.Feb -= expense.amount; }
        }
        else if (nDate > new Date(thisYear, 1, 28) && nDate <= new Date(thisYear, 2, 31)) {
          if (expense.category === 'Income') {
            projInfo.Mar += expense.amount;
          } else { projInfo.Mar -= expense.amount; }
        }
        else if (nDate > new Date(thisYear, 2, 31) && nDate <= new Date(thisYear, 3, 30)) {
          if (expense.category === 'Income') {
            projInfo.Apr += expense.amount;
          } else { projInfo.Apr -= expense.amount; }
        }
        else if (nDate > new Date(thisYear, 3, 30) && nDate <= new Date(thisYear, 4, 31)) {
          if (expense.category === 'Income') {
            projInfo.May += expense.amount;
          } else { projInfo.May -= expense.amount; }
        }
        else if (nDate > new Date(thisYear, 4, 31) && nDate <= new Date(thisYear, 5, 30)) {
          if (expense.category === 'Income') {
            projInfo.Jun += expense.amount;
          } else { projInfo.Jun -= expense.amount; }
        }
        else if (nDate > new Date(thisYear, 5, 30) && nDate <= new Date(thisYear, 6, 31)) {
          if (expense.category === 'Income') {
            projInfo.Jul += expense.amount;
          } else { projInfo.Jul -= expense.amount; }
        }
        else if (nDate > new Date(thisYear, 6, 31) && nDate <= new Date(thisYear, 7, 31)) {
          if (expense.category === 'Income') {
            projInfo.Aug += expense.amount;
          } else { projInfo.Aug -= expense.amount; }
        }
        else if (nDate > new Date(thisYear, 7, 31) && nDate <= new Date(thisYear, 8, 30)) {
          if (expense.category === 'Income') {
            projInfo.Sep += expense.amount;
          } else { projInfo.Sep -= expense.amount; }
        }
        else if (nDate > new Date(thisYear, 8, 30) && nDate <= new Date(thisYear, 9, 31)) {
          if (expense.category === 'Income') {
            projInfo.Oct += expense.amount;
          } else { projInfo.Oct -= expense.amount; }
        }
        else if (nDate > new Date(thisYear, 9, 31) && nDate <= new Date(thisYear, 10, 30)) {
          if (expense.category === 'Income') {
            projInfo.Nov += expense.amount;
          } else { projInfo.Nov -= expense.amount; }
        }
        else if (nDate > new Date(thisYear, 10, 30) && nDate <= new Date(thisYear, 11, 31)) {
          if (expense.category === 'Income') {
            projInfo.Dec += expense.amount;
          } else { projInfo.Dec -= expense.amount; }
        }
        if (maxDate && minDate) {
          if (maxDate - nDate < 0) { maxDate = nDate; }
          if (nDate - minDate < 0) { minDate = nDate; }
        } else {
          maxDate = new Date(expense.date);
          minDate = new Date(expense.date);
        }
      });
      // var totalDays = (maxDate - minDate) / (100*60*60*24);
      var totalDays = Math.floor(( maxDate - minDate ) / 86400000);
      expenses.forEach((expense) => {
        if (expense.category) {
          totalExp += expense.amount;
          var catKey = expense.category.split(" ").join("");
          var subKey = expense.subcategory.split(" ").join("");
          if (!expCalculations[catKey]) {
            expCalculations[catKey] = { N: '', T: 0, D: 0, M: 0, Y: 0, subs: {} };
          }
          expCalculations[catKey].T += expense.amount;

          if (!expCalculations[catKey].subs[subKey]) {
            expCalculations[catKey].subs[subKey] = { N: '', H: 0, T: 0, D: 0, M: 0, Y: 0 };
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
        if (expense.category) {
          var catKey = expense.category.split(" ").join("");
          var subKey = expense.subcategory.split(" ").join("");
          expCalculations[catKey].subs[subKey].H = (expCalculations[catKey].subs[subKey].T / expCalculations[catKey].T) * 100;
        }
      });
      return {expCalculations, expTotals};
    }

    this.calcProj = function(cInc, incomes, cLoan, loans, cExp) {
      var thisYear = new Date().getFullYear();
      var today = new Date();
      var start = 2000;
      var projCalculations = {
        Jan1: 0, Feb1: 0, Mar1: 0,
        Apr1: 0, May1: 0, Jun1: 0,
        Jul1: 0, Aug1: 0, Sep1: 0,
        Oct1: 0, Nov1: 0, Dec1: 0,
        Jan2: 0, Feb2: 0, Mar2: 0,
        Apr2: 0, May2: 0, Jun2: 0,
        Jul2: 0, Aug2: 0, Sep2: 0,
        Oct2: 0, Nov2: 0, Dec2: 0,
        Jan3: 0, Feb3: 0, Mar3: 0,
        Apr3: 0, May3: 0, Jun3: 0,
        Jul3: 0, Aug3: 0, Sep3: 0,
        Oct3: 0, Nov3: 0, Dec3: 0
      }
      var loanUpdate = {};
      var monthsDiff  = 0;
      loans.forEach((loan) => {
        var key = loan.payee.split(" ").join("");
        loanUpdate[key] = { balance: Number(loan.balance), payment: Number(loan.payment), rate: Number(loan.rate), monthsDiff: 0 }
      });
      function updateBalance(key, mon) {
        loanUpdate[key].monthsDiff++;
        var lastBalance = loanUpdate[key].balance;
        if (loanUpdate[key].balance > 0) {
          var interest, principal;
          for (var i = 0; i <= loanUpdate[key].monthsDiff; i++) {
            interest = (loanUpdate[key].balance * (loanUpdate[key].rate/100)) / 12;
            principal = loanUpdate[key].payment - interest;
            loanUpdate[key].balance -= principal;
          }
          if (loanUpdate[key].balance > 0) {
            projCalculations[mon] -= principal + interest;
          } else {
            projCalculations[mon] -= lastBalance;
          }
        }
      }
      if (new Date(thisYear, 0, 31) < today) { projCalculations.Jan1 = projInfo.Jan + start }
      else {
        projCalculations.Jan1 += start;
        incomes.forEach((inc) => {
          var key = inc.source.split(" ").join("");
          if (new Date(inc.first) < new Date(thisYear, 0, 31)) {
            projCalculations.Jan1 += cInc[key].N.M;
          }
        });
        loans.forEach((loan) => {
          var key = loan.payee.split(" ").join("");
          if (new Date(loan.first) < new Date(thisYear, 0, 31)) {
            var payDate = new Date(loan.first).getDate();
            loanUpdate[key].monthsDiff = calc.monthDiff(first, new Date(thisYear, 0, payDate));
            var payment = Number(loan.payment);
            var rate = Number(loan.rate);
            var interest, principal;
            for (var i = 0; i <= months; i++) {
              interest = (loanUpdate[key].balance * (rate/100)) / 12;
              principal = payment - interest;
              loanUpdate[key].balance = principal;
            }
            if (loanUpdate[key].balance > 0) {
              projCalculations.Jan1 -= principal;
            }
          }
        });
        projCalculations.Jan1 -= cExp.M;
      }
      if (new Date(thisYear, 1, 28) < today) { projCalculations.Feb1 = projInfo.Feb + projCalculations.Jan1 }
      else {
        projCalculations.Feb1 += projCalculations.Jan1;
        incomes.forEach((inc) => {
          var key = inc.source.split(" ").join("");
          if (new Date(inc.first) < new Date(thisYear, 1, 28)) {
            projCalculations.Feb1 += cInc[key].N.M;
          }
        });
        loans.forEach((loan) => {
          var key = loan.payee.split(" ").join("");
          if (new Date(loan.first) < new Date(thisYear, 1, 28)) {
            updateBalance(key, 'Feb1');
          }
        });
        projCalculations.Feb1 -= cExp.M;
      }
      if (new Date(thisYear, 2, 31) < today) { projCalculations.Mar1 = projInfo.Mar + projCalculations.Feb1 }
      else {
        projCalculations.Mar1 += projCalculations.Feb1;
        incomes.forEach((inc) => {
          var key = inc.source.split(" ").join("");
          if (new Date(inc.first) < new Date(thisYear, 2, 31)) {
            projCalculations.Mar1 += cInc[key].N.M;
          }
        });
        loans.forEach((loan) => {
          var key = loan.payee.split(" ").join("");
          if (new Date(loan.first) < new Date(thisYear, 2, 31)) {
            updateBalance(key, 'Mar1');
          }
        });
        projCalculations.Mar1 -= cExp.M;
      }
      if (new Date(thisYear, 3, 30) < today) { projCalculations.Apr1 = projInfo.Apr + projCalculations.Mar1 }
      else {
        projCalculations.Apr1 += projCalculations.Mar1;
        incomes.forEach((inc) => {
          var key = inc.source.split(" ").join("");
          if (new Date(inc.first) < new Date(thisYear, 3, 30)) {
            projCalculations.Apr1 += cInc[key].N.M;
          }
        });
        loans.forEach((loan) => {
          var key = loan.payee.split(" ").join("");
          if (new Date(loan.first) < new Date(thisYear, 3, 30)) {
            if (new Date(loan.first) < new Date(thisYear, 2, 31)) {
              updateBalance(key, 'Apr1');
            }
          }
        });
        projCalculations.Apr1 -= cExp.M;
      }
      if (new Date(thisYear, 4, 31) < today) { projCalculations.May1 = projInfo.May + projCalculations.Apr1 }
      else {
        projCalculations.May1 += projCalculations.Apr1;
        incomes.forEach((inc) => {
          var key = inc.source.split(" ").join("");
          if (new Date(inc.first) < new Date(thisYear, 4, 31)) {
            projCalculations.May1 += cInc[key].N.M;
          }
        });
        loans.forEach((loan) => {
          var key = loan.payee.split(" ").join("");
          if (new Date(loan.first) < new Date(thisYear, 4, 31)) {
            if (new Date(loan.first) < new Date(thisYear, 2, 31)) {
              updateBalance(key, 'May1');
            }
          }
        });
        projCalculations.May1 -= cExp.M;
      }
      if (new Date(thisYear, 5, 30) < today) { projCalculations.Jun1 = projInfo.Jun + projCalculations.May1 }
      else {
        projCalculations.Jun1 += projCalculations.May1;
        incomes.forEach((inc) => {
          var key = inc.source.split(" ").join("");
          if (new Date(inc.first) < new Date(thisYear, 5, 30)) {
            projCalculations.Jun1 += cInc[key].N.M;
          }
        });
        loans.forEach((loan) => {
          var key = loan.payee.split(" ").join("");
          if (new Date(loan.first) < new Date(thisYear, 5, 30)) {
            if (new Date(loan.first) < new Date(thisYear, 2, 31)) {
              updateBalance(key, 'Jun1');
            }
          }
        });
        projCalculations.Jun1 -= cExp.M;
      }
      if (new Date(thisYear, 6, 31) < today) { projCalculations.Jul1 = projInfo.Jul + projCalculations.Jun1 }
      else {
        projCalculations.Jul1 += projCalculations.Jun1;
        incomes.forEach((inc) => {
          var key = inc.source.split(" ").join("");
          if (new Date(inc.first) < new Date(thisYear, 6, 31)) {
            projCalculations.Jul1 += cInc[key].N.M;
          }
        });
        loans.forEach((loan) => {
          var key = loan.payee.split(" ").join("");
          if (new Date(loan.first) < new Date(thisYear, 6, 31)) {
            if (new Date(loan.first) < new Date(thisYear, 2, 31)) {
              updateBalance(key, 'Jul1');
            }
          }
        });
        projCalculations.Jul1 -= cExp.M;
      }
      if (new Date(thisYear, 7, 31) < today) { projCalculations.Aug1 = projInfo.Aug + projCalculations.Jul1 }
      else {
        projCalculations.Aug1 += projCalculations.Jul1;
        incomes.forEach((inc) => {
          var key = inc.source.split(" ").join("");
          if (new Date(inc.first) < new Date(thisYear, 7, 31)) {
            projCalculations.Aug1 += cInc[key].N.M;
          }
        });
        loans.forEach((loan) => {
          var key = loan.payee.split(" ").join("");
          if (new Date(loan.first) < new Date(thisYear, 7, 31)) {
            if (new Date(loan.first) < new Date(thisYear, 2, 31)) {
              updateBalance(key, 'Aug1');
            }
          }
        });
        projCalculations.Aug1 -= cExp.M;
      }
      if (new Date(thisYear, 8, 30) < today) { projCalculations.Sep1 = projInfo.Sep + projCalculations.Aug1 }
      else {
        projCalculations.Sep1 += projCalculations.Aug1;
        incomes.forEach((inc) => {
          var key = inc.source.split(" ").join("");
          if (new Date(inc.first) < new Date(thisYear, 8, 30)) {
            projCalculations.Sep1 += cInc[key].N.M;
          }
        });
        loans.forEach((loan) => {
          var key = loan.payee.split(" ").join("");
          if (new Date(loan.first) < new Date(thisYear, 8, 30)) {
            if (new Date(loan.first) < new Date(thisYear, 2, 31)) {
              updateBalance(key, 'Sep1');
            }
          }
        });
        projCalculations.Sep1 -= cExp.M;
      }
      if (new Date(thisYear, 9, 31) < today) { projCalculations.Oct1 = projInfo.Oct + projCalculations.Sep1 }
      else {
        projCalculations.Oct1 += projCalculations.Sep1;
        incomes.forEach((inc) => {
          var key = inc.source.split(" ").join("");
          if (new Date(inc.first) < new Date(thisYear, 9, 31)) {
            projCalculations.Oct1 += cInc[key].N.M;
          }
        });
        loans.forEach((loan) => {
          var key = loan.payee.split(" ").join("");
          if (new Date(loan.first) < new Date(thisYear, 9, 31)) {
            if (new Date(loan.first) < new Date(thisYear, 2, 31)) {
              updateBalance(key, 'Oct1');
            }
          }
        });
        projCalculations.Oct1 -= cExp.M;
      }
      if (new Date(thisYear, 10, 30) < today) { projCalculations.Nov1 = projInfo.Nov + projCalculations.Oct1 }
      else {
        projCalculations.Nov1 += projCalculations.Oct1;
        incomes.forEach((inc) => {
          var key = inc.source.split(" ").join("");
          if (new Date(inc.first) < new Date(thisYear, 10, 30)) {
            projCalculations.Nov1 += cInc[key].N.M;
          }
        });
        loans.forEach((loan) => {
          var key = loan.payee.split(" ").join("");
          if (new Date(loan.first) < new Date(thisYear, 10, 30)) {
            if (new Date(loan.first) < new Date(thisYear, 2, 31)) {
              updateBalance(key, 'Nov1');
            }
          }
        });
        projCalculations.Nov1 -= cExp.M;
      }
      if (new Date(thisYear, 11, 31) < today) { projCalculations.Dec1 = projInfo.Dec + projCalculations.Nov1 }
      else {
        projCalculations.Dec1 += projCalculations.Nov1;
        incomes.forEach((inc) => {
          var key = inc.source.split(" ").join("");
          if (new Date(inc.first) < new Date(thisYear, 11, 31)) {
            projCalculations.Dec1 += cInc[key].N.M;
          }
        });
        loans.forEach((loan) => {
          var key = loan.payee.split(" ").join("");
          if (new Date(loan.first) < new Date(thisYear, 11, 31)) {
            if (new Date(loan.first) < new Date(thisYear, 2, 31)) {
              updateBalance(key, 'Dec1');
            }
          }
        });
        projCalculations.Dec1 -= cExp.M;
      }
      projCalculations.Jan2 += projCalculations.Dec1;
      incomes.forEach((inc) => {
        var key = inc.source.split(" ").join("");
        if (new Date(inc.first) < new Date(thisYear+1, 0, 31)) {
          projCalculations.Jan2 += cInc[key].N.M;
        }
      });
      loans.forEach((loan) => {
        var key = loan.payee.split(" ").join("");
        if (new Date(loan.first) < new Date(thisYear+1, 0, 31)) {
          if (new Date(loan.first) < new Date(thisYear, 2, 31)) {
            updateBalance(key, 'Jan2');
          }
        }
      });
      projCalculations.Jan2 -= cExp.M;
      projCalculations.Feb2 += projCalculations.Jan2;
      incomes.forEach((inc) => {
        var key = inc.source.split(" ").join("");
        if (new Date(inc.first) < new Date(thisYear+1, 1, 28)) {
          projCalculations.Feb2 += cInc[key].N.M;
        }
      });
      loans.forEach((loan) => {
        var key = loan.payee.split(" ").join("");
        if (new Date(loan.first) < new Date(thisYear+1, 1, 28)) {
          if (new Date(loan.first) < new Date(thisYear, 2, 31)) {
            updateBalance(key, 'Feb2');
          }
        }
      });
      projCalculations.Feb2 -= cExp.M;
      projCalculations.Mar2 += projCalculations.Feb2;
      incomes.forEach((inc) => {
        var key = inc.source.split(" ").join("");
        if (new Date(inc.first) < new Date(thisYear+1, 2, 31)) {
          projCalculations.Mar2 += cInc[key].N.M;
        }
      });
      loans.forEach((loan) => {
        var key = loan.payee.split(" ").join("");
        if (new Date(loan.first) < new Date(thisYear+1, 2, 31)) {
          if (new Date(loan.first) < new Date(thisYear, 2, 31)) {
            updateBalance(key, 'Mar2');
          }
        }
      });
      projCalculations.Mar2 -= cExp.M;
      projCalculations.Apr2 += projCalculations.Mar2;
      incomes.forEach((inc) => {
        var key = inc.source.split(" ").join("");
        if (new Date(inc.first) < new Date(thisYear+1, 3, 30)) {
          projCalculations.Apr2 += cInc[key].N.M;
        }
      });
      loans.forEach((loan) => {
        var key = loan.payee.split(" ").join("");
        if (new Date(loan.first) < new Date(thisYear+1, 3, 30)) {
          if (new Date(loan.first) < new Date(thisYear, 2, 31)) {
            updateBalance(key, 'Apr2');
          }
        }
      });
      projCalculations.Apr2 -= cExp.M;
      projCalculations.May2 += projCalculations.Apr2;
      incomes.forEach((inc) => {
        var key = inc.source.split(" ").join("");
        if (new Date(inc.first) < new Date(thisYear+1, 4, 31)) {
          projCalculations.May2 += cInc[key].N.M;
        }
      });
      loans.forEach((loan) => {
        var key = loan.payee.split(" ").join("");
        if (new Date(loan.first) < new Date(thisYear+1, 4, 31)) {
          if (new Date(loan.first) < new Date(thisYear, 2, 31)) {
            updateBalance(key, 'May2');
          }
        }
      });
      projCalculations.May2 -= cExp.M;
      projCalculations.Jun2 += projCalculations.May2;
      incomes.forEach((inc) => {
        var key = inc.source.split(" ").join("");
        if (new Date(inc.first) < new Date(thisYear+1, 5, 30)) {
          projCalculations.Jun2 += cInc[key].N.M;
        }
      });
      loans.forEach((loan) => {
        var key = loan.payee.split(" ").join("");
        if (new Date(loan.first) < new Date(thisYear+1, 5, 30)) {
          if (new Date(loan.first) < new Date(thisYear, 2, 31)) {
            updateBalance(key, 'Jun2');
          }
        }
      });
      projCalculations.Jun2 -= cExp.M;
      projCalculations.Jul2 += projCalculations.Jun2;
      incomes.forEach((inc) => {
        var key = inc.source.split(" ").join("");
        if (new Date(inc.first) < new Date(thisYear+1, 6, 31)) {
          projCalculations.Jul2 += cInc[key].N.M;
        }
      });
      loans.forEach((loan) => {
        var key = loan.payee.split(" ").join("");
        if (new Date(loan.first) < new Date(thisYear+1, 6, 31)) {
          if (new Date(loan.first) < new Date(thisYear, 2, 31)) {
            updateBalance(key, 'Jul2');
          }
        }
      });
      projCalculations.Jul2 -= cExp.M;
      projCalculations.Aug2 += projCalculations.Jul2;
      incomes.forEach((inc) => {
        var key = inc.source.split(" ").join("");
        if (new Date(inc.first) < new Date(thisYear+1, 7, 31)) {
          projCalculations.Aug2 += cInc[key].N.M;
        }
      });
      loans.forEach((loan) => {
        var key = loan.payee.split(" ").join("");
        if (new Date(loan.first) < new Date(thisYear+1, 7, 31)) {
          if (new Date(loan.first) < new Date(thisYear, 2, 31)) {
            updateBalance(key, 'Aug2');
          }
        }
      });
      projCalculations.Aug2 -= cExp.M;
      projCalculations.Sep2 += projCalculations.Aug2;
      incomes.forEach((inc) => {
        var key = inc.source.split(" ").join("");
        if (new Date(inc.first) < new Date(thisYear+1, 8, 30)) {
          projCalculations.Sep2 += cInc[key].N.M;
        }
      });
      loans.forEach((loan) => {
        var key = loan.payee.split(" ").join("");
        if (new Date(loan.first) < new Date(thisYear+1, 8, 30)) {
          if (new Date(loan.first) < new Date(thisYear, 2, 31)) {
            updateBalance(key, 'Sep2');
          }
        }
      });
      projCalculations.Sep2 -= cExp.M;
      projCalculations.Oct2 += projCalculations.Sep2;
      incomes.forEach((inc) => {
        var key = inc.source.split(" ").join("");
        if (new Date(inc.first) < new Date(thisYear+1, 9, 31)) {
          projCalculations.Oct2 += cInc[key].N.M;
        }
      });
      loans.forEach((loan) => {
        var key = loan.payee.split(" ").join("");
        if (new Date(loan.first) < new Date(thisYear+1, 9, 31)) {
          if (new Date(loan.first) < new Date(thisYear, 2, 31)) {
            updateBalance(key, 'Oct2');
          }
        }
      });
      projCalculations.Oct2 -= cExp.M;
      projCalculations.Nov2 += projCalculations.Oct2;
      incomes.forEach((inc) => {
        var key = inc.source.split(" ").join("");
        if (new Date(inc.first) < new Date(thisYear+1, 10, 30)) {
          projCalculations.Nov2 += cInc[key].N.M;
        }
      });
      loans.forEach((loan) => {
        var key = loan.payee.split(" ").join("");
        if (new Date(loan.first) < new Date(thisYear+1, 10, 30)) {
          if (new Date(loan.first) < new Date(thisYear, 2, 31)) {
            updateBalance(key, 'Nov2');
          }
        }
      });
      projCalculations.Nov2 -= cExp.M;
      projCalculations.Dec2 += projCalculations.Nov2;
      incomes.forEach((inc) => {
        var key = inc.source.split(" ").join("");
        if (new Date(inc.first) < new Date(thisYear+1, 11, 31)) {
          projCalculations.Dec2 += cInc[key].N.M;
        }
      });
      loans.forEach((loan) => {
        var key = loan.payee.split(" ").join("");
        if (new Date(loan.first) < new Date(thisYear+1, 11, 31)) {
          if (new Date(loan.first) < new Date(thisYear, 2, 31)) {
            updateBalance(key, 'Dec2');
          }
        }
      });
      projCalculations.Dec2 -= cExp.M;
      projCalculations.Jan3 += projCalculations.Dec2;
      incomes.forEach((inc) => {
        var key = inc.source.split(" ").join("");
        if (new Date(inc.first) < new Date(thisYear+2, 0, 31)) {
          projCalculations.Jan3 += cInc[key].N.M;
        }
      });
      loans.forEach((loan) => {
        var key = loan.payee.split(" ").join("");
        if (new Date(loan.first) < new Date(thisYear+2, 0, 31)) {
          if (new Date(loan.first) < new Date(thisYear, 2, 31)) {
            updateBalance(key, 'Jan3');
          }
        }
      });
      projCalculations.Jan3 -= cExp.M;
      projCalculations.Feb3 += projCalculations.Jan3;
      incomes.forEach((inc) => {
        var key = inc.source.split(" ").join("");
        if (new Date(inc.first) < new Date(thisYear+2, 1, 28)) {
          projCalculations.Feb3 += cInc[key].N.M;
        }
      });
      loans.forEach((loan) => {
        var key = loan.payee.split(" ").join("");
        if (new Date(loan.first) < new Date(thisYear+2, 1, 28)) {
          if (new Date(loan.first) < new Date(thisYear, 2, 31)) {
            updateBalance(key, 'Feb3');
          }
        }
      });
      projCalculations.Feb3 -= cExp.M;
      projCalculations.Mar3 += projCalculations.Feb3;
      incomes.forEach((inc) => {
        var key = inc.source.split(" ").join("");
        if (new Date(inc.first) < new Date(thisYear+2, 2, 31)) {
          projCalculations.Mar3 += cInc[key].N.M;
        }
      });
      loans.forEach((loan) => {
        var key = loan.payee.split(" ").join("");
        if (new Date(loan.first) < new Date(thisYear+2, 2, 31)) {
          if (new Date(loan.first) < new Date(thisYear, 2, 31)) {
            updateBalance(key, 'Mar3');
          }
        }
      });
      projCalculations.Mar3 -= cExp.M;
      projCalculations.Apr3 += projCalculations.Mar3;
      incomes.forEach((inc) => {
        var key = inc.source.split(" ").join("");
        if (new Date(inc.first) < new Date(thisYear+2, 3, 30)) {
          projCalculations.Apr3 += cInc[key].N.M;
        }
      });
      loans.forEach((loan) => {
        var key = loan.payee.split(" ").join("");
        if (new Date(loan.first) < new Date(thisYear+2, 3, 30)) {
          if (new Date(loan.first) < new Date(thisYear, 2, 31)) {
            updateBalance(key, 'Apr3');
          }
        }
      });
      projCalculations.Apr3 -= cExp.M;
      projCalculations.May3 += projCalculations.Apr3;
      incomes.forEach((inc) => {
        var key = inc.source.split(" ").join("");
        if (new Date(inc.first) < new Date(thisYear+2, 4, 31)) {
          projCalculations.May3 += cInc[key].N.M;
        }
      });
      loans.forEach((loan) => {
        var key = loan.payee.split(" ").join("");
        if (new Date(loan.first) < new Date(thisYear+2, 4, 31)) {
          if (new Date(loan.first) < new Date(thisYear, 2, 31)) {
            updateBalance(key, 'May3');
          }
        }
      });
      projCalculations.May3 -= cExp.M;
      projCalculations.Jun3 += projCalculations.May3;
      incomes.forEach((inc) => {
        var key = inc.source.split(" ").join("");
        if (new Date(inc.first) < new Date(thisYear+2, 5, 30)) {
          projCalculations.Jun3 += cInc[key].N.M;
        }
      });
      loans.forEach((loan) => {
        var key = loan.payee.split(" ").join("");
        if (new Date(loan.first) < new Date(thisYear+2, 5, 30)) {
          if (new Date(loan.first) < new Date(thisYear, 2, 31)) {
            updateBalance(key, 'Jun3');
          }
        }
      });
      projCalculations.Jun3 -= cExp.M;
      projCalculations.Jul3 += projCalculations.Jun3;
      incomes.forEach((inc) => {
        var key = inc.source.split(" ").join("");
        if (new Date(inc.first) < new Date(thisYear+2, 6, 31)) {
          projCalculations.Jul3 += cInc[key].N.M;
        }
      });
      loans.forEach((loan) => {
        var key = loan.payee.split(" ").join("");
        if (new Date(loan.first) < new Date(thisYear+2, 6, 31)) {
          if (new Date(loan.first) < new Date(thisYear, 2, 31)) {
            updateBalance(key, 'Jul3');
          }
        }
      });
      projCalculations.Jul3 -= cExp.M;
      projCalculations.Aug3 += projCalculations.Jul3;
      incomes.forEach((inc) => {
        var key = inc.source.split(" ").join("");
        if (new Date(inc.first) < new Date(thisYear+2, 7, 31)) {
          projCalculations.Aug3 += cInc[key].N.M;
        }
      });
      loans.forEach((loan) => {
        var key = loan.payee.split(" ").join("");
        if (new Date(loan.first) < new Date(thisYear+2, 7, 31)) {
          if (new Date(loan.first) < new Date(thisYear, 2, 31)) {
            updateBalance(key, 'Aug3');
          }
        }
      });
      projCalculations.Aug3 -= cExp.M;
      projCalculations.Sep3 += projCalculations.Aug3;
      incomes.forEach((inc) => {
        var key = inc.source.split(" ").join("");
        if (new Date(inc.first) < new Date(thisYear+2, 8, 30)) {
          projCalculations.Sep3 += cInc[key].N.M;
        }
      });
      loans.forEach((loan) => {
        var key = loan.payee.split(" ").join("");
        if (new Date(loan.first) < new Date(thisYear+2, 8, 30)) {
          if (new Date(loan.first) < new Date(thisYear, 2, 31)) {
            updateBalance(key, 'Sep3');
          }
        }
      });
      projCalculations.Sep3 -= cExp.M;
      projCalculations.Oct3 += projCalculations.Sep3;
      incomes.forEach((inc) => {
        var key = inc.source.split(" ").join("");
        if (new Date(inc.first) < new Date(thisYear+2, 9, 31)) {
          projCalculations.Oct3 += cInc[key].N.M;
        }
      });
      loans.forEach((loan) => {
        var key = loan.payee.split(" ").join("");
        if (new Date(loan.first) < new Date(thisYear+2, 9, 31)) {
          if (new Date(loan.first) < new Date(thisYear, 2, 31)) {
            updateBalance(key, 'Oct3');
          }
        }
      });
      projCalculations.Oct3 -= cExp.M;
      projCalculations.Nov3 += projCalculations.Oct3;
      incomes.forEach((inc) => {
        var key = inc.source.split(" ").join("");
        if (new Date(inc.first) < new Date(thisYear+2, 10, 30)) {
          projCalculations.Nov3 += cInc[key].N.M;
        }
      });
      loans.forEach((loan) => {
        var key = loan.payee.split(" ").join("");
        if (new Date(loan.first) < new Date(thisYear+2, 10, 30)) {
          if (new Date(loan.first) < new Date(thisYear, 2, 31)) {
            updateBalance(key, 'Nov3');
          }
        }
      });
      projCalculations.Nov3 -= cExp.M;
      projCalculations.Dec3 += projCalculations.Nov3;
      incomes.forEach((inc) => {
        var key = inc.source.split(" ").join("");
        if (new Date(inc.first) < new Date(thisYear+2, 11, 31)) {
          projCalculations.Dec3 += cInc[key].N.M;
        }
      });
      loans.forEach((loan) => {
        var key = loan.payee.split(" ").join("");
        if (new Date(loan.first) < new Date(thisYear+2, 11, 31)) {
          if (new Date(loan.first) < new Date(thisYear, 2, 31)) {
            updateBalance(key, 'Dec3');
          }
        }
      });
      projCalculations.Dec3 -= cExp.M;
      return projCalculations;
    }

});
