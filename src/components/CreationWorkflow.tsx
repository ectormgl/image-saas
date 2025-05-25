
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useN8nIntegration } from '@/hooks/useN8nIntegration';
import { usePromptTemplates } from '@/hooks/usePromptTemplates';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserProducts, type Product } from '@/hooks/useUserProducts';
import { useAuth } from '@/contexts/AuthContext';

export const CreationWorkflow = ({ preSelectedProduct }: { preSelectedProduct?: Product | null }) => {
  const [step, setStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(preSelectedProduct || null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImagePath, setUploadedImagePath] = useState<string>('');
  const [formData, setFormData] = useState({
    productName: '',
    customSlogan: '',
    category: '',
    theme: '',
    targetAudience: '',
    stylePreferences: '',
    additionalInfo: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  
  // Hooks personalizados
  const { uploadImage, isUploading, uploadProgress } = useImageUpload();
  const { executeWorkflow, isExecuting, executionStatus } = useN8nIntegration();
  const { getImageFormats } = usePromptTemplates();
  const { profile } = useUserProfile();
  const { products } = useUserProducts();
  const { user } = useAuth();

  // Aplicar produto pré-selecionado quando mudado
  useEffect(() => {
    if (preSelectedProduct) {
      setSelectedProduct(preSelectedProduct);
    }
  }, [preSelectedProduct]);

  // Aplicar configurações do perfil do usuário quando disponível
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        customSlogan: prev.customSlogan || profile.default_slogan || '',
        category: prev.category || profile.category || ''
      }));
    }
  }, [profile]);

  // Preencher dados quando produto for selecionado
  useEffect(() => {
    if (selectedProduct) {
      setFormData(prev => ({
        ...prev,
        productName: selectedProduct.name,
        category: selectedProduct.category,
        targetAudience: selectedProduct.target_audience || '',
        stylePreferences: selectedProduct.style_preferences || '',
        additionalInfo: selectedProduct.description || ''
      }));
      
      if (selectedProduct.image_url) {
        setUploadedImage(selectedProduct.image_url);
        setUploadedImagePath(selectedProduct.image_url);
        setStep(2); // Pular para o próximo passo se já temos imagem
      }
    }
  }, [selectedProduct]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError('');
      
      // Upload para Supabase Storage
      const uploadResult = await uploadImage(file, 'products');
      
      // Criar preview local também
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setUploadedImagePath(uploadResult.path);
        setStep(2);
      };
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('Erro no upload:', error);
      setError(error instanceof Error ? error.message : 'Erro no upload da imagem');
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!uploadedImage || !user) {
      setError('Imagem não encontrada ou usuário não autenticado');
      return;
    }

    try {
      setIsGenerating(true);
      setError('');
      
      // Preparar dados para o workflow
      const workflowData = {
        productName: formData.productName,
        category: formData.category,
        theme: formData.theme,
        targetAudience: formData.targetAudience,
        brandColors: profile?.brand_colors || { primary: '#3B82F6', secondary: '#8B5CF6' },
        stylePreferences: formData.stylePreferences,
        additionalInfo: formData.additionalInfo,
        imageUrl: uploadedImage,
        slogan: formData.customSlogan || profile?.default_slogan
      };

      // Executar workflow n8n
      const result = await executeWorkflow(workflowData);
      
      console.log('Workflow executado:', result);
      
      // Por enquanto, simular imagens geradas (será substituído pela resposta real do n8n)
      setTimeout(() => {
        const mockImages = [
          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=600&fit=crop',
          'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop',
          'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=600&fit=crop'
        ];
        setGeneratedImages(mockImages);
        setIsGenerating(false);
        setStep(3);
      }, 5000);
      
    } catch (error) {
      console.error('Erro na geração:', error);
      setError(error instanceof Error ? error.message : 'Erro na geração de imagens');
      setIsGenerating(false);
    }
  };

  const handleStartOver = () => {
    setStep(1);
    setUploadedImage(null);
    setUploadedImagePath('');
    setFormData({
      productName: '',
      customSlogan: '',
      category: '',
      theme: '',
      targetAudience: '',
      stylePreferences: '',
      additionalInfo: ''
    });
    setGeneratedImages([]);
    setError('');
  };

  if (step === 1) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Marketing Images</h2>
          <p className="text-gray-600">Select a product or upload a photo to generate professional marketing visuals</p>
        </div>

        {/* Seleção de Produtos Existentes */}
        {products.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select an Existing Product</CardTitle>
              <CardDescription>Choose one of your products to create marketing images</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div 
                    key={product.id}
                    className={`border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                      selectedProduct?.id === product.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="h-32 bg-gray-100 relative">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      
                      {selectedProduct?.id === product.id && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-blue-500">Selected</Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{product.category}</p>
                    </div>
                  </div>
                ))}
              </div>

              {selectedProduct && (
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Selected: <span className="font-medium">{selectedProduct.name}</span>
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setSelectedProduct(null)}
                    >
                      Clear Selection
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => setStep(2)}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Separador */}
        {products.length > 0 && (
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-sm text-gray-500">Or upload a new product image</span>
            </div>
          </div>
        )}

        {/* Upload de Nova Imagem */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Product Photo</CardTitle>
            <CardDescription>Choose a high-quality image of your product</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer relative">
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading || !!selectedProduct}
              />
              
              {isUploading ? (
                <div className="space-y-4">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                  <h3 className="text-lg font-medium text-gray-900">Fazendo upload...</h3>
                  <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                  <p className="text-sm text-gray-600">{uploadProgress}% concluído</p>
                </div>
              ) : selectedProduct ? (
                <div className="text-center opacity-60">
                  <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-500 mb-2">Product already selected</h3>
                  <p className="text-gray-500">Clear product selection to upload a new image</p>
                </div>
              ) : (
                <>
                  <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Click to upload or drag and drop</h3>
                  <p className="text-gray-600">PNG, JPG, JPEG up to 10MB</p>
                </>
              )}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">💡 Tips for best results:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use high-resolution images (at least 1000x1000px)</li>
                <li>• Ensure good lighting and clear product visibility</li>
                <li>• Avoid cluttered backgrounds when possible</li>
                <li>• Include the full product in the frame</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Customize Your Generation</h2>
          <p className="text-gray-600">Provide details to create perfect marketing images</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Image</CardTitle>
            </CardHeader>
            <CardContent>
              {uploadedImage && (
                <div className="space-y-4">
                  <img src={uploadedImage} alt="Uploaded product" className="w-full h-64 object-cover rounded-lg" />
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(1)}
                    className="w-full"
                  >
                    Upload Different Image
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>Help our AI understand your product better</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="productName">Product Name *</Label>
                <Input
                  id="productName"
                  value={formData.productName}
                  onChange={(e) => handleFormChange('productName', e.target.value)}
                  placeholder="e.g., Summer Hat, Leather Wallet"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="customSlogan">Custom Slogan (Optional)</Label>
                <Input
                  id="customSlogan"
                  value={formData.customSlogan}
                  onChange={(e) => handleFormChange('customSlogan', e.target.value)}
                  placeholder={profile?.default_slogan || "Leave blank to use your default slogan"}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="category">Product Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleFormChange('category', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fashion">Fashion & Apparel</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="home">Home & Garden</SelectItem>
                    <SelectItem value="beauty">Beauty & Cosmetics</SelectItem>
                    <SelectItem value="sports">Sports & Fitness</SelectItem>
                    <SelectItem value="food">Food & Beverage</SelectItem>
                    <SelectItem value="automotive">Automotive</SelectItem>
                    <SelectItem value="books">Books & Media</SelectItem>
                    <SelectItem value="toys">Toys & Games</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="theme">Design Theme *</Label>
                <Select value={formData.theme} onValueChange={(value) => handleFormChange('theme', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern & Minimalist</SelectItem>
                    <SelectItem value="luxury">Luxury & Premium</SelectItem>
                    <SelectItem value="playful">Playful & Fun</SelectItem>
                    <SelectItem value="professional">Professional & Corporate</SelectItem>
                    <SelectItem value="vintage">Vintage & Retro</SelectItem>
                    <SelectItem value="natural">Natural & Organic</SelectItem>
                    <SelectItem value="bold">Bold & Vibrant</SelectItem>
                    <SelectItem value="elegant">Elegant & Sophisticated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Select value={formData.targetAudience} onValueChange={(value) => handleFormChange('targetAudience', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Who is your target audience?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="young-adults">Young Adults (18-25)</SelectItem>
                    <SelectItem value="millennials">Millennials (26-40)</SelectItem>
                    <SelectItem value="gen-x">Gen X (41-55)</SelectItem>
                    <SelectItem value="baby-boomers">Baby Boomers (55+)</SelectItem>
                    <SelectItem value="families">Families with Children</SelectItem>
                    <SelectItem value="professionals">Business Professionals</SelectItem>
                    <SelectItem value="students">Students</SelectItem>
                    <SelectItem value="seniors">Seniors</SelectItem>
                    <SelectItem value="general">General Audience</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="stylePreferences">Style Preferences</Label>
                <Input
                  id="stylePreferences"
                  value={formData.stylePreferences}
                  onChange={(e) => handleFormChange('stylePreferences', e.target.value)}
                  placeholder="e.g., bright colors, dark theme, gradient backgrounds"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                <Textarea
                  id="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={(e) => handleFormChange('additionalInfo', e.target.value)}
                  placeholder="Any specific requirements, key features to highlight, or style preferences..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <div className="mb-4 p-4 bg-yellow-50 rounded-lg inline-block">
            <p className="text-sm text-yellow-800">
              <strong>Cost:</strong> This generation will use 1 credit ($30 value)
            </p>
          </div>
          <Button 
            onClick={handleGenerate}
            disabled={!formData.productName || !formData.category || !formData.theme}
            className="px-8 py-3 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Generate Marketing Images ✨
          </Button>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="max-w-6xl mx-auto">
        {isGenerating ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Your Images...</h2>
            <p className="text-gray-600">Nossa IA está criando 5 visuais de marketing profissionais para {formData.productName}</p>
            
            {error && (
              <Alert className="mt-4 max-w-md mx-auto">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="mt-8 max-w-md mx-auto bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-800 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <p>Analisando sua foto do produto...</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <p>Aplicando cores da marca e tema ({formData.theme})...</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <p>Criando formatos para Instagram e redes sociais...</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                  <p>Gerando imagens de detalhes do produto...</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
                  <p>Finalizando banners para website...</p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-white rounded border border-blue-200">
                <p className="text-xs text-gray-600">
                  Status do Workflow: <span className="font-medium text-blue-700">{executionStatus}</span>
                </p>
                {isExecuting && (
                  <p className="text-xs text-gray-600 mt-1">
                    Processamento via n8n em andamento...
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Marketing Images Are Ready! 🎉</h2>
              <p className="text-gray-600">5 professional images generated for {formData.productName}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {generatedImages.map((image, index) => {
                const formats = ['Instagram Post', 'Instagram Story', 'Product Detail', 'Facebook Ad', 'Website Banner'];
                return (
                  <Card key={index} className="overflow-hidden">
                    <div className="relative">
                      <img src={image} alt={`Generated ${formats[index]}`} className="w-full h-48 object-cover" />
                      <Badge className="absolute top-2 left-2 bg-white text-gray-800">
                        {formats[index]}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{formats[index]}</span>
                        <Button size="sm" variant="outline">
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-center gap-4">
              <Button 
                onClick={handleStartOver}
                variant="outline"
                className="px-6"
              >
                Create New Images
              </Button>
              <Button className="px-6 bg-gradient-to-r from-blue-600 to-purple-600">
                Download All Images
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};
