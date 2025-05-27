import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useUserProducts, type Product } from '@/hooks/useUserProducts';
import { 
  Plus, 
  Package, 
  Edit, 
  Trash2, 
  Image as ImageIcon,
  Tag,
  Palette
} from 'lucide-react';

interface MyProductsProps {
  onCreateImages?: (product: Product) => void;
}

export const MyProducts = ({ onCreateImages }: MyProductsProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { uploadImage, isUploading } = useImageUpload();
  const { products, loading, saving, createProduct, updateProduct, deleteProduct } = useUserProducts();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    target_audience: '',
    style_preferences: '',
    brand_colors: {
      primary: '#3B82F6',
      secondary: '#8B5CF6'
    }
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);
    
    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      target_audience: '',
      style_preferences: '',
      brand_colors: {
        primary: '#3B82F6',
        secondary: '#8B5CF6'
      }
    });
    setSelectedImage(null);
    setImagePreview('');
    setEditingProduct(null);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category,
      target_audience: product.target_audience || '',
      style_preferences: product.style_preferences || '',
      brand_colors: product.brand_colors || {
        primary: '#3B82F6',
        secondary: '#8B5CF6'
      }
    });
    setImagePreview(product.image_url || '');
    setIsDialogOpen(true);
  };

  const saveProduct = async () => {
    if (!formData.name || !formData.category) {
      return;
    }

    try {
      let imageUrl = editingProduct?.image_url || '';

      // Upload da nova imagem se selecionada
      if (selectedImage) {
        const uploadResult = await uploadImage(selectedImage, 'products');
        imageUrl = uploadResult.publicUrl;
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        target_audience: formData.target_audience,
        style_preferences: formData.style_preferences,
        brand_colors: formData.brand_colors,
        image_url: imageUrl,
      };

      if (editingProduct) {
        // Atualizar produto existente
        await updateProduct(editingProduct.id, productData);
      } else {
        // Criar novo produto
        await createProduct(productData);
      }

      setIsDialogOpen(false);
      resetForm();
      
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    await deleteProduct(productId);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Meus Produtos</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Meus Produtos</h1>
          <p className="text-gray-600 mt-1">
            Gerencie seus produtos e crie novas imagens de marketing
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Atualize as informações do seu produto.' : 'Adicione um novo produto ao seu catálogo.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Upload de Imagem */}
              <div>
                <Label>Foto do Produto</Label>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImagePreview('');
                          setSelectedImage(null);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isUploading}
                      />
                      <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">
                        {isUploading ? 'Enviando...' : 'Clique para adicionar uma foto'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">PNG, JPG até 10MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do Produto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Camiseta Premium"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fashion">Moda & Vestuário</SelectItem>
                      <SelectItem value="electronics">Eletrônicos</SelectItem>
                      <SelectItem value="home">Casa & Jardim</SelectItem>
                      <SelectItem value="beauty">Beleza & Cosméticos</SelectItem>
                      <SelectItem value="sports">Esportes & Fitness</SelectItem>
                      <SelectItem value="food">Alimentos & Bebidas</SelectItem>
                      <SelectItem value="automotive">Automotivo</SelectItem>
                      <SelectItem value="books">Livros & Mídia</SelectItem>
                      <SelectItem value="toys">Brinquedos & Jogos</SelectItem>
                      <SelectItem value="other">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva seu produto, suas características principais..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="target_audience">Público-Alvo</Label>
                <Select 
                  value={formData.target_audience} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, target_audience: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Quem é seu público?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="young-adults">Jovens Adultos (18-25)</SelectItem>
                    <SelectItem value="millennials">Millennials (26-40)</SelectItem>
                    <SelectItem value="gen-x">Geração X (41-55)</SelectItem>
                    <SelectItem value="baby-boomers">Baby Boomers (55+)</SelectItem>
                    <SelectItem value="families">Famílias com Crianças</SelectItem>
                    <SelectItem value="professionals">Profissionais</SelectItem>
                    <SelectItem value="students">Estudantes</SelectItem>
                    <SelectItem value="seniors">Idosos</SelectItem>
                    <SelectItem value="general">Público Geral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="style_preferences">Preferências de Estilo</Label>
                <Input
                  id="style_preferences"
                  value={formData.style_preferences}
                  onChange={(e) => setFormData(prev => ({ ...prev, style_preferences: e.target.value }))}
                  placeholder="Ex: cores vibrantes, minimalista, elegante..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Cores da Marca</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="primary_color" className="text-sm">Cor Primária</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="primary_color"
                        type="color"
                        value={formData.brand_colors.primary}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          brand_colors: { ...prev.brand_colors, primary: e.target.value }
                        }))}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={formData.brand_colors.primary}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          brand_colors: { ...prev.brand_colors, primary: e.target.value }
                        }))}
                        placeholder="#3B82F6"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="secondary_color" className="text-sm">Cor Secundária</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="secondary_color"
                        type="color"
                        value={formData.brand_colors.secondary}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          brand_colors: { ...prev.brand_colors, secondary: e.target.value }
                        }))}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={formData.brand_colors.secondary}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          brand_colors: { ...prev.brand_colors, secondary: e.target.value }
                        }))}
                        placeholder="#8B5CF6"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={saveProduct}
                  disabled={saving || isUploading}
                  className="flex-1"
                >
                  {saving ? 'Salvando...' : editingProduct ? 'Atualizar Produto' : 'Criar Produto'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={saving || isUploading}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">Nenhum produto cadastrado</h3>
            <p className="text-gray-600 mb-6">
              Crie seu primeiro produto para começar a gerar imagens de marketing incríveis
            </p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Produto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-all duration-200">
              <CardContent className="p-0">
                <div className="relative">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openEditDialog(product)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <Badge variant="outline">
                      <Tag className="h-3 w-3 mr-1" />
                      {product.category}
                    </Badge>
                  </div>
                  
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 mb-4">
                    {product.brand_colors && (
                      <div className="flex items-center gap-1">
                        <Palette className="h-3 w-3 text-gray-400" />
                        <div 
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: product.brand_colors.primary }}
                        />
                        <div 
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: product.brand_colors.secondary }}
                        />
                      </div>
                    )}
                    {product.target_audience && (
                      <Badge variant="secondary" className="text-xs">
                        {product.target_audience}
                      </Badge>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                    onClick={() => {
                      if (onCreateImages) {
                        onCreateImages(product);
                      } else {
                        console.log('Criar imagens para produto:', product.id);
                      }
                    }}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Criar Imagens
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
