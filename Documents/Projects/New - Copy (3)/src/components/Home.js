import React, { useContext, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { GlobalStateContext } from '../context/GlobalStateContext';
import 'tailwindcss/tailwind.css';

const expenseCategories = ['Rent', 'Utilities', 'Groceries', 'Clothing', 'Transportation', 'Healthcare', 'Personal Care', 'Household Items', 'Friends', 'Entertainment', 'Mobile phones', 'Others', 'Online Subscriptions', 'Savings', 'Debt Repayment'];
const currencies = ['USD', 'KES', 'RUB', 'EUR'];

const Home = () => {
  const { transactions, expectedIncome, addTransaction, updateExpectedIncome, exchangeRates, error: globalError, loading, debt, setDebtAmount, convertAmount } = useContext(GlobalStateContext);
  const [transactionType, setTransactionType] = useState('expense');
  const [selectedCategory, setSelectedCategory] = useState('Transportation');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('KES');
  const [notification, setNotification] = useState('');
  const [error, setError] = useState(null);
  const [selectedDisplayCurrency, setSelectedDisplayCurrency] = useState('USD');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 7));
  const [dateRange, setDateRange] = useState('month');
  const [showPopup, setShowPopup] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState('Roman'); // New state for selected person

  useEffect(() => {
    if (globalError) {
      setError(globalError);
    }
  }, [globalError]);

  const convertToSelectedCurrency = (amount, currency) => {
    if (!exchangeRates[currency] || !exchangeRates[selectedDisplayCurrency]) {
      console.error(`Missing exchange rate for ${currency} or ${selectedDisplayCurrency}`);
      return 0;
    }
    const rate = exchangeRates[selectedDisplayCurrency] / exchangeRates[currency];
    return amount * rate;
  };

  const convertTransactions = (transactions, toCurrency) => {
    return transactions.map(transaction => {
      const convertedAmount = convertToSelectedCurrency(transaction.amount, transaction.currency);
      return { ...transaction, amount: convertedAmount, currency: toCurrency };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const amountInSelectedCurrency = parseFloat(amount);

      if (transactionType === 'expense' && !selectedCategory) {
        setError("Please select a category for the expense.");
        return;
      }

      if (transactionType === 'expectedIncome') {
        await updateExpectedIncome(amountInSelectedCurrency, currency);
        setNotification('Expected Income updated successfully!');
      } else if (transactionType === 'setDebt') {
        await setDebtAmount(amountInSelectedCurrency, currency);
        setNotification('Debt set successfully!');
      } else if ((transactionType === 'expense' && selectedCategory) || transactionType === 'income') {
        const newTransaction = {
          type: transactionType,
          category: transactionType === 'income' ? 'Income' : selectedCategory,
          amount: amountInSelectedCurrency,
          description: description,
          currency: currency,
          date: new Date().toISOString().slice(0, 10),
          person: selectedPerson // Add selected person to the transaction
        };
        await addTransaction(newTransaction);
        setNotification('Transaction added successfully!');

        if (transactionType === 'expense' && selectedCategory === 'Debt Repayment') {
          const convertedAmount = convertAmount(amountInSelectedCurrency, currency, debt.currency);
          await setDebtAmount(debt.amount - convertedAmount, debt.currency);
        }
      }

      setSelectedCategory('Transportation');
      setAmount('');
      setDescription('');
      setCurrency('KES');
      setTransactionType('expense');
      setSelectedPerson('Roman'); // Reset selected person

      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);

      setTimeout(() => setNotification(''), 3000);
      setError(null);
    } catch (error) {
      console.error("Error submitting form: ", error);
      setError("Failed to submit data. Please try again later.");
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (dateRange === 'month') {
      return t.date.startsWith(selectedDate);
    } else {
      return t.date.startsWith(selectedDate.slice(0, 4));
    }
  });

  const convertedTransactions = convertTransactions(filteredTransactions, selectedDisplayCurrency);

  const data = [
    { name: 'Expected Income', value: convertToSelectedCurrency(expectedIncome.amount, expectedIncome.currency) },
    { name: 'Actual Income', value: convertedTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0) },
    { name: 'Expenses', value: convertedTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0) },
    { name: 'Debt', value: convertToSelectedCurrency(debt.amount, debt.currency) }
  ];

  if (loading) {
    return <div className="loading text-center text-xl font-semibold">Loading data...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-5 font-sans text-black">
      <h2 className="text-center text-black mb-8 text-3xl font-bold">Income and Expense Tracker</h2>

      <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <p className="text-2xl font-semibold mb-4 text-black">Exchange Rates (1 USD)</p>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(exchangeRates).map(([currency, rate]) => (
            <p key={currency} className="text-lg text-black">{currency}: {rate.toFixed(2)}</p>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <div className="mb-6">
          <label htmlFor="displayCurrency" className="block text-lg font-medium mb-2 text-black">Display Currency:</label>
          <select 
            id="displayCurrency" 
            value={selectedDisplayCurrency} 
            onChange={(e) => setSelectedDisplayCurrency(e.target.value)} 
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black text-lg text-black"
          >
            {currencies.map(curr => (
              <option key={curr} value={curr}>{curr}</option>
            ))}
          </select>
        </div>
        <div className="mb-6">
          <label className="block text-lg font-medium mb-2 text-black">Date Range:</label>
          <div className="mt-1 flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="dateRange"
                value="month"
                checked={dateRange === 'month'}
                onChange={() => setDateRange('month')}
                className="form-radio text-black"
              />
              <span className="ml-2 text-lg text-black">Month</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="dateRange"
                value="year"
                checked={dateRange === 'year'}
                onChange={() => setDateRange('year')}
                className="form-radio text-black"
              />
              <span className="ml-2 text-lg text-black">Year</span>
            </label>
          </div>
        </div>
        <div className="mb-6">
          <label htmlFor="displayDate" className="block text-lg font-medium mb-2 text-black">
            {dateRange === 'month' ? 'Display Month:' : 'Display Year:'}
          </label>
          <input
            type={dateRange === 'month' ? 'month' : 'number'}
            id="displayDate"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={dateRange === 'year' ? '1900' : undefined}
            max={dateRange === 'year' ? new Date().getFullYear() : undefined}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black text-lg text-black"
          />
        </div>
      </div>

      <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `${value.toFixed(2)} ${selectedDisplayCurrency}`} />
              <Legend />
              <Bar dataKey="value" radius={[10, 10, 0, 0]} fillOpacity={0.8}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.name === 'Expected Income'
                        ? 'rgba(255, 215, 0, 0.8)'
                        : entry.name === 'Actual Income'
                        ? 'rgba(0, 255, 0, 0.8)'
                        : entry.name === 'Expenses'
                        ? 'rgba(255, 140, 0, 0.8)'
                        : 'rgba(255, 0, 0, 0.8)' // Color for Debt
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg shadow-md">
        <div>
          <label htmlFor="transactionType" className="block text-lg font-medium mb-2 text-black">Transaction Type</label>
          <select 
            id="transactionType" 
            name="transactionType" 
            value={transactionType} 
            onChange={(e) => setTransactionType(e.target.value)} 
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black text-lg text-black"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="expectedIncome">Expected Income</option>
            <option value="setDebt">Set Debt</option>
          </select>
        </div>
        {transactionType === 'expense' && (
          <div>
            <label className="block text-lg font-medium mb-2 text-black">Person</label>
            <div className="mt-1 flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="person"
                  value="Roman"
                  checked={selectedPerson === 'Roman'}
                  onChange={() => setSelectedPerson('Roman')}
                  className="form-radio text-black"
                />
                <span className="ml-2 text-lg text-black">Roman</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="person"
                  value="Violet"
                  checked={selectedPerson === 'Violet'}
                  onChange={() => setSelectedPerson('Violet')}
                  className="form-radio text-black"
                />
                <span className="ml-2 text-lg text-black">Violet</span>
              </label>
            </div>
          </div>
        )}
        {transactionType !== 'expectedIncome' && transactionType !== 'setDebt' && selectedCategory !== 'Debt Repayment' && (
          <div>
            <label htmlFor="description" className="block text-lg font-medium mb-2 text-black">Description</label>
            <input 
              type="text" 
              id="description" 
              name="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black text-lg text-black" 
            />
          </div>
        )}
        <div>
          <label htmlFor="amount" className="block text-lg font-medium mb-2 text-black">Amount</label>
          <input 
            type="number" 
            id="amount" 
            name="amount" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            required 
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black text-lg text-black" 
          />
        </div>
        <div>
          <label htmlFor="currency" className="block text-lg font-medium mb-2 text-black">Currency</label>
          <select 
            id="currency" 
            name="currency" 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value)} 
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black text-lg text-black"
          >
            {currencies.map(curr => (
              <option key={curr} value={curr}>{curr}</option>
            ))}
          </select>
        </div>
        {transactionType === 'expense' && (
          <div>
            <label htmlFor="category" className="block text-lg font-medium mb-2 text-black">Category</label>
            <select 
              id="category" 
              name="category" 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)} 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black text-lg text-black"
            >
              <option value="">Select Category</option>
              {expenseCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        )}
        {error && <p className="text-red-500 text-center">{error}</p>}
        <button type="submit" className="w-full bg-black text-white py-2 px-4 rounded-md shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black text-lg">
          Add Transaction
        </button>
      </form>

      {notification && <p className="text-green-500 mt-4 text-center">{notification}</p>}

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md shadow-md">
            <p className="text-lg font-semibold text-black">Submission Successful!</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;