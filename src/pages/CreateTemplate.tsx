import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimplifiedFinancialData } from '@/hooks/useSimplifiedFinancialData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const CreateTemplate = () => {
  const navigate = useNavigate();
  const { categories, addTemplate, loading } = useSimplifiedFinancialData();
  
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    description: '',
    amount: '',
    category_id: ''
  });
  const [saving, setSaving] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
      </div>
    );
  }

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

      const { error } = await addTemplate(templateData);
      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Predefinição criada com sucesso.",
      });

      navigate('/transactions');
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar predefinição.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const backgroundSvg = `data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-900">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("${backgroundSvg}")` }}></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/transactions')}
              className="text-gray-400 hover:text-white mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Save className="mr-3 h-8 w-8 text-green-400" />
              Nova Predefinição
            </h1>
            <p className="text-gray-400 mt-2">Crie uma predefinição para agilizar transações futuras</p>
          </div>

          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
            <CardHeader>
              <CardTitle className="text-white">Detalhes da Predefinição</CardTitle>
            </CardHeader>

            <CardContent>
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
                  <Label htmlFor="description" className="text-gray-300">Descrição *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Descrição da predefinição"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-gray-300">Valor *</Label>
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
                  <div className="space-y-2">
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

                <div className="flex gap-4 pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/transactions')}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saving} 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Criando...' : 'Criar Predefinição'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateTemplate;