
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';
import Header from '@/components/Header';
import LoadingState from '@/components/ui/LoadingState';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

interface WaitlistMetric {
  feature_name: string;
  number_of_signups: number;
  most_recent_signup: string | null;
}

const ADMIN_USERS = [
  // Add admin user IDs here
  // Example: "550e8400-e29b-41d4-a716-446655440000"
];

const WaitlistDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<WaitlistMetric[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const isAdmin = user && ADMIN_USERS.includes(user.id);
  
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (!isAdmin) {
      navigate('/');
      toast.error("Access denied", {
        description: "You don't have permission to view this page",
      });
      return;
    }
    
    fetchWaitlistMetrics();
  }, [user, navigate, isAdmin]);
  
  const fetchWaitlistMetrics = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('feature_waitlists')
        .select('feature_name, joined_at')
        .order('joined_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Process data to get metrics
      const metricsMap = new Map<string, { count: number; latestDate: string | null }>();
      
      data.forEach(item => {
        const { feature_name, joined_at } = item;
        
        if (!metricsMap.has(feature_name)) {
          metricsMap.set(feature_name, { count: 1, latestDate: joined_at });
        } else {
          const current = metricsMap.get(feature_name)!;
          metricsMap.set(feature_name, { 
            count: current.count + 1, 
            latestDate: current.latestDate ? 
              (new Date(current.latestDate) > new Date(joined_at) ? current.latestDate : joined_at) : 
              joined_at 
          });
        }
      });
      
      // Convert map to array
      const processedMetrics: WaitlistMetric[] = Array.from(metricsMap.entries()).map(([feature, stats]) => ({
        feature_name: feature,
        number_of_signups: stats.count,
        most_recent_signup: stats.latestDate
      }));
      
      // Sort by number of signups (descending)
      processedMetrics.sort((a, b) => b.number_of_signups - a.number_of_signups);
      
      setMetrics(processedMetrics);
    } catch (error) {
      console.error('Error fetching waitlist metrics:', error);
      toast.error('Failed to load data', {
        description: 'Could not retrieve waitlist metrics'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Redirect if not admin
  if (!isAdmin) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container-width max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Waitlist Dashboard</h1>
            <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full flex items-center">
              <Shield className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">Admin Only</span>
            </div>
          </div>
          
          {isLoading ? (
            <LoadingState message="Loading waitlist data..." />
          ) : metrics.length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <Table>
                <TableCaption>Feature waitlist statistics</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    <TableHead className="text-right">Signups</TableHead>
                    <TableHead className="text-right">Most Recent Signup</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.map((metric) => (
                    <TableRow key={metric.feature_name}>
                      <TableCell className="font-medium">
                        {metric.feature_name.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </TableCell>
                      <TableCell className="text-right">{metric.number_of_signups}</TableCell>
                      <TableCell className="text-right">
                        {metric.most_recent_signup 
                          ? format(new Date(metric.most_recent_signup), 'MMM d, yyyy')
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Alert>
              <AlertTitle>No data available</AlertTitle>
              <AlertDescription>
                No waitlist entries have been found. Users need to join feature waitlists for data to appear here.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </main>
    </div>
  );
};

export default WaitlistDashboard;
