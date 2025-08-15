import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit2, Trash2, Save, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface TemplateManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: any[];
  categories: any[];
  onAddTemplate: (data: any) => Promise<{ error?: any }>;
  onUpdateTemplate: (id: string, data: any) => Promise<{ error?: any }>;
  onDeleteTemplate: (id: string) => Promise<{ error?: any }>;
}

const TemplateManagementModal = ({
  isOpen,
  onClose,
  templates,
  categories,
  onAddTemplate,
  onUpdateTemplate,
  onDeleteTemplate
}: TemplateManagementModalProps) => {
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    description: '',
    amount: '',
    category_id: ''
  });
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setFormData({
      type: 'expense',
      description: '',
      amount: '',
      category_id: ''
    });
    setEditingTemplate(null);
    setIsCreating(false);
  };

  const handleEdit = (template: any) => {
    setFormData({
      type: template.type,
      description: template.description,
      amount: template.amount.toString(),
      category_id: template.category_id || ''
    });
    setEditingTemplate(template);
    setIsCreating(false);
  };

  const handleCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const templateData = {
        type: formData.type,
        description: formData.description,
        amount: parseFloat(formData.amount),
        category_id: formData.category_id || null
      };

      let error;
      if (editingTemplate) {
        ({ error } = await onUpdateTemplate(editingTemplate.id, templateData));
      } else {
        ({ error } = await onAddTemplate(templateData));
      }

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: `Predefinição ${editingTemplate ? 'atualizada' : 'criada'} com sucesso.`,
      });

      resetForm();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar predefinição.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta predefinição?')) return;

    try {
      const { error } = await onDeleteTemplate(templateId);
      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Predefinição excluída com sucesso.",
      });

      if (editingTemplate?.id === templateId) {
        resetForm();
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir predefinição.",
        variant: "destructive",
      });
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Sem categoria';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-white">Gerenciar Predefinições</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
          {/* Lista de Templates */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Predefinições Existentes</h3>
              <Button
                onClick={handleCreate}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova
              </Button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {templates.map((template) => (
                <Card key={template.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        {template.type === 'income' ? (
                          <ArrowUpRight className="h-4 w-4 text-green-400 flex-shrink-0" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-400 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white text-sm truncate">
                            {template.description}
                          </div>
                          <div className="text-xs text-gray-400">
                            R$ {Number(template.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            {template.category_id && (
                              <span className="ml-2">• {getCategoryName(template.category_id)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(template)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-800/30"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(template.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-800/30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {templates.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">📝</div>
                  <p>Nenhuma predefinição encontrada</p>
                  <p className="text-sm mt-1">Clique em "Nova" para criar sua primeira predefinição</p>
                </div>
              )}
            </div>
          </div>

          {/* Formulário */}
          {(isCreating || editingTemplate) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  {editingTemplate ? 'Editar Predefinição' : 'Nova Predefinição'}
                </h3>
                <Button
                  variant="ghost"
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-300"
                >
                  ✕
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="type" className="text-gray-300">Tipo</Label>
                  <Select value={formData.type} onValueChange={(value: 'income' | 'expense') => setFormData({...formData, type: value})}>
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
                  <Label htmlFor="description" className="text-gray-300">Descrição</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Descrição da predefinição"
                    required
                  />
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

                {formData.type === 'expense' && (
                  <div>
                    <Label htmlFor="category" className="text-gray-300">Categoria</Label>
                    <Select value={formData.category_id || "none"} onValueChange={(value) => setFormData({...formData, category_id: value === "none" ? "" : value})}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Selecione uma categoria (opcional)" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="none" className="text-white">Sem categoria</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id} className="text-white">
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving} className="flex-1 bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {!isCreating && !editingTemplate && (
            <div className="flex items-center justify-center text-gray-400 text-center">
              <div>
                <div className="text-4xl mb-2">⚡</div>
                <p>Selecione uma predefinição para editar</p>
                <p className="text-sm mt-1">ou clique em "Nova" para criar uma</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateManagementModal;