
import React, { useState } from 'react';
import { useSimplifiedFinancialData } from '@/hooks/useSimplifiedFinancialData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, ArrowUpRight, ArrowDownRight, Calendar, CheckCircle2, BookOpen, Save, Zap } from 'lucide-react';
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
    const currentDate = new Date();
    setFormData({
      ...formData,
      type: template.type,
      description: template.description,
      amount: template.amount.toString(),
      category_id: template.category_id || '',
      competence_month: currentDate.getMonth() + 1,
      competence_year: currentDate.getFullYear(),
    });
    setShowTemplates(false);
    
    toast({
      title: "Predefinição aplicada",
      description: "Os campos foram preenchidos automaticamente. Ajuste o valor se necessário.",
    });
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
      
      <div className="relative z-10 container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white flex items-center">
              <Plus className="mr-2 sm:mr-3 h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-green-400" />
              Nova Transação
            </h1>
            <p className="text-gray-400 mt-2 text-sm sm:text-base">Registre suas receitas e despesas</p>
          </div>

          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-white text-lg sm:text-xl">Detalhes da Transação</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              {/* Seção de Predefinições Rápidas */}
              {templates.length > 0 && (
                <Card className="backdrop-blur-sm bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-800/30 shadow-xl mb-4 sm:mb-6">
                  <CardHeader className="pb-3 p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-blue-200 flex items-center text-sm sm:text-base">
                        <Zap className="mr-2 h-4 w-4 text-blue-400" />
                        Predefinições Rápidas
                      </CardTitle>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowTemplates(!showTemplates)}
                        className="text-blue-300 hover:text-blue-100 hover:bg-blue-800/30 text-xs sm:text-sm p-1.5 sm:p-2"
                      >
                        {showTemplates ? 'Ocultar' : 'Ver Todas'}
                        <BookOpen className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 pt-0">
                    {!showTemplates ? (
                      // Exibir apenas os primeiros 3 templates como botões rápidos
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                        {templates.slice(0, 3).map((template: any) => (
                          <Button
                            key={template.id}
                            type="button"
                            variant="outline"
                            onClick={() => handleTemplateSelect(template)}
                            className="justify-start text-left border-blue-500/40 text-blue-200 hover:bg-blue-500/20 hover:border-blue-400/60 p-3 h-auto transition-all duration-200 shadow-lg hover:shadow-xl"
                          >
                            <div className="flex items-center w-full">
                              {template.type === 'income' ? (
                                <ArrowUpRight className="mr-2 h-3 w-3 text-green-400 flex-shrink-0" />
                              ) : (
                                <ArrowDownRight className="mr-2 h-3 w-3 text-red-400 flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-xs sm:text-sm truncate">{template.description}</div>
                                <div className="text-xs opacity-75">
                                  R$ {Number(template.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    ) : (
                      // Exibir todos os templates em formato de lista
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-h-48 overflow-y-auto pr-2">
                        {templates.map((template: any) => (
                          <Button
                            key={template.id}
                            type="button"
                            variant="outline"
                            onClick={() => handleTemplateSelect(template)}
                            className="justify-start text-left border-blue-500/40 text-blue-200 hover:bg-blue-500/20 hover:border-blue-400/60 p-3 h-auto transition-all duration-200"
                          >
                            <div className="flex items-center w-full">
                              {template.type === 'income' ? (
                                <ArrowUpRight className="mr-2 h-3 w-3 text-green-400 flex-shrink-0" />
                              ) : (
                                <ArrowDownRight className="mr-2 h-3 w-3 text-red-400 flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-xs sm:text-sm truncate">{template.description}</div>
                                <div className="text-xs opacity-75">
                                  R$ {Number(template.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="flex gap-2 sm:gap-4">
                  <Button
                    type="button"
                    variant={formData.type === 'income' ? 'default' : 'outline'}
                    onClick={() => setFormData({...formData, type: 'income'})}
                    className={`flex-1 text-xs sm:text-sm p-2 sm:p-3 ${
                      formData.type === 'income' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'border-green-600 text-green-400 hover:bg-green-600 hover:text-white'
                    }`}
                  >
                    <ArrowUpRight className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    Receita
                  </Button>
                  <Button
                    type="button"
                    variant={formData.type === 'expense' ? 'default' : 'outline'}
                    onClick={() => setFormData({...formData, type: 'expense'})}
                    className={`flex-1 text-xs sm:text-sm p-2 sm:p-3 ${
                      formData.type === 'expense' 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'border-red-600 text-red-400 hover:bg-red-600 hover:text-white'
                    }`}
                  >
                    <ArrowDownRight className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    Despesa
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-gray-300 text-sm">Valor *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white text-sm sm:text-base"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="competence-month" className="text-gray-300 text-sm flex items-center">
                      <Calendar className="inline mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Mês de Competência *
                    </Label>
                    <Select
                      value={formData.competence_month.toString()}
                      onValueChange={(value) => setFormData({...formData, competence_month: parseInt(value)})}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {months.map((month, index) => (
                          <SelectItem key={index + 1} value={(index + 1).toString()} className="text-white text-sm">
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="competence-year" className="text-gray-300 text-sm">Ano de Competência *</Label>
                    <Input
                      id="competence-year"
                      type="number"
                      value={formData.competence_year}
                      onChange={(e) => setFormData({...formData, competence_year: parseInt(e.target.value)})}
                      className="bg-gray-800 border-gray-700 text-white text-sm sm:text-base"
                      min="2020"
                      max="2030"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-300 text-sm">Descrição *</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva a transação..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white text-sm sm:text-base resize-none"
                    rows={3}
                    required
                  />
                </div>

                {formData.type === 'expense' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-gray-300 text-sm">Categoria *</Label>
                      <Select
                        value={formData.category_id}
                        onValueChange={(value) => setFormData({...formData, category_id: value})}
                        required
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white text-sm sm:text-base">
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id} className="text-white text-sm">
                              <div className="flex items-center">
                                <div 
                                  className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
                                  style={{ backgroundColor: category.color }}
                                ></div>
                                <span className="truncate">{category.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="due-date" className="text-gray-300 text-sm">Data de Vencimento (opcional)</Label>
                      <Input
                        id="due-date"
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                        className="bg-gray-800 border-gray-700 text-white text-sm sm:text-base"
                      />
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border-2 border-green-500/30 shadow-lg">
                      <Checkbox
                        id="is_paid"
                        checked={formData.is_paid}
                        onCheckedChange={(checked) => setFormData({...formData, is_paid: !!checked})}
                        className="border-green-400 text-green-400 focus:ring-green-400 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 flex-shrink-0"
                      />
                      <Label htmlFor="is_paid" className="text-green-200 font-semibold cursor-pointer text-sm sm:text-base flex items-center">
                        <CheckCircle2 className="inline mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                        Marcar como Pago
                      </Label>
                    </div>
                  </>
                )}

                {/* Opção para salvar como template (para todas as transações) */}
                <div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border-2 border-purple-500/30 shadow-lg">
                  <Checkbox
                    id="save_template"
                    checked={saveAsTemplate}
                    onCheckedChange={(checked) => setSaveAsTemplate(!!checked)}
                    className="border-purple-400 text-purple-400 focus:ring-purple-400 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500 flex-shrink-0"
                  />
                  <Label htmlFor="save_template" className="text-purple-200 font-semibold cursor-pointer text-sm sm:text-base flex items-center">
                    <Save className="inline mr-1 sm:mr-2 h-4 w-4 flex-shrink-0" />
                    Salvar como Predefinição
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-sm sm:text-base p-3 sm:p-4"
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
