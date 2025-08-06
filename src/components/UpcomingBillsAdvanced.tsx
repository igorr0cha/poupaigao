
import React, { useState } from 'react';
import { useFinancialData } from '@/hooks/useFinancialData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, CheckCircle, Calendar, Edit2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import EditTransactionModal from '@/components/EditTransactionModal';
import { supabase } from '@/integrations/supabase/client';

const UpcomingBillsAdvanced = () => {
  const { transactions, categories, markTransactionAsPaid, loading, refetch } = useFinancialData();
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [paying, setPaying] = useState(false);
  const [editTransaction, setEditTransaction] = useState<any>(null);

  // Get unpaid expenses for current month
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const upcomingExpenses = transactions.filter(t => 
    t.type === 'expense' && 
    !t.is_paid &&
    (t.competence_month === currentMonth && t.competence_year === currentYear ||
     (t.due_date && new Date(t.due_date) >= new Date()))
  ).slice(0, 5);

  const handleMarkAsPaid = async () => {
    if (!selectedTransaction) return;

    setPaying(true);
    try {
      const { error } = await markTransactionAsPaid(selectedTransaction.id);
      
      if (error) throw error;

      toast({
        title: "Despesa paga!",
        description: "A despesa foi marcada como paga.",
      });

      setSelectedTransaction(null);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao marcar despesa como paga.",
        variant: "destructive",
      });
    } finally {
      setPaying(false);
    }
  };

  const handleUpdateTransaction = async (id: string, data: any) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
      
      await refetch();
      toast({
        title: "Despesa atualizada!",
        description: "A despesa foi atualizada com sucesso.",
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar despesa.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return 'Sem categoria';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Categoria não encontrada';
  };

  const getCategoryColor = (categoryId?: string) => {
    if (!categoryId) return '#6B7280';
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#6B7280';
  };

  if (loading) {
    return (
      <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-orange-400" />
            A Vencer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-orange-400" />
            A Vencer
          </div>
          {upcomingExpenses.length > 0 && (
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
              {upcomingExpenses.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingExpenses.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
            <p className="text-gray-400">Nenhuma despesa pendente!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border-l-4 border-orange-400">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: getCategoryColor(expense.category_id) }}
                    ></div>
                    <h4 className="font-semibold text-white text-lg">
                      {getCategoryName(expense.category_id)}
                    </h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditTransaction(expense)}
                      className="h-6 w-6 p-0 hover:bg-gray-700/50 ml-2"
                    >
                      <Edit2 className="h-3 w-3 text-gray-400 hover:text-white" />
                    </Button>
                  </div>
                  <p className="text-gray-300 font-medium text-base mb-1">{expense.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span className="font-semibold text-orange-400">
                      R$ {Number(expense.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span>
                      Competência: {expense.competence_month}/{expense.competence_year}
                    </span>
                    {expense.due_date && (
                      <span>
                        Vence: {new Date(expense.due_date).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      onClick={() => setSelectedTransaction(expense)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar como Paga
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Marcar Despesa como Paga</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-800 rounded-lg">
                        <p className="text-white font-semibold">{selectedTransaction?.description}</p>
                        <p className="text-orange-400 font-bold text-lg">
                          R$ {Number(selectedTransaction?.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>

                      <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                        <div className="flex items-center text-blue-300">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          <span className="text-sm">
                            A despesa será marcada como paga
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={handleMarkAsPaid}
                        disabled={paying}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {paying ? 'Processando...' : 'Confirmar Pagamento'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
        )}
        
        {editTransaction && (
          <EditTransactionModal
            transaction={editTransaction}
            categories={categories}
            isOpen={true}
            onClose={() => setEditTransaction(null)}
            onUpdate={handleUpdateTransaction}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingBillsAdvanced;
