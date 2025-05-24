
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

export const Dashboard = () => {
  const recentGenerations = [
    { id: 1, productName: "Summer Hat", date: "2024-01-20", status: "Completed", images: 5 },
    { id: 2, productName: "Leather Wallet", date: "2024-01-18", status: "Completed", images: 5 },
    { id: 3, productName: "Running Shoes", date: "2024-01-15", status: "Processing", images: 0 },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-700">Credits Remaining</CardTitle>
            <CardDescription>Available generations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 mb-2">5</div>
            <div className="text-sm text-blue-600">out of 10 credits</div>
            <Progress value={50} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-purple-700">Total Generations</CardTitle>
            <CardDescription>This month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700 mb-2">23</div>
            <div className="text-sm text-purple-600">+5 from last month</div>
            <div className="mt-3 text-xs text-purple-500">115 images created</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-700">Success Rate</CardTitle>
            <CardDescription>Quality generations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 mb-2">98%</div>
            <div className="text-sm text-green-600">Excellent quality</div>
            <Progress value={98} className="mt-3" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Generations</CardTitle>
            <CardDescription>Your latest AI image generations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentGenerations.map((generation) => (
                <div key={generation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{generation.productName}</h4>
                    <p className="text-sm text-gray-600">{generation.date}</p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      generation.status === 'Completed' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {generation.status}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{generation.images} images</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage Analytics</CardTitle>
            <CardDescription>Your generation patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Instagram Posts</span>
                <span className="font-medium">45%</span>
              </div>
              <Progress value={45} />
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Instagram Stories</span>
                <span className="font-medium">30%</span>
              </div>
              <Progress value={30} />
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Product Detail Pages</span>
                <span className="font-medium">25%</span>
              </div>
              <Progress value={25} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billing & Credits</CardTitle>
          <CardDescription>Manage your subscription and purchase credits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <h4 className="font-medium mb-2">Current Plan: Starter</h4>
              <p className="text-sm text-gray-600 mb-4">10 credits per month • $49/month</p>
              <Button variant="outline" className="w-full sm:w-auto">
                Upgrade Plan
              </Button>
            </div>
            <div className="flex-1">
              <h4 className="font-medium mb-2">Need More Credits?</h4>
              <p className="text-sm text-gray-600 mb-4">Purchase additional credits for $30 each</p>
              <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600">
                Buy Credits
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
