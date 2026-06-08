import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldAlert, UserPlus } from "lucide-react";

const mockData = [
  { id: 'U-001', name: 'Alice Smith', email: 'alice.smith@o3.com', role: 'Super Admin', status: 'Active', lastLogin: '2026-06-04 10:30 AM' },
  { id: 'U-002', name: 'Bob Johnson', email: 'bob.kyc@o3.com', role: 'KYC Admin', status: 'Active', lastLogin: '2026-06-04 09:15 AM' },
  { id: 'U-003', name: 'Charlie Davis', email: 'charlie.catalog@o3.com', role: 'Catalog Admin', status: 'Suspended', lastLogin: '2026-06-01 04:00 PM' },
];

export default function AdminUsersList() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Users Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage platform administrators and role-based access.</p>
        </div>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" /> Invite Admin
        </Button>
      </div>

      <div className="border rounded-md bg-card shadow-sm border-muted">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockData.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    {row.role === 'Super Admin' && <ShieldAlert className="w-3.5 h-3.5 text-primary" />}
                    <span className="text-sm">{row.role}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={row.status === 'Active' ? 'default' : 'destructive'} className={row.status === 'Active' ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' : ''}>
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{row.lastLogin}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">Manage</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
