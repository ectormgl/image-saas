import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ProcessingLog {
  id: string;
  step_name: string;
  status: 'started' | 'completed' | 'failed';
  message: string;
  created_at: string;
  metadata?: any;
}

interface ProcessingStatusProps {
  imageRequestId: string;
  onStatusChange?: (status: string) => void;
}

export const ProcessingStatus = ({ imageRequestId, onStatusChange }: ProcessingStatusProps) => {
  const [logs, setLogs] = useState<ProcessingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (imageRequestId && user) {
      fetchLogs();
      
      // Configurar subscription para updates em tempo real
      const subscription = supabase
        .channel('processing-logs')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'processing_logs',
            filter: `image_request_id=eq.${imageRequestId}`
          },
          (payload) => {
            const newLog = payload.new as ProcessingLog;
            setLogs(prev => [...prev, newLog]);
            updateProgress(newLog);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [imageRequestId, user]);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('processing_logs')
        .select('*')
        .eq('image_request_id', imageRequestId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      setLogs(data || []);
      
      // Calcular progresso baseado nos logs
      if (data && data.length > 0) {
        const completedSteps = data.filter(log => log.status === 'completed').length;
        const totalSteps = 5; // Número total de etapas esperadas
        setProgress((completedSteps / totalSteps) * 100);
      }

    } catch (error) {
      console.error('Erro ao buscar logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = (log: ProcessingLog) => {
    if (log.status === 'completed') {
      const completedSteps = logs.filter(l => l.status === 'completed').length + 1;
      const totalSteps = 5;
      const newProgress = (completedSteps / totalSteps) * 100;
      setProgress(newProgress);
      
      if (onStatusChange) {
        onStatusChange(log.step_name);
      }
    }
  };

  const getStepIcon = (stepName: string, status: string) => {
    const icons = {
      'workflow_started': '🚀',
      'image_upload': '📤',
      'ai_processing': '🤖',
      'image_generation': '🎨',
      'workflow_completed': '✅'
    };

    const icon = icons[stepName as keyof typeof icons] || '⚡';
    
    if (status === 'failed') return '❌';
    if (status === 'completed') return '✅';
    if (status === 'started') return '⏳';
    
    return icon;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'started': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const retryProcessing = async () => {
    // Implementar lógica de retry se necessário
    console.log('Retry processing for:', imageRequestId);
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
    <Card>
      <CardHeader>
        <CardTitle>Status do Processamento</CardTitle>
        <CardDescription>
          Acompanhe o progresso da geração das suas imagens
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Progresso geral</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border">
              <span className="text-xl">
                {getStepIcon(log.step_name, log.status)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">
                    {log.step_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <Badge className={getStatusColor(log.status)}>
                    {log.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{log.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(log.created_at).toLocaleTimeString('pt-BR')}
                </p>
              </div>
            </div>
          ))}
        </div>

        {logs.some(log => log.status === 'failed') && (
          <div className="pt-4 border-t">
            <Button 
              onClick={retryProcessing} 
              variant="outline" 
              className="w-full"
            >
              Tentar Novamente
            </Button>
          </div>
        )}

        {logs.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <p>Aguardando início do processamento...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
