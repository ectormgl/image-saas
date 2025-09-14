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
    },
    // Enhanced fields for AI image generation
    brand_name: '',
    brand_tone: '',
    brand_personality: '',
    color_theme: '',
    background_style: '',
    lighting_style: '',
    product_placement: '',
    typography_style: '',
    composition_guidelines: '',
    surface_type: '',
    accent_props: '',
    camera_angle: '',
    visual_mood: '',
    texture_preferences: '',
    overlay_text_style: '',
    premium_level: '',
    trending_themes: [] as string[]
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
      },
      // Enhanced fields for AI image generation
      brand_name: '',
      brand_tone: '',
      brand_personality: '',
      color_theme: '',
      background_style: '',
      lighting_style: '',
      product_placement: '',
      typography_style: '',
      composition_guidelines: '',
      surface_type: '',
      accent_props: '',
      camera_angle: '',
      visual_mood: '',
      texture_preferences: '',
      overlay_text_style: '',
      premium_level: '',
      trending_themes: [] as string[]
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
      },
      // Enhanced fields for AI image generation
      brand_name: (product as any).brand_name || '',
      brand_tone: (product as any).brand_tone || '',
      brand_personality: (product as any).brand_personality || '',
      color_theme: (product as any).color_theme || '',
      background_style: (product as any).background_style || '',
      lighting_style: (product as any).lighting_style || '',
      product_placement: (product as any).product_placement || '',
      typography_style: (product as any).typography_style || '',
      composition_guidelines: (product as any).composition_guidelines || '',
      surface_type: (product as any).surface_type || '',
      accent_props: (product as any).accent_props || '',
      camera_angle: (product as any).camera_angle || '',
      visual_mood: (product as any).visual_mood || '',
      texture_preferences: (product as any).texture_preferences || '',
      overlay_text_style: (product as any).overlay_text_style || '',
      premium_level: (product as any).premium_level || '',
      trending_themes: (product as any).trending_themes || []
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
        // Enhanced fields for AI image generation
        brand_name: formData.brand_name,
        brand_tone: formData.brand_tone,
        brand_personality: formData.brand_personality,
        color_theme: formData.color_theme,
        background_style: formData.background_style,
        lighting_style: formData.lighting_style,
        product_placement: formData.product_placement,
        typography_style: formData.typography_style,
        composition_guidelines: formData.composition_guidelines,
        surface_type: formData.surface_type,
        accent_props: formData.accent_props,
        camera_angle: formData.camera_angle,
        visual_mood: formData.visual_mood,
        texture_preferences: formData.texture_preferences,
        overlay_text_style: formData.overlay_text_style,
        premium_level: formData.premium_level,
        trending_themes: formData.trending_themes,
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

              {/* Enhanced AI Generation Fields */}
              <div className="border-t pt-6">
                <h4 className="font-medium text-lg mb-4 text-gray-900">🎨 Configurações Avançadas para IA</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="brand_name">Nome da Marca</Label>
                      <Input
                        id="brand_name"
                        value={formData.brand_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, brand_name: e.target.value }))}
                        placeholder="Ex: Grace, Nike, Apple..."
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="brand_tone">Tom da Marca</Label>
                      <Select 
                        value={formData.brand_tone} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, brand_tone: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecione o tom" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="elegante-moderno">Elegante e Moderno</SelectItem>
                          <SelectItem value="luxuoso-premium">Luxuoso e Premium</SelectItem>
                          <SelectItem value="jovem-divertido">Jovem e Divertido</SelectItem>
                          <SelectItem value="profissional-confiavel">Profissional e Confiável</SelectItem>
                          <SelectItem value="artesanal-autentico">Artesanal e Autêntico</SelectItem>
                          <SelectItem value="inovador-tecnologico">Inovador e Tecnológico</SelectItem>
                          <SelectItem value="minimalista-clean">Minimalista e Clean</SelectItem>
                          <SelectItem value="vintage-nostalgico">Vintage e Nostálgico</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="visual_mood">Mood Visual</Label>
                      <Select 
                        value={formData.visual_mood} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, visual_mood: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecione o mood" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sofisticado-elegante">Sofisticado e Elegante</SelectItem>
                          <SelectItem value="energetico-vibrante">Energético e Vibrante</SelectItem>
                          <SelectItem value="calmo-sereno">Calmo e Sereno</SelectItem>
                          <SelectItem value="luxuoso-exclusivo">Luxuoso e Exclusivo</SelectItem>
                          <SelectItem value="natural-organico">Natural e Orgânico</SelectItem>
                          <SelectItem value="futurista-tecnologico">Futurista e Tecnológico</SelectItem>
                          <SelectItem value="aconchegante-intimista">Aconchegante e Intimista</SelectItem>
                          <SelectItem value="dinamico-urbano">Dinâmico e Urbano</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="premium_level">Nível Premium</Label>
                      <Select 
                        value={formData.premium_level} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, premium_level: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecione o nível" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ultra-premium">Ultra Premium</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="mid-premium">Mid Premium</SelectItem>
                          <SelectItem value="acessivel">Acessível</SelectItem>
                          <SelectItem value="popular">Popular</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="background_style">Estilo de Fundo</Label>
                      <Select 
                        value={formData.background_style} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, background_style: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecione o fundo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="degradee-suave">Degradê Suave</SelectItem>
                          <SelectItem value="textura-marble">Textura Mármore</SelectItem>
                          <SelectItem value="tecido-seda">Tecido de Seda</SelectItem>
                          <SelectItem value="parede-texturizada">Parede Texturizada</SelectItem>
                          <SelectItem value="fundo-neutro">Fundo Neutro</SelectItem>
                          <SelectItem value="ambiente-natural">Ambiente Natural</SelectItem>
                          <SelectItem value="studio-limpo">Studio Limpo</SelectItem>
                          <SelectItem value="cenario-urbano">Cenário Urbano</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="lighting_style">Estilo de Iluminação</Label>
                      <Select 
                        value={formData.lighting_style} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, lighting_style: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecione a iluminação" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="luz-natural-suave">Luz Natural Suave</SelectItem>
                          <SelectItem value="spotlight-dramatico">Spotlight Dramático</SelectItem>
                          <SelectItem value="iluminacao-difusa">Iluminação Difusa</SelectItem>
                          <SelectItem value="luz-dourada">Luz Dourada</SelectItem>
                          <SelectItem value="iluminacao-studio">Iluminação de Studio</SelectItem>
                          <SelectItem value="luz-ambiente">Luz Ambiente</SelectItem>
                          <SelectItem value="contraste-alto">Contraste Alto</SelectItem>
                          <SelectItem value="luz-cinematica">Luz Cinemática</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="surface_type">Tipo de Superfície</Label>
                      <Select 
                        value={formData.surface_type} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, surface_type: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecione a superfície" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="madeira-nobre">Madeira Nobre</SelectItem>
                          <SelectItem value="mármore-elegante">Mármore Elegante</SelectItem>
                          <SelectItem value="tecido-veludo">Tecido Veludo</SelectItem>
                          <SelectItem value="metal-escovado">Metal Escovado</SelectItem>
                          <SelectItem value="vidro-temperado">Vidro Temperado</SelectItem>
                          <SelectItem value="pedra-natural">Pedra Natural</SelectItem>
                          <SelectItem value="superficie-reflexiva">Superfície Reflexiva</SelectItem>
                          <SelectItem value="textura-organica">Textura Orgânica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="camera_angle">Ângulo da Câmera</Label>
                      <Select 
                        value={formData.camera_angle} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, camera_angle: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecione o ângulo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="frontal-centralizado">Frontal Centralizado</SelectItem>
                          <SelectItem value="45-graus-elegante">45 Graus Elegante</SelectItem>
                          <SelectItem value="vista-aerea">Vista Aérea</SelectItem>
                          <SelectItem value="perspectiva-baixa">Perspectiva Baixa</SelectItem>
                          <SelectItem value="close-up-detalhes">Close-up Detalhes</SelectItem>
                          <SelectItem value="angulo-dinamico">Ângulo Dinâmico</SelectItem>
                          <SelectItem value="perfil-lateral">Perfil Lateral</SelectItem>
                          <SelectItem value="perspectiva-artistica">Perspectiva Artística</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="accent_props">Elementos Complementares</Label>
                    <Input
                      id="accent_props"
                      value={formData.accent_props}
                      onChange={(e) => setFormData(prev => ({ ...prev, accent_props: e.target.value }))}
                      placeholder="Ex: pétalas de rosa, cristais, fitas douradas, plantas..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="composition_guidelines">Diretrizes de Composição</Label>
                    <Textarea
                      id="composition_guidelines"
                      value={formData.composition_guidelines}
                      onChange={(e) => setFormData(prev => ({ ...prev, composition_guidelines: e.target.value }))}
                      placeholder="Ex: Produto centralizado, regra dos terços, simetria, assimetria criativa..."
                      className="mt-1"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="texture_preferences">Preferências de Textura</Label>
                    <Input
                      id="texture_preferences"
                      value={formData.texture_preferences}
                      onChange={(e) => setFormData(prev => ({ ...prev, texture_preferences: e.target.value }))}
                      placeholder="Ex: texturas táteis, superfícies lisas, acabamentos foscos..."
                      className="mt-1"
                    />
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
