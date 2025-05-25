
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export const ProfileSetup = () => {
  const { user } = useAuth();
  const { profile, loading, updating, updateProfile, uploadLogo } = useUserProfile();
  
  const [profileData, setProfileData] = useState({
    businessName: '',
    slogan: '',
    category: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6',
    description: ''
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Carregar dados do perfil quando o componente for montado
  useEffect(() => {
    if (profile) {
      setProfileData({
        businessName: profile.business_name || '',
        slogan: profile.default_slogan || '',
        category: profile.category || '',
        primaryColor: profile.brand_colors?.primary || '#3B82F6',
        secondaryColor: profile.brand_colors?.secondary || '#8B5CF6',
        description: '' // Este campo não existe na tabela, mas podemos manter na UI
      });
      
      if (profile.logo_url) {
        setLogoPreview(profile.logo_url);
      }
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    // Limpar erro quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!profileData.businessName.trim()) {
      newErrors.businessName = 'Nome da empresa é obrigatório';
    }
    
    if (!profileData.slogan.trim()) {
      newErrors.slogan = 'Slogan é obrigatório';
    }
    
    if (!profileData.category) {
      newErrors.category = 'Categoria é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user) {
      alert('Você precisa estar logado para salvar o perfil.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      let logoUrl = profile?.logo_url;
      
      // Upload do logo se houver um novo arquivo
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile);
        if (!logoUrl) {
          return; // Upload falhou, o hook já mostrou o erro
        }
      }

      // Atualizar perfil
      const success = await updateProfile({
        business_name: profileData.businessName,
        default_slogan: profileData.slogan,
        category: profileData.category,
        brand_colors: {
          primary: profileData.primaryColor,
          secondary: profileData.secondaryColor,
        },
        logo_url: logoUrl,
      });

      if (success) {
        setLogoFile(null); // Limpar arquivo após sucesso
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <Skeleton className="h-8 w-64 mx-auto mb-2" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Business Profile</h2>
        <p className="text-gray-600">Set up your brand details to create consistent marketing visuals</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>Basic details about your business</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="businessName">Nome da Empresa *</Label>
              <Input
                id="businessName"
                value={profileData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                className={`mt-1 ${errors.businessName ? 'border-red-500' : ''}`}
                placeholder="Digite o nome da sua empresa"
              />
              {errors.businessName && (
                <p className="text-sm text-red-500 mt-1">{errors.businessName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="slogan">Slogan Padrão *</Label>
              <Input
                id="slogan"
                value={profileData.slogan}
                onChange={(e) => handleInputChange('slogan', e.target.value)}
                className={`mt-1 ${errors.slogan ? 'border-red-500' : ''}`}
                placeholder="Digite o slogan da sua marca"
              />
              {errors.slogan && (
                <p className="text-sm text-red-500 mt-1">{errors.slogan}</p>
              )}
            </div>

            <div>
              <Label htmlFor="category">Categoria Principal *</Label>
              <Select 
                value={profileData.category} 
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger className={`mt-1 ${errors.category ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fashion">Moda & Vestuário</SelectItem>
                  <SelectItem value="electronics">Eletrônicos</SelectItem>
                  <SelectItem value="home">Casa & Jardim</SelectItem>
                  <SelectItem value="beauty">Beleza & Cosméticos</SelectItem>
                  <SelectItem value="sports">Esportes & Fitness</SelectItem>
                  <SelectItem value="food">Alimentação & Bebidas</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500 mt-1">{errors.category}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Descrição do Negócio</Label>
              <Textarea
                id="description"
                value={profileData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="mt-1"
                placeholder="Descreva seu negócio..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Design da Marca</CardTitle>
            <CardDescription>Elementos visuais para suas imagens de marketing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Upload do Logo</Label>
              <div className="mt-1">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors relative">
                  {logoPreview ? (
                    <div className="space-y-2">
                      <img src={logoPreview} alt="Preview do logo" className="mx-auto h-20 w-20 object-contain" />
                      <p className="text-sm text-gray-600">Logo carregado com sucesso</p>
                      {logoFile && (
                        <p className="text-xs text-blue-600">Novo arquivo: {logoFile.name}</p>
                      )}
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        className="mt-2"
                        onClick={() => document.getElementById('logo-upload')?.click()}
                      >
                        Alterar Logo
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="text-sm text-gray-600">Faça upload do seu logo</p>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        className="mt-2"
                        onClick={() => document.getElementById('logo-upload')?.click()}
                      >
                        Escolher Arquivo
                      </Button>
                    </div>
                  )}
                  <input
                    id="logo-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryColor">Cor Primária</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={profileData.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    className="w-12 h-10 p-1 rounded"
                  />
                  <Input
                    value={profileData.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    placeholder="#3B82F6"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="secondaryColor">Cor Secundária</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={profileData.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    className="w-12 h-10 p-1 rounded"
                  />
                  <Input
                    value={profileData.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    placeholder="#8B5CF6"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Preview da Marca</h4>
              <div className="flex items-center gap-3">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-12 h-12 rounded-full object-contain" />
                ) : (
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: profileData.primaryColor }}
                  >
                    {profileData.businessName.charAt(0) || 'E'}
                  </div>
                )}
                <div>
                  <div className="font-medium">{profileData.businessName || 'Nome da Empresa'}</div>
                  <div className="text-sm text-gray-600">{profileData.slogan || 'Seu slogan aqui'}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button 
          onClick={handleSave}
          disabled={updating}
          className="px-8 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
        >
          {updating ? 'Salvando...' : 'Salvar Perfil'}
        </Button>
      </div>
    </div>
  );
};
