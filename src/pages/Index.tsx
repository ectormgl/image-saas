
import { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { Dashboard } from '@/components/Dashboard';
import { ProfileSetup } from '@/components/ProfileSetup';
import { CreationWorkflow } from '@/components/CreationWorkflow';
import { MyProducts } from '@/components/MyProducts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useUserCredits } from '@/hooks/useUserCredits';
import { useUserProducts, type Product } from '@/hooks/useUserProducts';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';

const Index = () => {
  const [showSignup, setShowSignup] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProductForCreation, setSelectedProductForCreation] = useState<Product | null>(null);
  const { user, loading: authLoading, signOut } = useAuth();
  const { credits, loading: creditsLoading } = useUserCredits();

  const handleLogout = async () => {
    await signOut();
    setActiveTab('dashboard');
  };

  const handleCreateImagesFromProduct = (product: Product) => {
    setSelectedProductForCreation(product);
    setActiveTab('creation');
  };

  const handleTabChange = (value: string) => {
    if (value !== 'creation') {
      setSelectedProductForCreation(null);
    }
    setActiveTab(value);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              AI Marketing Studio
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform your product photos into stunning marketing visuals in seconds. 
              Professional quality images for Instagram, stories, and product pages.
            </p>
          </div>

          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
            {showSignup ? (
              <SignupForm onSwitchToLogin={() => setShowSignup(false)} />
            ) : (
              <LoginForm onSwitchToSignup={() => setShowSignup(true)} />
            )}
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-white rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Upload Product Photo</h3>
              <p className="text-gray-600">Simply upload any product image to get started</p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Generation</h3>
              <p className="text-gray-600">Our AI creates 5 professional marketing images</p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Download & Use</h3>
              <p className="text-gray-600">Download ready-to-post marketing visuals</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Marketing Studio
          </h1>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setActiveTab('products')}
              variant={activeTab === 'products' ? 'default' : 'outline'}
              size="sm"
              className="gap-2"
            >
              <Package className="h-4 w-4" />
              Meus Produtos
            </Button>
            <div className="text-sm text-gray-600">
              Credits: <span className="font-semibold text-blue-600">
                {creditsLoading ? '...' : credits}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {user.email}
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              size="sm"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="dashboard" className="text-center">Dashboard</TabsTrigger>
            <TabsTrigger value="products" className="text-center">Meus Produtos</TabsTrigger>
            <TabsTrigger value="profile" className="text-center">My Profile</TabsTrigger>
            <TabsTrigger value="creation" className="text-center">Creation</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-8">
            <Dashboard />
          </TabsContent>

          <TabsContent value="products" className="mt-8">
            <MyProducts onCreateImages={handleCreateImagesFromProduct} />
          </TabsContent>

          <TabsContent value="profile" className="mt-8">
            <ProfileSetup />
          </TabsContent>

          <TabsContent value="creation" className="mt-8">
            <CreationWorkflow preSelectedProduct={selectedProductForCreation} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
