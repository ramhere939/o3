import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileCheck, AlertTriangle, ShieldCheck, Loader2 } from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`API Error: ${res.status} - ${errText}`);
      }
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col h-[80vh] items-center justify-center text-center p-6">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold text-destructive mb-2">Failed to load Dashboard Data</h2>
        <p className="text-muted-foreground bg-muted p-4 rounded-md max-w-lg overflow-auto">
          {error instanceof Error ? error.message : 'Unknown error occurred while fetching from port 3001.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card shadow-sm border-muted">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Connected to live DB</p>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-sm border-muted">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending KYC</CardTitle>
            <ShieldCheck className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingKyc || 0}</div>
            <p className="text-xs text-muted-foreground">Requires immediate review</p>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-sm border-muted">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Listings</CardTitle>
            <FileCheck className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingListings || 0}</div>
            <p className="text-xs text-muted-foreground">Live catalog items</p>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-sm border-muted">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Disputes</CardTitle>
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats?.openDisputes || 0}</div>
            <p className="text-xs text-muted-foreground">2 escalated to Super Admin</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1 shadow-sm border-muted">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stats?.recentActivity?.map((activity: any) => (
                <div key={activity.id} className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${activity.color}`}></div>
                  <div>
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
