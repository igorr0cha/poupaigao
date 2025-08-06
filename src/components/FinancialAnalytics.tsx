import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinancialData } from '@/hooks/useFinancialData';
import { TrendingUp, TrendingDown, Target, Calendar, DollarSign, AlertCircle } from 'lucide-react';

const FinancialAnalytics = () => {
  const { 
    getMonthlyIncome, 
    getMonthlyExpenses, 
    getMonthlyBalance,
    getMonthlyData,
    transactions,
    getTotalGoals
  } = useFinancialData();

  const currentMonthIncome = getMonthlyIncome();
  const currentMonthExpenses = getMonthlyExpenses();
  const currentMonthBalance = getMonthlyBalance();
  const monthlyData = getMonthlyData(3); // Últimos 3 meses
  
  // Análise de tendência
  const previousMonthBalance = monthlyData.length > 1 ? monthlyData[1].balance : 0;
  const balanceTrend = currentMonthBalance - previousMonthBalance;
  
  // Análise de gastos por categoria
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense' && !t.is_paid)
    .reduce((acc, t) => acc + Number(t.amount), 0);
    
  // Meta de economia (30% da receita)
  const savingsGoal = currentMonthIncome * 0.3;
  const actualSavings = currentMonthBalance;
  const savingsPercentage = currentMonthIncome > 0 ? (actualSavings / savingsGoal) * 100 : 0;
  
  // Projeção próximo mês baseada na média
  const avgIncome = monthlyData.reduce((acc, month) => acc + month.income, 0) / monthlyData.length;
  const avgExpenses = monthlyData.reduce((acc, month) => acc + month.expenses, 0) / monthlyData.length;
  const projectedBalance = avgIncome - avgExpenses;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Análises Financeiras</h2>
        <p className="text-gray-400">Insights e tendências das suas finanças</p>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Tendência do Saldo</CardTitle>
            {balanceTrend >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-400" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balanceTrend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {balanceTrend >= 0 ? '+' : ''}R$ {Math.abs(balanceTrend).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              vs. mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Meta de Economia</CardTitle>
            <Target className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {Math.min(savingsPercentage, 100).toFixed(0)}%
            </div>
            <p className="text-xs text-gray-400 mt-1">
              de R$ {savingsGoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Projeção Próximo Mês</CardTitle>
            <Calendar className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${projectedBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              R$ {projectedBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              baseado na média
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Despesas Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">
              R$ {expensesByCategory.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              não pagas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
          <CardHeader>
            <CardTitle className="text-white">Insights Financeiros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentMonthBalance > 0 && savingsPercentage < 30 && (
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <div className="flex items-start">
                  <Target className="h-4 w-4 text-blue-400 mt-0.5 mr-2" />
                  <div>
                    <p className="text-blue-300 font-medium text-sm">Oportunidade de Economia</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Você pode aumentar sua economia em R$ {(savingsGoal - actualSavings).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para atingir a meta de 30%.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {balanceTrend > 0 && (
              <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                <div className="flex items-start">
                  <TrendingUp className="h-4 w-4 text-green-400 mt-0.5 mr-2" />
                  <div>
                    <p className="text-green-300 font-medium text-sm">Tendência Positiva</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Seu saldo melhorou R$ {balanceTrend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em relação ao mês anterior.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {expensesByCategory > currentMonthIncome * 0.1 && (
              <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/30">
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-orange-400 mt-0.5 mr-2" />
                  <div>
                    <p className="text-orange-300 font-medium text-sm">Atenção às Despesas Pendentes</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Você tem R$ {expensesByCategory.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em despesas não pagas.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
          <CardHeader>
            <CardTitle className="text-white">Histórico de Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.slice(0, 3).map((month, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                  <div>
                    <p className="text-white text-sm font-medium">
                      {index === 0 ? 'Este mês' : `${index + 1} ${index === 1 ? 'mês' : 'meses'} atrás`}
                    </p>
                    <p className="text-gray-400 text-xs">
                      Receitas: R$ {month.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${month.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      R$ {month.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-gray-400 text-xs">
                      Saldo
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialAnalytics;