import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePromptTemplates } from '@/hooks/usePromptTemplates';

interface PromptTemplatesProps {
  category?: string;
  onSelectTemplate?: (template: any) => void;
}

export const PromptTemplates = ({ category, onSelectTemplate }: PromptTemplatesProps) => {
  const { templates, loading, getTemplatesByCategory, generatePrompt } = usePromptTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const filteredTemplates = category 
    ? getTemplatesByCategory(category) 
    : templates;

  const handleSelectTemplate = (template: any) => {
    setSelectedTemplate(template);
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Templates de Prompt Disponíveis</h3>
        <p className="text-sm text-gray-600">
          Escolha um template otimizado para sua categoria de produto
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">{template.name}</CardTitle>
                <Badge variant="secondary">{template.category}</Badge>
              </div>
              <CardDescription className="text-sm">
                {template.template.substring(0, 100)}...
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      Visualizar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{template.name}</DialogTitle>
                      <DialogDescription>
                        Categoria: {template.category}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Template:</h4>
                        <div className="p-3 bg-gray-50 rounded text-sm">
                          {template.template}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Variáveis necessárias:</h4>
                        <div className="flex flex-wrap gap-2">
                          {Object.keys(template.variables).map((variable) => (
                            <Badge key={variable} variant="outline">
                              {variable}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button 
                          onClick={() => handleSelectTemplate(template)}
                          className="flex-1"
                        >
                          Usar este Template
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  onClick={() => handleSelectTemplate(template)}
                  size="sm" 
                  className="flex-1"
                >
                  Usar Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            <p>Nenhum template encontrado para esta categoria.</p>
            <p className="text-sm mt-1">
              Templates personalizados serão criados automaticamente baseados nas suas especificações.
            </p>
          </CardContent>
        </Card>
      )}

      {selectedTemplate && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-800">
              <span>✅</span>
              <span className="font-medium">Template selecionado: {selectedTemplate.name}</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Este template será usado para gerar suas imagens de marketing.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
