
import React, { useState } from 'react';
import { useSimplifiedFinancialData } from '@/hooks/useSimplifiedFinancialData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, ArrowUpRight, ArrowDownRight, Calendar, CheckCircle2, BookOpen, Save } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const SimplifiedTransactions = () => {
  const { categories, addTransaction, loading, templates, addTemplate } = useSimplifiedFinancialData();

  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    category_id: '',
    competence_month: new Date().getMonth() + 1,
    competence_year: new Date().getFullYear(),
    due_date: '',
    is_recurring: false,
    recurring_day: new Date().getDate(),
    is_paid: false
  });
  const [saving, setSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const transactionData: any = {
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        competence_month: formData.competence_month,
        competence_year: formData.competence_year,
        date: new Date().toISOString().split('T')[0],
        is_paid: formData.type === 'income' ? true : formData.is_paid
      };

      if (formData.type === 'expense') {
        transactionData.category_id = formData.category_id;
        
        if (formData.due_date) {
          transactionData.due_date = formData.due_date;
        }
        
        if (formData.is_recurring && formData.recurring_day) {
          // Criar template para futuras transações
          const templateData = {
            type: formData.type,
            description: formData.description,
            amount: parseFloat(formData.amount),
            category_id: formData.category_id || null
          };
          
          await addTemplate(templateData);
        }
      }

      const { error } = await addTransaction(transactionData);

      if (error) throw error;

      // Salvar como template se solicitado
      if (saveAsTemplate) {
        const templateData = {
          type: formData.type,
          description: formData.description,
          amount: parseFloat(formData.amount),
          category_id: formData.category_id || null
        };
        
        await addTemplate(templateData);
      }

      toast({
        title: "Transação adicionada!",
        description: `${formData.type === 'income' ? 'Receita' : 'Despesa'} registrada com sucesso.`,
      });

      // Reset form but keep some values
      setFormData({
        type: formData.type,
        amount: '',
        description: '',
        category_id: '',
        competence_month: formData.competence_month,
        competence_year: formData.competence_year,
        due_date: '',
        is_recurring: false,
        recurring_day: new Date().getDate(),
        is_paid: false
      });
      setSaveAsTemplate(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar transação.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTemplateSelect = (template: any) => {
    setFormData({
      ...formData,
      type: template.type,
      description: template.description,
      amount: template.amount.toString(),
      category_id: template.category_id || '',
    });
    setShowTemplates(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
      </div>
    );
  }

  const backgroundSvg = `data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E`;

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-900">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("${backgroundSvg}")` }}></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Plus className="mr-3 h-8 w-8 text-green-400" />
              Nova Transação
            </h1>
            <p className="text-gray-400 mt-2">Registre suas receitas e despesas</p>
          </div>

          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
            <CardHeader>
              <CardTitle className="text-white">Detalhes da Transação</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Seção de Templates */}
              {templates.length > 0 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-lg border-2 border-blue-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-medium flex items-center">
                      <BookOpen className="mr-2 h-4 w-4 text-blue-400" />
                      Predefinições Disponíveis
                    </h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTemplates(!showTemplates)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {showTemplates ? 'Ocultar' : 'Mostrar'}
                    </Button>
                  </div>
                  
                  {showTemplates && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {templates.map((template: any) => (
                        <Button
                          key={template.id}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleTemplateSelect(template)}
                          className="justify-start text-left border-blue-500/30 text-blue-200 hover:bg-blue-500/20"
                        >
                          <div className="flex items-center">
                            {template.type === 'income' ? (
                              <ArrowUpRight className="mr-2 h-3 w-3 text-green-400" />
                            ) : (
                              <ArrowDownRight className="mr-2 h-3 w-3 text-red-400" />
                            )}
                            <div>
                              <div className="font-medium">{template.description}</div>
                              <div className="text-xs opacity-75">
                                R$ {Number(template.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={formData.type === 'income' ? 'default' : 'outline'}
                    onClick={() => setFormData({...formData, type: 'income'})}
                    className={`flex-1 ${
                      formData.type === 'income' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'border-green-600 text-green-400 hover:bg-green-600 hover:text-white'
                    }`}
                  >
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    Receita
                  </Button>
                  <Button
                    type="button"
                    variant={formData.type === 'expense' ? 'default' : 'outline'}
                    onClick={() => setFormData({...formData, type: 'expense'})}
                    className={`flex-1 ${
                      formData.type === 'expense' 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'border-red-600 text-red-400 hover:bg-red-600 hover:text-white'
                    }`}
                  >
                    <ArrowDownRight className="mr-2 h-4 w-4" />
                    Despesa
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-gray-300">Valor *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="competence-month" className="text-gray-300">
                      <Calendar className="inline mr-2 h-4 w-4" />
                      Mês de Competência *
                    </Label>
                    <Select
                      value={formData.competence_month.toString()}
                      onValueChange={(value) => setFormData({...formData, competence_month: parseInt(value)})}
                    >
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

                  <div className="space-y-2">
                    <Label htmlFor="competence-year" className="text-gray-300">Ano de Competência *</Label>
                    <Input
                      id="competence-year"
                      type="number"
                      value={formData.competence_year}
                      onChange={(e) => setFormData({...formData, competence_year: parseInt(e.target.value)})}
                      className="bg-gray-800 border-gray-700 text-white"
                      min="2020"
                      max="2030"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-300">Descrição *</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva a transação..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>

                {formData.type === 'expense' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-gray-300">Categoria *</Label>
                      <Select
                        value={formData.category_id}
                        onValueChange={(value) => setFormData({...formData, category_id: value})}
                        required
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id} className="text-white">
                              <div className="flex items-center">
                                <div 
                                  className="w-3 h-3 rounded-full mr-2" 
                                  style={{ backgroundColor: category.color }}
                                ></div>
                                {category.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="due-date" className="text-gray-300">Data de Vencimento (opcional)</Label>
                      <Input
                        id="due-date"
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-lg border-2 border-blue-500/30 shadow-lg">
                      <Checkbox
                        id="recurring"
                        checked={formData.is_recurring}
                        onCheckedChange={(checked) => setFormData({...formData, is_recurring: !!checked})}
                        className="border-blue-400 text-blue-400 focus:ring-blue-400 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                      />
                      <Label htmlFor="recurring" className="text-blue-200 font-semibold cursor-pointer text-base">
                        📝 Criar Predefinição
                      </Label>
                    </div>

                    {formData.is_recurring && (
                      <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                        <p className="text-blue-200 text-sm">
                          ✨ Esta transação será salva como predefinição para facilitar futuras entradas similares.
                        </p>
                      </div>
                    )}

                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border-2 border-green-500/30 shadow-lg">
                      <Checkbox
                        id="is_paid"
                        checked={formData.is_paid}
                        onCheckedChange={(checked) => setFormData({...formData, is_paid: !!checked})}
                        className="border-green-400 text-green-400 focus:ring-green-400 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                      />
                      <Label htmlFor="is_paid" className="text-green-200 font-semibold cursor-pointer text-base">
                        <CheckCircle2 className="inline mr-2 h-5 w-5" />
                        Marcar como Pago
                      </Label>
                    </div>
                  </>
                )}

                {/* Opção para salvar como template (para receitas também) */}
                {!formData.is_recurring && (
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border-2 border-purple-500/30 shadow-lg">
                    <Checkbox
                      id="save_template"
                      checked={saveAsTemplate}
                      onCheckedChange={(checked) => setSaveAsTemplate(!!checked)}
                      className="border-purple-400 text-purple-400 focus:ring-purple-400 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                    />
                    <Label htmlFor="save_template" className="text-purple-200 font-semibold cursor-pointer text-base">
                      <Save className="inline mr-2 h-4 w-4" />
                      Salvar como Predefinição
                    </Label>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  {saving ? 'Salvando...' : `Adicionar ${formData.type === 'income' ? 'Receita' : 'Despesa'}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedTransactions;
