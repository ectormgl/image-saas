
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export const CreationWorkflow = () => {
  const [step, setStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    productName: '',
    customSlogan: '',
    category: '',
    theme: '',
    additionalInfo: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setStep(2);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    console.log('Generating images with data:', formData);
    
    // Simulate AI generation process
    setTimeout(() => {
      // Mock generated images
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
    }, 3000);
  };

  const handleStartOver = () => {
    setStep(1);
    setUploadedImage(null);
    setFormData({
      productName: '',
      customSlogan: '',
      category: '',
      theme: '',
      additionalInfo: ''
    });
    setGeneratedImages([]);
  };

  if (step === 1) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Marketing Images</h2>
          <p className="text-gray-600">Upload a product photo to generate 5 professional marketing visuals</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload Product Photo</CardTitle>
            <CardDescription>Choose a high-quality image of your product</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer relative">
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Click to upload or drag and drop</h3>
              <p className="text-gray-600">PNG, JPG, JPEG up to 10MB</p>
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
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  value={formData.productName}
                  onChange={(e) => handleFormChange('productName', e.target.value)}
                  placeholder="e.g., Summer Hat, Leather Wallet"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="customSlogan">Custom Slogan (Optional)</Label>
                <Input
                  id="customSlogan"
                  value={formData.customSlogan}
                  onChange={(e) => handleFormChange('customSlogan', e.target.value)}
                  placeholder="Leave blank to use your default slogan"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="category">Product Category</Label>
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
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="theme">Design Theme</Label>
                <Select value={formData.theme} onValueChange={(value) => handleFormChange('theme', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="luxury">Luxury & Premium</SelectItem>
                    <SelectItem value="minimalist">Minimalist & Clean</SelectItem>
                    <SelectItem value="vibrant">Vibrant & Energetic</SelectItem>
                    <SelectItem value="vintage">Vintage & Retro</SelectItem>
                    <SelectItem value="modern">Modern & Tech</SelectItem>
                    <SelectItem value="natural">Natural & Organic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                <Textarea
                  id="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={(e) => handleFormChange('additionalInfo', e.target.value)}
                  placeholder="Any specific requirements or style preferences..."
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
            <p className="text-gray-600">Our AI is creating 5 stunning marketing visuals for your product</p>
            <div className="mt-8 max-w-md mx-auto bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-800 space-y-1">
                <p>✨ Analyzing your product photo...</p>
                <p>🎨 Applying your brand colors and theme...</p>
                <p>📱 Creating Instagram-ready formats...</p>
                <p>🖼️ Generating product detail images...</p>
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
