import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Save } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface EditTransactionModalProps {
  transaction: any;
  categories: any[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: any) => Promise<{ error?: any }>;
  onSaveAsTemplate?: (data: any) => Promise<{ error?: any }>;
}

const EditTransactionModal = ({ 
  transaction, 
  categories, 
  isOpen, 
  onClose, 
  onUpdate,
  onSaveAsTemplate 
}: EditTransactionModalProps) => {
  const [formData, setFormData] = useState({
    type: '',
    amount: '',
    description: '',
    category_id: '',
    date: '',
    due_date: '',
    is_paid: true,
    is_recurring: false,
    recurring_day: '',
    competence_month: 1,
    competence_year: 2024
  });
  
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type || 'expense',
        amount: transaction.amount?.toString() || '',
        description: transaction.description || '',
        category_id: transaction.category_id || '',
        date: transaction.date || '',
        due_date: transaction.due_date || '',
        is_paid: transaction.is_paid ?? true,
        is_recurring: transaction.is_recurring ?? false,
        recurring_day: transaction.recurring_day?.toString() || '',
        competence_month: transaction.competence_month || new Date().getMonth() + 1,
        competence_year: transaction.competence_year || new Date().getFullYear()
      });
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date,
        category_id: formData.category_id || null,
        due_date: formData.due_date || null,
        is_paid: formData.is_paid,
        is_recurring: formData.is_recurring,
        recurring_day: formData.is_recurring ? parseInt(formData.recurring_day) : null,
        competence_month: formData.competence_month,
        competence_year: formData.competence_year
      };

      const { error } = await onUpdate(transaction.id, updateData);
      if (error) throw error;

      // Salvar como template se solicitado
      if (saveAsTemplate && onSaveAsTemplate) {
        const templateData = {
          type: formData.type,
          description: formData.description,
          amount: parseFloat(formData.amount),
          category_id: formData.category_id || null
        };
        await onSaveAsTemplate(templateData);
      }

      toast({
        title: "Transação atualizada!",
        description: "As alterações foram salvas com sucesso.",
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar transação.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Editar Transação</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type" className="text-gray-300">Tipo</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="income" className="text-white">Receita</SelectItem>
                  <SelectItem value="expense" className="text-white">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="amount" className="text-gray-300">Valor</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-gray-300">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Descrição da transação"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="text-gray-300">Data</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            
            {formData.type === 'expense' && (
              <div>
                <Label htmlFor="category" className="text-gray-300">Categoria</Label>
                <Select value={formData.category_id} onValueChange={(value) => setFormData({...formData, category_id: value})}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="text-white">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="competence-month" className="text-gray-300">Mês de Competência</Label>
              <Select value={formData.competence_month.toString()} onValueChange={(value) => setFormData({...formData, competence_month: parseInt(value)})}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {months.map((month, index) => (
                    <SelectItem key={index + 1} value={(index + 1).toString()} className="text-white">
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="competence-year" className="text-gray-300">Ano de Competência</Label>
              <Input
                id="competence-year"
                type="number"
                value={formData.competence_year}
                onChange={(e) => setFormData({...formData, competence_year: parseInt(e.target.value)})}
                className="bg-gray-800 border-gray-700 text-white"
                min="2020"
                max="2030"
              />
            </div>
          </div>

          {formData.type === 'expense' && (
            <>
              <div>
                <Label htmlFor="due-date" className="text-gray-300">Data de Vencimento</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div className="space-y-4">

                {formData.is_recurring && (
                  <div>
                    <Label htmlFor="recurring-day" className="text-gray-300">Dia do Vencimento</Label>
                    <Input
                      id="recurring-day"
                      type="number"
                      min="1"
                      max="31"
                      value={formData.recurring_day}
                      onChange={(e) => setFormData({...formData, recurring_day: e.target.value})}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Dia do mês (1-31)"
                    />
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex items-center space-x-3">
            <Checkbox
              id="is-paid"
              checked={formData.is_paid}
              onCheckedChange={(checked) => setFormData({...formData, is_paid: !!checked})}
              className="border-green-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
            />
            <Label htmlFor="is-paid" className="text-green-300">
              Transação Paga
            </Label>
          </div>

          {onSaveAsTemplate && (
            <div className="flex items-center space-x-3 p-4 bg-blue-800/20 border border-blue-600/30 rounded-lg">
              <Checkbox
                id="save-template"
                checked={saveAsTemplate}
                onCheckedChange={(checked) => setSaveAsTemplate(!!checked)}
                className="border-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <div>
                <Label htmlFor="save-template" className="text-blue-300">
                  Salvar como Predefinição
                </Label>
                <p className="text-sm text-blue-200/70">
                  Criar uma predefinição com estes dados
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="flex-1 bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTransactionModal;