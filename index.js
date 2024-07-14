// Add your salary sources as keys in this object
let salarySources = {
  upwork: 0,
  // company: 0,
};

// Add path to your CSV
const pathToHDFCBANKStatement = 'HDFCBANK_Account_Statement_FY24 - Sheet 1.csv';

const fs = require('fs/promises');
const { csv2json } = require('json-2-csv');

async function main() {
  const accountStatement = await fs.readFile(pathToHDFCBANKStatement);
  const statementJson = csv2json(
    accountStatement.toString().split('\r').join('')
  );

  const accountCredits = statementJson
    .filter((t) => t['Deposit Amt.'] && t['Deposit Amt.'] !== '')
    .map((t) => {
      return {
        ...t,
        Narration: t.Narration?.toLowerCase() || '',
      };
    });

  console.log(accountCredits);

  let salary = 0;
  let dividend = 0;
  let savingsCreditInterest = 0;

  accountCredits.forEach((t) => {
    const narration = t.Narration;
    const deposit = t['Deposit Amt.'];

    // Salary
    Object.keys(salarySources).forEach((source) => {
      if (narration.includes(source)) {
        salary += deposit;
        salarySources[source] += deposit;
      }
    });

    // Dividend
    if (narration.includes('div')) {
      dividend += deposit;
    }

    // Credit interest capitalized
    if (narration.includes('credit interest capitalised')) {
      savingsCreditInterest += deposit;
    }
  });

  const toReturn = {
    salary,
    salarySources,
    dividend,
    savingsCreditInterest,
  };

  console.log(toReturn);

  return toReturn;
}

main();
